import sharp from 'sharp';
import path from 'path';
import { createCanvas, registerFont } from 'canvas';

const COLORS = {
  ON: [
    [249, 187, 130], // 温暖的橙桃色
    [235, 161, 112], // 柔和的赭土色
    [252, 205, 132], // 浅金色
  ],
  OFF: [
    [156, 165, 148], // 灰绿色
    [172, 180, 165], // 柔和的鼠尾草色
    [187, 185, 100], // 橄榄色
    [215, 218, 170], // 浅卡其色
    [229, 213, 125], // 浅芥末色
    [209, 214, 175], // 浅橄榄色
  ],
};

/**
 * 圆形接口
 */
export interface Circle {
  /**
   * 圆心x坐标
   */
  x: number;
  /**
   * 圆心y坐标
   */
  y: number;
  /**
   * 圆半径
   */
  radius: number;
  /**
   * 圆的颜色
   */
  color: number[];
}

/**
 * 石原氏色盲检测图生成器 选项接口
 */
export interface IshiharaOptions {
  /**
   * 文本内容
   */
  text?: string;
  /**
   * 字体大小
   */
  fontSize?: number;
  /**
   * 字体路径
   */
  fontPath?: string;
}

/**
 * 石原氏色盲检测图生成器
 */
export class IshiharaGenerator {
  /**
   * 生成器的宽度
   */
  private width: number;
  /**
   * 生成器的高度
   */
  private height: number;
  /**
   * 最小圆直径
   */
  private minDiameter: number;
  /**
   * 最大圆直径
   */
  private maxDiameter: number;
  /**
   * 图像buffer
   */
  private imageBuffer: Buffer;
  /**
   * 圆数组
   */
  private circles: Circle[] = [];
  /**
   * 文本mask
   */
  private textMask: Buffer;
  /**
   * 选项
   */
  private options: IshiharaOptions;

  /**
   * 构造函数
   * @param width 生成器的宽度
   * @param height 生成器的高度
   * @param options 选项
   */
  constructor(width: number, height: number, options: IshiharaOptions = {}) {
    this.width = width;
    this.height = height;
    this.minDiameter = (width + height) / 200;
    this.maxDiameter = (width + height) / 75;
    this.options = {
      text: '74',
      fontSize: Math.min(width, height) / 4,
      ...options,
    };
    this.imageBuffer = Buffer.alloc(width * height * 3, 255);
    this.textMask = Buffer.alloc(width * height, 0);
  }

  /**
   * 生成文字mask
   */
  private async createTextMask(): Promise<void> {
    if (this.options.fontPath) {
      try {
        registerFont(this.options.fontPath, { family: 'CustomFont' });
      } catch (error) {
        console.warn('Failed to register custom font, falling back to default');
      }
    }
    const canvas = createCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.font = `${this.options.fontSize}px ${this.options.fontPath ? 'CustomFont' : 'Arial'}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.fillText(this.options.text!, this.width / 2, this.height / 2);
    const textBuffer = canvas.toBuffer('raw');
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const pixelIndex = (y * this.width + x) * 4;
        const maskIndex = y * this.width + x;
        if (textBuffer[pixelIndex + 3] > 0) {
          this.textMask[maskIndex] = 1;
        }
      }
    }
  }

  /**
   * 生成圆
   */
  private generateCircle(): Circle {
    const radius = Math.random() * (this.maxDiameter - this.minDiameter) + this.minDiameter / 2;
    const angle = Math.random() * Math.PI * 2;
    const distanceFromCenter = Math.random() * (this.width * 0.48 - radius);

    const x = this.width * 0.5 + Math.cos(angle) * distanceFromCenter;
    const y = this.height * 0.5 + Math.sin(angle) * distanceFromCenter;

    const pixelX = Math.floor(x);
    const pixelY = Math.floor(y);
    const inTextMask = pixelX >= 0 && pixelX < this.width && pixelY >= 0 && pixelY < this.height && this.textMask[pixelY * this.width + pixelX] === 1;

    return {
      x,
      y,
      radius,
      color: this.determineCircleColorForMask(x, y, inTextMask),
    };
  }

  /**
   * 生成圆的颜色
   * @param x 圆心x坐标
   * @param y 圆心y坐标
   * @param inTextMask 是否在mask内
   */
  private determineCircleColorForMask(x: number, y: number, inTextMask: boolean): number[] {
    if (inTextMask) {
      return COLORS.ON[Math.floor(Math.random() * COLORS.ON.length)];
    }
    return COLORS.OFF[Math.floor(Math.random() * COLORS.OFF.length)];
  }

  /**
   * 生成圆
   * @param totalCircles 总圆数
   */
  async generate(totalCircles: number = 2000): Promise<void> {
    // 首先生成文字mask
    await this.createTextMask();
    // 随机生成初始圆
    const initialCircle = this.generateCircle();
    this.circles.push(initialCircle);
    this.drawCircle(initialCircle);

    for (let i = 0; i < totalCircles; i++) {
      let newCircle: Circle;
      let attempts = 0;

      do {
        newCircle = this.generateCircle();
        attempts++;
      } while (this.doesCircleOverlap(newCircle) && attempts < 100);

      if (attempts < 100) {
        this.circles.push(newCircle);
        this.drawCircle(newCircle);
      }
    }
  }

  /**
   * 判断圆是否重叠
   * @param newCircle 新圆
   */
  private doesCircleOverlap(newCircle: Circle): boolean {
    return this.circles.some((existingCircle) => {
      const dx = existingCircle.x - newCircle.x;
      const dy = existingCircle.y - newCircle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < existingCircle.radius + newCircle.radius;
    });
  }

  /**
   * 画圆
   * @param circle 圆
   */
  private drawCircle(circle: Circle): void {
    const { x, y, radius, color } = circle;
    const centerX = Math.floor(x);
    const centerY = Math.floor(y);
    const intRadius = Math.ceil(radius);

    for (let dy = -intRadius; dy <= intRadius; dy++) {
      for (let dx = -intRadius; dx <= intRadius; dx++) {
        if (dx * dx + dy * dy <= radius * radius) {
          const pixelX = centerX + dx;
          const pixelY = centerY + dy;

          if (pixelX >= 0 && pixelX < this.width && pixelY >= 0 && pixelY < this.height) {
            const pixelIndex = (pixelY * this.width + pixelX) * 3;
            this.imageBuffer[pixelIndex] = color[0];
            this.imageBuffer[pixelIndex + 1] = color[1];
            this.imageBuffer[pixelIndex + 2] = color[2];
          }
        }
      }
    }
  }

  /**
   * 保存图片
   * @param outputPath 保存的路径
   */
  async save(outputPath: string): Promise<void> {
    await sharp(this.imageBuffer, {
      raw: {
        width: this.width,
        height: this.height,
        channels: 3,
      },
    }).toFile(outputPath);
  }
}