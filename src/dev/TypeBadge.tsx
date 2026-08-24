import { TYPE_ICONS, TYPE_LABELS } from './fieldTypes';

export default function TypeBadge({ type }: { type: string }) {
  return (
    <span className="dm-type-badge" data-type={type}>
      <i className={`fa-solid ${TYPE_ICONS[type] || 'fa-font'}`} />
      {TYPE_LABELS[type] || type}
    </span>
  );
}
