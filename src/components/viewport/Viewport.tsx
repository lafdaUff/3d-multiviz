import { Canvas } from '@react-three/fiber'
import TopBar from './TopBar'
import BottomBar from './BottomBar'
import InfoScreen from './InfoScreen'
import ResetRotationButton from './ResetRotationButton'
import { Experience, type ModelData } from './Experience'
import { useContext, useState, useRef, useCallback } from 'react'
import ObjectsContext from '../../ObjectsContext'
import ModeContext from '../../ModeContext'

export default function Viewport({ onObjectSelect }: { onObjectSelect: (data: ModelData | null) => void }) {

    const { currentObjects } = useContext(ObjectsContext);

    const [isInfoScreenVisible, setInfoScreenVisible] = useState(true);
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

    const [resetToken, setResetToken] = useState(0);
    const resetRotation = useCallback(() => setResetToken(token => token + 1), []);

    const [isRotated, setRotated] = useState(false);

    const handleViewportPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (selectedMode !== 'mode3' || e.buttons !== 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const index = (e.clientX - rect.left) < rect.width / 2 ? 0 : 1;
        setMasterCamera(prev => prev === index ? prev : index);
    }, [selectedMode]);

return (

        <div className="viewport flex" id="viewport" onPointerMove={handleViewportPointerMove}>
            {selectedMode === 'mode3' ?
                currentObjects.map(
                (object, index) => (
                    <Canvas key={object.link} camera={{ near: 0.01 }} className={`clip-${index % 2 === 0 ? 'left' : 'right'} canvas-container`} style={{height: '100%', width: '100%', position: 'absolute'}}>
                        <Experience
                            onObjectSelect={onObjectSelect} 
                            currentObjects={[object]}
                            cameraLock={isCameraLocked} 
                            syncedCameraRef={cameraControlsRef}
                            isMaster={index === masterCamera}
                        />
                    </Canvas>
                )) :
                <Canvas camera={{ near: 0.01 }} className='canvas-container' style={{height: '100%', width: '100%'}}>
                    <Experience onObjectSelect={onObjectSelect} currentObjects={currentObjects} cameraLock={selectedMode === 'mode2'} resetToken={resetToken} onRotationChange={setRotated} />
                </Canvas>
            }
            <ModeContext.Provider value={{ currentMode: selectedMode, setCurrentMode: setSelectedMode }}>
                <div className='viewportContent flex'>
                    <TopBar toggleInfoScreen={ToggleInfoScreen} toggleLock={toggleLock} isCameraLocked={isCameraLocked}/>
                    <BottomBar />
                    {selectedMode === 'mode2' && isRotated && <ResetRotationButton onClick={resetRotation} />}
                    {isInfoScreenVisible && <InfoScreen toggleInfoScreen={ToggleInfoScreen} />}
            </div>
        </ModeContext.Provider>
        </div>
        )
}