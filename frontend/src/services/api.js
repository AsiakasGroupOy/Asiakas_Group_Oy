import axios from 'axios';

const backendURL = 'http://localhost:5000/api/calls';
const pythonAPIURL = 'http://localhost:8000/analyze';

// Backend (Node.js) Communication
export const fetchCalls = async () => {
  const response = await axios.get(backendURL);
  return response.data;
};

export const createCall = async (callData) => {
  const response = await axios.post(backendURL, callData);
  return response.data;
};

// Python API Communication
export const analyzeText = async (text) => {
  const response = await axios.post(pythonAPIURL, { text });
  return response.data;
};

