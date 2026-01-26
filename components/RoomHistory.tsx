'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/Home.module.css';

interface RecentRoom {
    id: string;
    name?: string;
    lastVisited: number;
}

export default function RoomHistory() {
    const router = useRouter();
    const [recentRooms, setRecentRooms] = useState<RecentRoom[]>([]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('orbit_recent_rooms');
            if (stored) {
                const parsed = JSON.parse(stored);
                // Sort by recency
                const sorted = (Array.isArray(parsed) ? parsed : []).sort((a: RecentRoom, b: RecentRoom) => b.lastVisited - a.lastVisited);
                setRecentRooms(sorted.slice(0, 5)); // Keep top 5
            }
        } catch (e) {
            console.warn('Failed to load room history', e);
        }
    }, []);

    if (recentRooms.length === 0) return null;

    return (
        <div className={styles.zigZagContent}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.7)' }}>Recent Classes</h3>
            <div style={{ display: 'grid', gap: '0.8rem' }}>
                {recentRooms.map((room) => (
                    <div
                        key={room.id}
                        className={styles.secondaryButton}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            background: 'rgba(255, 255, 255, 0.05)'
                        }}
                        onClick={() => router.push(`/rooms/${room.id}`)}
                    >
                        <span>{room.id}</span>
                        <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>
                            {new Date(room.lastVisited).toLocaleDateString()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
