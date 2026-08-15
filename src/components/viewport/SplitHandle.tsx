import { useState } from "react";

interface SplitHandleProps {
    // Horizontal position of the cut, in percent of the viewport width
    position: number;
    onChange: (position: number) => void;
    containerRef: React.RefObject<HTMLDivElement | null>;
}

const MIN_POSITION = 10;
const MAX_POSITION = 90;
const KEYBOARD_STEP = 2;

function clamp(position: number) {
    return Math.min(MAX_POSITION, Math.max(MIN_POSITION, position));
}

export default function SplitHandle({ position, onChange, containerRef }: SplitHandleProps) {

    const [isDragging, setDragging] = useState(false);

    function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
    }

    function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;

        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect || rect.width === 0) return;

        onChange(clamp(((event.clientX - rect.left) / rect.width) * 100));
    }

    function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        setDragging(false);
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
        if (event.key === 'ArrowLeft') onChange(clamp(position - KEYBOARD_STEP));
        else if (event.key === 'ArrowRight') onChange(clamp(position + KEYBOARD_STEP));
        else return;

        event.preventDefault();
    }

    return (
        <div
            className={`split-handle${isDragging ? ' dragging' : ''}`}
            style={{ left: `${position}%` }}
            role="separator"
            aria-orientation="vertical"
            aria-valuenow={Math.round(position)}
            aria-valuemin={MIN_POSITION}
            aria-valuemax={MAX_POSITION}
            tabIndex={0}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onKeyDown={handleKeyDown}
        >
            <div className="split-handle-line" />
            <div className="split-handle-grip">
                <i className="fa-solid fa-left-right"></i>
            </div>
        </div>
    );
}
