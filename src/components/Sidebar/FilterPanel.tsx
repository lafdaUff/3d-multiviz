import { useTranslation } from "react-i18next"
import { type Facet, type Filters } from "../../data/catalog"

interface FilterPanelProps {
    facets: Facet[]
    groupOptions: Array<{ key: string; label: string }>
    filters: Filters
    groupBy: string | null
    resultCount: number
    onToggleValue: (key: string, value: string) => void
    onGroupChange: (key: string | null) => void
    onClear: () => void
    onClose: () => void
}

export default function FilterPanel({
    facets, groupOptions, filters, groupBy, resultCount,
    onToggleValue, onGroupChange, onClear, onClose,
}: FilterPanelProps) {

    const { t } = useTranslation()
    const hasFilters = Object.values(filters).some(values => values.length > 0)

    return (
        <div className="filter-panel">
            <div className="filter-panel-header flex">
                <p className="bold">{t("filters.title")}</p>
                <button className="search-icon-btn" title={t("filters.close")} onClick={onClose}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div className="filter-group">
                <p className="filter-group-title">{t("filters.groupBy")}</p>
                <div className="filter-values">
                    <button
                        className={`filter-chip${groupBy === null ? " active" : ""}`}
                        onClick={() => onGroupChange(null)}
                    >
                        {t("filters.noGroup")}
                    </button>
                    {groupOptions.map(option => (
                        <button
                            key={option.key}
                            className={`filter-chip${groupBy === option.key ? " active" : ""}`}
                            onClick={() => onGroupChange(groupBy === option.key ? null : option.key)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {facets.length === 0 && <p className="filter-empty">{t("filters.empty")}</p>}

            {facets.map(facet => (
                <div className="filter-group" key={facet.key}>
                    <p className="filter-group-title">{facet.label}</p>
                    <div className="filter-values">
                        {facet.values.map(({ value, count }) => (
                            <button
                                key={value}
                                className={`filter-chip${(filters[facet.key] ?? []).includes(value) ? " active" : ""}`}
                                onClick={() => onToggleValue(facet.key, value)}
                            >
                                {value}
                                <span className="filter-chip-count">{count}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            <div className="filter-panel-footer flex">
                <button className="filter-panel-clear" onClick={onClear} disabled={!hasFilters}>
                    {t("filters.clear")}
                </button>
                <button className="filter-panel-apply" onClick={onClose}>
                    {t("filters.show", { count: resultCount })}
                </button>
            </div>
        </div>
    )
}
