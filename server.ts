import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK with required user-agent
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set in environment.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health and configuration status endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.1-flash-lite',
  });
});

// Chat completion endpoint (with SSE streaming support)
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, botConfig, stream = true } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured. Please ensure your API key is configured in Settings > Secrets.',
      });
    }

    const ai = getAIClient();

    // Compose system instruction from bot configuration
    let systemInstruction = botConfig?.systemPrompt || 'You are an intelligent, helpful AI assistant.';
    if (botConfig?.tone) {
      systemInstruction += `\n\nTone & Demeanor: Speak in a ${botConfig.tone} style.`;
    }
    if (botConfig?.knowledgeBase && botConfig.knowledgeBase.trim().length > 0) {
      systemInstruction += `\n\nReference Knowledge & Context:\n"""\n${botConfig.knowledgeBase.trim()}\n"""\nUse this knowledge as ground truth when relevant.`;
    }
    if (botConfig?.name) {
      systemInstruction += `\nYour name is "${botConfig.name}". Always embody this identity naturally.`;
    }

    // Convert client message history into Gemini contents format
    // Map roles: 'user' -> 'user', 'assistant'/'model' -> 'model'
    const contents = messages.map((m: { role: string; content?: string; text?: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content || m.text || '' }],
    }));

    // Order of models: ultra-fast low-latency lite model first, with fallback to 3.8 flash
    const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];

    // Generator function that attempts candidate models and yields stream chunks
    async function* streamFromGemini() {
      let lastError: any = null;

      for (const model of models) {
        try {
          console.log(`[Chat API] Streaming with model: ${model}`);
          const streamResult = await ai.models.generateContentStream({
            model,
            contents,
            config: {
              systemInstruction,
            },
          });

          for await (const chunk of streamResult) {
            const chunkText = chunk.text || '';
            if (chunkText) {
              yield chunkText;
            }
          }
          return; // Successfully streamed entire response
        } catch (err: any) {
          lastError = err;
          console.warn(`[Chat API] Model ${model} failed, attempting next model:`, err?.message?.slice?.(0, 100));
          await new Promise((r) => setTimeout(r, 400));
          continue;
        }
      }
      throw lastError || new Error('All model attempts failed');
    }

    if (stream) {
      // Set headers for Server-Sent Events (SSE)
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();
      res.write(': stream connected\n\n');

      try {
        for await (const text of streamFromGemini()) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      } catch (streamErr: any) {
        console.error('Error during streaming generation:', streamErr);
        let errorMsg = streamErr?.message || 'Failed to stream response from Gemini model';
        try {
          const parsed = JSON.parse(errorMsg);
          if (parsed?.error?.message) {
            errorMsg = parsed.error.message;
          }
        } catch {
          // not JSON, keep original
        }
        res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
        res.end();
      }
    } else {
      // Non-streaming fallback
      const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
      let responseText = '';
      let lastErr: any = null;

      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents,
            config: { systemInstruction },
          });
          responseText = response.text || '';
          break;
        } catch (err: any) {
          lastErr = err;
          console.warn(`[Chat API] Non-streaming model ${model} failed, trying next:`, err?.message?.slice?.(0, 100));
          await new Promise((r) => setTimeout(r, 400));
          continue;
        }
      }

      if (!responseText && lastErr) {
        throw lastErr;
      }

      return res.json({ text: responseText });
    }
  } catch (error: any) {
    console.error('Error handling /api/chat:', error);
    return res.status(500).json({
      error: error?.message || 'Internal server error while processing AI chat request.',
    });
  }
});

// Auto-Prompt Generator: generate optimized bot personality and instructions
app.post('/api/generate-prompt', async (req: Request, res: Response) => {
  try {
    const { idea, category } = req.body;
    if (!idea || typeof idea !== 'string') {
      return res.status(400).json({ error: 'Please provide a bot concept or description.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured. Please ensure your API key is configured.',
      });
    }

    const ai = getAIClient();

    const promptText = `You are an expert AI prompt engineer and bot architect.
Given this user's bot idea: "${idea}" (Category: ${category || 'general'}),
generate a complete configuration for a high-performing AI bot.

Respond strictly in valid JSON format matching this schema:
{
  "name": "Short, catchy name for the bot (max 3 words)",
  "tagline": "A punchy 1-sentence value proposition or role description",
  "systemPrompt": "A comprehensive, high-quality system prompt (150-300 words) defining role, guardrails, reasoning style, and format",
  "tone": "One or two words describing demeanor (e.g. Sharp & Concise, Warm & Empathetic, Analytical, Creative & Playful)",
  "starterPrompts": ["3 engaging prompt suggestions for users to click and ask this bot"]
}
`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
        },
      });
    } catch {
      await new Promise((r) => setTimeout(r, 400));
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
        },
      });
    }

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/generate-prompt:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate bot blueprint.',
    });
  }
});

// Setup dev server with Vite middleware or serve static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Boot AI Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
