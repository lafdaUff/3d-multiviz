import { useState } from 'react';
import { useDataFile } from '../useDataManager';

interface SchemaField {
  type: string;
  description: string;
  name?: string;
  items?: { type: string };
}

type SchemaEntry = Record<string, SchemaField>;

const TYPES = ['string', 'number', 'date', 'link', 'array', 'boolean'];
const TYPE_LABELS: Record<string, string> = {
  string: 'Texto', number: 'Número', date: 'Data',
  link: 'Link', array: 'Lista', boolean: 'Sim/Não',
};

// Regra que o valor deste campo terá de cumprir na aba Modelos
const TYPE_HINTS: Record<string, string> = {
  string: 'Aceita qualquer texto',
  number: 'Aceita apenas números',
  date: 'Aceita AAAA, AAAA-MM-DD ou DD/MM/AAAA',
  link: 'Exige uma URL http:// ou https://',
  array: 'Aceita vários valores separados por vírgula',
  boolean: 'Aceita apenas Sim ou Não',
};

const DEFAULT_FIELDS = [
  { id: 'nome',      name: 'Nome',      description: 'Nome da obra ou modelo',      type: 'string' },
  { id: 'link',      name: 'Link',      description: 'Slug/URL único do modelo',    type: 'string' },
  { id: 'thumb',     name: 'Thumbnail', description: 'URL da imagem de capa',       type: 'string' },
  { id: 'descricao', name: 'Descrição', description: 'Descrição detalhada da obra', type: 'string' },
];

function toId(name: string) {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

function MetaCard({ name, description, id, type, onEdit, onDelete }: {
  name: string; description: string; id: string; type: string;
  onEdit?: () => void; onDelete?: () => void;
}) {
  return (
    <div className="dm-meta-card">
      <div className="dm-meta-info">
        <span className="dm-meta-name">{name}</span>
        <span className="dm-meta-desc">{description}</span>
      </div>
      <div className="dm-meta-divider" />
      <div className="dm-meta-col">
        <span className="dm-meta-col-label">ID</span>
        <span className="dm-meta-col-value">{id}</span>
      </div>
      <div className="dm-meta-divider" />
      <div className="dm-meta-col">
        <span className="dm-meta-col-label">Tipo</span>
        <span className="dm-meta-col-value">{TYPE_LABELS[type] || type}</span>
      </div>
      {onEdit && (
        <>
          <div className="dm-meta-divider" />
          <div className="dm-meta-actions">
            <button className="dm-meta-action-btn" onClick={onEdit}>✎ Editar</button>
            <button className="dm-meta-action-btn dm-meta-action-danger" onClick={onDelete}>⌫ Excluir</button>
          </div>
        </>
      )}
    </div>
  );
}

function MetaModal({ initial, existingIds, onConfirm, onCancel, confirmLabel }: {
  initial: { name: string; id: string; type: string; idLocked?: boolean };
  existingIds: string[];
  onConfirm: (values: { name: string; id: string; type: string }) => void;
  onCancel: () => void;
  confirmLabel: string;
}) {
  const [name, setName] = useState(initial.name);
  const [id, setId] = useState(initial.id);
  const [type, setType] = useState(initial.type);
  const [idEdited, setIdEdited] = useState(initial.idLocked ?? false);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!idEdited) setId(toId(val));
  };

  const handleIdChange = (val: string) => {
    setId(val);
    setIdEdited(true);
  };

  const idLocked = initial.idLocked ?? false;
  const trimmedId = id.trim();

  const nameError = name.trim() ? null : 'Informe o nome do campo';

  const idError = idLocked
    ? null
    : !trimmedId
      ? 'Informe o ID'
      : !/^[a-z][a-z0-9_]*$/.test(trimmedId)
        ? 'Use apenas letras minúsculas, números e _ (comece por uma letra)'
        : existingIds.includes(trimmedId)
          ? 'Já existe um campo com este ID'
          : null;

  const typeError = TYPES.includes(type) ? null : 'Selecione um tipo válido';
  const isValid = !nameError && !idError && !typeError;

  return (
    <div className="dm-modal-backdrop" onClick={onCancel}>
      <div className="dm-modal" onClick={e => e.stopPropagation()}>
        <div className="dm-field">
          <label className="dm-field-label">Nome do campo</label>
          <input
            className={`dm-field-input${nameError ? ' dm-field-input-error' : ''}`}
            value={name}
            onChange={e => handleNameChange(e.target.value)}
            placeholder="Ex.: Material"
            autoFocus
          />
          {nameError && <span className="dm-field-error">{nameError}</span>}
        </div>

        <div className="dm-field">
          <label className="dm-field-label">
            ID <span className="dm-field-label-hint">
              {idLocked ? '*Não pode ser alterado' : '*Gerado automaticamente'}
            </span>
          </label>
          <input
            className={`dm-field-input${idLocked ? ' dm-field-input-disabled' : ''}${idError ? ' dm-field-input-error' : ''}`}
            value={id}
            onChange={e => handleIdChange(e.target.value)}
            placeholder="material"
            readOnly={idLocked}
          />
          {idError && <span className="dm-field-error">{idError}</span>}
        </div>

        <div className="dm-field">
          <label className="dm-field-label">Tipo de valor</label>
          <div className="dm-select-wrapper">
            <select
              className="dm-field-input dm-select-input"
              value={type}
              onChange={e => setType(e.target.value)}
            >
              {TYPES.map(t => (
                <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>
              ))}
            </select>
            <span className="dm-select-arrow">▾</span>
          </div>
          <span className="dm-field-help">{TYPE_HINTS[type]}</span>
        </div>

        <div className="dm-modal-actions">
          <button className="dm-modal-cancel" onClick={onCancel}>Cancelar</button>
          <button
            className="dm-modal-confirm"
            disabled={!isValid}
            onClick={() => { if (isValid) onConfirm({ name, id: trimmedId, type }); }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

type ModalMode = { kind: 'add' } | { kind: 'edit'; index: number };

export default function SchemaEditor() {
  const { data, loading, error, saveData } = useDataFile<SchemaEntry[]>('dataschema');
  const [saved, setSaved] = useState(false);
  const [modal, setModal] = useState<ModalMode | null>(null);

  if (loading) return <div className="dm-loading">Loading...</div>;

  const save = async (updated: SchemaEntry[]) => {
    const ok = await saveData(updated);
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  const handleAdd = ({ name, id, type }: { name: string; id: string; type: string }) => {
    const field: SchemaField = { name: name || id, type, description: '' };
    save([...(data || []), { [id]: field }]);
    setModal(null);
  };

  const handleEditSave = (index: number, { name, type }: { name: string; id: string; type: string }) => {
    const entry = (data || [])[index];
    const key = Object.keys(entry)[0];
    const prev = entry[key];
    const updated = [...(data || [])];
    updated[index] = { [key]: { ...prev, name: name || key, type, description: prev.description } };
    save(updated);
    setModal(null);
  };

  const handleDelete = (index: number) =>
    save((data || []).filter((_, i) => i !== index));

  const hasCustom = data && data.length > 0;

  const allIds = (data || []).map(entry => Object.keys(entry)[0]);

  const editInitial = (() => {
    if (modal?.kind !== 'edit') return null;
    const entry = (data || [])[modal.index];
    const key = Object.keys(entry)[0];
    const field = entry[key];
    return { name: field.name || key, id: key, type: field.type, idLocked: true };
  })();

  return (
    <div className="dm-schema-layout">
      {error && <div className="dm-error dm-full-width">{error}</div>}
      {saved && <div className="dm-success dm-full-width">Salvo!</div>}

      <div className="dm-schema-top-bar">
        <button className="dm-schema-add-btn" onClick={() => setModal({ kind: 'add' })}>
          + Adicionar campo
        </button>
      </div>

      <div className="dm-meta-section">
        <p className="dm-meta-section-title">Campos padrão</p>
        <p className="dm-meta-section-sub">Presentes em todo modelo, não podem ser alterados</p>
        <hr className="dm-meta-hr" />
        <div className="dm-meta-list">
          {DEFAULT_FIELDS.map(f => (
            <MetaCard key={f.id} name={f.name} description={f.description} id={f.id} type={f.type} />
          ))}
        </div>

        <p className="dm-meta-section-title">Campos personalizados</p>
        <p className="dm-meta-section-sub">Ficam disponíveis para preenchimento na aba Modelos</p>
        <hr className="dm-meta-hr" />

        {!hasCustom ? (
          <div className="dm-meta-empty">
            <p className="dm-meta-empty-title">Nenhum campo personalizado</p>
            <p className="dm-meta-empty-sub">Crie um clicando em "Adicionar campo"</p>
          </div>
        ) : (
          <div className="dm-meta-list">
            {(data || []).map((entry, i) => {
              const key = Object.keys(entry)[0];
              const field = entry[key];
              return (
                <MetaCard
                  key={i}
                  name={field.name || key}
                  description={field.description}
                  id={key}
                  type={field.type}
                  onEdit={() => setModal({ kind: 'edit', index: i })}
                  onDelete={() => handleDelete(i)}
                />
              );
            })}
          </div>
        )}
      </div>

      {modal?.kind === 'add' && (
        <MetaModal
          initial={{ name: '', id: '', type: 'string' }}
          existingIds={allIds}
          onConfirm={handleAdd}
          onCancel={() => setModal(null)}
          confirmLabel="Adicionar"
        />
      )}

      {modal?.kind === 'edit' && editInitial && (
        <MetaModal
          initial={editInitial}
          existingIds={allIds.filter((_, i) => i !== modal.index)}
          onConfirm={v => handleEditSave(modal.index, v)}
          onCancel={() => setModal(null)}
          confirmLabel="Salvar"
        />
      )}
    </div>
  );
}
