const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateAIReply = async (messageContent, conversationContext = []) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const chat = model.startChat({
      history: conversationContext.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(messageContent);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI Service Error:', error);
    throw new Error('Failed to generate AI response');
  }
};

const generateSummary = async (messages) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const messageText = messages.map((msg) => `${msg.sender.name}: ${msg.content}`).join('\n');

    const prompt = `Summarize the following conversation in 2-3 sentences:\n\n${messageText}`;

    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 150,
        temperature: 0.5,
      },
    });

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Summary Generation Error:', error);
    throw new Error('Failed to generate summary');
  }
};

const generateSmartReplies = async (lastMessage) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Generate 3 concise, contextual reply suggestions for this message. Return ONLY as a JSON array of strings, no other text.

Message: "${lastMessage}"

Return format: ["reply1", "reply2", "reply3"]`;

    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.6,
      },
    });

    const response = await result.response;
    const content = response.text();

    try {
      return JSON.parse(content);
    } catch {
      return content
        .split('\n')
        .filter((line) => line.trim())
        .slice(0, 3);
    }
  } catch (error) {
    console.error('Smart Replies Error:', error);
    return [];
  }
};

module.exports = {
  generateAIReply,
  generateSummary,
  generateSmartReplies,
};
