import { type ModelData } from "../viewport/Experience"
import searchInItems from "./search"
import database from '../../data/database.json' with { type: 'json' }
import { useEffect } from "react"
import { useTranslation } from "react-i18next"

export default function SearchBar({ onSearch }: { onSearch: (items: ModelData[]) => void }) {

    const { t } = useTranslation();

    function handleSearch(searchTerm: string) {
        const getSearch = searchInItems(database, searchTerm)
        onSearch(getSearch)
    }

    useEffect(() => {
        onSearch(database) 
    }, [])

    return(
        <div className="searchBar flex">
            <input
                type="text"
                id="searchField"
                placeholder={t("search.placeholder")}
                className="search"
                onChange={(e) => handleSearch(e.target.value)}
            />
            <p id="searchBTN"><i className="fa-solid fa-magnifying-glass"></i></p>
            </div>
    )
}