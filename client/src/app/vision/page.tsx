'use client'
import React, { useRef, useEffect, useState } from 'react';

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [processedImg, setProcessedImg] = useState<string | null>(null);
  const [status, setStatus] = useState('OFFLINE');

  useEffect(() => {
    const socket = new WebSocket('ws://127.0.0.1:8801/ws');
    socketRef.current = socket;

    socket.onopen = () => setStatus('CONNECTED');
    socket.onclose = () => setStatus('OFFLINE');
    socket.onmessage = (event) => {
      setProcessedImg(event.data);
    };

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 } 
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera error:", err);
        setStatus('ERROR');
      }
    }
    startCamera();

    let animationId: number;
    let lastSentTime = 0;

    const sendFrame = (time: number) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ws = socketRef.current;

      if (time - lastSentTime > 60) {
        if (ws?.readyState === WebSocket.OPEN && video?.readyState === 4 && canvas) {
          const context = canvas.getContext('2d');
          if (context) {
            canvas.width = 640; 
            canvas.height = 480;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = canvas.toDataURL('image/jpeg', 0.4);
            ws.send(imageData);
            lastSentTime = time;
          }
        }
      }
      animationId = requestAnimationFrame(sendFrame);
    };

    animationId = requestAnimationFrame(sendFrame);

    return () => {
      cancelAnimationFrame(animationId);
      if (socket.readyState === WebSocket.OPEN) socket.close();
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0a0a0c] flex items-center justify-center overflow-hidden font-mono text-cyan-400">
      
      {/* Achtergrond Decoratie */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#1a1a2e 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

      {/* Hoofd Container */}
      <div className="relative w-[90vw] h-[80vh] border-2 border-cyan-900/50 rounded-xl bg-black/40 backdrop-blur-md shadow-[0_0_50px_rgba(0,255,255,0.1)] overflow-hidden">
        
        {/* UI Overlay - Bovenkant */}
        <div className="absolute top-0 w-full p-4 flex justify-between items-start z-10 bg-gradient-to-b from-black/80 to-transparent">
          <div>
            <h1 className="text-xl font-bold tracking-widest uppercase italic">NeuralSync OS v1.0</h1>
            <p className="text-xs text-cyan-700">Hand-Tracking Audio Interface</p>
          </div>
          <div className="text-right">
            <div className={`text-sm font-bold ${status === 'CONNECTED' ? 'text-green-500' : 'text-red-500'}`}>
              ● {status}
            </div>
            <p className="text-[10px] text-cyan-800 uppercase">Input: Camera_01</p>
          </div>
        </div>

        {/* De Video Stream */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          {processedImg ? (
            <div className="relative group">
              {/* De afbeelding zelf */}
              <img 
                src={processedImg} 
                alt="AI Stream" 
                className="rounded-lg border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                style={{ transform: 'scaleX(-1)' }} 
              />
              {/* Scanlijn effect over de video */}
              <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-sm tracking-[0.2em] uppercase">Initialising Neural Link...</div>
            </div>
          )}
        </div>

        {/* UI Overlay - Onderkant */}
        <div className="absolute bottom-0 w-full p-4 flex justify-between items-end z-10 bg-gradient-to-t from-black/80 to-transparent">
          <div className="text-[10px] space-y-1 text-cyan-800">
            <p>[SYSTEM_BOOT_SUCCESS]</p>
            <p>[ENCRYPTED_WS_ACTIVE]</p>
            <p>[MEDIAPIPE_HANDS_LOADED]</p>
          </div>
          <div className="text-xs italic text-cyan-600 animate-pulse">
            Waiting for gesture input...
          </div>
        </div>

      </div>

      {/* Kleine Preview rechtsonder (Picture in Picture) */}
      <div className="absolute bottom-8 right-8 w-40 aspect-video rounded-lg border-2 border-cyan-500/20 shadow-2xl overflow-hidden group">
        <div className="absolute inset-0 bg-cyan-500/10 z-10 pointer-events-none group-hover:bg-transparent transition-colors"></div>
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale brightness-125" style={{ transform: 'scaleX(-1)' }} />
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}