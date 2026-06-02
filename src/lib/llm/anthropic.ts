import Anthropic from "@anthropic-ai/sdk";
import type { LLMProvider } from "./interfaces";

export interface AnthropicConfig {
  model: string;
  apiKey?: string;
}

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;
  private model: string;

  constructor(config: AnthropicConfig) {
    this.model = config.model;
    this.client = new Anthropic(
      config.apiKey ? { apiKey: config.apiKey } : undefined
    );
  }

  async generateText(prompt: string, maxTokens = 1024): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    });
    const block = response.content[0];
    return block.type === "text" ? block.text : "";
  }
}
