// server/src/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { WatsonXAI } from '@ibm-cloud/watsonx-ai';
import { IamAuthenticator } from 'ibm-cloud-sdk-core';
import winston from 'winston';
import watsonxConfig from './config/watsonx.js';

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Debug logging for WatsonXAI
logger.info('Initializing WatsonXAI client');
console.log('WatsonXAI:', WatsonXAI);
console.log('WatsonXAI methods:', Object.keys(WatsonXAI.prototype));

// Initialize Watsonx.ai client with IAM authentication
let watsonxAIService;
try {
  watsonxAIService = WatsonXAI.newInstance({
    authenticator: new IamAuthenticator({
      apikey: watsonxConfig.apiKey
    }),
    serviceUrl: watsonxConfig.endpoint,
    version: watsonxConfig.version
  });

  // Test the authentication by making a simple request
  const testResponse = await watsonxAIService.generateText({
    input: 'Test',
    modelId: watsonxConfig.modelId,
    projectId: watsonxConfig.projectId,
    parameters: {
      max_new_tokens: 10
    }
  });

  logger.info('Watsonx authentication successful');
} catch (error) {
  logger.error('Failed to initialize Watsonx.ai client:', {
    message: error.message,
    stack: error.stack,
    response: error.response?.data
  });
  process.exit(1);
}

// Debug logging for watsonxAIService
logger.info('Watsonx Config:', {
  apiKey: watsonxConfig.apiKey ? 'Set' : 'Not Set',
  projectId: watsonxConfig.projectId ? 'Set' : 'Not Set',
  endpoint: watsonxConfig.endpoint,
  modelId: watsonxConfig.modelId,
  version: watsonxConfig.version
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Generate React code from prompt
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    logger.info('Generating code for prompt:', { prompt });

    // Log the request payload
    const requestPayload = {
      input: `You are a React developer specializing in IBM Carbon Design System. Your task is to generate clean, efficient React code following Carbon Design System best practices.

Requirements:
1. Always include necessary imports from '@carbon/react'
2. Use proper component structure with TypeScript types
3. Include proper prop types and default props
4. Add comments for complex logic
5. Follow Carbon Design System naming conventions
6. Include proper accessibility attributes
7. Use Carbon's built-in components and utilities
8. Never hallucinate, only use components that are part of the Carbon Design System.

User request: ${prompt}

Please provide the complete React component code with all necessary imports and proper structure.`,
      modelId: watsonxConfig.modelId,
      projectId: watsonxConfig.projectId,
      parameters: {
        max_new_tokens: 2048,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0
      }
    };

    logger.info('Watsonx request payload:', {
      modelId: requestPayload.modelId,
      projectId: requestPayload.projectId,
      inputLength: requestPayload.input.length
    });

    const response = await watsonxAIService.generateText(requestPayload);

    logger.info('Watsonx response:', { 
      hasResults: !!response.result?.results,
      resultCount: response.result?.results?.length 
    });

    if (!response.result?.results?.[0]?.generated_text) {
      logger.error('No generated text in response:', response);
      return res.status(500).json({ 
        error: 'No code generated', 
        details: 'The API returned an empty response' 
      });
    }

    // Clean up the response
    const generatedCode = response.result.results[0].generated_text
      .replace(/```(jsx|tsx|javascript|typescript)?\n?/g, '') // Remove code block markers
      .replace(/```\n?/g, '') // Remove closing code block markers
      .trim();

    logger.info('Generated code length:', generatedCode.length);

    res.json({
      code: generatedCode,
      model: watsonxConfig.modelId
    });
  } catch (error) {
    logger.error('Error in /api/generate:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    res.status(500).json({ 
      error: 'Failed to generate code', 
      details: error.message,
      response: error.response?.data 
    });
  }
});

// Refine code through chat
app.post('/api/refine', async (req, res) => {
  try {
    const { prompt, previousCode } = req.body;
    
    if (!prompt || !previousCode) {
      return res.status(400).json({ error: 'Prompt and previous code are required' });
    }

    const response = await watsonxAIService.generateText({
      input: `You are a React developer specializing in IBM Carbon Design System. Your task is to refine and improve existing React code following Carbon Design System best practices.

Requirements:
1. Always include necessary imports from '@carbon/react'
2. Use proper component structure with TypeScript types
3. Include proper prop types and default props
4. Add comments for complex logic
5. Follow Carbon Design System naming conventions
6. Include proper accessibility attributes
7. Use Carbon's built-in components and utilities

Current code:
${previousCode}

Requested changes: ${prompt}

Please provide the complete updated React component code with all necessary changes.`,
      modelId: watsonxConfig.modelId,
      projectId: watsonxConfig.projectId,
      parameters: {
        max_new_tokens: 2048,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0
      }
    });

    // Clean up the response
    const generatedCode = response.result.results[0].generated_text
      .replace(/```(jsx|tsx|javascript|typescript)?\n?/g, '') // Remove code block markers
      .replace(/```\n?/g, '') // Remove closing code block markers
      .trim();

    res.json({
      code: generatedCode,
      model: watsonxConfig.modelId
    });
  } catch (error) {
    logger.error('Error in /api/refine:', error);
    res.status(500).json({ error: 'Failed to refine code', details: error.message });
  }
});

// Convert code from other design systems to Carbon
app.post('/api/convert', async (req, res) => {
  try {
    const { sourceCode, sourceDesignSystem, targetFramework } = req.body;
    
    if (!sourceCode || !sourceDesignSystem || !targetFramework) {
      return res.status(400).json({ error: 'Source code, design system, and target framework are required' });
    }

    logger.info('Converting code:', { 
      designSystem: sourceDesignSystem,
      framework: targetFramework,
      codeLength: sourceCode.length 
    });

    const requestPayload = {
      input: `You are a React developer specializing in IBM Carbon Design System. Your task is to convert code from ${sourceDesignSystem} to Carbon Design System components.

Requirements:
1. Convert all UI components to their Carbon Design System equivalents
2. Maintain the same functionality and behavior
3. Use proper Carbon Design System patterns and best practices
4. Include all necessary imports from '@carbon/react'
5. Preserve component structure and props
6. Add proper accessibility attributes
7. Follow Carbon Design System naming conventions

Source code in ${sourceDesignSystem}:
${sourceCode}

Please provide the complete converted code using Carbon Design System components.`,
      modelId: watsonxConfig.modelId,
      projectId: watsonxConfig.projectId,
      parameters: {
        max_new_tokens: 2048,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0
      }
    };

    const response = await watsonxAIService.generateText(requestPayload);

    if (!response.result?.results?.[0]?.generated_text) {
      logger.error('No converted code in response:', response);
      return res.status(500).json({ 
        error: 'No code generated', 
        details: 'The API returned an empty response' 
      });
    }

    const convertedCode = response.result.results[0].generated_text
      .replace(/```(jsx|tsx|javascript|typescript)?\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    logger.info('Code conversion successful:', { 
      originalLength: sourceCode.length,
      convertedLength: convertedCode.length 
    });

    res.json({
      code: convertedCode,
      model: watsonxConfig.modelId
    });
  } catch (error) {
    logger.error('Error in /api/convert:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    res.status(500).json({ 
      error: 'Failed to convert code', 
      details: error.message,
      response: error.response?.data 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});