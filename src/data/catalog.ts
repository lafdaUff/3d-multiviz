import type { ModelData } from '../components/viewport/Experience';
import schema from './dataschema.json' with { type: 'json' };

interface SchemaField {
  type: string;
  name?: string;
  description?: string;
}

type SchemaEntry = Record<string, SchemaField>;

const fields = schema as unknown as SchemaEntry[];

export type Filters = Record<string, string[]>;

export interface FacetValue {
  value: string;
  count: number;
}

export interface Facet {
  key: string;
  label: string;
  type: string;
  values: FacetValue[];
}

export interface ItemGroup {
  key: string;
  /** null = grupo único, sem cabeçalho */
  label: string | null;
  items: ModelData[];
}

/** Minúsculas, sem acentos: "Ceará" e "ceara" passam a bater. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function fieldOf(key: string): SchemaField | null {
  const entry = fields.find(f => Object.keys(f)[0] === key);
  return entry ? Object.values(entry)[0] : null;
}

/** Rótulo do metadado: o "name" do schema quando existe, senão a própria chave. */
export function fieldLabel(key: string): string {
  return fieldOf(key)?.name || key;
}

export function fieldType(key: string): string {
  return fieldOf(key)?.type || 'string';
}

/** Tipo declarado no schema ou, na falta dele, o formato do próprio valor. */
export function resolveType(key: string, value: unknown): string {
  const declared = fieldOf(key)?.type;
  if (declared) return declared;
  if (Array.isArray(value)) return 'array';
  if (value !== null && typeof value === 'object') return 'link';
  if (typeof value === 'number') return 'number';
  return 'string';
}

function toStrings(value: unknown): string[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.flatMap(toStrings);
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    return [obj.nome, obj.label, obj.link, obj.url]
      .filter(v => typeof v === 'string' && v)
      .map(String);
  }
  return [String(value)];
}

/** Valores que servem como filtro/agrupamento (URLs ficam de fora: não agrupam nada). */
export function facetValues(item: ModelData, key: string): string[] {
  const entry = (item.customdata ?? []).find(e => Object.keys(e)[0] === key);
  if (!entry) return [];
  if (fieldType(key) === 'link') return [];
  const value = Object.values(entry)[0];
  if (value && typeof value === 'object' && !Array.isArray(value)) return [];
  return toStrings(value);
}

const searchCache = new WeakMap<ModelData, string>();

/** Todo o texto pesquisável do modelo: título, slug, descrição, dimensões e metadados. */
function searchText(item: ModelData): string {
  const cached = searchCache.get(item);
  if (cached) return cached;

  const parts: string[] = [item.nome, item.link, item.descricao ?? ''];

  if (item.dimensions) {
    parts.push(item.dimensions.altura, item.dimensions.largura ?? '', item.dimensions.profundidade ?? '');
  }

  for (const entry of item.customdata ?? []) {
    const key = Object.keys(entry)[0];
    // a chave e o rótulo entram junto: buscar por "materiais" encontra o campo
    parts.push(key, fieldLabel(key), ...toStrings(Object.values(entry)[0]));
  }

  const text = normalize(parts.join(' '));
  searchCache.set(item, text);
  return text;
}

/** Busca por termos: cada palavra precisa aparecer em algum campo do modelo. */
export function searchItems(items: ModelData[], query: string): ModelData[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return items;
  return items.filter(item => {
    const haystack = searchText(item);
    return terms.every(term => haystack.includes(term));
  });
}

/** OU dentro do mesmo metadado, E entre metadados diferentes. */
export function filterItems(items: ModelData[], filters: Filters): ModelData[] {
  const active = Object.entries(filters).filter(([, values]) => values.length > 0);
  if (active.length === 0) return items;

  return items.filter(item =>
    active.every(([key, values]) => {
      const own = facetValues(item, key).map(normalize);
      return values.some(value => own.includes(normalize(value)));
    })
  );
}

export function countActiveFilters(filters: Filters): number {
  return Object.values(filters).reduce((total, values) => total + values.length, 0);
}

export function activeFilterList(filters: Filters): Array<{ key: string; value: string }> {
  return Object.entries(filters).flatMap(([key, values]) => values.map(value => ({ key, value })));
}

export function toggleFilterValue(filters: Filters, key: string, value: string): Filters {
  const current = filters[key] ?? [];
  const next = current.includes(value)
    ? current.filter(v => v !== value)
    : [...current, value];

  const updated = { ...filters, [key]: next };
  if (next.length === 0) delete updated[key];
  return updated;
}

/**
 * Facetas dos itens informados. Valores já selecionados continuam na lista
 * mesmo zerados, para o filtro nunca sumir debaixo do dedo de quem clicou.
 */
export function buildFacets(items: ModelData[], filters: Filters = {}): Facet[] {
  const counts = new Map<string, Map<string, number>>();

  const bucketOf = (key: string) => {
    let bucket = counts.get(key);
    if (!bucket) {
      bucket = new Map<string, number>();
      counts.set(key, bucket);
    }
    return bucket;
  };

  for (const item of items) {
    for (const entry of item.customdata ?? []) {
      const key = Object.keys(entry)[0];
      const values = facetValues(item, key);
      if (values.length === 0) continue;
      const bucket = bucketOf(key);
      for (const value of new Set(values)) {
        bucket.set(value, (bucket.get(value) ?? 0) + 1);
      }
    }
  }

  for (const [key, values] of Object.entries(filters)) {
    const bucket = bucketOf(key);
    for (const value of values) {
      if (!bucket.has(value)) bucket.set(value, 0);
    }
  }

  return [...counts.entries()]
    .map(([key, bucket]) => ({
      key,
      label: fieldLabel(key),
      type: fieldType(key),
      values: [...bucket.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, 'pt')),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt'));
}

/** Agrupa por um metadado; um modelo com vários valores aparece em cada grupo. */
export function groupItems(items: ModelData[], key: string | null): ItemGroup[] {
  if (!key) return [{ key: 'all', label: null, items }];

  const groups = new Map<string, ModelData[]>();
  const semValor: ModelData[] = [];

  for (const item of items) {
    const values = facetValues(item, key);
    if (values.length === 0) {
      semValor.push(item);
      continue;
    }
    for (const value of new Set(values)) {
      const bucket = groups.get(value);
      if (bucket) bucket.push(item);
      else groups.set(value, [item]);
    }
  }

  const result: ItemGroup[] = [...groups.entries()]
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'pt'))
    .map(([label, groupItems]) => ({ key: `${key}:${label}`, label, items: groupItems }));

  // grupo dos que não têm o metadado vai para o fim, sem rótulo próprio
  if (semValor.length > 0) result.push({ key: `${key}:__sem__`, label: '', items: semValor });

  return result;
}
