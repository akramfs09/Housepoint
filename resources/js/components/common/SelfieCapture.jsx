import { useRef, useState, useCallback, useEffect } from 'react';

const SelfieCapture = ({ onCapture }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [error, setError] = useState(null);

    const startCamera = useCallback(async () => {
        setError(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
            });
            if (videoRef.current) videoRef.current.srcObject = mediaStream;
            setStream(mediaStream);
        } catch {
            setError('Gagal mengakses kamera. Pastikan Anda mengizinkan akses.');
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) stream.getTracks().forEach(track => track.stop());
        setStream(null);
    }, [stream]);

    const capture = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(blob => {
            const file = new File([blob], `selfie_${Date.now()}.jpg`, { type: 'image/jpeg' });
            setCapturedImage(URL.createObjectURL(blob));
            onCapture(file);
            stopCamera();
        }, 'image/jpeg', 0.9);
    }, [onCapture, stopCamera]);

    const retake = () => { setCapturedImage(null); onCapture(null); startCamera(); };

    useEffect(() => { return () => { if (stream) stream.getTracks().forEach(t => t.stop()); }; }, [stream]);

    return (
        <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-medium text-gray-700">Selfie Verifikasi</h3>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {capturedImage ? (
                <div className="space-y-2">
                    <img src={capturedImage} alt="Selfie" className="w-40 h-40 object-cover rounded-lg border" />
                    <button type="button" onClick={retake} className="text-blue-600 text-sm hover:underline">📸 Ambil Ulang</button>
                </div>
            ) : (
                <div className="space-y-2">
                    <video ref={videoRef} autoPlay playsInline className="w-full max-w-sm rounded-lg bg-black" />
                    <canvas ref={canvasRef} className="hidden" />
                    {!stream ? (
                        <button type="button" onClick={startCamera} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">📸 Aktifkan Kamera</button>
                    ) : (
                        <div className="flex gap-2">
                            <button type="button" onClick={capture} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">🖼️ Jepret!</button>
                            <button type="button" onClick={stopCamera} className="bg-gray-400 text-white px-4 py-2 rounded-lg text-sm">Batal</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SelfieCapture;