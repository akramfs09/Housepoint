import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import echo from './echo';            // ← tambahkan
import '../css/app.css';

window.echo = echo;                   // ← agar bisa diakses di console

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);