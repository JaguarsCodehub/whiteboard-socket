'use client';
import Image from 'next/image';
import { Inter } from 'next/font/google';
import { useEffect, useRef, useState } from 'react';
import { useDraw } from '@/common/hooks/drawing';
import { socket } from '@/common/lib/socket';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D>();

  const [drawing, setDrawing] = useState(false);

  const [size, setSize] = useState({ width: 0, height: 0 });
  const [options, setOptions] = useState<CtxOptions>({
    lineColor: '#00',
    lineWidth: 5,
  });

  const { handleDraw, handleStartDrawing, handleEndDrawing } = useDraw(
    options,
    ctxRef.current
  );

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctxRef.current = ctx;
    }
  }, [options.lineColor, options.lineWidth]);

  const drawFromSocket = (
    socketMoves: [number, number][],
    socketOptions: CtxOptions
  ) => {
    const tempCtx = ctxRef.current;

    if (tempCtx) {
      tempCtx.lineWidth = socketOptions.lineWidth;
      tempCtx.strokeStyle = socketOptions.lineColor;

      tempCtx.beginPath();
      socketMoves.forEach(([x, y]) => {
        tempCtx.lineTo(x, y);
        tempCtx.stroke();
      });

      tempCtx.closePath();
    }
  };

  useEffect(() => {
    let movesToDrawLater: [number, number][] = [];
    let optionsToUseLater: CtxOptions = {
      lineColor: '',
      lineWidth: 0,
    };

    socket.on('socket_draw', (movesToDraw, socketoptions) => {
      if (ctxRef.current && !drawing) {
        drawFromSocket(movesToDraw, socketoptions);
      } else {
        movesToDrawLater = movesToDraw;
        optionsToUseLater = socketoptions;
      }
    });

    return () => {
      socket.off('socket_draw');

      if (movesToDrawLater.length) {
        drawFromSocket(movesToDrawLater, optionsToUseLater);
      }
    };
  }, [drawing]);

  return (
    <div className='flex h-full w-full items-center justify-center'>
      <button
        onClick={() => setOptions({ lineColor: 'blue', lineWidth: 5 })}
        className='absolute bg-black'
      >
        Blue
      </button>
      <canvas
        className='h-full w-full'
        ref={canvasRef}
        onMouseDown={(e) => handleStartDrawing(e.clientX, e.clientY)}
        onMouseUp={handleEndDrawing}
        onMouseMove={(e) => handleDraw(e.clientX, e.clientY)}
        onTouchStart={(e) => {
          handleStartDrawing(
            e.changedTouches[0].clientX,
            e.changedTouches[0].clientY
          );
        }}
        onTouchEnd={handleEndDrawing}
        onTouchMove={(e) => {
          e.changedTouches[0].clientX, e.changedTouches[0].clientY;
        }}
        width={size.width}
        height={size.height}
      />
    </div>
  );
}
