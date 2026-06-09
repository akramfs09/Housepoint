import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const reverbScheme = import.meta.env.VITE_REVERB_SCHEME || 'http';
const reverbPort = Number(import.meta.env.VITE_REVERB_PORT || 8081);

const echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    cluster: '',
    wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
    wsPort: reverbPort,
    wssPort: reverbPort,
    forceTLS: reverbScheme === 'https',
    disableStats: true,
    enabledTransports: [reverbScheme === 'https' ? 'wss' : 'ws'],
    authEndpoint: `${apiBaseUrl}/broadcasting/auth`,
    auth: {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    },
});

export default echo;
