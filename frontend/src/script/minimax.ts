/// <reference lib="webworker" />
import { Board } from "@src/types";

self.onmessage = async function (e: MessageEvent<{ board: Board }>) {
  const { board } = e.data;

  const instance = new Board({...board});

  // Simulação da IA (coloque aqui o minimax ou heurística)
  const lastTree = instance.getLastTree();
  let bestMove = null;
  if(lastTree)
    bestMove = await Board.minMax(instance, lastTree, 2);

  (self as DedicatedWorkerGlobalScope).postMessage(bestMove);
};