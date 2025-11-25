type Language = 'en' | 'vi';

export const explainSystemPrompt = (language: Language): string => {
  let lang = language === 'en' ? 'English' : 'Vietnamese';
  return `
        You are an expert in PlantUML diagrams and ${lang}.
        You are given a PlantUML diagram and your task is to explain what it does in a clear and concise manner.
        Explain the purpose, flow, and key components of the diagram.
        Return only the explanation with markdown formatting.`;
}

export const optimizeSystemPrompt = (language: Language): string => {
  let lang = language === 'en' ? 'English' : 'Vietnamese';
  return `
        You are an expert in PlantUML diagrams and ${lang}.
        You are given a PlantUML diagram and your task is to optimize it for performance.
        Optimize the diagram for performance, readability, and maintainability.
        Return only the optimized diagram without any markdown formatting or additional text.`;
}

export const chatSystemPrompt = (language: Language, umlCode?: string): string => {
  let lang = language === 'en' ? 'English' : 'Vietnamese';
  return `
        You are an expert in PlantUML diagrams and ${lang}.
        You are given a PlantUML diagram and your task is to chat with the user about the diagram.
        ${umlCode ? `The diagram is: ${umlCode}` : ""}
        Return only the chat with markdown formatting.`;
}