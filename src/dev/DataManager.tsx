import { useState } from 'react';
import DatabaseEditor from './editors/DatabaseEditor';
import SchemaEditor from './editors/SchemaEditor';
import CollectionConfigEditor from './editors/CollectionConfigEditor';
import './DataManager.css';

type Tab = 'config' | 'schema' | 'database';

const TAB_LABELS: Record<Tab, string> = {
  config: 'Configurações da coleção',
  schema: 'Campos de metadados',
  database: 'Modelos',
};

const TAB_SUBTITLES: Record<Tab, string> = {
  config: 'Informações gerais que identificam esta coleção',
  schema: 'Defina a estrutura: quais campos os modelos podem preencher',
  database: 'Cadastre os modelos 3D e preencha os metadados de cada um',
};

export default function DataManager() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('config');

  return (
    <>
      <button
        className="dm-toggle"
        onClick={() => setOpen(!open)}
        title="Data Manager (Dev Only)"
      >
        {open ? '\u2715' : '\u2699'}
      </button>

      {open && (
        <div className="dm-fullscreen">
          <nav className="dm-tab-bar">
            {(Object.keys(TAB_LABELS) as Tab[]).map(tab => (
              <button
                key={tab}
                className={`dm-tab-btn${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </nav>

          <h2 className="dm-page-title">{TAB_LABELS[activeTab]}</h2>
          <p className="dm-page-subtitle">{TAB_SUBTITLES[activeTab]}</p>

          <div className="dm-body">
            {activeTab === 'config' && <CollectionConfigEditor />}
            {activeTab === 'schema' && <SchemaEditor />}
            {activeTab === 'database' && <DatabaseEditor />}
          </div>
        </div>
      )}
    </>
  );
}
