import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './PortalTooltip.css';

export interface PortalTooltipProps {
    /** Tooltip content - can be string or ReactNode */
    content: React.ReactNode;
    /** Trigger element */
    children: React.ReactNode;
    /** Position of tooltip relative to trigger */
    position?: 'top' | 'bottom' | 'left' | 'right';
    /** Delay before showing tooltip (ms) */
    delay?: number;
    /** Disable the tooltip */
    disabled?: boolean;
}

/**
 * Portal-based Tooltip component - renders outside DOM hierarchy to avoid clipping
 * Follows Bosch FROK design system styling
 */
export const PortalTooltip: React.FC<PortalTooltipProps> = ({
    content,
    children,
    position = 'top',
    delay = 100,
    disabled = false,
}) => {
    const [show, setShow] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const wrapperRef = useRef<HTMLSpanElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const updatePosition = () => {
        if (!wrapperRef.current) return;

        const rect = wrapperRef.current.getBoundingClientRect();
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        let top = 0;
        let left = 0;

        switch (position) {
            case 'top':
                top = rect.top + scrollY - 6;
                left = rect.left + scrollX + rect.width / 2;
                break;
            case 'bottom':
                top = rect.bottom + scrollY + 6;
                left = rect.left + scrollX + rect.width / 2;
                break;
            case 'left':
                top = rect.top + scrollY + rect.height / 2;
                left = rect.left + scrollX - 6;
                break;
            case 'right':
                top = rect.top + scrollY + rect.height / 2;
                left = rect.right + scrollX + 6;
                break;
        }

        setCoords({ top, left });
    };

    useEffect(() => {
        if (show) {
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [show]);

    const handleMouseEnter = () => {
        if (disabled) return;
        timeoutRef.current = setTimeout(() => setShow(true), delay);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setShow(false);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    if (!content) return <>{children}</>;

    return (
        <>
            <span
                ref={wrapperRef}
                className="portal-tooltip-trigger"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onFocus={handleMouseEnter}
                onBlur={handleMouseLeave}
            >
                {children}
            </span>
            {show && createPortal(
                <div
                    className={`portal-tooltip portal-tooltip--${position}`}
                    style={{ top: coords.top, left: coords.left }}
                    role="tooltip"
                >
                    <div className="portal-tooltip__content">
                        {content}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default PortalTooltip;
