import { useRef, useEffect, useCallback } from 'react';

interface SignatureCanvasProps {
  onSave: (dataUrl: string) => void;
  onClear?: () => void;
  width?: number;
  height?: number;
  className?: string;
}

export default function SignatureCanvas({
  onSave,
  onClear,
  width = 300,
  height = 180,
  className = '',
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth || width;
    canvas.height = height;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.strokeStyle = '#1A4F9C';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctxRef.current = ctx;
  }, [height, width]);

  // Get position (works for both mouse and touch)
  const getPos = (e: MouseEvent | TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const src = 'touches' in e ? e.touches[0] : (e as MouseEvent);

    return {
      x: src.clientX - rect.left,
      y: src.clientY - rect.top,
    };
  };

  // Start drawing
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getPos(e.nativeEvent);
    isDrawingRef.current = true;
    lastPosRef.current = pos;
  };

  // Draw
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawingRef.current || !ctxRef.current) return;

    const pos = getPos(e.nativeEvent);
    const ctx = ctxRef.current;

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastPosRef.current = pos;
  };

  // Stop drawing
  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  // Save signature
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  // Clear canvas
  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    onClear?.();
  };

  // Initialize on mount and resize
  useEffect(() => {
    initCanvas();

    const handleResize = () => initCanvas();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvas]);

  return (
    <div className={`signature-container ${className}`}>
      <canvas
        ref={canvasRef}
        className="signature-canvas"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{ touchAction: 'none', border: '1px solid #e5e7eb', borderRadius: '8px' }}
      />

      <div className="signature-buttons" style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        <button type="button" className="btn-outline" onClick={handleClear}>
          🗑 Clear
        </button>
        <button type="button" className="btn-secondary" onClick={handleSave}>
          ✅ Save Signature
        </button>
      </div>
    </div>
  );
}