import { Canvas } from '@react-three/fiber'
import TopBar from './TopBar'
import BottomBar from './BottomBar'
import InfoScreen from './InfoScreen'
import { Experience, type ModelData } from './Experience'
import { useContext, useState, useRef } from 'react'
import ObjectsContext from '../../ObjectsContext'
import ModeContext from '../../ModeContext'

export default function Viewport({ onObjectSelect }: { onObjectSelect: (data: ModelData | null) => void }) {

    const { currentObjects } = useContext(ObjectsContext);

    const [isInfoScreenVisible, setInfoScreenVisible] = useState(false);
    const [isCameraLocked, setCameraLocked] = useState(false);
    const [masterCamera, setMasterCamera] = useState<number | null>(null);

    // Add ref for camera controls synchronization
    const cameraControlsRef = useRef(null);

    function ToggleInfoScreen() {
        setInfoScreenVisible(!isInfoScreenVisible);
    }

    function toggleLock() {
        setCameraLocked(!isCameraLocked);
        console.log('Camera lock toggled:', !isCameraLocked);
    }

    const [selectedMode, setSelectedMode] = useState('mode1');

return (
    
        <div className="viewport flex" id="viewport" >
            {selectedMode === 'mode3' ? 
                currentObjects.map(
                (object, index) => (
                    <Canvas key={object.link} onMouseEnter={() => setMasterCamera(index)} className={`clip-${index % 2 === 0 ? 'left' : 'right'} canvas-container`} style={{height: '100%', width: '100%', position: 'absolute'}}>
                        <Experience
                            onObjectSelect={onObjectSelect} 
                            currentObjects={[object]}
                            cameraLock={isCameraLocked} 
                            syncedCameraRef={cameraControlsRef}
                            isMaster={index === masterCamera}
                        />
                    </Canvas>
                )) :
                <Canvas className='canvas-container' style={{height: '100%', width: '100%'}}>
                    <Experience onObjectSelect={onObjectSelect} currentObjects={currentObjects} cameraLock={selectedMode === 'mode2'} />
                </Canvas>
            }
            <ModeContext.Provider value={{ currentMode: selectedMode, setCurrentMode: setSelectedMode }}>
                <div className='viewportContent flex'>
                    <TopBar toggleInfoScreen={ToggleInfoScreen} toggleLock={toggleLock} isCameraLocked={isCameraLocked}/>
                    <BottomBar />
                    {isInfoScreenVisible && <InfoScreen toggleInfoScreen={ToggleInfoScreen} />}
            </div>
        </ModeContext.Provider>
        </div>
        )
}