import { createCanvas, loadImage } from "canvas";
import path from "path";

const ASSETS_PATH = path.resolve(__dirname, "assets");

export class CanvasService {
  async generateDailyImage(params: {
    dayNumber: number;
    passages: string[];
  }): Promise<Buffer> {
    const WIDTH = 1080;
    const HEIGHT = 1080;
    const COLOR = "#5B320E";

    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");

    // Background
    const bg = await loadImage(path.join(ASSETS_PATH, "bg.png"));
    ctx.drawImage(bg, 0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = COLOR;

    /**
     * =====================
     * TÍTULO
     * =====================
     */
    ctx.textAlign = "center";
    ctx.font = 'bold 145px "Cinzel"';
    ctx.fillText("PLANO DE", WIDTH / 2, 200);
    ctx.fillText("LEITURA", WIDTH / 2, 320);

    ctx.font = '50px "Cinzel"';
    ctx.fillText(`— DIA ${params.dayNumber} — ${new Date().toLocaleDateString("pt-BR")} —`, WIDTH / 2, 380);

    /**
     * =====================
     * LISTA DE PASSAGENS
     * =====================
     */
    ctx.textAlign = "left";
    ctx.font = 'bold 65px "Cinzel"';

    const listStartX = 105; // texto
    const bulletX = 60; // bullet
    const lineHeight = 70;
    let y = 490;

    for (const passage of params.passages) {
      ctx.fillText("•", bulletX, y);
      ctx.fillText(passage.toUpperCase(), listStartX, y);
      y += lineHeight;
    }

    return canvas.toBuffer("image/png");
  }
}
