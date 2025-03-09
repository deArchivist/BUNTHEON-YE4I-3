// Environment configuration

export const ENV = {
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
};

export const validateEnv = (): boolean => {
  return Boolean(ENV.GEMINI_API_KEY && ENV.GEMINI_API_KEY !== 'demo_mode');
};
