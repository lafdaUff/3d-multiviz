import { Canvas } from '@react-three/fiber'
import TopBar from './TopBar'
import BottomBar from './BottomBar'
import InfoScreen from './InfoScreen'
import { Experience, type ModelData } from './Experience'
import { useContext, useState } from 'react'
import ObjectsContext from '../../ObjectsContext'

export default function Viewport({ onObjectSelect }: { onObjectSelect: (data: ModelData | null) => void }) {

    const { currentObjects } = useContext(ObjectsContext);


    const [isInfoScreenVisible, setInfoScreenVisible] = useState(false);
    const [isCameraLocked, setCameraLocked] = useState(false);

    function ToggleInfoScreen() {
        setInfoScreenVisible(!isInfoScreenVisible);
    }

    function toggleLock() {
        setCameraLocked(!isCameraLocked);
        console.log('Camera lock toggled:', !isCameraLocked);
    }

return (
    <div className="viewport" id="viewport">
        <Canvas>
            <Experience onObjectSelect={onObjectSelect} currentObjects={currentObjects} cameraLock={isCameraLocked} />
        </Canvas>
        <div className='viewportContent flex'>
            <TopBar toggleInfoScreen={ToggleInfoScreen} toggleLock={toggleLock} isCameraLocked={isCameraLocked} />
            <BottomBar />
            {isInfoScreenVisible && <InfoScreen toggleInfoScreen={ToggleInfoScreen} />}
        </div>
    </div>
        )
}