import OpenAI from 'openai';
import { cacheResponse } from '../utils/cache';
import { AppError } from '../utils/appError';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const aiService = {
  async generateResponse(prompt, options = {}) {
    try {
      const cacheKey = `ai_response_${prompt}`;
      const cachedResponse = await cacheResponse.get(cacheKey);
      
      if (cachedResponse && !options.skipCache) {
        return cachedResponse;
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 150
      });

      const response = completion.choices[0].message.content;
      await cacheResponse.set(cacheKey, response);
      
      return response;
    } catch (error) {
      throw new AppError('AI Service Error', 500);
    }
  },

  async analyzeImage(imageBuffer) {
    try {
      const response = await openai.images.analyze({
        image: imageBuffer,
        model: "gpt-4-vision-preview"
      });
      
      return response.data;
    } catch (error) {
      throw new AppError('Image Analysis Error', 500);
    }
  },

  async moderateContent(text) {
    try {
      const response = await openai.moderations.create({
        input: text
      });
      
      return {
        flagged: response.results[0].flagged,
        categories: response.results[0].categories
      };
    } catch (error) {
      throw new AppError('Content Moderation Error', 500);
    }
  }
};

export const configureAI = () => {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OpenAI API key not found. AI features will be disabled.');
    return false;
  }
  return true;
};