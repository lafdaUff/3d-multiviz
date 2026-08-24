import { useTranslation } from "react-i18next";
import { fieldLabel, resolveType } from "../../data/catalog";

interface MetadataItemProps {
  metadataEntry: Record<string, unknown>;
  onFilter?: (key: string, value: string) => void;
}

export default function MetadataItem({ metadataEntry, onFilter }: MetadataItemProps) {
  const { t } = useTranslation();

  const metaKey = Object.keys(metadataEntry)[0];
  const metaValue = Object.values(metadataEntry)[0];

  const label = fieldLabel(metaKey);
  const schemaType = resolveType(metaKey, metaValue);

  // um valor clicável leva de volta à lista já filtrada por ele
  const value = (text: string, filterValue = text) => {
    if (!onFilter) return <small key={text}>{text}</small>;
    return (
      <button
        key={text}
        type="button"
        className="metadata-value"
        title={t("filters.seeSimilar", { value: text })}
        onClick={() => onFilter(metaKey, filterValue)}
      >
        <small>{text}</small>
      </button>
    );
  };

  const renderValue = () => {
    switch (schemaType) {
      case 'number':
        return value(Number(metaValue).toLocaleString('pt-BR'), String(metaValue));

      case 'array':
        if (Array.isArray(metaValue)) {
          return <span className="metadata-values">{metaValue.map(item => value(String(item)))}</span>;
        }
        return value(String(metaValue));

      case 'link': {
        if (typeof metaValue === 'object' && metaValue !== null && 'link' in metaValue) {
          const link = metaValue as { link: string; nome?: string };
          return (
            <a href={link.link} target="_blank" rel="noopener noreferrer">
              <small>{link.nome || link.link}</small>
            </a>
          );
        }
        return <small>{String(metaValue)}</small>;
      }

      default:
        return value(String(metaValue));
    }
  };

  return (
    <li className="metadata-item">
      <p className="bold">{label}: </p>
      {renderValue()}
    </li>
  );
}
