export type StudioMode =
  | '💬 Chat Prompt Mode'
  | '📞 Live AI Voice Call'
  | '🧠 Autonomous Problem Solver'
  | '📝 Freeform Canvas'
  | '📊 Structured Few-Shot'
  | '⚙️ API Key & Developer Manager'
  | '🧬 Model Fine-Tuning Pipeline';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  imagePrompt?: string;
  imageStyle?: string;
  imageSeed?: number;
  timestamp?: string;
  source?: string;
}

export interface ApiKeyItem {
  project: string;
  rpm_limit: number;
  created_at: string;
  status: string;
}

export interface FewShotRow {
  id: string;
  input: string;
  output: string;
}

export interface FineTunedModel {
  base: string;
  status: string;
  created_at: string;
}
