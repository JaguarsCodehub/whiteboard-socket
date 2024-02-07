import { CANVAS_SIZE } from '@/common/constants/canvasSize';
import { useViePortSize } from '@/common/hooks/useViewPortSize';
import { useMotionValue } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useKeyPressEvent } from 'react-use';
import { useDraw } from '../hooks/canvas.hooks';
import { socket } from '@/common/lib/socket';
import { drawFromSocket } from '../helpers/canvas.helpers';
import { motion } from 'framer-motion';
import MiniMap from './Minimap';

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smallCanvasRef = useRef<HTMLCanvasElement>(null);

  const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
  const [dragging, setDragging] = useState(false);
  const [, setMovedMiniMap] = useState(false);
  const { width, height } = useViePortSize();

  const ctxRef = useRef<CanvasRenderingContext2D>();

  useKeyPressEvent('Control', (e) => {
    if (e.ctrlKey && !dragging) {
      setDragging(true);
    }
  });

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const copyCanvasToSmall = () => {
    if (canvasRef.current) {
      smallCanvasRef.current
        ?.getContext('2d')
        ?.drawImage(
          canvasRef.current,
          0,
          0,
          CANVAS_SIZE.width,
          CANVAS_SIZE.height
        );
    }
  };

  const { handleDraw, handleStartDrawing, handleEndDrawing, drawing } = useDraw(
    ctx,
    dragging,
    -x.get(),
    -y.get(),
    copyCanvasToSmall
  );

  useEffect(() => {
    const newCtx = canvasRef.current?.getContext('2d');
    if (newCtx) setCtx(newCtx);

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey && dragging) {
        setDragging(false);
      }
    };

    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [dragging]);

  useEffect(() => {
    let movesToDrawLater: [number, number][] = [];
    let optionsToUseLater: CtxOptions = {
      lineColor: '',
      lineWidth: 0,
    };

    socket.on('socket_draw', (movesToDraw, socketoptions) => {
      if (ctx && drawing) {
        drawFromSocket(movesToDraw, socketoptions, ctx, copyCanvasToSmall);
      } else {
        movesToDrawLater = movesToDraw;
        optionsToUseLater = socketoptions;
      }
    });

    // return () => {
    //   socket.off('socket_draw');

    //   if (movesToDrawLater.length && ctx) {
    //     drawFromSocket(
    //       movesToDrawLater,
    //       optionsToUseLater,
    //       ctx,
    //       copyCanvasToSmall
    //     );
    //   }
    // };
  }, [drawing, ctx]);

  return (
    <div className='relative h-full w-full overflow-hidden'>
      <motion.canvas
        // SETTINGS
        ref={canvasRef}
        width={CANVAS_SIZE.width}
        height={CANVAS_SIZE.height}
        className={`absolute top-0 z-10 ${dragging && 'cursor-move'}`}
        style={{ x, y }}
        // DRAG
        drag={dragging}
        dragConstraints={{
          left: -(CANVAS_SIZE.width - width),
          right: 0,
          top: -(CANVAS_SIZE.height - height),
          bottom: 0,
        }}
        dragElastic={0}
        dragTransition={{ power: 0, timeConstant: 0 }}
        // HANDLERS
        onMouseDown={(e) => handleStartDrawing(e.clientX, e.clientY)}
        onMouseUp={handleEndDrawing}
        onMouseMove={(e) => {
          handleDraw(e.clientX, e.clientY);
        }}
        onTouchStart={(e) =>
          handleStartDrawing(
            e.changedTouches[0].clientX,
            e.changedTouches[0].clientY
          )
        }
        onTouchEnd={handleEndDrawing}
        onTouchMove={(e) =>
          handleDraw(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
        }
      />
      <MiniMap
        ref={smallCanvasRef}
        x={x}
        y={y}
        dragging={dragging}
        setMovedMiniMap={setMovedMiniMap}
      />
      ;{' '}
      <button
        className={`absolute bottom-14 right-5 z-10 rounded-xl md:bottom-5 ${
          dragging ? 'bg-green-500' : 'bg-zinc-300 text-black'
        } p-3 text-lg text-white`}
        onClick={() => setDragging((prev) => !prev)}
      ></button>
    </div>
  );
};

export default Canvas;
