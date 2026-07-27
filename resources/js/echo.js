import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8000/api';
    }
    return `${window.location.origin}/api`;
};

const reverbScheme = import.meta.env.VITE_REVERB_SCHEME || (window.location.protocol === 'https:' ? 'https' : 'http');
const reverbPort = Number(import.meta.env.VITE_REVERB_PORT || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 8081 : (window.location.protocol === 'https:' ? 443 : 80)));
const reverbHost = import.meta.env.VITE_REVERB_HOST || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'localhost' : window.location.hostname);

const echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    cluster: '',
    wsHost: reverbHost,
    wsPort: reverbPort,
    wssPort: reverbPort,
    forceTLS: reverbScheme === 'https',
    disableStats: true,
    enabledTransports: [reverbScheme === 'https' ? 'wss' : 'ws'],
    authEndpoint: `${getApiBaseUrl()}/broadcasting/auth`,
    auth: {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    },
});

export const refreshEchoAuthToken = () => {
    const token = localStorage.getItem('token') || '';
    const authorization = token ? `Bearer ${token}` : '';

    if (echo.options?.auth?.headers) {
        echo.options.auth.headers.Authorization = authorization;
    }

    if (echo.connector?.options?.auth?.headers) {
        echo.connector.options.auth.headers.Authorization = authorization;
    }

    if (echo.connector?.pusher?.config?.auth?.headers) {
        echo.connector.pusher.config.auth.headers.Authorization = authorization;
    }
};

export default echo;
