import ItemList from "../Items/ItemList"
import SearchBar from "./SearchBar"
import FilterPanel from "./FilterPanel"
import MetadataInfo from "./MetadataInfo"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { type ModelData } from "../viewport/Experience"
import database from '../../data/database.json' with { type: 'json' }
import {
  type Filters,
  activeFilterList,
  buildFacets,
  countActiveFilters,
  fieldLabel,
  filterItems,
  groupItems,
  searchItems,
  toggleFilterValue,
} from "../../data/catalog"

const allItems = database as ModelData[]

export default function Sidebar({ objectData, cleanMetadata }: { objectData: ModelData | null, cleanMetadata: () => void }) {

  const { t } = useTranslation()

  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<Filters>({})
  const [groupBy, setGroupBy] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // busca primeiro, filtros depois: as contagens das facetas acompanham o termo digitado
  const searched = useMemo(() => searchItems(allItems, query), [query])
  const visibleItems = useMemo(() => filterItems(searched, filters), [searched, filters])
  const facets = useMemo(() => buildFacets(searched, filters), [searched, filters])
  const groups = useMemo(() => groupItems(visibleItems, groupBy), [visibleItems, groupBy])

  // opções de agrupamento saem do acervo inteiro, senão somem ao filtrar por elas
  const groupOptions = useMemo(
    () => buildFacets(allItems).map(facet => ({ key: facet.key, label: facet.label })),
    []
  )

  const activeFilters = activeFilterList(filters)
  const isFiltering = query.trim() !== "" || activeFilters.length > 0

  function handleToggleValue(key: string, value: string) {
    setFilters(current => toggleFilterValue(current, key, value))
  }

  function handleClearFilters() {
    setFilters({})
  }

  // caminho inverso: de um metadado da ficha para os modelos que compartilham o valor
  function handleFilterFromMetadata(key: string, value: string) {
    setQuery("")
    setFilters({ [key]: [value] })
    setShowFilters(false)
    cleanMetadata()
  }

  return(
      <div className="side-menu flex" id="side-menu">
          <div className="sidebar-header flex">
              { objectData && (
                <button onClick={cleanMetadata} ><i className="fa-solid fa-arrow-left"></i></button>
              )}
              <SearchBar
                value={query}
                onChange={setQuery}
                onToggleFilters={() => setShowFilters(open => !open)}
                filtersOpen={showFilters}
                activeFilters={countActiveFilters(filters)}
              />
          </div>

          {!objectData && activeFilters.length > 0 && (
            <div className="active-filters">
              {activeFilters.map(({ key, value }) => (
                <button
                  key={`${key}:${value}`}
                  className="filter-chip active"
                  title={t("filters.remove")}
                  onClick={() => handleToggleValue(key, value)}
                >
                  <span className="filter-chip-field">{fieldLabel(key)}:</span>
                  {value}
                  <i className="fa-solid fa-xmark"></i>
                </button>
              ))}
            </div>
          )}

          {!objectData && isFiltering && (
            <small className="results-count">{t("search.results", { count: visibleItems.length })}</small>
          )}

          {objectData ? (
            <MetadataInfo objectData={objectData} onFilter={handleFilterFromMetadata} />
          ) : (
            <ItemList groups={groups} />
          )}

          {showFilters && !objectData && (
            <FilterPanel
              facets={facets}
              groupOptions={groupOptions}
              filters={filters}
              groupBy={groupBy}
              resultCount={visibleItems.length}
              onToggleValue={handleToggleValue}
              onGroupChange={setGroupBy}
              onClear={handleClearFilters}
              onClose={() => setShowFilters(false)}
            />
          )}
      </div>

  )
}
