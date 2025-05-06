// Default configuration
const config = {
  modelId: 'meta-llama/llama-3-3-70b-instruct', // Using the recommended model for code generation
  endpoint: 'https://us-south.ml.cloud.ibm.com',
  version: '2024-05-31', // Required version parameter
  maxTokens: 2048,
  temperature: 0.7,
  topP: 0.9,
  frequencyPenalty: 0,
  presencePenalty: 0,
  authType: 'iam' // Explicitly set authentication type to IAM
};

// Function to get config with environment variables
export function getConfig() {
  const requiredEnvVars = ['WATSONX_API_KEY', 'WATSONX_PROJECT_ID'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }

  return {
    ...config,
    apiKey: process.env.WATSONX_API_KEY,
    projectId: process.env.WATSONX_PROJECT_ID,
    endpoint: process.env.WATSONX_ENDPOINT || config.endpoint
  };
}

export default config; 