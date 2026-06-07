import { llm } from "@/composition";
import { getWorkspace } from "@/lib/workspace";
import { getDictionary, fmt } from "@/i18n";

export async function compareExpressions(
  original: string,
  userInput: string,
  meaning: string,
  context?: string
): Promise<string> {
  const dict = getDictionary(getWorkspace());
  const prompt = fmt(dict.prompts.compare, {
    original,
    userInput,
    meaning,
    context: context ? `\nContext: ${context}` : "",
  });
  return llm.generateText(prompt, 1024);
}
