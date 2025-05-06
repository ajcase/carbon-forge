// Validate required environment variables
const requiredEnvVars = ['WATSONX_API_KEY', 'WATSONX_PROJECT_ID'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

const config = {
  apiKey: process.env.WATSONX_API_KEY,
  projectId: process.env.WATSONX_PROJECT_ID,
  modelId: 'meta-llama/llama-3-3-70b-instruct', // Using the recommended model for code generation
  endpoint: process.env.WATSONX_ENDPOINT || 'https://us-south.ml.cloud.ibm.com',
  version: '2024-05-31', // Required version parameter
  maxTokens: 2048,
  temperature: 0.7,
  topP: 0.9,
  frequencyPenalty: 0,
  presencePenalty: 0,
  authType: 'iam' // Explicitly set authentication type to IAM
};

export default config; 