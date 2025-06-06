import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // Adjust this to match your Spring Boot server URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;