'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';

interface UseOpenAIRealtimeOptions {
    deviceId?: string;
}

interface UseOpenAIRealtimeReturn {
    isListening: boolean;
    transcript: string;
    isFinal: boolean;
    start: (deviceId?: string) => Promise<void>;
    stop: () => void;
    error: string | null;
    analyser: AnalyserNode | null;
}

export function useOpenAIRealtime(options: UseOpenAIRealtimeOptions = {}): UseOpenAIRealtimeReturn {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isFinal, setIsFinal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const socketRef = useRef<WebSocket | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const startingRef = useRef(false);

    const stop = useCallback(() => {
        console.log("🔌 OpenAI: Stopping transcription engine...");
        setIsListening(false);
        startingRef.current = false;

        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }

        if (socketRef.current) {
            socketRef.current.onclose = null;
            socketRef.current.close();
            socketRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => { });
            audioContextRef.current = null;
        }
        analyserRef.current = null;
    }, []);

    const start = useCallback(async (deviceId?: string) => {
        if (startingRef.current) return;
        startingRef.current = true;
        console.log("🔌 OpenAI: Starting transcription session...");

        try {
            // 1. Get ephemeral token
            const tokenRes = await fetch('/api/openai-realtime-token', { method: 'POST' });
            if (!tokenRes.ok) throw new Error('Failed to get OpenAI session token');
            const session = await tokenRes.json();
            const ephemeralKey = session.client_secret.value;

            // 2. Setup Audio
            const constraints: MediaStreamConstraints = {
                audio: deviceId ? { deviceId: { exact: deviceId } } : true
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            const audioCtx = new AudioContext({ sampleRate: 24000 });
            audioContextRef.current = audioCtx;

            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = analyser;

            const processor = audioCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;
            source.connect(processor);
            processor.connect(audioCtx.destination);

            // 3. Connect WebSocket
            const url = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview";
            const socket = new WebSocket(url, [
                "realtime",
                "openai-insecure-api-key." + ephemeralKey // Using session token here
            ]);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log("✅ OpenAI: WebSocket connected");
                setIsListening(true);
                setError(null);
                startingRef.current = false;

                // Configure session for STT
                socket.send(JSON.stringify({
                    type: 'session.update',
                    session: {
                        modalities: ['text'],
                        input_audio_transcription: { model: 'whisper-1' },
                        turn_detection: { type: 'server_vad' }
                    }
                }));

                processor.onaudioprocess = (e) => {
                    if (socket.readyState !== WebSocket.OPEN) return;
                    const inputData = e.inputBuffer.getChannelData(0);
                    const pcm16 = new Int16Array(inputData.length);
                    for (let i = 0; i < inputData.length; i++) {
                        const s = Math.max(-1, Math.min(1, inputData[i]));
                        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                    }
                    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
                    socket.send(JSON.stringify({
                        type: 'input_audio_buffer.append',
                        audio: base64Audio
                    }));
                };
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);

                // Transcription events
                if (data.type === 'conversation.item.input_audio_transcription.delta') {
                    setTranscript(prev => prev + data.delta);
                    setIsFinal(false);
                } else if (data.type === 'conversation.item.input_audio_transcription.completed') {
                    setIsFinal(true);
                } else if (data.type === 'error') {
                    console.error('❌ OpenAI Error:', data.error);
                    setError(data.error.message);
                }
            };

            socket.onclose = () => {
                console.log("🔌 OpenAI: WebSocket closed");
                stop();
            };

            socket.onerror = (err) => {
                console.error("❌ OpenAI WebSocket error:", err);
            };

        } catch (e: any) {
            console.error("❌ OpenAI Start failed:", e);
            setError(e.message);
            stop();
        }
    }, [stop]);

    useEffect(() => {
        return () => stop();
    }, [stop]);

    return useMemo(() => ({
        isListening,
        transcript,
        isFinal,
        start,
        stop,
        error,
        analyser: analyserRef.current
    }), [isListening, transcript, isFinal, start, stop, error]);
}
