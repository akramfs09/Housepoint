import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, CheckCircle2 } from 'lucide-react';

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
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
            });
            setStream(mediaStream);
        } catch (err) {
            console.error(err);
            setError('Gagal mengakses kamera. Pastikan Anda mengizinkan akses browser.');
        }
    }, []);

    // 🌟 KUNCI UTAMA FIX LAYAR HITAM:
    // Memastikan srcObject dipasang tepat setelah element <video> di-render oleh DOM
    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(err => console.error("Video play error:", err));
        }
    }, [stream]);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setStream(null);
    }, [stream]);

    const capture = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        const ctx = canvas.getContext('2d');
        // Efek mirror dibalik pas jepret agar hasilnya natural (tidak terbalik)
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(blob => {
            if (blob) {
                const file = new File([blob], `selfie_${Date.now()}.jpg`, { type: 'image/jpeg' });
                setCapturedImage(URL.createObjectURL(blob));
                onCapture(file);
                stopCamera();
            }
        }, 'image/jpeg', 0.9);
    }, [onCapture, stopCamera]);

    const retake = () => { 
        setCapturedImage(null); 
        onCapture(null); 
        startCamera(); 
    };

    // Otomatis matikan hardware kamera jika komponen di-unmount/pindah halaman
    useEffect(() => { 
        return () => { if (stream) stream.getTracks().forEach(t => t.stop()); }; 
    }, [stream]);

    return (
        <div className="w-full font-poppins">
            {error && <p className="text-red-500 text-xs font-medium mb-3">{error}</p>}
            
            {/* Layout Horizontal Flexbox (Kiri Box Foto, Kanan Panduan Teks) */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
                
                {/* 📸 BOX PREVIEW (Sesuai Ukuran Mockup FOTO KTP: 260px x 340px) */}
                <div className="bg-[#EAE4DB] w-full md:w-[260px] h-[340px] rounded-xl flex flex-col items-center justify-center border border-[#D5CBB9] overflow-hidden shrink-0 relative shadow-sm">
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {capturedImage ? (
                        /* Hasil Gambar */
                        <img src={capturedImage} alt="Selfie Preview" className="w-full h-full object-cover block" />
                    ) : stream ? (
                        /* Live Video Wajah (Sudah sinkron & tidak hitam lagi) */
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted
                            className="w-full h-full object-cover scale-x-[-1] bg-black block" 
                        />
                    ) : (
                        /* Standby Tampilan Awal */
                        <div className="p-4 flex flex-col items-center justify-center">
                            <Camera className="w-8 h-8 text-[#8B7E6D] mb-3 stroke-[1.2] mx-auto" />
                            <p className="text-xs font-medium text-[#736756]">Pratinjau Foto Selfie</p>
                        </div>
                    )}
                </div>
                
                {/* 📋 TEKS PANDUAN DAN TOMBOL AKSI */}
                <div className="space-y-5 w-full pt-1">
                    <div className="text-xs text-[#555555] space-y-2.5">
                        <p className="font-bold text-[#333333] text-sm">Panduan Foto Selfie:</p>
                        <div className="flex items-start gap-2 text-[#555555]">
                            <CheckCircle2 className="w-4 h-4 text-[#C5A065] shrink-0 mt-0.5 stroke-[1.5]" /> 
                            <span>Pegang KTP di bawah dagu tanpa menutupi wajah.</span>
                        </div>
                        <div className="flex items-start gap-2 text-[#555555]">
                            <CheckCircle2 className="w-4 h-4 text-[#C5A065] shrink-0 mt-0.5 stroke-[1.5]" /> 
                            <span>Pastikan wajah dan teks pada KTP terlihat jelas.</span>
                        </div>
                        <div className="flex items-start gap-2 text-[#555555]">
                            <CheckCircle2 className="w-4 h-4 text-[#C5A065] shrink-0 mt-0.5 stroke-[1.5]" /> 
                            <span>Gunakan pencahayaan yang terang.</span>
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="w-full max-w-xs">
                        {capturedImage ? (
                            <button type="button" onClick={retake} 
                                className="inline-flex items-center justify-center gap-2 w-full bg-white border border-[#C5A065] text-[#C5A065] px-4 py-2.5 rounded-lg text-xs font-semibold shadow-sm hover:bg-[#FAF6EE] transition">
                                <Camera className="w-4 h-4 stroke-[1.5]" /> Ambil Ulang Foto
                            </button>
                        ) : !stream ? (
                            /* Sesuai desain tombol mockup awal */
                            <button type="button" onClick={startCamera} 
                                className="inline-flex items-center justify-center gap-2 w-full bg-white border border-[#C5A065] text-[#C5A065] px-4 py-2.5 rounded-lg text-xs font-semibold shadow-sm hover:bg-[#FAF6EE] transition">
                                <Camera className="w-4 h-4 stroke-[1.5]" /> Ambil Foto Selfie
                            </button>
                        ) : (
                            /* 🌟 UPDATE: Saat Kamera Menyala, Ikon & Teks mengikuti kebutuhan model Ambil Foto */
                            <div className="flex gap-2 w-full">
                                <button type="button" onClick={capture} 
                                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[#C5A065] text-white px-4 py-2.5 rounded-lg text-xs font-bold shadow-sm hover:bg-[#b08d55] transition text-center tracking-wider">
                                    <Camera className="w-4 h-4 stroke-[2]" /> Ambil Foto
                                </button>
                                <button type="button" onClick={stopCamera} 
                                    className="bg-gray-200 text-gray-600 px-4 py-2.5 rounded-lg text-xs font-semibold hover:bg-gray-300 transition">
                                    Batal
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SelfieCapture;