// ai-worker.js - Web Worker for Checkers AI
import { getAIMove } from "./ai.js";

self.onmessage = function (e) {
  const { board, botColor, difficulty, ruleVariant, requestId } = e.data;
  try {
    const bestMove = getAIMove(board, botColor, difficulty, ruleVariant);
    self.postMessage({ requestId, bestMove, botColor, error: null });
  } catch (err) {
    self.postMessage({ requestId, bestMove: null, botColor, error: err.message });
  }
};
