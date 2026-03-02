import { useState, useEffect } from 'react';
import { useDataFile } from '../useDataManager';

interface CollectionConfig {
  nome?: string;
  link?: string;
  descricao?: string;
  autoria?: string;
  dataCriacao?: string;
  categoria?: string;
  licenca?: string;
  thumbnail?: string;
}

const DEFAULTS: CollectionConfig = {
  nome: '', link: '', descricao: '', autoria: '',
  dataCriacao: '', categoria: '', licenca: '', thumbnail: '',
};

export default function CollectionConfigEditor() {
  const { data, loading, saveData, error } = useDataFile<CollectionConfig>('collectionconfig');
  const [form, setForm] = useState<CollectionConfig>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setForm({ ...DEFAULTS, ...data });
  }, [data]);

  const handleSave = async () => {
    const ok = await saveData(form);
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  const set = (key: keyof CollectionConfig) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }));

  if (loading) return <div className="dm-loading">Loading...</div>;

  return (
    <div className="dm-config-layout">
      {error && <div className="dm-error">{error}</div>}

      <div className="dm-config-form-card">
        {[
          { label: 'Nome da coleção',    key: 'nome'        },
          { label: 'Link da coleção',    key: 'link'        },
          { label: 'Autoria da coleção', key: 'autoria'     },
          { label: 'Data de criação',    key: 'dataCriacao' },
          { label: 'Categoria',          key: 'categoria'   },
          { label: 'Licença',            key: 'licenca'     },
        ].map(({ label, key }) => (
          <div key={key} className="dm-field">
            <label className="dm-field-label">{label}</label>
            <input
              className="dm-field-input"
              value={form[key as keyof CollectionConfig] || ''}
              onChange={set(key as keyof CollectionConfig)}
              placeholder={label}
            />
          </div>
        ))}

        <div className="dm-field">
          <label className="dm-field-label">Descrição da coleção</label>
          <textarea
            className="dm-field-textarea"
            value={form.descricao || ''}
            onChange={set('descricao')}
            placeholder="Descrição da coleção"
          />
        </div>
      </div>

      <div className="dm-config-sidebar">
        <div className="dm-config-thumb">
          {form.thumbnail
            ? <img src={form.thumbnail} alt="thumbnail" />
            : <span className="dm-config-thumb-empty">Sem imagem</span>
          }
        </div>
        <div className="dm-field">
          <label className="dm-field-label" style={{ fontSize: 13 }}>URL da imagem</label>
          <input
            className="dm-field-input"
            value={form.thumbnail || ''}
            onChange={set('thumbnail')}
            placeholder="https://..."
          />
        </div>
        <button className="dm-config-action-btn">⬡ Alterar tema</button>
        <button className="dm-config-action-btn">A Alterar fonte</button>
        <button className="dm-config-save-btn" onClick={handleSave}>
          {saved ? 'Salvo!' : 'Salvar Configurações'}
        </button>
      </div>
    </div>
  );
}
