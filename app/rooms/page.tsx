'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/Home.module.css';
import RoomHistory from '@/components/RoomHistory';
import { generateRoomId } from '@/lib/client-utils';

export default function RoomsDashboard() {
  const router = useRouter();
  const [midInput, setMidInput] = useState('');
  const [showJoinArea, setShowJoinArea] = useState(false);

  const createClass = () => {
    const roomId = generateRoomId();
    router.push(`/rooms/${roomId}`);
  };

  const joinSession = () => {
    const mid = midInput.trim();
    if (mid) {
      router.push(`/rooms/${mid}`);
    }
  };

  return (
    <div className={styles.main} style={{ justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>
      <div className={styles.container} style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 className={styles.headline} style={{ fontSize: '3rem' }}>
            MY <span className={styles.headlineAccent}>CLASSES</span>
          </h1>
          <p className={styles.subheadline} style={{ margin: '1rem auto' }}>
            Manage your teaching spaces and review past sessions.
          </p>
        </div>

        {/* Action Grid */}
        <div className={styles.featuresGrid} style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '3rem' }}>
          <div
            className={styles.featureTile}
            onClick={createClass}
            style={{ cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}
          >
            <div className={styles.featureIcon} style={{ width: '64px', height: '64px', fontSize: '2rem' }}>⚡</div>
            <h3 style={{ fontSize: '1.5rem', marginTop: '1rem' }}>New Class</h3>
            <p>Start a fresh room instantly</p>
          </div>

          <div
            className={styles.featureTile}
            onClick={() => setShowJoinArea(true)}
            style={{ cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', border: showJoinArea ? '1px solid var(--color-primary)' : undefined }}
          >
            <div className={styles.featureIcon} style={{ width: '64px', height: '64px', fontSize: '2rem' }}>🔓</div>
            <h3 style={{ fontSize: '1.5rem', marginTop: '1rem' }}>Join Class</h3>
            <p>Enter an existing Room ID</p>
          </div>
        </div>

        {/* Join Input Area */}
        {showJoinArea && (
          <div className={styles.controlCard} style={{ marginBottom: '3rem', animation: 'fadeIn 0.3s ease' }}>
            <h3>Enter Room ID</h3>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <input
                type="text"
                className={styles.passphraseInput}
                placeholder="ORBIT-XXXXXX"
                value={midInput}
                onChange={(e) => setMidInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && joinSession()}
                autoFocus
              />
              <button className={styles.primaryButton} onClick={joinSession}>
                Join
              </button>
            </div>
          </div>
        )}

        {/* History Section */}
        <RoomHistory />

      </div>
    </div>
  );
}
