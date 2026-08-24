
import Item from './Item'
import {  useContext, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import ObjectsContext from '../../ObjectsContext'
import { type ModelData } from '../viewport/Experience'
import { type ItemGroup } from '../../data/catalog'
import Tooltip from './Tooltip'
import { type TooltipProps } from './Tooltip'

export default function ItemList({groups} : {groups: ItemGroup[]}){

    const { t } = useTranslation()

    const { currentObjects, setCurrentObjects } = useContext(ObjectsContext)

    const [tooltipContent, setTooltipContent] = useState<TooltipProps>()

    const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map())
    const listaRef = useRef<HTMLDivElement>(null)

    const isMobile = window.innerWidth <= 768

    const grouped = groups.some(group => group.label !== null)
    const total = groups.reduce((sum, group) => sum + group.items.length, 0)

    function handleItemClick(item: ModelData) {
        setCurrentObjects((prevSelected) => {
        let newSelection;
        if (prevSelected.includes(item)) {
            newSelection = prevSelected.filter((link) => link != item);
        } else {
            newSelection = [...prevSelected, item];
        }

        const el = itemRefs.current.get(item.link);
        if (el) {
            el.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest",
            });
        }

        return newSelection;
        });
    }
    function handleItemEnter(event : React.MouseEvent<HTMLLIElement>, item: ModelData){
        const rect = event.currentTarget.getBoundingClientRect()
        const listaRect = listaRef.current?.getBoundingClientRect()
        if(isMobile && listaRect){
            setTooltipContent({location: {x: listaRect.left + listaRect.width / 3, y: listaRect.top - 50}, content: {title: item.nome, desc: item.descricao}})
            return
        }
        setTooltipContent({location: {x: rect.right + 10, y: rect.top}, content: {title: item.nome, desc: item.descricao}})
    }

    return(
        <>
            <div className={`lista${grouped ? ' grouped' : ''}`} ref={listaRef}>
                <div className="gradient"></div>
                { total === 0 ? <p>{t("list.empty")}</p> : groups.map(group => (
                    <div className="lista-group" key={group.key}>
                        {group.label !== null && (
                            <p className="lista-group-title">
                                <span>{group.label || t("filters.noValue")}</span>
                                <span className="lista-group-count">{group.items.length}</span>
                            </p>
                        )}
                        <ul className="objetos">
                            {group.items.map(item => (
                                <Item
                                ref={(el: HTMLLIElement | null) => {
                                if (el) itemRefs.current.set(item.link, el);
                                }}
                                selected={currentObjects.includes(item)}
                                item={{image: item.thumb}}
                                key={item.link}
                                onMouseEnter={(event) => handleItemEnter(event, item)}
                                onMouseLeave={() => setTooltipContent(undefined)}
                                onClick = {() => handleItemClick(item)}/>
                            ))}
                        </ul>
                    </div>
                )) }
            </div>
            {tooltipContent && <Tooltip {...tooltipContent}/>}
        </>

    )
}
