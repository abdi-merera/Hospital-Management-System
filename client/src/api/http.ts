import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

export const http = axios.create({
  baseURL: API_BASE_URL,
});
