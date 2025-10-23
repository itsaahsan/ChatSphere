const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateAIReply = async (messageContent, conversationContext = []) => {
  try {
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant in a chat application. Provide concise, friendly responses.',
      },
      ...conversationContext,
      {
        role: 'user',
        content: messageContent,
      },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('AI Service Error:', error);
    throw new Error('Failed to generate AI response');
  }
};

const generateSummary = async (messages) => {
  try {
    const messageText = messages.map((msg) => `${msg.sender.name}: ${msg.content}`).join('\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Summarize the conversation in 2-3 sentences.',
        },
        {
          role: 'user',
          content: messageText,
        },
      ],
      max_tokens: 150,
      temperature: 0.5,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Summary Generation Error:', error);
    throw new Error('Failed to generate summary');
  }
};

const generateSmartReplies = async (lastMessage) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Generate 3 concise, contextual reply suggestions for a chat message. Return as JSON array.',
        },
        {
          role: 'user',
          content: `Message: "${lastMessage}"\nGenerate 3 suggested replies as a JSON array of strings.`,
        },
      ],
      max_tokens: 200,
      temperature: 0.6,
    });

    const content = response.choices[0].message.content;
    try {
      return JSON.parse(content);
    } catch {
      return content.split('\n').filter((line) => line.trim());
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
