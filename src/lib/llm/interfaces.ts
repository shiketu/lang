export interface LLMProvider {
  generateText(prompt: string, maxTokens?: number): Promise<string>;
}
