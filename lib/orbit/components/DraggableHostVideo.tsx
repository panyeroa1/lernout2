'use client';

import React from 'react';
import { ParticipantTile, TrackReferenceOrPlaceholder } from '@livekit/components-react';
import styles from '@/styles/Eburon.module.css';

interface DraggableHostVideoProps {
    trackRef: TrackReferenceOrPlaceholder;
    onClose: () => void;
}

export function DraggableHostVideo({ trackRef, onClose }: DraggableHostVideoProps) {
    const [position, setPosition] = React.useState({ x: 20, y: 20 });
    const [size, setSize] = React.useState({ width: 320, height: 180 });
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
    const [isResizing, setIsResizing] = React.useState(false);
    const [resizeStart, setResizeStart] = React.useState({ x: 0, y: 0, w: 0, h: 0 });
    const [isFullScreen, setIsFullScreen] = React.useState(false);
    const presetSize = React.useRef({ width: 320, height: 180 });

    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.resize-handle')) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleResizeMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsResizing(true);
        setResizeStart({ x: e.clientX, y: e.clientY, w: size.width, h: size.height });
    };

    const toggleFullScreen = () => {
        if (!isFullScreen) {
            presetSize.current = { ...size };
            setSize({ width: window.innerWidth - 40, height: (window.innerWidth - 40) * (9 / 16) });
            setPosition({ x: 20, y: 20 });
        } else {
            setSize(presetSize.current);
        }
        setIsFullScreen(!isFullScreen);
    };

    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging && !isFullScreen) {
                setPosition({
                    x: e.clientX - dragStart.x,
                    y: e.clientY - dragStart.y
                });
            }
            if (isResizing && !isFullScreen) {
                const dw = e.clientX - resizeStart.x;
                const dh = dw * (9 / 16); // Aspect ratio lock
                setSize({
                    width: Math.max(160, resizeStart.w + dw),
                    height: Math.max(90, resizeStart.h + dh)
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, dragStart, resizeStart]);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                left: isFullScreen ? '20px' : position.x,
                top: isFullScreen ? '20px' : position.y,
                width: isFullScreen ? 'calc(100vw - 40px)' : size.width,
                height: isFullScreen ? 'calc(100vh - 40px)' : size.height,
                zIndex: 1000,
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                border: '2px solid rgba(255,255,255,0.1)',
                backgroundColor: '#000',
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
                transition: isDragging || isResizing ? 'none' : 'all 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}
            onMouseDown={handleMouseDown}
        >
            <ParticipantTile trackRef={trackRef} style={{ width: '100%', height: '100%' }} />

            {/* Controls Overlay */}
            <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                display: 'flex',
                gap: '8px',
                opacity: 0,
                transition: 'opacity 0.2s',
            }} className="host-video-controls">
                <button
                    onClick={(e) => { e.stopPropagation(); toggleFullScreen(); }}
                    style={{ background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex' }}
                    title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                >
                    {isFullScreen ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 14h6v6M20 10h-6V4M14 10l7 7M10 14l-7-7" /></svg>
                    ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" /></svg>
                    )}
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); setSize({ width: size.width * 1.2, height: size.height * 1.2 }); }}
                    style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}
                    title="Enlarge"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); setSize({ width: size.width * 0.8, height: size.height * 0.8 }); }}
                    style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}
                    title="Shrink"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 14h6v6M20 10h-6V4M14 10l7 7M10 14l-7-7" /></svg>
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    style={{ background: 'rgba(239, 68, 68, 0.8)', border: 'none', color: '#fff', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}
                    title="Hide"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Resize Handle */}
            <div
                className="resize-handle"
                onMouseDown={handleResizeMouseDown}
                style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '20px',
                    height: '20px',
                    cursor: 'nwse-resize',
                    background: 'linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.3) 50%)',
                    zIndex: 1001
                }}
            />

            <style jsx>{`
        div:hover .host-video-controls {
          opacity: 1 !important;
        }
      `}</style>
        </div>
    );
}
