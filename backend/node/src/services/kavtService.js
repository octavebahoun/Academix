/**
 * @file kavtService.js
 * @description Service d'assistant IA "KAVT" (OpenRouter) avec streaming SSE.
 */

const logger = require('../utils/logger');

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

const KAVT_USER_ID = Number(process.env.KAVT_USER_ID || -100);
const KAVT_MODEL = process.env.KAVT_MODEL || 'arcee-ai/trinity-large-preview:free';
const KAVT_CONTEXT_LIMIT = Number(process.env.KAVT_CONTEXT_LIMIT || 20);
const KAVT_RATE_LIMIT_PER_MIN = Number(process.env.KAVT_RATE_LIMIT_PER_MIN || 5);
const KAVT_MAX_QUESTION_CHARS = Number(process.env.KAVT_MAX_QUESTION_CHARS || 800);

const kavtMentionRegex = /@kavt\b/i;

const normalizeWhitespace = (value) => (value || '').toString().replace(/\s+/g, ' ').trim();

const isKavtMentioned = (text) => kavtMentionRegex.test((text || '').toString());

const extractKavtQuestion = (text) => {
    if (!text) return '';
    return normalizeWhitespace(text.toString().replace(/@kavt\b/gi, ' '));
};

const buildSystemPrompt = () => {
    return [
        "Tu es KAVT, l'assistant pédagogique intégré au chat AcademiX.",
        "Réponds en français, de façon concise et actionnable.",
        "Si la question manque d'informations, pose 1 à 2 questions de clarification.",
        "Évite les digressions, et structure la réponse (puces / étapes) si utile.",
        "Conserve le contexte de la session, mais n'invente pas des faits."
    ].join(' ');
};

const sseStreamChat = async function* ({ apiKey, model, messages, maxTokens = 600, temperature = 0.4 }) {
    const headers = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.OPENROUTER_REFERER || process.env.FRONTEND_URL || 'http://localhost:5173',
        'X-Title': process.env.OPENROUTER_APP_TITLE || 'AcademiX'
    };

    const body = {
        model,
        stream: true,
        temperature,
        max_tokens: maxTokens,
        messages
    };

    const response = await fetch(OPENROUTER_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`OpenRouter error ${response.status}: ${text || response.statusText}`);
    }

    if (!response.body) {
        throw new Error('OpenRouter: réponse sans body stream');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    let buffer = '';

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split('\n');
        buffer = parts.pop() || '';

        for (const rawLine of parts) {
            const line = rawLine.trim();
            if (!line.startsWith('data:')) continue;

            const data = line.slice(5).trim();
            if (!data) continue;
            if (data === '[DONE]') return;

            let parsed;
            try {
                parsed = JSON.parse(data);
            } catch {
                continue;
            }

            const delta = parsed?.choices?.[0]?.delta?.content;
            if (typeof delta === 'string' && delta.length) {
                yield delta;
            }
        }
    }
};

const createRateLimiter = () => {
    const hitsByKey = new Map();

    const check = ({ key, now = Date.now() }) => {
        const windowMs = 60_000;
        const list = hitsByKey.get(key) || [];
        const filtered = list.filter((t) => now - t < windowMs);
        if (filtered.length >= KAVT_RATE_LIMIT_PER_MIN) {
            hitsByKey.set(key, filtered);
            return { ok: false, retryAfterMs: windowMs - (now - filtered[0]) };
        }
        filtered.push(now);
        hitsByKey.set(key, filtered);
        return { ok: true, retryAfterMs: 0 };
    };

    return { check };
};

const buildKavtPromptMessages = ({ contextMessages, question, askerLabel }) => {
    const system = { role: 'system', content: buildSystemPrompt() };

    const context = (contextMessages || [])
        .filter((msg) => msg && msg.type !== 'system')
        .map((msg) => {
            const isAssistant = Number(msg.user_id) === KAVT_USER_ID;
            const label = normalizeWhitespace(
                `${msg.user_info?.prenom || ''} ${msg.user_info?.nom || ''}`
            ) || (isAssistant ? 'KAVT' : 'Participant');

            return {
                role: isAssistant ? 'assistant' : 'user',
                content: `${label}: ${(msg.contenu || '').toString()}`
            };
        });

    const userQuestion = {
        role: 'user',
        content: `${askerLabel}: ${question}`
    };

    return [system, ...context, userQuestion];
};

module.exports = {
    KAVT_USER_ID,
    KAVT_MODEL,
    KAVT_CONTEXT_LIMIT,
    KAVT_MAX_QUESTION_CHARS,
    isKavtMentioned,
    extractKavtQuestion,
    createRateLimiter,
    buildKavtPromptMessages,
    sseStreamChat,
    logger
};
