const dev = process.env.NODE_ENV !== 'production';
export const serverAddress = dev ? 'http://localhost:8000' : '';
