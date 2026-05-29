import { Link } from 'react-router-dom';

const Forbidden = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
        <p className="text-xl text-gray-600 mb-6">Anda tidak memiliki akses ke halaman ini.</p>
        <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Kembali ke Beranda
        </Link>
    </div>
);

export default Forbidden;