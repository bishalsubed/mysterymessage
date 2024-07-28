import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const prompt = "List three engaging questions for an anonymous social platform. Separate each question with '||'.";

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 150,  // Reduced max tokens
            stream: true,
        });

        const stream = OpenAIStream(response);

        return new StreamingTextResponse(stream);
    } catch (error:any) {
        console.error('An unexpected error occurred:', error);

        if (error.response) {
            console.error('Error code:', error.response.status);
            console.error('Error data:', error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error message:', error.message);
        }

        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
