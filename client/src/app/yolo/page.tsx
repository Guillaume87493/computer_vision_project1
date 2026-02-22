"use client";
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Activity, Trash2, Upload } from 'lucide-react';

export default function VideoClient() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [processedImg, setProcessedImg] = useState<string | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  // De resolutie die we naar de server sturen
  const SEND_WIDTH = 640;
  const SEND_HEIGHT = 480;

  useEffect(() => {
    const socket = new WebSocket('ws://127.0.0.1:8800/ws');
    socketRef.current = socket;
    socket.onmessage = (event) => setProcessedImg(event.data);

    let animationId: number;
    let lastSentTime = 0;

    const sendFrame = (time: number) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ws = socketRef.current;

      if (video && !video.paused && !video.ended && video.readyState >= 2) {
        if (time - lastSentTime > 100) { // 10 FPS
          if (ws?.readyState === WebSocket.OPEN && canvas) {
            const context = canvas.getContext('2d');
            if (context) {
              canvas.width = SEND_WIDTH;
              canvas.height = SEND_HEIGHT;
              context.drawImage(video, 0, 0, SEND_WIDTH, SEND_HEIGHT);
              const imageData = canvas.toDataURL('image/jpeg', 0.4);
              ws.send(imageData);
              lastSentTime = time;
            }
          }
        }
      }
      animationId = requestAnimationFrame(sendFrame);
    };

    animationId = requestAnimationFrame(sendFrame);
    return () => {
      cancelAnimationFrame(animationId);
      if (socket.readyState === WebSocket.OPEN) socket.close();
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
      setVideoSrc(URL.createObjectURL(file));
      setProcessedImg(null);
    }
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "reset" }));
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "reset" }));
    }
  };

  const handleVideoClick = useCallback((event: React.MouseEvent) => {
    // Voorkom clicks op de reset button of andere UI elementen
    const target = event.target as HTMLElement;
    if (target.closest('button')) return;

    const container = containerRef.current;
    if (!container || !socketRef.current) return;

    const rect = container.getBoundingClientRect();
    
    // Bereken klik relatief t.o.v. de 640x480 resolutie
    const scaleX = SEND_WIDTH / rect.width;
    const scaleY = SEND_HEIGHT / rect.height;

    const x = Math.round((event.clientX - rect.left) * scaleX);
    const y = Math.round((event.clientY - rect.top) * scaleY);

    // Strenge validatie: x en y moeten binnen het beeld vallen en groter zijn dan 10
    // Dit filtert de "0,0" ghost clicks bij het laden
    if (
      socketRef.current.readyState === WebSocket.OPEN && 
      x > 10 && y > 10 && 
      x < SEND_WIDTH && y < SEND_HEIGHT
    ) {
      console.log(`Punt verzonden: ${x}, ${y}`);
      socketRef.current.send(JSON.stringify({ type: "click", x, y }));
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-[#020617] flex items-center justify-center font-mono p-4">
      <div className="relative w-full h-full max-w-5xl max-h-[85vh] border border-cyan-500/30 bg-black/60 flex flex-col shadow-2xl overflow-hidden backdrop-blur-sm">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/30 bg-cyan-500/5 z-20">
          <div className="flex items-center gap-2 text-cyan-400 text-[11px] tracking-[0.2em]">
            <Activity size={16} className="animate-pulse" />
            SYSTEM_STATUS: ACTIVE
          </div>
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 text-[10px] transition-all uppercase tracking-tighter"
          >
            <Trash2 size={12} /> Wipe_Zones
          </button>
        </div>

        {/* Viewport Area */}
        <div 
          ref={containerRef} 
          onClick={handleVideoClick} 
          className="relative flex-1 bg-black flex items-center justify-center cursor-crosshair overflow-hidden group"
        >
          {/* De video stream */}
          {videoSrc && (
            <video 
              ref={videoRef} 
              src={videoSrc}
              className={`absolute inset-0 w-full h-full object-contain ${processedImg ? 'opacity-0' : 'opacity-100'}`}
              muted playsInline autoPlay loop
            />
          )}
          
          {/* Het verwerkte beeld van de server */}
          {processedImg && (
            <img 
              src={processedImg} 
              alt="AI Processor" 
              className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none" 
            />
          )}

          {!videoSrc && (
            <label className="flex flex-col items-center gap-4 p-12 border-2 border-dashed border-cyan-500/20 hover:border-cyan-500/40 transition-all cursor-pointer">
              <Upload className="text-cyan-500/50 group-hover:text-cyan-400" size={48} />
              <span className="text-cyan-500/70 text-xs tracking-widest">FEED_DATA_STREAM</span>
              <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
            </label>
          )}

          {/* HUD Frame Overlay */}
          <div className="absolute inset-0 pointer-events-none border-[1px] border-white/5 z-0"></div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}