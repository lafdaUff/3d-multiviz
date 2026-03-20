import { useState, useRef, useCallback } from 'react';
import { useDataFile } from '../useDataManager';
import { generateThumbnail, extractDimensions } from '../generateThumbnail';
import type { ModelData, CustomData } from '../../data/schema';

interface SchemaField {
  type: string;
  description: string;
  name?: string;
  items?: { type: string };
}
type SchemaEntry = Record<string, SchemaField>;

const TYPE_LABELS: Record<string, string> = {
  string: 'Texto', number: 'Número', date: 'Data',
  link: 'Link', array: 'Lista', boolean: 'Sim/Não',
};

function slugify(filename: string) {
  return filename
    .replace(/\.glb$/i, '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

async function uploadModel(file: File): Promise<string> {
  const slug = slugify(file.name);
  const res = await fetch(`/__data-manager/upload-model?filename=${slug}.glb`, {
    method: 'POST',
    body: file,
  });
  if (!res.ok) throw new Error('Upload failed');
  return slug;
}

async function uploadThumbBlob(blob: Blob, thumbName: string): Promise<void> {
  const res = await fetch(`/__data-manager/upload-thumb?filename=${thumbName}.png`, {
    method: 'POST',
    body: blob,
  });
  if (!res.ok) throw new Error('Thumb upload failed');
}

async function uploadThumbFile(file: File, thumbName: string): Promise<void> {
  const ext = file.name.split('.').pop() || 'png';
  const res = await fetch(`/__data-manager/upload-thumb?filename=${thumbName}.${ext}`, {
    method: 'POST',
    body: file,
  });
  if (!res.ok) throw new Error('Thumb upload failed');
}

function ModelCard({ item, onEdit, onDelete }: {
  item: ModelData; onEdit: () => void; onDelete: () => void;
}) {
  const thumbUrl = `/thumbs/${item.thumb}.png`;
  const customCount = item.customdata?.length ?? 0;

  return (
    <div className="dm-model-card">
      <div className="dm-model-thumb">
        <img src={thumbUrl} alt={item.nome} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        <span className="dm-model-thumb-fallback">{item.nome.charAt(0)}</span>
      </div>
      <div className="dm-model-card-body">
        <span className="dm-model-card-name">{item.nome}</span>
        <span className="dm-model-card-slug">{item.link}</span>
        {customCount > 0 && (
          <span className="dm-model-card-meta">{customCount} metadado{customCount > 1 ? 's' : ''}</span>
        )}
      </div>
      <div className="dm-model-card-actions">
        <button className="dm-meta-action-btn" onClick={onEdit}>✎ Editar</button>
        <button className="dm-meta-action-btn dm-meta-action-danger" onClick={onDelete}>⌫ Excluir</button>
      </div>
    </div>
  );
}

function CustomDataField({ cd, index, schema, onChange, onRemove }: {
  cd: CustomData; index: number;
  schema: SchemaEntry[] | null;
  onChange: (i: number, key: string, val: unknown) => void;
  onRemove: (i: number) => void;
}) {
  const key = Object.keys(cd)[0];
  const value = cd[key];
  const schemaEntry = schema?.find(s => Object.keys(s)[0] === key);
  const field = schemaEntry ? Object.values(schemaEntry)[0] : null;
  const fieldType = field?.type || 'string';

  const renderInput = () => {
    if (fieldType === 'array' && Array.isArray(value)) {
      return (
        <input
          className="dm-field-input"
          value={(value as string[]).join(', ')}
          onChange={e => onChange(index, key, e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
          placeholder="Valores separados por vírgula"
        />
      );
    }

    if (fieldType === 'link' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const linkObj = value as Record<string, unknown>;
      return (
        <div className="dm-model-link-row">
          <input
            className="dm-field-input"
            placeholder="Nome"
            value={String(linkObj.nome || '')}
            onChange={e => onChange(index, key, { ...linkObj, nome: e.target.value })}
          />
          <input
            className="dm-field-input"
            placeholder="URL"
            value={String(linkObj.link || '')}
            onChange={e => onChange(index, key, { ...linkObj, link: e.target.value })}
          />
        </div>
      );
    }

    if (fieldType === 'number') {
      return (
        <input
          className="dm-field-input"
          type="number"
          value={String(value)}
          onChange={e => onChange(index, key, Number(e.target.value))}
        />
      );
    }

    return (
      <input
        className="dm-field-input"
        value={String(value)}
        onChange={e => onChange(index, key, e.target.value)}
      />
    );
  };

  return (
    <div className="dm-model-custom-row">
      <div className="dm-model-custom-row-header">
        <span className="dm-model-custom-label">
          {field?.name || key}
          <span className="dm-field-label-hint">{TYPE_LABELS[fieldType] || fieldType}</span>
        </span>
        <button className="dm-meta-action-btn dm-meta-action-danger" onClick={() => onRemove(index)}>✕</button>
      </div>
      {renderInput()}
    </div>
  );
}

function GlbDropZone({ onFile, currentSlug }: {
  onFile: (file: File) => void; currentSlug: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.glb')) onFile(file);
  }, [onFile]);

  return (
    <div
      className={`dm-model-dropzone${dragging ? ' dragging' : ''}${currentSlug ? ' has-file' : ''}`}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".glb"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
      {currentSlug ? (
        <>
          <span className="dm-dropzone-icon">✓</span>
          <span className="dm-dropzone-filename">{currentSlug}.glb</span>
          <span className="dm-dropzone-hint">Clique ou arraste para substituir</span>
        </>
      ) : (
        <>
          <span className="dm-dropzone-icon">↑</span>
          <span className="dm-dropzone-label">Arraste o modelo .glb aqui</span>
          <span className="dm-dropzone-hint">ou clique para selecionar</span>
        </>
      )}
    </div>
  );
}

function ThumbUploadZone({ thumbName, onFile }: {
  thumbName: string; onFile: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const thumbUrl = thumbName ? `/thumbs/${thumbName}.png?t=${Date.now()}` : '';

  return (
    <div className="dm-model-thumb-upload" onClick={() => inputRef.current?.click()}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
      {thumbUrl ? (
        <img src={thumbUrl} alt="thumb" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      ) : null}
      <div className="dm-model-thumb-overlay">
        <span>Alterar thumbnail</span>
      </div>
    </div>
  );
}

interface ModalState {
  mode: 'add' | 'edit';
  index?: number;
  form: ModelData;
  customData: CustomData[];
  uploading: boolean;
  proportionalLock: boolean;
  extracting: boolean;
}

function ModelModal({ state, schema, onSave, onCancel, onChange }: {
  state: ModalState;
  schema: SchemaEntry[] | null;
  onSave: () => void;
  onCancel: () => void;
  onChange: (s: ModalState) => void;
}) {
  const { form, customData, uploading, mode, proportionalLock, extracting } = state;

  const setForm = (patch: Partial<ModelData>) =>
    onChange({ ...state, form: { ...form, ...patch } });

  const handleGlbFile = async (file: File) => {
    onChange({ ...state, uploading: true });
    try {
      const slug = await uploadModel(file);
      const thumbSlug = form.thumb || slug;
      let autoDimensions: { altura: string; largura: string; profundidade: string } | undefined;

      try {
        const result = await generateThumbnail(file);
        await uploadThumbBlob(result.blob, thumbSlug);
        autoDimensions = result.dimensions;
      } catch (e) {
        console.warn('Auto-thumbnail generation failed:', e);
      }

      onChange({
        ...state,
        uploading: false,
        form: {
          ...form,
          link: slug,
          thumb: thumbSlug,
          nome: form.nome || file.name.replace(/\.glb$/i, ''),
          dimensions: autoDimensions || form.dimensions,
        },
      });
    } catch {
      onChange({ ...state, uploading: false });
    }
  };

  const handleThumbFile = async (file: File) => {
    const thumbName = form.thumb || form.link;
    if (!thumbName) return;
    try {
      await uploadThumbFile(file, thumbName);
      onChange({ ...state, form: { ...form, thumb: thumbName } });
    } catch { /* ignore */ }
  };

  const handleDimensionChange = (field: 'altura' | 'largura' | 'profundidade', value: string) => {
    const prev: Record<string, string> = {
      altura: form.dimensions?.altura || '',
      largura: form.dimensions?.largura || '',
      profundidade: form.dimensions?.profundidade || '',
    };

    const oldNum = parseFloat(prev[field]);
    const newNum = parseFloat(value);
    const next = { ...prev, [field]: value };

    if (proportionalLock && oldNum > 0 && newNum > 0 && oldNum !== newNum) {
      const ratio = newNum / oldNum;
      for (const key of ['altura', 'largura', 'profundidade']) {
        if (key !== field) {
          const v = parseFloat(prev[key]);
          if (v > 0) next[key] = String(Math.round(v * ratio * 100) / 100);
        }
      }
    }

    setForm({
      dimensions: {
        altura: next.altura,
        largura: next.largura || undefined,
        profundidade: next.profundidade || undefined,
      },
    });
  };

  const handleExtractDimensions = async () => {
    if (!form.link) return;
    onChange({ ...state, extracting: true });
    try {
      const dims = await extractDimensions(form.link);
      onChange({ ...state, extracting: false, form: { ...form, dimensions: dims } });
    } catch {
      onChange({ ...state, extracting: false });
    }
  };

  const addCustomField = (fieldName: string) => {
    const schemaEntry = schema?.find(s => Object.keys(s)[0] === fieldName);
    const fieldType = schemaEntry ? Object.values(schemaEntry)[0].type : 'string';
    let defaultValue: unknown = '';
    if (fieldType === 'number') defaultValue = 0;
    if (fieldType === 'array') defaultValue = [];
    if (fieldType === 'link') defaultValue = { nome: '', link: '' };
    onChange({ ...state, customData: [...customData, { [fieldName]: defaultValue } as CustomData] });
  };

  const updateCustom = (i: number, key: string, val: unknown) => {
    const updated = [...customData];
    updated[i] = { [key]: val } as CustomData;
    onChange({ ...state, customData: updated });
  };

  const removeCustom = (i: number) => {
    onChange({ ...state, customData: customData.filter((_, idx) => idx !== i) });
  };

  const availableFields = schema
    ? schema
        .map(s => Object.keys(s)[0])
        .filter(name => !customData.some(cd => Object.keys(cd)[0] === name))
    : [];

  return (
    <div className="dm-modal-backdrop" onClick={onCancel}>
      <div className="dm-model-modal" onClick={e => e.stopPropagation()}>

        <div className="dm-model-modal-left">
          <GlbDropZone onFile={handleGlbFile} currentSlug={form.link} />
          <ThumbUploadZone thumbName={form.thumb} onFile={handleThumbFile} />
        </div>

        <div className="dm-model-modal-right">
          <p className="dm-model-modal-title">
            {mode === 'add' ? 'Adicionar Modelo' : 'Editar Modelo'}
          </p>

          <div className="dm-model-modal-fields">
            <div className="dm-field">
              <label className="dm-field-label">Nome</label>
              <input
                className="dm-field-input"
                value={form.nome}
                onChange={e => setForm({ nome: e.target.value })}
                placeholder="Nome do modelo"
                autoFocus
              />
            </div>

            <div className="dm-model-row-2">
              <div className="dm-field">
                <label className="dm-field-label">Link <span className="dm-field-label-hint">*Auto do arquivo</span></label>
                <input
                  className="dm-field-input"
                  value={form.link}
                  onChange={e => setForm({ link: e.target.value })}
                  placeholder="slug_do_modelo"
                />
              </div>
              <div className="dm-field">
                <label className="dm-field-label">Thumb <span className="dm-field-label-hint">*Auto do link</span></label>
                <input
                  className="dm-field-input"
                  value={form.thumb}
                  onChange={e => setForm({ thumb: e.target.value })}
                  placeholder={form.link || 'thumbnail'}
                />
              </div>
            </div>

            <div className="dm-field">
              <label className="dm-field-label">Descrição</label>
              <textarea
                className="dm-field-textarea"
                value={form.descricao || ''}
                onChange={e => setForm({ descricao: e.target.value })}
                placeholder="Descrição do modelo"
              />
            </div>

            <div className="dm-field">
              <div className="dm-dimensions-header">
                <label className="dm-field-label">Dimensões <span className="dm-field-label-hint">cm</span></label>
                <div className="dm-dimensions-actions">
                  <button
                    type="button"
                    className="dm-lock-btn"
                    onClick={handleExtractDimensions}
                    disabled={!form.link || extracting}
                    title="Extrair dimensões do modelo"
                  >
                    <i className={`fa-solid ${extracting ? 'fa-spinner fa-spin' : 'fa-cube'}`} />
                  </button>
                  <button
                    type="button"
                    className={`dm-lock-btn${proportionalLock ? ' active' : ''}`}
                    onClick={() => onChange({ ...state, proportionalLock: !proportionalLock })}
                    title={proportionalLock ? 'Proporção travada' : 'Proporção destravada'}
                  >
                    <i className={`fa-solid ${proportionalLock ? 'fa-link' : 'fa-link-slash'}`} />
                  </button>
                </div>
              </div>
              <div className="dm-model-row-3">
                <div className="dm-field">
                  <label className="dm-field-label-sm">Altura</label>
                  <input
                    className="dm-field-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.dimensions?.altura || ''}
                    onChange={e => handleDimensionChange('altura', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="dm-field">
                  <label className="dm-field-label-sm">Largura</label>
                  <input
                    className="dm-field-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.dimensions?.largura || ''}
                    onChange={e => handleDimensionChange('largura', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="dm-field">
                  <label className="dm-field-label-sm">Profundidade</label>
                  <input
                    className="dm-field-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.dimensions?.profundidade || ''}
                    onChange={e => handleDimensionChange('profundidade', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {(schema && schema.length > 0) && (
            <div className="dm-model-custom-section">
              <div className="dm-model-custom-header">
                <span className="dm-field-label">Metadados customizados</span>
                {availableFields.length > 0 && (
                  <div className="dm-select-wrapper dm-model-add-field-select">
                    <select
                      className="dm-field-input dm-select-input"
                      onChange={e => { if (e.target.value) { addCustomField(e.target.value); e.target.value = ''; } }}
                      defaultValue=""
                    >
                      <option value="" disabled>+ Adicionar campo</option>
                      {availableFields.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <span className="dm-select-arrow">▾</span>
                  </div>
                )}
              </div>
              {customData.map((cd, i) => (
                <CustomDataField
                  key={i}
                  cd={cd}
                  index={i}
                  schema={schema}
                  onChange={updateCustom}
                  onRemove={removeCustom}
                />
              ))}
            </div>
          )}

          <div className="dm-modal-actions">
            <button className="dm-modal-cancel" onClick={onCancel}>Cancelar</button>
            <button
              className="dm-modal-confirm"
              disabled={uploading || !form.link.trim()}
              onClick={onSave}
            >
              {uploading ? 'Enviando...' : mode === 'add' ? 'Adicionar' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DatabaseEditor() {
  const { data, loading, error, saveData } = useDataFile<ModelData[]>('database');
  const { data: schema } = useDataFile<SchemaEntry[]>('dataschema');
  const [saved, setSaved] = useState(false);
  const [modal, setModal] = useState<ModalState | null>(null);

  if (loading) return <div className="dm-loading">Loading...</div>;
  if (!data) return <div className="dm-error">Sem dados</div>;

  const save = async (updated: ModelData[]) => {
    const ok = await saveData(updated);
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  const openAdd = () => setModal({
    mode: 'add',
    form: { nome: '', link: '', thumb: '' },
    customData: [],
    uploading: false,
    proportionalLock: true,
    extracting: false,
  });

  const openEdit = (index: number) => {
    const item = data[index];
    setModal({
      mode: 'edit',
      index,
      form: { ...item },
      customData: item.customdata ? item.customdata.map(d => ({ ...d })) : [],
      uploading: false,
      proportionalLock: true,
      extracting: false,
    });
  };

  const handleSave = () => {
    if (!modal) return;
    const dims = modal.form.dimensions;
    const cleanDims = dims?.altura
      ? {
          altura: dims.altura,
          ...(dims.largura ? { largura: dims.largura } : {}),
          ...(dims.profundidade ? { profundidade: dims.profundidade } : {}),
        }
      : undefined;
    const item: ModelData = {
      ...modal.form,
      thumb: modal.form.thumb || modal.form.link,
      customdata: modal.customData.length > 0 ? modal.customData : undefined,
      dimensions: cleanDims,
    };
    if (modal.mode === 'add') {
      save([...data, item]);
    } else if (modal.mode === 'edit' && modal.index !== undefined) {
      const updated = [...data];
      updated[modal.index] = item;
      save(updated);
    }
    setModal(null);
  };

  const handleDelete = (index: number) => {
    save(data.filter((_, i) => i !== index));
  };

  return (
    <div className="dm-schema-layout">
      {error && <div className="dm-error dm-full-width">{error}</div>}
      {saved && <div className="dm-success dm-full-width">Salvo!</div>}

      <div className="dm-schema-top-bar">
        <button className="dm-schema-add-btn" onClick={openAdd}>
          + Adicionar Modelo
        </button>
      </div>

      {data.length === 0 ? (
        <div className="dm-meta-section">
          <div className="dm-meta-empty">
            <p className="dm-meta-empty-title">Nenhum modelo cadastrado</p>
            <p className="dm-meta-empty-sub">Cadastre clicando em "Adicionar Modelo"</p>
          </div>
        </div>
      ) : (
        <div className="dm-model-grid">
          {data.map((item, i) => (
            <ModelCard
              key={i}
              item={item}
              onEdit={() => openEdit(i)}
              onDelete={() => handleDelete(i)}
            />
          ))}
        </div>
      )}

      {modal && (
        <ModelModal
          state={modal}
          schema={schema}
          onSave={handleSave}
          onCancel={() => setModal(null)}
          onChange={setModal}
        />
      )}
    </div>
  );
}
