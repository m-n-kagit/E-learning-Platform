import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'//for setting up a axios 
// instance with default config like 
// baseURL and withCredentials to avoid repeating 
// the same config in every request and also to handle 
// token refresh logic in one place 
// instead of handling it in every request. This helps to keep the code clean and maintainable.

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
  proxy : {
    '/api' : {
      target: 'http://localhost:4500/',
      changeOrigin: true //means that the origin of the host 
      // header will be changed to the target URL. 
      // This is often necessary when the backend server 
      // expects requests to come from a specific origin, 
      // and it helps to avoid CORS issues during development.
    }
  }}
}

)
