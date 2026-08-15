import { useEffect, useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

interface HoverTipProps {
    // Last known pointer position, used to place the tip before the pointer moves again
    initialPosition: React.RefObject<{ x: number; y: number }>;
}

const OFFSET_X = 14;
const OFFSET_Y = 6;
const MARGIN = 8;

export default function HoverTip({ initialPosition }: HoverTipProps) {
    const tipRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    function place(x: number, y: number) {
        const el = tipRef.current;
        if (!el) return;
        const left = Math.min(x + OFFSET_X, window.innerWidth - el.offsetWidth - MARGIN);
        const top = Math.min(y + OFFSET_Y, window.innerHeight - el.offsetHeight - MARGIN);
        el.style.transform = `translate(${left}px, ${top}px)`;
        el.style.visibility = 'visible';
    }

    useLayoutEffect(() => {
        const { x, y } = initialPosition.current;
        place(x, y);
    }, [initialPosition]);

    useEffect(() => {
        function handlePointerMove(event: PointerEvent) {
            const el = tipRef.current;
            if (!el) return;
            // Hide while orbiting or dragging
            if (event.buttons !== 0) {
                el.style.visibility = 'hidden';
                return;
            }
            place(event.clientX, event.clientY);
        }

        window.addEventListener('pointermove', handlePointerMove);
        return () => window.removeEventListener('pointermove', handlePointerMove);
    }, []);

    return (
        <div ref={tipRef} className="hover-tip" id="hover-tip" style={{ visibility: 'hidden' }}>
            {t("viewport.hoverTip")}
        </div>
    );
}
