'use client';

import React from 'react';
import styles from '@/styles/Eburon.module.css';

interface BlackboardProps {
    transcript: string;
    translation?: string;
    isFinal: boolean;
    language: string;
}

export function Blackboard({ transcript, translation, isFinal, language }: BlackboardProps) {
    const scrollRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [transcript, translation]);

    return (
        <div className={styles.blackboardArea} ref={scrollRef}>
            <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Transcription (Source) */}
                <div style={{ opacity: transcript ? 1 : 0.5, transition: 'opacity 0.3s' }}>
                    <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: '1rem' }}>Original Audio</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 500, lineHeight: 1.4, color: isFinal ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                        {transcript || "Listening..."}
                    </p>
                </div>

                {/* Translation (Target) */}
                {translation && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(212, 175, 55, 0.6)', marginBottom: '1rem' }}>
                            {language} Translation
                        </h3>
                        <p style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.3, color: 'var(--gold)', textShadow: '0 0 30px rgba(212, 175, 55, 0.2)' }}>
                            {translation}
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
}
