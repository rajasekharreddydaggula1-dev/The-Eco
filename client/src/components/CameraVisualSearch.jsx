import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { X, Camera, RefreshCw, Eye, Sparkles, Upload } from 'lucide-react';

export default function CameraVisualSearch({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { stores } = useSelector(state => state.stores);

  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Initialize Camera Stream
  useEffect(() => {
    if (!isOpen) return;

    const startCamera = async () => {
      try {
        setCameraError('');
        setCapturedImage(null);
        setMatchResult(null);
        setIsAnalyzing(false);

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error(err);
        setCameraError('Unable to access camera. Please make sure you have granted camera permissions or use the file upload option.');
      }
    };

    startCamera();

    // Cleanup: Stop all tracks on close
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Match canvas dimensions to video feed
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(dataUrl);

    // Stop camera stream
    stopCamera();

    // Trigger analysis
    analyzeImage();
  };

  // Simulated AI Image Analysis matching one of the products
  const analyzeImage = () => {
    setIsAnalyzing(true);
    setMatchResult(null);

    // Mock products we can match
    const mockMatchableProducts = [
      {
        name: 'Air Max Runner 90',
        id: '6671423902eed4a5ad8108aa', // fallback or lookup
        storeSlug: 'nike',
        price: 9999,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150',
        storeName: 'Nike Store',
        matchPercent: 98
      },
      {
        name: 'Terracotta Water Jug',
        id: '6671423902eed4a5ad8108bb',
        storeSlug: 'clay-earth',
        price: 650,
        image: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=150',
        storeName: 'Clay & Earth',
        matchPercent: 94
      },
      {
        name: 'Eco Yoga Mat',
        id: '6671423902eed4a5ad8108cc',
        storeSlug: 'khadi-naturals',
        price: 1299,
        image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=150',
        storeName: 'Khadi Naturals',
        matchPercent: 96
      },
      {
        name: 'Organic Tulsi Green Tea',
        id: '6671423902eed4a5ad8108dd',
        storeSlug: 'organic-india',
        price: 250,
        image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=150',
        storeName: 'Organic India',
        matchPercent: 92
      },
      {
        name: 'Solar Power Bank',
        id: '6671423902eed4a5ad8108ee',
        storeSlug: 'green-tech',
        price: 2499,
        image: 'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=150',
        storeName: 'Green Tech',
        matchPercent: 95
      }
    ];

    setTimeout(() => {
      // Pick a random match
      const randIdx = Math.floor(Math.random() * mockMatchableProducts.length);
      const matched = mockMatchableProducts[randIdx];
      setMatchResult(matched);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result);
      stopCamera();
      analyzeImage();
    };
    reader.readAsDataURL(file);
  };

  const resetSearch = async () => {
    setCapturedImage(null);
    setMatchResult(null);
    setIsAnalyzing(false);
    
    // Restart camera
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewProduct = () => {
    if (!matchResult) return;
    // Note: In visual search we matched name, let's navigate to the store, and filter/search for the product name
    navigate(`/store/${matchResult.storeSlug}?search=${encodeURIComponent(matchResult.name)}`);
    onClose();
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm transform overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl backdrop-blur-md transition-all animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-4">
          <div className="flex items-center gap-2 text-eco-400">
            <Camera className="h-4 w-4" />
            <h3 className="text-sm font-bold text-white">Visual Camera Search</h3>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Viewport */}
        <div className="mt-6 flex flex-col items-center">
          <div className="relative h-64 w-full overflow-hidden rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
            {/* Live Camera Feed */}
            {!capturedImage && !cameraError && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
                {/* Visual scanner bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-eco-400 to-transparent shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" style={{
                  animation: 'drift 2s infinite alternate ease-in-out',
                }} />
              </>
            )}

            {/* Captured Still Frame */}
            {capturedImage && (
              <img
                src={capturedImage}
                alt="Captured Snapshot"
                className="h-full w-full object-cover"
              />
            )}

            {/* Overlay Loader during AI Analysis */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="h-8 w-8 text-eco-400 animate-spin" />
                <span className="text-xs font-semibold text-slate-300">Classifying image...</span>
              </div>
            )}

            {/* Error message */}
            {cameraError && !capturedImage && (
              <div className="p-4 text-center space-y-4">
                <span className="text-2xl block">📷</span>
                <p className="text-[11px] text-slate-400 leading-normal">{cameraError}</p>
                <label className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 px-4 py-2 text-xs font-semibold text-white cursor-pointer transition-all active:scale-95">
                  <Upload className="h-3.5 w-3.5" />
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Hidden Canvas for Drawing Screenshot */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Bottom Action bar */}
          <div className="mt-6 w-full">
            {/* 1. Camera Live View Controls */}
            {!capturedImage && !cameraError && (
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleCapture}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-eco-600 hover:bg-eco-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-eco-600/20 transition-all active:scale-95"
                >
                  <Camera className="h-4 w-4" />
                  Capture & Search
                </button>
                <label className="flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 p-3 text-slate-400 hover:text-white transition-all cursor-pointer">
                  <Upload className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* 2. Matched Result display */}
            {matchResult && (
              <div className="space-y-4 border-t border-slate-900 pt-4 animate-slide-up">
                <div className="flex items-center gap-1 text-[10px] font-bold text-eco-400 uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" /> Visual Match Found ({matchResult.matchPercent}%)
                </div>
                
                <div className="flex gap-3 bg-slate-900/40 border border-slate-900 rounded-xl p-3">
                  <img
                    src={matchResult.image}
                    alt={matchResult.name}
                    className="h-12 w-12 rounded-lg object-cover border border-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{matchResult.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{matchResult.storeName}</p>
                    <p className="text-xs font-semibold text-eco-300 mt-1">₹{matchResult.price.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={resetSearch}
                    className="flex-1 rounded-lg bg-slate-900 border border-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:text-white transition-all"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleViewProduct}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-brand-600 hover:bg-brand-500 py-2.5 text-xs font-bold text-white transition-all active:scale-95 shadow-md shadow-brand-600/10"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Product
                  </button>
                </div>
              </div>
            )}

            {/* 3. Back to live camera after static snapshot capture */}
            {capturedImage && !matchResult && !isAnalyzing && (
              <button
                onClick={resetSearch}
                className="w-full rounded-lg bg-slate-900 border border-slate-800 py-2.5 text-xs font-semibold text-white transition-all"
              >
                Reset Camera
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
