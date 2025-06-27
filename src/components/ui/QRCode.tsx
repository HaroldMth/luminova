import React, { useEffect, useRef } from 'react';
import QRCodeLib from 'qrcode';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCode: React.FC<QRCodeProps> = ({ 
  value, 
  size = 200, 
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCodeLib.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#7C3AED',
          light: '#FFFFFF'
        }
      });
    }
  }, [value, size]);

  return (
    <div className={`inline-block ${className}`}>
      <canvas ref={canvasRef} className="rounded-lg shadow-md" />
    </div>
  );
};