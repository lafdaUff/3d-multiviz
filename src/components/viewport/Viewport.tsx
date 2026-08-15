import { Canvas } from '@react-three/fiber'
import TopBar from './TopBar'
import BottomBar from './BottomBar'
import InfoScreen from './InfoScreen'
import ResetViewButton from './ResetViewButton'
import HoverTip from './HoverTip'
import SplitHandle from './SplitHandle'
import { Experience, type ModelData } from './Experience'
import { type DragOffsets } from './DraggableModel'
import { useContext, useState, useRef, useCallback, useEffect, useMemo } from 'react'
import ObjectsContext from '../../ObjectsContext'
import ModeContext from '../../ModeContext'

interface ViewportProps {
    onObjectSelect: (data: ModelData | null) => void;
    selectedLink?: string | null;
}

export default function Viewport({ onObjectSelect, selectedLink = null }: ViewportProps) {

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
    const resetView = useCallback(() => setResetToken(token => token + 1), []);

    const [isViewChanged, setViewChanged] = useState(false);

    const [isObjectHovered, setObjectHovered] = useState(false);
    const pointerPosition = useRef({ x: 0, y: 0 });

    // Kept outside the canvas so dragged positions survive a mode change
    const dragOffsets = useRef<DragOffsets>({});

    useEffect(() => {
        const links = new Set(currentObjects.map(object => object.link));
        for (const link of Object.keys(dragOffsets.current)) {
            if (!links.has(link)) delete dragOffsets.current[link];
        }
    }, [currentObjects]);

    // Position of the cut in 'mode3', in percent of the viewport width
    const [splitPosition, setSplitPosition] = useState(50);
    const viewportRef = useRef<HTMLDivElement>(null);

    // 'mode3' has room for two sides only, so it shows the two most recently selected objects
    const splitObjects = useMemo(() => currentObjects.slice(-2), [currentObjects]);
    // Keeps exactly one camera driving the others, even after the sides change
    const masterIndex = masterCamera !== null && masterCamera < splitObjects.length ? masterCamera : 0;

    const handleViewportPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        pointerPosition.current = { x: e.clientX, y: e.clientY };
        if (selectedMode !== 'mode3' || e.buttons !== 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const index = (e.clientX - rect.left) < rect.width * (splitPosition / 100) ? 0 : 1;
        setMasterCamera(prev => prev === index ? prev : index);
    }, [selectedMode, splitPosition]);

return (

        <div
            ref={viewportRef}
            className={`viewport flex${isObjectHovered ? ' hovering-object' : ''}`}
            id="viewport"
            style={{ '--split': `${splitPosition}%` } as React.CSSProperties}
            onPointerMove={handleViewportPointerMove}
        >
            {selectedMode === 'mode3' ?
                splitObjects.map(
                (object, index) => (
                    <Canvas key={object.link} camera={{ near: 0.01 }} className={`clip-${index % 2 === 0 ? 'left' : 'right'} canvas-container`} style={{height: '100%', width: '100%', position: 'absolute'}}>
                        <Experience
                            onObjectSelect={onObjectSelect} 
                            currentObjects={[object]}
                            cameraLock={isCameraLocked} 
                            syncedCameraRef={cameraControlsRef}
                            isMaster={index === masterIndex}
                            onHoverChange={setObjectHovered}
                            selectedLink={selectedLink}
                        />
                    </Canvas>
                )) :
                <Canvas camera={{ near: 0.01 }} className='canvas-container' style={{height: '100%', width: '100%'}}>
                    <Experience onObjectSelect={onObjectSelect} currentObjects={currentObjects} cameraLock={selectedMode === 'mode2'} resetToken={resetToken} onViewChange={setViewChanged} onHoverChange={setObjectHovered} selectedLink={selectedLink} dragOffsets={dragOffsets} />
                </Canvas>
            }
            {selectedMode === 'mode3' && splitObjects.length > 0 && (
                <SplitHandle position={splitPosition} onChange={setSplitPosition} containerRef={viewportRef} />
            )}
            <ModeContext.Provider value={{ currentMode: selectedMode, setCurrentMode: setSelectedMode }}>
                <div className='viewportContent flex'>
                    <TopBar toggleInfoScreen={ToggleInfoScreen} toggleLock={toggleLock} isCameraLocked={isCameraLocked}/>
                    <BottomBar />
                    {selectedMode !== 'mode3' && isViewChanged && <ResetViewButton onClick={resetView} />}
                    {isObjectHovered && !isInfoScreenVisible && <HoverTip initialPosition={pointerPosition} />}
                    {isInfoScreenVisible && <InfoScreen toggleInfoScreen={ToggleInfoScreen} />}
            </div>
        </ModeContext.Provider>
        </div>
        )
}