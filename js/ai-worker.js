// ai-worker.js - Background Web Worker for Bot computations
import { getAIMove } from "./ai.js";

self.onmessage = function (e) {
  const { board, botColor, difficulty, requestId } = e.data;
  try {
    const bestMove = getAIMove(board, botColor, difficulty);
    self.postMessage({ requestId, bestMove, error: null });
  } catch (err) {
    self.postMessage({ requestId, bestMove: null, error: err.message });
  }
};
