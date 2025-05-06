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
    const { getConfig } = await import('./config/watsonx.js');
    const muiToCarbonMapping = await import('./config/mui-to-carbon.json', { assert: { type: 'json' } });

    // Get configuration with environment variables
    const watsonxConfig = getConfig();
    
    // Log configuration (excluding sensitive data)
    console.log('WatsonX Configuration:', {
      endpoint: watsonxConfig.endpoint,
      version: watsonxConfig.version,
      modelId: watsonxConfig.modelId,
      projectId: watsonxConfig.projectId,
      hasApiKey: !!watsonxConfig.apiKey,
      maxTokens: watsonxConfig.maxTokens,
      temperature: watsonxConfig.temperature,
      authType: watsonxConfig.authType
    });

    // Initialize Watsonx.ai client
    console.log('Initializing WatsonX client with endpoint:', watsonxConfig.endpoint);
    const watsonxAIService = WatsonXAI.newInstance({
      authenticator: new IamAuthenticator({
        apikey: watsonxConfig.apiKey
      }),
      serviceUrl: watsonxConfig.endpoint,
      version: watsonxConfig.version
    });

    // Test the authentication by making a simple request
    console.log('Testing WatsonX authentication...');
    try {
      const testResponse = await watsonxAIService.generateText({
        input: 'Test',
        modelId: watsonxConfig.modelId,
        projectId: watsonxConfig.projectId,
        parameters: {
          max_new_tokens: 10
        }
      });
      console.log('WatsonX authentication successful');
    } catch (authError) {
      console.error('WatsonX authentication failed:', {
        message: authError.message,
        stack: authError.stack,
        response: authError.response?.data,
        config: {
          endpoint: watsonxConfig.endpoint,
          version: watsonxConfig.version,
          hasApiKey: !!watsonxConfig.apiKey,
          hasProjectId: !!watsonxConfig.projectId
        }
      });
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Authentication failed', 
          details: authError.message,
          response: authError.response?.data 
        })
      };
    }

    // Parse the request body
    const body = JSON.parse(event.body);
    const { prompt, model, framework, previousCode, sourceCode, sourceDesignSystem, targetFramework } = body;

    console.log('Request details:', {
      framework,
      model,
      hasPrompt: !!prompt,
      hasPreviousCode: !!previousCode,
      hasSourceCode: !!sourceCode,
      sourceDesignSystem,
      targetFramework
    });

    // Determine the operation type based on the request parameters
    let operation;
    if (sourceCode && sourceDesignSystem && targetFramework) {
      operation = 'convert';
    } else if (prompt && previousCode) {
      operation = 'refine';
    } else if (prompt) {
      operation = 'generate';
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid request parameters' })
      };
    }

    console.log('Determined operation:', operation);

    // Route based on operation
    switch (operation) {
      case 'generate': {
        if (!prompt) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Prompt is required' })
          };
        }

        if (framework !== 'react') {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Only React framework is supported for code generation' })
          };
        }

        const frameworkSpecificRequirements = `
Requirements:
1. Always include necessary imports from '@carbon/react'
2. Use proper component structure with TypeScript types
3. Include proper prop types and default props
4. Add comments for complex logic
5. Follow Carbon Design System naming conventions
6. Include proper accessibility attributes
7. Use Carbon's built-in components and utilities
8. Never hallucinate, only use components that are part of the Carbon Design System.`;

        const requestPayload = {
          input: `You are a React developer specializing in IBM Carbon Design System. Your task is to generate clean, efficient React code following Carbon Design System best practices.

${frameworkSpecificRequirements}

User request: ${prompt}

Please provide ONLY the React code with all necessary imports and proper structure. Do not include any additional text, HTML tags, or end-of-text markers.`,
          modelId: model || watsonxConfig.modelId,
          projectId: watsonxConfig.projectId,
          parameters: {
            max_new_tokens: watsonxConfig.maxTokens,
            temperature: watsonxConfig.temperature,
            top_p: watsonxConfig.topP,
            frequency_penalty: watsonxConfig.frequencyPenalty,
            presence_penalty: watsonxConfig.presencePenalty
          }
        };

        console.log('Generate request payload:', {
          modelId: requestPayload.modelId,
          projectId: requestPayload.projectId,
          inputLength: requestPayload.input.length,
          parameters: requestPayload.parameters
        });

        const response = await watsonxAIService.generateText(requestPayload);
        console.log('Generate response:', {
          hasResults: !!response.result?.results,
          resultCount: response.result?.results?.length,
          hasGeneratedText: !!response.result?.results?.[0]?.generated_text
        });

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

        console.log('Refine request:', {
          promptLength: prompt.length,
          previousCodeLength: previousCode.length
        });

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
          modelId: model || watsonxConfig.modelId,
          projectId: watsonxConfig.projectId,
          parameters: {
            max_new_tokens: watsonxConfig.maxTokens,
            temperature: watsonxConfig.temperature,
            top_p: watsonxConfig.topP,
            frequency_penalty: watsonxConfig.frequencyPenalty,
            presence_penalty: watsonxConfig.presencePenalty
          }
        });

        console.log('Refine response:', {
          hasResults: !!response.result?.results,
          resultCount: response.result?.results?.length,
          hasGeneratedText: !!response.result?.results?.[0]?.generated_text
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
            model: model || watsonxConfig.modelId
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

        console.log('Convert request:', {
          sourceDesignSystem,
          targetFramework,
          sourceCodeLength: sourceCode.length
        });

        // Create mapping context for the prompt
        const mappingContext = muiToCarbonMapping.default
          .map(item => `${item.material_component} -> ${item.carbon_component} (${item.alignment_notes})`)
          .join('\n');

        const frameworkSpecificRequirements = targetFramework === 'react' ? `
Requirements:
1. Convert all UI components to their Carbon Design System equivalents using the mapping above
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

IMPORTANT: You MUST use the following component mapping for conversion:

${mappingContext}

${frameworkSpecificRequirements}

Source code in ${sourceDesignSystem}:
${sourceCode}

Please provide the complete converted code using Carbon Design System ${targetFramework === 'react' ? 'React' : 'Web Components'}. Only return code, do not return any other text.`,
          modelId: model || watsonxConfig.modelId,
          projectId: watsonxConfig.projectId,
          parameters: {
            max_new_tokens: watsonxConfig.maxTokens,
            temperature: watsonxConfig.temperature,
            top_p: watsonxConfig.topP,
            frequency_penalty: watsonxConfig.frequencyPenalty,
            presence_penalty: watsonxConfig.presencePenalty
          }
        });

        console.log('Convert response:', {
          hasResults: !!response.result?.results,
          resultCount: response.result?.results?.length,
          hasGeneratedText: !!response.result?.results?.[0]?.generated_text
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
            model: model || watsonxConfig.modelId
          })
        };
      }

      default:
        console.log('Invalid operation:', operation);
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid operation' })
        };
    }
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      endpoint: error.endpoint,
      statusCode: error.statusCode
    });
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