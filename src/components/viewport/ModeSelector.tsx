import Mode1Icon from "../../assets/icons/mode1.svg?react";
import Mode2Icon from "../../assets/icons/mode2.svg?react";
import Mode3Icon from "../../assets/icons/mode3.svg?react";

import Mode1Video from "../../assets/mode1.webp";
import Mode2Video from "../../assets/mode2.webp";

import { useContext, useState} from "react";
import ModeContext from "../../ModeContext";
import Tooltip from "../Items/Tooltip";
import { type TooltipProps } from '../Items/Tooltip'



export default function ModeSelector() {

    const [tooltipContent, setTooltipContent] = useState<TooltipProps>();

    function handleTooltip(event : React.MouseEvent<HTMLElement>, text: string, img?: string){
        const rect = event.currentTarget.getBoundingClientRect();
        setTooltipContent({location: {x: rect.left, y: rect.bottom + 10}, content: {title: text, img}});
    }

    const { currentMode, setCurrentMode } = useContext(ModeContext);

    return (
        <>
        
            <div className="mode-selector">
                <button className={`mode-button ${currentMode === 'mode1' && 'selected'}`} onClick={() => setCurrentMode('mode1')} onMouseEnter={(e) => handleTooltip(e, 'Câmera Orbital', Mode1Video)} onMouseLeave={() => setTooltipContent(undefined)}><Mode1Icon className="mode-icon" /></button>
                <button className={`mode-button ${currentMode === 'mode2' && 'selected'}`} onClick={() => setCurrentMode('mode2')} onMouseEnter={(e) => handleTooltip(e, 'Modo Justaposto', Mode2Video)} onMouseLeave={() => setTooltipContent(undefined)}><Mode2Icon className="mode-icon" /></button>
                <button className={`mode-button ${currentMode === 'mode3' && 'selected'}`} onClick={() => setCurrentMode('mode3')} onMouseEnter={(e) => handleTooltip(e, 'Mode 3', Mode1Video)} onMouseLeave={() => setTooltipContent(undefined)}><Mode3Icon className="mode-icon" /></button>
            </div>
            {tooltipContent && <Tooltip {...tooltipContent}/>}
        </>
    );
}