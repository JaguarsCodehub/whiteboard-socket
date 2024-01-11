import { useEffect, useState } from 'react';

export const useDraw = (
  options: CtxOptions,
  ctx?: CanvasRenderingContext2D
) => {
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    if (ctx) {
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = options.lineWidth;
      ctx.strokeStyle = options.lineColor;
    }
  });
};
