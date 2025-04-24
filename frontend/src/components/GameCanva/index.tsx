import { useEffect, useRef } from "react"
import { Board } from "../../types"

interface CanvaProps {
  board: Board
}

export default function Canva({ board }: CanvaProps) {
  const canvaRef = useRef(null);
  const boardRef = useRef(board);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const initCanvas = async () => {
      if(!canvaRef.current) return;
      boardRef.current = boardRef.current.addContext(canvaRef.current);

      await Board.preloadImages();
      
      // Animation loop function
      const animate = () => {
        boardRef.current.render();
        animationFrameRef.current = window.requestAnimationFrame(animate);
      };
  
      // Start the animation loop
      animate();
    };

    initCanvas();
    // Cleanup function to cancel animation frame when component unmounts
    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [board]);

  useEffect(() => {
    if(!canvaRef.current) return;
    const canva = document.getElementById('canva');
    canva?.addEventListener("mousedown", (e) => {
      const rect = canva.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      boardRef.current.canvaClick(x, y);
    });
    canva?.addEventListener("mouseup", (e) => {
      const rect = canva.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      boardRef.current.canvaDrop(x, y);
    });

    canva?.addEventListener("mousemove", e => {
      const rect = canva.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      boardRef.current.canvaMove(x, y);
    });
  }, [canvaRef.current]);

  useEffect(() => {
    return () => {
      boardRef.current.stopTimer();
    };
  }, []);

  //get view with and height
  const viewWidth = 1024;
  const viewHeight = 800;

  return (
    <canvas id="canva" ref={canvaRef} width={viewWidth} height={viewHeight} style={{
      margin: "0 auto",
      display: "block",
    }}/>
  );
}  