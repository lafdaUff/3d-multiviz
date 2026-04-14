import { useEffect, useRef, useState, useLayoutEffect } from 'react'
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
    timeout?: number // Optional timeout in milliseconds
}

export default function Tooltip({location = {x: 1, y: 2}, content, timeout = 3000} : TooltipProps ){
    const [isVisible, setIsVisible] = useState(true)
    const tooltipRef = useRef<HTMLDivElement>(null)
    const timeoutRef = useRef<number | null>(null)

    useLayoutEffect(() => {
        const el = tooltipRef.current
        if (!el) return

        // Reset to off-screen to measure natural width
        el.style.left = '-9999px'
        el.style.right = ''
        el.style.top = `${location.y}px`
        el.style.visibility = 'hidden'

        // Force layout to get the natural dimensions
        const width = el.offsetWidth
        const overflows = location.x + width > window.innerWidth

        if (overflows) {
            el.style.left = ''
            el.style.right = `${window.innerWidth - location.x}px`
        } else {
            el.style.left = `${location.x}px`
            el.style.right = ''
        }
        el.style.visibility = ''
    }, [location, content])

    useEffect(() => {
        // Check if device is mobile
        const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window

        setIsVisible(true)
        if (isMobile && timeout > 0) {
            timeoutRef.current = setTimeout(() => {
                setIsVisible(false)
            }, timeout)
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [timeout, content])

    if (!isVisible) {
        return null
    }

    return(
        <div ref={tooltipRef} className="tooltip" id="global-tooltip" style={{ visibility: 'hidden' }}>
            <div className="tooltip-content">
                {content.img && <img src={content.img} alt={content.title} />}
                <p className="bold">{content.title}</p>
                <p>{content.desc}</p>
            </div>
        </div>
    )
}