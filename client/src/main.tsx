import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './assets/css/font-awesome.min.css';
import './assets/css/style.css';

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const isUnauthorized = error.response?.status === 401;
    const isLoginPage = window.location.pathname.startsWith('/login');

    if (isUnauthorized && !isLoginPage) {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');

      // Redirect to login
      if (!isLoginPage) {
        window.location.assign('/login');
      }

      return new Promise(() => {});
    }

    return Promise.reject(error);
  }
);

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root was not found');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
