import fs from 'fs';
import path from 'path';

type AiConfig = {
  defaultModel?: string;
  provider?: string;
  notes?: string;
};

const configPath = path.resolve(process.cwd(), 'config', 'ai.json');

let aiConfig: AiConfig = {};
try {
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf-8');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    aiConfig = JSON.parse(raw) as AiConfig;
  }
} catch (e) {
  // swallow - fallback to env or defaults
}

export function getDefaultModel(): string {
  // runtime override via env
  if (process.env.NEXT_PUBLIC_AI_MODEL) return process.env.NEXT_PUBLIC_AI_MODEL;
  if (aiConfig.defaultModel) return aiConfig.defaultModel;
  return 'claude-haiku-4.5';
}

export function getAiProvider(): string {
  if (process.env.NEXT_PUBLIC_AI_PROVIDER) return process.env.NEXT_PUBLIC_AI_PROVIDER;
  return aiConfig.provider ?? 'anthropic';
}

export default {
  getDefaultModel,
  getAiProvider,
};
