import api from '../services/api';

let snapLoaderPromise = null;

export const loadMidtransSnap = async () => {
    if (window.snap) {
        return window.snap;
    }

    if (snapLoaderPromise) {
        return snapLoaderPromise;
    }

    snapLoaderPromise = api.get('/midtrans/config').then(({ data }) => {
        const config = data.data || {};

        if (!config.snap_url || !config.client_key) {
            throw new Error('Konfigurasi Midtrans belum lengkap.');
        }

        return new Promise((resolve, reject) => {
            const existingScript = document.querySelector('script[data-midtrans-snap="true"]');
            if (existingScript) {
                existingScript.addEventListener('load', () => resolve(window.snap));
                existingScript.addEventListener('error', () => reject(new Error('Gagal memuat Midtrans Snap.')));
                return;
            }

            const script = document.createElement('script');
            script.src = config.snap_url;
            script.async = true;
            script.dataset.midtransSnap = 'true';
            script.dataset.clientKey = config.client_key;
            script.onload = () => resolve(window.snap);
            script.onerror = () => reject(new Error('Gagal memuat Midtrans Snap.'));
            document.body.appendChild(script);
        });
    });

    return snapLoaderPromise;
};
