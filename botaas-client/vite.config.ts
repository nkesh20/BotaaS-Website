import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        allowedHosts: [
            'localhost',
            '127.0.0.1',
            '5123-212-58-102-224.ngrok-free.app',
            '.ngrok-free.app', // This will allow any subdomain of ngrok-free.app
        ],
    },
});