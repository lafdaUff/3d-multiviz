import { useTranslation } from "react-i18next"

interface SearchBarProps {
    value: string
    onChange: (value: string) => void
    onToggleFilters: () => void
    filtersOpen: boolean
    activeFilters: number
}

export default function SearchBar({ value, onChange, onToggleFilters, filtersOpen, activeFilters }: SearchBarProps) {

    const { t } = useTranslation();

    return(
        <div className="searchBar flex">
            <input
                type="text"
                id="searchField"
                placeholder={t("search.placeholder")}
                className="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            {value !== "" && (
                <button className="search-icon-btn" title={t("search.clear")} onClick={() => onChange("")}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
            )}
            <button
                className={`search-icon-btn filter-toggle${filtersOpen || activeFilters > 0 ? " active" : ""}`}
                title={t("filters.open")}
                onClick={onToggleFilters}
            >
                <i className="fa-solid fa-sliders"></i>
                {activeFilters > 0 && <span className="filter-toggle-count">{activeFilters}</span>}
            </button>
        </div>
    )
}
