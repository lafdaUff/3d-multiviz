
export interface TooltipProps {
    location: {
        x: number
        y: number
    }
    content: {
        title: string
        desc?: string
        img?: string
    }
}

export default function Tooltip({location = {x: 1, y: 2}, content} : TooltipProps ){

    return(
        <div className="tooltip" id="global-tooltip" style={{top: location.y, left: location.x}}>
            <div className="tooltip-content">
                {content.img && <img src={content.img} alt={content.title} />}
                <p className="bold">{content.title}</p>
                <p>{content.desc}</p>
            </div>
        </div>
    )
}