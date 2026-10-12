import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));

// Initialize GoogleGenAI server client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// 1. Audio Transcription endpoint (gemini-3.5-transcribe)
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Gemini API key is not configured in environment',
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'audio/webm',
              data: audioBase64,
            },
          },
          { text: 'Transcribe this audio precisely. Return only the transcription text.' },
        ],
      },
    });

    const transcription = response.text || '';
    return res.json({ transcription });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Audio transcription error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to transcribe audio with Gemini',
    });
  }
});

// 2. Multi-turn Chat endpoint (gemini-3.5-flash / gemini-3.1-flash-lite)
app.post('/api/chat', async (req, res) => {
  try {
    const {
      messages,
      model = 'gemini-3.5-flash',
      roleDescription,
    } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Gemini API key is not configured in environment',
      });
    }

    // Selected model: gemini-3.5-flash (default general) or gemini-3.1-flash-lite (fast)
    const validModel =
      model === 'gemini-3.1-flash-lite' ? 'gemini-3.1-flash-lite' : 'gemini-3.5-flash';

    const systemInstruction =
      roleDescription ||
      'You are Gemini AI Assistant, a witty, helpful, and concise conversational AI companion inside PulseChat social messenger. Help users write messages, find quotes, summarize ideas, brainstorm, and chat naturally.';

    // Format conversation history for Gemini API
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: validModel,
      contents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || '';
    return res.json({ reply });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Gemini chat error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate response from Gemini',
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasKey: Boolean(process.env.GEMINI_API_KEY) });
});

// Vite Middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
