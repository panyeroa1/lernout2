
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return new NextResponse('OpenAI API key not configured', { status: 503 });
        }

        const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-realtime-preview',
                modalities: ['text'], // We only need text for STT
                instructions: 'You are a transcription engine. Transcribe the audio precisely.',
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('OpenAI Realtime Token Error:', err);
            return new NextResponse(err, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('OpenAI Realtime token route error:', error);
        return new NextResponse('Internal error', { status: 500 });
    }
}
