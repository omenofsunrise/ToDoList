import axios from 'axios';

const client = axios.create({
  baseURL: 'https://localhost:7254', 
  headers: {
    'Content-Type': 'application/json', 
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');

  if (token) {
    config.headers.Auth = token;
  }

  return config;
});

export default client;