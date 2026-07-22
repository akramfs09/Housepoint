import { useEffect, useState, useRef } from 'react';

const DragDropUpload = ({ images, setImages, initialImages = [], errors }) => {
    const [dragActive, setDragActive] = useState(false);
    const [existingImages, setExistingImages] = useState([]);
    const inputRef = useRef(null);
    const MAX_IMAGES = 10;

    useEffect(() => {
        const normalized = (initialImages || []).map((image, index) => ({
            id: image.id ?? index,
            preview: image.url || image.path || image,
            label: `Foto tersimpan ${index + 1}`,
        }));
        setExistingImages(normalized);
    }, [initialImages]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        addFiles(files);
    };

    const handleFileInput = (e) => {
        const files = Array.from(e.target.files);
        addFiles(files);
    };

    const addFiles = (files) => {
        const remaining = MAX_IMAGES - existingImages.length - images.length;
        const newFiles = files.slice(0, remaining).map(file => ({
            file,
            preview: URL.createObjectURL(file),
            label: file.name,
        }));
        setImages([...images, ...newFiles]);
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
    };

    return (
        <div>
            <label className="block text-sm font-medium mb-1">
                Upload Foto Properti (maks {MAX_IMAGES})
            </label>

            {/* Drop Zone */}
            <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer ${
                    dragActive ? 'border-[#C5A065] bg-[#faf7f0]' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <p className="text-gray-500 text-sm">
                    📁 Drag & Drop Foto Properti di sini<br />
                    atau <span className="text-[#C5A065]">Klik untuk Memilih File</span>
                </p>
                <p className="text-gray-400 text-xs mt-2">
                    Format: JPEG, JPG, PNG, WEBP | Maks: {MAX_IMAGES} foto
                </p>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                />
            </div>
            {errors?.images && <p className="text-red-500 text-xs mt-1">{errors.images[0]}</p>}

            {existingImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
                    {existingImages.map((img, i) => (
                        <div key={img.id ?? i} className="relative rounded-lg overflow-hidden border border-amber-100 bg-white">
                            <img
                                src={img.preview}
                                alt={img.label}
                                className="w-full h-24 object-cover"
                            />
                            <div className="px-2 py-1 text-[10px] font-semibold text-gray-600 bg-amber-50 border-t border-amber-100">
                                Tersimpan
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Thumbnail Preview */}
            {images.length > 0 && (
                <div className="grid grid-cols-5 gap-3 mt-4">
                    {images.map((img, i) => (
                        <div key={i} className="relative group">
                            <img
                                src={img.preview}
                                alt={img.label || `Preview ${i + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(i)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                            >
                                ✕
                            </button>
                            <span className="block text-xs text-center text-gray-500 mt-1">Foto {i + 1}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DragDropUpload;
