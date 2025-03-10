const config = {
  production: {
    API_URL: 'https://bhimgpt-service.onrender.com',
    CHAT_API_URL: 'https://bhimgpt-flask.onrender.com/chat'
  },
  development: {
    API_URL: 'http://localhost:5000',
    CHAT_API_URL: 'http://localhost:5001/chat'
  }
};

// Use the environment variable to determine the current environment
const currentEnv = process.env.NODE_ENV === 'production' ? 'production' : 'development';

export default config[currentEnv];