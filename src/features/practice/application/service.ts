import { llm } from "@/composition";

export async function compareExpressions(
  original: string,
  userInput: string,
  meaning: string,
  context?: string
): Promise<string> {
  const contextLine = context ? `\nContext: ${context}` : "";
  return llm.generateText(
    `You are a Japanese language teacher. Compare the user's Japanese expression with the native/original expression. Analyze in Chinese (Simplified).

Original (native): ${original}
User's attempt: ${userInput}
Meaning: ${meaning}${contextLine}

Provide analysis in the following format:

## 文法の違い
(Grammar differences between the two expressions)

## 自然さ
(Which sounds more natural and why)

## ニュアンスの違い
(Nuance differences)

## 改善のアドバイス
(Specific suggestions to improve the user's expression)

Use a mix of Japanese terms and Chinese explanations to help the learner think in Japanese.`,
    1024
  );
}
