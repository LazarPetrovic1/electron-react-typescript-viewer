import { useEffect, useRef, useState } from "react";
import { barWidth } from "../utils";

type AnimationProps = {
  analyser: AnalyserNode,
  x: number,
  dataArray: null | Uint8Array,
  bufferLength: number | null,
  animation: Function,
  barHeight: number,
}

function Animation(props: AnimationProps) {
  const { analyser, x, dataArray, bufferLength, animation, barHeight } = props;
  let xVal = x;
  const canvas = useRef<null | HTMLCanvasElement>(null);
  const [context, setContext] = useState<null | CanvasRenderingContext2D>(null);

  const draw = (frameCount: number) => {
    if (context) {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      context.fillStyle = "#000000";
      context.beginPath();
      context.arc(50, 100, 20 * Math.sin(frameCount * 0.05) ** 2, 0, 2 * Math.PI);
      context.fill();
    }
  };

  useEffect(() => {
    if (canvas.current) {
      const canvasItem = canvas.current;
      const ctx = canvasItem.getContext("2d");
      setContext(() => ctx);
    }
  }, [canvas]);

  useEffect(() => {
    let animationFrameId : number;

    // Check if null context has been replaced on component mount
    if (
      context &&
      typeof canvas.current?.width == 'number' &&
      typeof canvas.current?.height == 'number' &&
      dataArray !== null && typeof bufferLength === 'number'
    ) {
      //Our draw came here
      const animate = () => {
        xVal = 0;
        const [cw, ch] = [canvas.current?.width || window.innerWidth - 350, canvas.current?.height || window.innerHeight - 67]
        context.clearRect(0, 0, cw, ch);
        analyser.getByteFrequencyData(dataArray);
        animation(context, bufferLength, xVal, barWidth, barHeight, dataArray, cw, ch);
        animationFrameId = requestAnimationFrame(animate);
      }
      
      animate();
    }
    return () => { window.cancelAnimationFrame(animationFrameId); };
  }, [draw, context]);

  return (
    <>
      <img id="display-image" />
      <canvas ref={canvas} className="canvas" id="canvas"></canvas>
    </>
  )
}

export default Animation;