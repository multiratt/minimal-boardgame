// screenshot.js - Pure Client-side High-Resolution Match Card Generator
// Zero permissions required, 100% offline & mobile-compatible

function drawRoundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export function generateMatchStatsCanvas(data) {
  const scale = 2; // High-DPI 2x scale
  const w = 580;
  const h = 680;

  const canvas = document.createElement("canvas");
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  // 1. Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, "#0e0f12");
  bgGrad.addColorStop(1, "#16181d");
  ctx.fillStyle = bgGrad;
  drawRoundRect(ctx, 0, 0, w, h, 16);
  ctx.fill();

  // Outer border
  ctx.strokeStyle = "#2b2e36";
  ctx.lineWidth = 2;
  drawRoundRect(ctx, 1, 1, w - 2, h - 2, 16);
  ctx.stroke();

  // 2. Header
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.letterSpacing = "2px";
  ctx.fillText("MINIMAL BOARD GAMES", w / 2, 45);

  // Mode Pill Badge
  const modeText = data.modeName || "Board Game";
  ctx.font = "bold 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const badgeWidth = ctx.measureText(modeText).width + 24;
  const badgeX = (w - badgeWidth) / 2;
  const badgeY = 60;

  ctx.fillStyle = "#1b1d22";
  drawRoundRect(ctx, badgeX, badgeY, badgeWidth, 24, 12);
  ctx.fill();
  ctx.strokeStyle = "#383c47";
  ctx.lineWidth = 1;
  drawRoundRect(ctx, badgeX, badgeY, badgeWidth, 24, 12);
  ctx.stroke();

  ctx.fillStyle = "#e2e4e9";
  ctx.textAlign = "center";
  ctx.fillText(modeText, w / 2, badgeY + 16);

  // 3. Winner Hero Banner Card
  const winnerCardY = 100;
  const winnerCardH = 105;
  const cardMargin = 32;
  const cardW = w - cardMargin * 2;

  ctx.fillStyle = "#181a20";
  drawRoundRect(ctx, cardMargin, winnerCardY, cardW, winnerCardH, 12);
  ctx.fill();
  ctx.strokeStyle = "#323642";
  ctx.lineWidth = 1;
  drawRoundRect(ctx, cardMargin, winnerCardY, cardW, winnerCardH, 12);
  ctx.stroke();

  // Winner Title
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`🏆 ${data.winnerTitle || "จบเกม"}`, w / 2, winnerCardY + 42);

  // Winner Reason
  ctx.fillStyle = "#9ba0af";
  ctx.font = "14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(data.winnerReason || "", w / 2, winnerCardY + 68);

  // Players Line
  ctx.fillStyle = "#d0d4dc";
  ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const playersText = `⚪ ${data.whitePlayer || "Player 1"}   VS   ⚫ ${data.blackPlayer || "Player 2"}`;
  ctx.fillText(playersText, w / 2, winnerCardY + 92);

  // 4. Match Statistics Section
  const statsStartY = 225;
  ctx.fillStyle = "#8a909d";
  ctx.font = "bold 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(data.statsHeader || "📊 สรุปสถิติการแข่งขัน", cardMargin, statsStartY);

  // Stats Grid: 2 columns x 3 rows
  const gridGapX = 14;
  const gridGapY = 12;
  const colW = (cardW - gridGapX) / 2;
  const rowH = 68;
  const gridTopY = statsStartY + 14;

  const statItems = [
    { icon: "⏱️", label: data.labels.totalTime, val: data.values.totalTime },
    { icon: "⚡", label: data.labels.avgTime, val: data.values.avgTime },
    { icon: "🎯", label: data.labels.totalMoves, val: data.values.totalMoves },
    { icon: "💥", label: data.labels.captures, val: data.values.captures },
    { icon: "👑", label: data.labels.promotions, val: data.values.promotions },
    { icon: "🏆", label: data.labels.resultDetail, val: data.values.resultDetail }
  ];

  for (let i = 0; i < statItems.length; i++) {
    const item = statItems[i];
    const col = i % 2;
    const row = Math.floor(i / 2);
    const boxX = cardMargin + col * (colW + gridGapX);
    const boxY = gridTopY + row * (rowH + gridGapY);

    // Stat Box background
    ctx.fillStyle = "#141519";
    drawRoundRect(ctx, boxX, boxY, colW, rowH, 8);
    ctx.fill();
    ctx.strokeStyle = "#272a32";
    ctx.lineWidth = 1;
    drawRoundRect(ctx, boxX, boxY, colW, rowH, 8);
    ctx.stroke();

    // Icon
    ctx.font = "18px -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(item.icon, boxX + 12, boxY + 41);

    // Label
    ctx.fillStyle = "#868b97";
    ctx.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(item.label, boxX + 42, boxY + 28);

    // Value
    let displayVal = item.val || "—";
    const maxValW = colW - 48;
    ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Thai', 'Sukhumvit Set', Tahoma, sans-serif";
    if (ctx.measureText(displayVal).width > maxValW) {
      ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Thai', 'Sukhumvit Set', Tahoma, sans-serif";
    }
    while (ctx.measureText(displayVal).width > maxValW && displayVal.length > 3) {
      displayVal = displayVal.slice(0, -2) + "…";
    }
    ctx.fillText(displayVal, boxX + 42, boxY + 50);
  }

  // 5. Footer
  const footerY = h - 28;
  ctx.strokeStyle = "#262930";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cardMargin, footerY - 14);
  ctx.lineTo(w - cardMargin, footerY - 14);
  ctx.stroke();

  ctx.fillStyle = "#656a76";
  ctx.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Minimal Board Games", cardMargin, footerY);

  ctx.textAlign = "right";
  ctx.fillText("multiratt.github.io/minimal-boardgame", w - cardMargin, footerY);

  return canvas.toDataURL("image/png");
}

function dataURLtoBlob(dataUrl) {
  const parts = dataUrl.split(",");
  const mime = parts[0].match(/:(.*?);/)[1];
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export async function shareOrSaveMatchCard(dataUrl, filename = "minimal-boardgame-stats.png") {
  // Convert dataURL to Blob synchronously
  let blob = null;
  try {
    blob = dataURLtoBlob(dataUrl);
  } catch (e) {
    console.warn("dataURLtoBlob failed:", e);
  }

  // Check if Web Share API with files is supported
  if (blob && typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Minimal Board Games",
          text: "ผลการแข่งขัน Minimal Board Games",
          files: [file]
        });
        return { success: true, method: "share" };
      }
    } catch (err) {
      if (err.name === "AbortError") {
        return { success: true, method: "cancel" };
      }
      // If NotAllowedError or any rejection, smoothly fall back without throwing
      console.warn("navigator.share failed, fallback to preview/download:", err.message);
    }
  }

  // Fallback: Automatic Download via Anchor
  try {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (e) {
    console.warn("Anchor download failed:", e);
  }

  return { success: true, method: "download", dataUrl };
}
