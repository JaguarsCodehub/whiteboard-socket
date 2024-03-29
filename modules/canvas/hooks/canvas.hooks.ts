import { socket } from '@/common/lib/socket';
import { useEffect, useState } from 'react';
import { useOptions } from '@/common/recoil/options';

let moves: [number, number][] = [];

export const useDraw = (
  ctx: CanvasRenderingContext2D | undefined,
  blocked: boolean,
  movedX: number,
  movedY: number,
  handleEnd: () => void
) => {
  const options = useOptions();
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    if (ctx) {
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = options.lineWidth;
      ctx.strokeStyle = options.lineColor;
    }
  });

  const handleStartDrawing = (x: number, y: number) => {
    if (!ctx || blocked) return;
    console.log(' drawing now ok');
    moves = [[x + movedX, y + movedY]];
    setDrawing(true);

    ctx.beginPath();
    ctx.lineTo(x + movedX, y + movedY);
    ctx.stroke();
  };

  const handleEndDrawing = () => {
    if (!ctx) return;

    socket.emit('draw', moves, options);
    console.log('emitting drawing event');

    setDrawing(false);
    ctx.closePath();
    handleEnd();
  };

  const handleDraw = (x: number, y: number) => {
    if (ctx && drawing && !blocked) {
      moves.push([x + movedX, y + movedY]);
      ctx.lineTo(x + movedX, y + movedY);
      ctx.stroke();
    }
  };

  return {
    handleEndDrawing,
    handleDraw,
    handleStartDrawing,
    drawing,
  };
};
