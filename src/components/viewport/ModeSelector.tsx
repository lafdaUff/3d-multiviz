import Mode1Icon from "../../assets/icons/mode1.svg?react";
import Mode2Icon from "../../assets/icons/mode2.svg?react";
import Mode3Icon from "../../assets/icons/mode3.svg?react";

import { useContext} from "react";
import ModeContext from "../../ModeContext";



export default function ModeSelector() {

    
    const { currentMode, setCurrentMode } = useContext(ModeContext);

    return (
        <div className="mode-selector">

            <button className={`mode-button ${currentMode === 'mode1' && 'selected'}`} onClick={() => setCurrentMode('mode1')}><Mode1Icon className="mode-icon" /></button>
            <button className={`mode-button ${currentMode === 'mode2' && 'selected'}`} onClick={() => setCurrentMode('mode2')}><Mode2Icon className="mode-icon" /></button>
            <button className={`mode-button ${currentMode === 'mode3' && 'selected'}`} onClick={() => setCurrentMode('mode3')}><Mode3Icon className="mode-icon" /></button>
        </div>
    );
}