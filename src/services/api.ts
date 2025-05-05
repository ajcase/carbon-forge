import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface CodeGenerationResponse {
  code: string;
  model: string;
}

export const generateCode = async (prompt: string): Promise<CodeGenerationResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate`, { prompt });
    return response.data;
  } catch (error) {
    console.error('Error generating code:', error);
    throw error;
  }
};

export const refineCode = async (prompt: string, previousCode: string): Promise<CodeGenerationResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/refine`, {
      prompt,
      previousCode
    });
    return response.data;
  } catch (error) {
    console.error('Error refining code:', error);
    throw error;
  }
}; 