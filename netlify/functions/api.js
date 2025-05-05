export const handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { WatsonXAI } = await import('@ibm-cloud/watsonx-ai');
    const { IamAuthenticator } = await import('ibm-cloud-sdk-core');

    // Initialize Watsonx.ai client
    const watsonxAIService = new WatsonXAI({
      authenticator: new IamAuthenticator({
        apikey: process.env.WATSONX_API_KEY,
      }),
      serviceUrl: process.env.WATSONX_ENDPOINT,
    });

    // Parse the request body
    const body = JSON.parse(event.body);
    const { endpoint, prompt, model, framework, previousCode, sourceCode, sourceDesignSystem, targetFramework } = body;

    // Route based on endpoint
    switch (endpoint) {
      case 'generate': {
        if (!prompt) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Prompt is required' })
          };
        }

        const frameworkSpecificRequirements = framework === 'react' ? `
Requirements:
1. Always include necessary imports from '@carbon/react'
2. Use proper component structure with TypeScript types
3. Include proper prop types and default props
4. Add comments for complex logic
5. Follow Carbon Design System naming conventions
6. Include proper accessibility attributes
7. Use Carbon's built-in components and utilities
8. Never hallucinate, only use components that are part of the Carbon Design System.` : `
Requirements:
1. Always include necessary imports from '@carbon/web-components'
2. Use proper custom element naming (kebab-case)
3. Include proper attributes and properties
4. Add comments for complex logic
5. Follow Carbon Design System naming conventions
6. Include proper accessibility attributes
7. Use Carbon's built-in web components
8. Never hallucinate, only use components that are part of the Carbon Design System.
9. Use proper event handling with custom events
10. Include proper shadow DOM usage where applicable
11. Return ONLY the Web Components code without any HTML tags or end-of-text markers
12. Do not include any wrapper elements or additional text`;

        const requestPayload = {
          input: `You are a ${framework === 'react' ? 'React' : 'Web Components'} developer specializing in IBM Carbon Design System. Your task is to generate clean, efficient ${framework === 'react' ? 'React' : 'Web Components'} code following Carbon Design System best practices.

${frameworkSpecificRequirements}

User request: ${prompt}

Please provide ONLY the ${framework === 'react' ? 'React' : 'Web Components'} code with all necessary imports and proper structure. Do not include any additional text, HTML tags, or end-of-text markers.`,
          modelId: model || process.env.WATSONX_MODEL_ID,
          projectId: process.env.WATSONX_PROJECT_ID,
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
          return {
            statusCode: 500,
            body: JSON.stringify({ 
              error: 'No code generated', 
              details: 'The API returned an empty response' 
            })
          };
        }

        const generatedCode = response.result.results[0].generated_text
          .replace(/```(jsx|tsx|javascript|typescript|html)?\n?/g, '')
          .replace(/```\n?/g, '')
          .replace(/<html>\n?/g, '')
          .replace(/<\/html>\n?/g, '')
          .replace(/<\|end_of_text\|\>/g, '')
          .trim();

        return {
          statusCode: 200,
          body: JSON.stringify({ 
            code: generatedCode,
            model: requestPayload.modelId
          })
        };
      }

      case 'refine': {
        if (!prompt || !previousCode) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Prompt and previous code are required' })
          };
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
          modelId: model || process.env.WATSONX_MODEL_ID,
          projectId: process.env.WATSONX_PROJECT_ID,
          parameters: {
            max_new_tokens: 2048,
            temperature: 0.7,
            top_p: 0.9,
            frequency_penalty: 0,
            presence_penalty: 0
          }
        });

        const generatedCode = response.result.results[0].generated_text
          .replace(/```(jsx|tsx|javascript|typescript|html)?\n?/g, '')
          .replace(/```\n?/g, '')
          .replace(/<html>\n?/g, '')
          .replace(/<\/html>\n?/g, '')
          .replace(/<\|end_of_text\|\>/g, '')
          .trim();

        return {
          statusCode: 200,
          body: JSON.stringify({ 
            code: generatedCode,
            model: model || process.env.WATSONX_MODEL_ID
          })
        };
      }

      case 'convert': {
        if (!sourceCode || !sourceDesignSystem || !targetFramework) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Source code, design system, and target framework are required' })
          };
        }

        const frameworkSpecificRequirements = targetFramework === 'react' ? `
Requirements:
1. Convert all UI components to their Carbon Design System equivalents
2. If a component is not in the mapping, do not make up a component - use the closest equivalent
3. Maintain the same functionality and behavior
4. Use proper Carbon Design System patterns and best practices
5. Include all necessary imports from '@carbon/react'
6. Preserve component structure and props
7. Add proper accessibility attributes
8. Follow Carbon Design System naming conventions` : `
Requirements:
1. Convert all UI components to their Carbon Web Components equivalents
2. Use proper custom element naming (kebab-case)
3. Convert props to attributes and properties
4. Use proper event handling with custom events
5. Include proper shadow DOM usage where applicable
6. Maintain the same functionality and behavior
7. Use proper Carbon Design System patterns and best practices
8. Include all necessary imports from '@carbon/web-components'
9. Add proper accessibility attributes
10. Follow Carbon Design System naming conventions`;

        const response = await watsonxAIService.generateText({
          input: `You are a ${targetFramework === 'react' ? 'React' : 'Web Components'} developer specializing in IBM Carbon Design System. Your task is to convert code from ${sourceDesignSystem} to Carbon Design System ${targetFramework === 'react' ? 'React' : 'Web Components'}.

${frameworkSpecificRequirements}

Source code in ${sourceDesignSystem}:
${sourceCode}

Please provide the complete converted code using Carbon Design System ${targetFramework === 'react' ? 'React' : 'Web Components'}. Only return code, do not return any other text.`,
          modelId: model || process.env.WATSONX_MODEL_ID,
          projectId: process.env.WATSONX_PROJECT_ID,
          parameters: {
            max_new_tokens: 2048,
            temperature: 0.7,
            top_p: 0.9,
            frequency_penalty: 0,
            presence_penalty: 0
          }
        });

        const convertedCode = response.result.results[0].generated_text
          .replace(/```(jsx|tsx|javascript|typescript|html)?\n?/g, '')
          .replace(/```\n?/g, '')
          .replace(/<html>\n?/g, '')
          .replace(/<\/html>\n?/g, '')
          .replace(/<\|end_of_text\|\>/g, '')
          .trim();

        return {
          statusCode: 200,
          body: JSON.stringify({ 
            code: convertedCode,
            model: model || process.env.WATSONX_MODEL_ID
          })
        };
      }

      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid endpoint' })
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal Server Error', 
        details: error.message,
        response: error.response?.data 
      })
    };
  }
}; 