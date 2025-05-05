const { WatsonxAI } = require('@ibm-cloud/watsonx-ai');
const { IamAuthenticator } = require('ibm-cloud-sdk-core');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { prompt, model } = JSON.parse(event.body);

    const watsonx = new WatsonxAI({
      authenticator: new IamAuthenticator({
        apikey: process.env.WATSONX_API_KEY,
      }),
      serviceUrl: process.env.WATSONX_ENDPOINT,
    });

    const response = await watsonx.generate({
      projectId: process.env.WATSONX_PROJECT_ID,
      modelId: model,
      input: prompt,
      parameters: {
        max_new_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
        top_k: 50,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ code: response.result.generated_text }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', details: error.message }),
    };
  }
}; 