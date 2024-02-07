import { Dispatch, SetStateAction, forwardRef, useEffect, useRef } from 'react';
import { MotionValue, useMotionValue } from 'framer-motion';
import { useViePortSize } from '@/common/hooks/useViewPortSize';
import { CANVAS_SIZE } from '@/common/constants/canvasSize';
import { motion } from 'framer-motion';

const MiniMap = forwardRef<
  HTMLCanvasElement,
  {
    x: MotionValue<number>;
    y: MotionValue<number>;
    dragging: boolean;
    setMovedMiniMap: Dispatch<SetStateAction<boolean>>;
  }
>(({ x, y, dragging, setMovedMiniMap }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { height, width } = useViePortSize();
  const minX = useMotionValue(0);
  const minY = useMotionValue(0);

  useEffect(() => {
    minX.onChange((newX) => {
      if (!dragging) x.set(-newX * 10);
    });
    minY.onChange((newY) => {
      if (!dragging) y.set(-newY * 10);
    });

    return () => {
      minX.clearListeners();
      minY.clearListeners();
    };
  }, [dragging, minX, minY, x, y]);

  return (
    <div
      ref={containerRef}
      style={{ width: CANVAS_SIZE.width / 10, height: CANVAS_SIZE.height / 10 }}
      className='absoulte right-10 top-10 z-50 bg-zinc-400'
    >
      <canvas
        ref={ref}
        width={CANVAS_SIZE.width}
        height={CANVAS_SIZE.height}
        className='h-full w-full'
      />
      <motion.div
        drag
        dragConstraints={containerRef}
        dragElastic={0}
        dragTransition={{ power: 0, timeConstant: 0 }}
        onDragEnd={() => setMovedMiniMap((prev: boolean) => !prev)}
        className='absolute top-0 left-0 cursor-grab border-2 border-red-500'
        style={{
          width: width / 10,
          height: height / 10,
          x: minX,
          y: minY,
        }}
        animate={{ x: -x.get() / 10, y: -y.get() / 10 }}
        transition={{ duration: 0.1 }}
      ></motion.div>
    </div>
  );
});

MiniMap.displayName = 'MiniMap';

export default MiniMap;
