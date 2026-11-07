import * as THREE from 'three';
import type { RobotExpression } from './types';

export class RobotFaceTexture {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public texture: THREE.CanvasTexture;
  private currentExpression: RobotExpression = 'happy';
  private isBlinking = false;
  private isTalking = false;
  private talkTimer: any = null;
  private talkFrame = 0;
  private bgColor = '#0047AB';
  private pixelColor = '#FFFFFF';

  constructor(bgColor = '#0047AB', pixelColor = '#FFFFFF') {
    this.bgColor = bgColor;
    this.pixelColor = pixelColor;
    this.canvas = document.createElement('canvas');
    this.canvas.width = 256;
    this.canvas.height = 160;

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context for robot face texture');
    }
    this.ctx = ctx;

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.generateMipmaps = false;

    this.render();
  }

  public setColors(bg: string, pixel: string) {
    if (this.bgColor !== bg || this.pixelColor !== pixel) {
      this.bgColor = bg;
      this.pixelColor = pixel;
      this.render();
    }
  }

  public setExpression(expression: RobotExpression) {
    if (this.currentExpression !== expression) {
      this.currentExpression = expression;
      this.render();
    }
  }

    public setTalking(talking: boolean) {
    if (this.isTalking !== talking) {
      this.isTalking = talking;
      if (talking) {
        if (this.talkTimer) clearInterval(this.talkTimer);
        this.talkTimer = setInterval(() => {
          this.talkFrame = (this.talkFrame + 1) % 4;
          this.render();
        }, 120);
      } else {
        if (this.talkTimer) {
          clearInterval(this.talkTimer);
          this.talkTimer = null;
        }
        this.talkFrame = 0;
        this.render();
      }
    }
  }

  public setBlink(blinking: boolean) {
    if (this.isBlinking !== blinking) {
      this.isBlinking = blinking;
      this.render();
    }
  }

  public render() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    // Visor screen base color
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, w, h);

    // Subtle dark scanline background border
    ctx.strokeStyle = '#051226';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, w - 6, h - 6);

    // Soft brutalist inner corner accents
    ctx.fillStyle = '#051226';
    ctx.fillRect(6, 6, 8, 8);
    ctx.fillRect(w - 14, 6, 8, 8);
    ctx.fillRect(6, h - 14, 8, 8);
    ctx.fillRect(w - 14, h - 14, 8, 8);

    ctx.fillStyle = this.pixelColor;
    ctx.strokeStyle = this.pixelColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const leftEyeX = 74;
    const rightEyeX = 182;
    const eyeY = 74;

    // Blinking override
    if (this.isBlinking) {
      ctx.lineWidth = 8;
      // Eyebrows
      ctx.beginPath();
      ctx.moveTo(56, 42);
      ctx.lineTo(92, 42);
      ctx.moveTo(164, 42);
      ctx.lineTo(200, 42);
      ctx.stroke();

      // Flat closed blink eyes
      ctx.beginPath();
      ctx.moveTo(50, eyeY);
      ctx.lineTo(98, eyeY);
      ctx.moveTo(158, eyeY);
      ctx.lineTo(206, eyeY);
      ctx.stroke();

      // Resting smile mouth
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(128, 110, 18, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();

      
    if (this.isTalking) {
      ctx.fillStyle = this.bgColor;
      ctx.fillRect(104, 95, 48, 32);
      ctx.strokeStyle = this.pixelColor;
      ctx.fillStyle = this.pixelColor;
      ctx.lineWidth = 6;
      if (this.talkFrame % 2 === 0) {
        ctx.beginPath();
        ctx.ellipse(128, 112, 14, 10, 0, 0, 2 * Math.PI);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(128, 110, 16, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
      }
    }
    this.texture.needsUpdate = true;
      return;
    }

    switch (this.currentExpression) {
      case 'enjoying': {
        // Vibing, cheerful raised curved eyebrows
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(leftEyeX, 44, 18, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(rightEyeX, 44, 18, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();

        // Vibing closed happy ^ ^ eyes
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.moveTo(52, 82);
        ctx.quadraticCurveTo(leftEyeX, 52, 96, 82);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(160, 82);
        ctx.quadraticCurveTo(rightEyeX, 52, 204, 82);
        ctx.stroke();

        // Cute pixel blush squares under eyes (#FF5A1F)
        ctx.fillStyle = '#FF5A1F';
        ctx.fillRect(46, 92, 16, 8);
        ctx.fillRect(194, 92, 16, 8);

        // Sweet content smile mouth
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(128, 104, 18, 0.12 * Math.PI, 0.88 * Math.PI);
        ctx.stroke();
        break;
      }

      case 'thinking': {
        // Inquisitive curved eyebrows (left higher, right flat)
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(leftEyeX, 40, 18, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(162, 44);
        ctx.lineTo(202, 44);
        ctx.stroke();

        // Eyes looking upward/sideways toward upper-right
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rightEyeX, eyeY, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#051226';
        ctx.beginPath();
        ctx.arc(leftEyeX + 7, eyeY - 6, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rightEyeX + 7, eyeY - 6, 8, 0, Math.PI * 2);
        ctx.fill();

        // Thought dots '...' in top corner
        ctx.fillStyle = '#FF5A1F';
        ctx.fillRect(206, 26, 6, 6);
        ctx.fillRect(216, 20, 7, 7);
        ctx.fillRect(228, 14, 9, 9);

        // Small thoughtful curved mouth
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(116, 112);
        ctx.quadraticCurveTo(128, 118, 142, 108);
        ctx.stroke();
        break;
      }

      case 'proud': {
        // High confident eyebrows
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(leftEyeX, 42, 18, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(rightEyeX, 42, 18, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();

        // Bright proud smiling eyes
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.moveTo(52, 78);
        ctx.quadraticCurveTo(leftEyeX, 50, 96, 78);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(160, 78);
        ctx.quadraticCurveTo(rightEyeX, 50, 204, 78);
        ctx.stroke();

        // Subtle blush
        ctx.fillStyle = '#FF5A1F';
        ctx.fillRect(48, 88, 12, 6);
        ctx.fillRect(196, 88, 12, 6);

        // Upward confident smile
        ctx.lineWidth = 7;
        ctx.strokeStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(128, 98, 22, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        break;
      }

      case 'shy': {
        // Gentle flat eyebrows
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(56, 46);
        ctx.lineTo(94, 46);
        ctx.moveTo(162, 46);
        ctx.lineTo(200, 46);
        ctx.stroke();

        // Eyes looking downward / sideways
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rightEyeX, eyeY, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#051226';
        ctx.beginPath();
        ctx.arc(leftEyeX - 6, eyeY + 5, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rightEyeX - 6, eyeY + 5, 8, 0, Math.PI * 2);
        ctx.fill();

        // Big cute pixel blush squares on cheeks
        ctx.fillStyle = '#FF5A1F';
        ctx.fillRect(42, 88, 20, 10);
        ctx.fillRect(194, 88, 20, 10);

        // Small shy smile mouth
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(128, 108, 14, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
        break;
      }

      case 'flirty': {
        // Wink face: left eye open and smiling, right eye a happy wink curve
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(leftEyeX, 42, 18, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(162, 42);
        ctx.lineTo(202, 38);
        ctx.stroke();

        // Left eye: open with star catchlight
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#051226';
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(leftEyeX + 3, eyeY - 3, 4, 0, Math.PI * 2);
        ctx.fill();

        // Right eye: playful wink curve
        ctx.lineWidth = 9;
        ctx.strokeStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(160, eyeY + 4);
        ctx.quadraticCurveTo(rightEyeX, eyeY - 14, 204, eyeY + 4);
        ctx.stroke();

        // Floating pixel heart in corner (#FF5A1F)
        ctx.fillStyle = '#FF5A1F';
        ctx.fillRect(206, 78, 6, 6);
        ctx.fillRect(214, 78, 6, 6);
        ctx.fillRect(203, 84, 20, 6);
        ctx.fillRect(206, 90, 14, 6);
        ctx.fillRect(209, 96, 8, 6);
        ctx.fillRect(212, 102, 2, 4);

        // Cheerful cheeky smile
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(124, 106, 18, 0.1 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
        break;
      }

      case 'happy': {
        // Cheerful curved eyebrows
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(leftEyeX, 46, 20, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(rightEyeX, 46, 20, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();

        // Big cheerful ^ ^ eyes
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(52, 84);
        ctx.quadraticCurveTo(leftEyeX, 48, 96, 84);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(160, 84);
        ctx.quadraticCurveTo(rightEyeX, 48, 204, 84);
        ctx.stroke();

        // Orange neo-brutal blush squares
        ctx.fillStyle = '#FF5A1F';
        ctx.fillRect(48, 90, 12, 6);
        ctx.fillRect(196, 90, 12, 6);

        // Cheerful smile mouth
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(128, 102, 22, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        break;
      }

      case 'grin': {
        // High raised eyebrows
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(54, 38);
        ctx.lineTo(94, 36);
        ctx.moveTo(162, 36);
        ctx.lineTo(202, 38);
        ctx.stroke();

        // Arched smiling eyes
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.moveTo(52, 80);
        ctx.quadraticCurveTo(leftEyeX, 50, 96, 80);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(160, 80);
        ctx.quadraticCurveTo(rightEyeX, 50, 204, 80);
        ctx.stroke();

        // Big wide toothy grin
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(102, 102, 52, 24, [4, 4, 12, 12]);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#051226';
        ctx.stroke();
        // Tooth dividers
        ctx.beginPath();
        ctx.moveTo(115, 102);
        ctx.lineTo(115, 124);
        ctx.moveTo(128, 102);
        ctx.lineTo(128, 126);
        ctx.moveTo(141, 102);
        ctx.lineTo(141, 124);
        ctx.stroke();
        break;
      }

      case 'laughing': {
        // Tilted happy eyebrows
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(54, 44);
        ctx.lineTo(92, 36);
        ctx.moveTo(164, 36);
        ctx.lineTo(202, 44);
        ctx.stroke();

        // > < laughing wedge eyes
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.moveTo(54, 58);
        ctx.lineTo(84, 74);
        ctx.lineTo(54, 90);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(202, 58);
        ctx.lineTo(172, 74);
        ctx.lineTo(202, 90);
        ctx.stroke();

        // Wide laughing open 'D' mouth
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(128, 108, 22, 0, Math.PI, false);
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#051226';
        ctx.stroke();
        // Cute tongue accent
        ctx.fillStyle = '#FF5A1F';
        ctx.beginPath();
        ctx.arc(128, 122, 11, 0.9 * Math.PI, 2.1 * Math.PI, true);
        ctx.fill();
        break;
      }

      case 'wink': {
        // Right eyebrow raised
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(54, 46);
        ctx.lineTo(92, 44);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(rightEyeX, 36, 18, 1.2 * Math.PI, 1.8 * Math.PI);
        ctx.stroke();

        // Left eye: wink line with flutter ticks
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.moveTo(50, eyeY + 2);
        ctx.quadraticCurveTo(74, eyeY + 12, 98, eyeY + 2);
        ctx.stroke();
        // Eyelash tick
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(96, eyeY + 2);
        ctx.lineTo(104, eyeY - 6);
        ctx.stroke();

        // Right eye: large round open eye with shine
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(rightEyeX, eyeY, 22, 0, Math.PI * 2);
        ctx.fill();
        // Dark pupil
        ctx.fillStyle = '#051226';
        ctx.beginPath();
        ctx.arc(rightEyeX + 3, eyeY, 11, 0, Math.PI * 2);
        ctx.fill();
        // Sparkling catchlight
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(rightEyeX - 1, eyeY - 4, 4, 0, Math.PI * 2);
        ctx.fill();

        // Playful smirk mouth
        ctx.lineWidth = 7;
        ctx.strokeStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(112, 112);
        ctx.quadraticCurveTo(134, 126, 150, 106);
        ctx.stroke();
        break;
      }

      case 'curious': {
        // Friendly raised inquisitive curved eyebrows (both friendly and cheerful)
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(leftEyeX, 36, 18, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(rightEyeX, 40, 18, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();

        // Sparkly bright open eyes with starry catchlights
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, 21, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rightEyeX, eyeY, 21, 0, Math.PI * 2);
        ctx.fill();

        // Dark pupils
        ctx.fillStyle = '#051226';
        ctx.beginPath();
        ctx.arc(leftEyeX + 2, eyeY - 1, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rightEyeX + 2, eyeY - 1, 10, 0, Math.PI * 2);
        ctx.fill();

        // Sparkle catchlights (cross / star highlights in pupils)
        ctx.fillStyle = '#FFFFFF';
        const drawSparkle = (cx: number, cy: number) => {
          ctx.beginPath();
          ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(cx - 5, cy - 1, 10, 2);
          ctx.fillRect(cx - 1, cy - 5, 2, 10);
        };
        drawSparkle(leftEyeX - 2, eyeY - 5);
        drawSparkle(rightEyeX - 2, eyeY - 5);

        // Cheerful orange blush squares
        ctx.fillStyle = '#FF5A1F';
        ctx.fillRect(48, 86, 12, 6);
        ctx.fillRect(196, 86, 12, 6);

        // Small open cheerful smile
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(128, 106, 16, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        break;
      }

      case 'excited': {
        // Eyebrows raised high
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(leftEyeX, 32, 20, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(rightEyeX, 32, 20, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();

        // Star eyes ★ ★ (5-point stars)
        const drawStar = (cx: number, cy: number, spikes: number, outerR: number, innerR: number) => {
          let rot = (Math.PI / 2) * 3;
          let x: number;
          let y: number;
          const step = Math.PI / spikes;

          ctx.beginPath();
          ctx.moveTo(cx, cy - outerR);
          for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerR;
            y = cy + Math.sin(rot) * outerR;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerR;
            y = cy + Math.sin(rot) * innerR;
            ctx.lineTo(x, y);
            rot += step;
          }
          ctx.lineTo(cx, cy - outerR);
          ctx.closePath();
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#051226';
          ctx.stroke();
        };

        drawStar(leftEyeX, eyeY, 5, 26, 12);
        drawStar(rightEyeX, eyeY, 5, 26, 12);

        // Wide excited open smile
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(128, 112, 20, 0, Math.PI, false);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#FF5A1F';
        ctx.beginPath();
        ctx.arc(128, 126, 10, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'mind-blown': {
        // Raised ultra-high eyebrows
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(leftEyeX, 26, 18, 1.1 * Math.PI, 1.9 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(rightEyeX, 26, 18, 1.1 * Math.PI, 1.9 * Math.PI);
        ctx.stroke();

        // Wide round eyes with tiny pinpoint pupils
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rightEyeX, eyeY, 26, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#051226';
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rightEyeX, eyeY, 6, 0, Math.PI * 2);
        ctx.fill();

        // Dropped-jaw open 'O' mouth
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(128, 118, 16, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#051226';
        ctx.beginPath();
        ctx.ellipse(128, 118, 10, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'smug': {
        // Sly confident brows
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(56, 44);
        ctx.lineTo(92, 36);
        ctx.moveTo(164, 38);
        ctx.lineTo(200, 44);
        ctx.stroke();

        // Half-lidded confident eyes glancing sideways
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY + 4, 18, 0, Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rightEyeX, eyeY + 4, 18, 0, Math.PI);
        ctx.fill();

        ctx.fillStyle = '#051226';
        ctx.beginPath();
        ctx.arc(leftEyeX + 6, eyeY + 8, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rightEyeX + 6, eyeY + 8, 8, 0, Math.PI * 2);
        ctx.fill();

        // Confident diagonal smirk
        ctx.lineWidth = 7;
        ctx.strokeStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(116, 116);
        ctx.quadraticCurveTo(134, 122, 148, 104);
        ctx.stroke();
        break;
      }

      case 'silly': {
        // Goofy uneven brows
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(leftEyeX, 36, 16, 1.2 * Math.PI, 1.8 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(164, 46);
        ctx.quadraticCurveTo(182, 36, 200, 48);
        ctx.stroke();

        // Derpy mismatched eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rightEyeX, eyeY, 22, 0, Math.PI * 2);
        ctx.fill();

        // Left pupil looking up-left, right pupil looking down-right
        ctx.fillStyle = '#051226';
        ctx.beginPath();
        ctx.arc(leftEyeX - 7, eyeY - 6, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rightEyeX + 7, eyeY + 7, 9, 0, Math.PI * 2);
        ctx.fill();

        // Open mouth with tongue sticking out
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(128, 106, 18, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        // Bright orange tongue
        ctx.fillStyle = '#FF5A1F';
        ctx.beginPath();
        ctx.arc(134, 120, 10, 0, Math.PI);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#051226';
        ctx.stroke();
        break;
      }

      case 'dizzy': {
        // Wavy brows
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(54, 40);
        ctx.quadraticCurveTo(74, 30, 94, 42);
        ctx.moveTo(162, 42);
        ctx.quadraticCurveTo(182, 30, 202, 40);
        ctx.stroke();

        // Spiral eyes @ @
        const drawSpiral = (cx: number, cy: number) => {
          ctx.lineWidth = 4.5;
          ctx.strokeStyle = '#FFFFFF';
          ctx.beginPath();
          for (let a = 0; a < 4 * Math.PI; a += 0.15) {
            const r = 1.6 * a;
            const x = cx + r * Math.cos(a);
            const y = cy + r * Math.sin(a);
            if (a === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        };

        drawSpiral(leftEyeX, eyeY);
        drawSpiral(rightEyeX, eyeY);

        // Squiggly dizzy mouth
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(112, 114);
        ctx.quadraticCurveTo(120, 106, 128, 114);
        ctx.quadraticCurveTo(136, 122, 144, 114);
        ctx.stroke();
        break;
      }

      case 'focused': {
        // Friendly determined face: flat or slightly raised gentle brows (never angry)
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(54, 42);
        ctx.lineTo(94, 40);
        ctx.moveTo(162, 40);
        ctx.lineTo(202, 42);
        ctx.stroke();

        // Friendly bright round eyes with catchlights
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rightEyeX, eyeY, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#051226';
        ctx.beginPath();
        ctx.arc(leftEyeX + 2, eyeY, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rightEyeX + 2, eyeY, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(leftEyeX - 2, eyeY - 4, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rightEyeX - 2, eyeY - 4, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Friendly small smile mouth
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(128, 106, 16, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
        break;
      }

      case 'sleepy': {
        // Relaxed flat brows
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(56, 46);
        ctx.lineTo(92, 46);
        ctx.moveTo(164, 46);
        ctx.lineTo(200, 46);
        ctx.stroke();

        // Soft closed sleeping curved arcs _ _
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(leftEyeX, 74, 16, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(rightEyeX, 74, 16, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();

        // Gentle resting mouth
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(128, 110, 10, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();

        // Floating pixel Z Z Z
        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = '#FF5A1F';
        ctx.fillText('z', 210, 52);
        ctx.font = 'bold 22px monospace';
        ctx.fillText('Z', 222, 38);
        ctx.font = 'bold 26px monospace';
        ctx.fillText('Z', 234, 22);
        break;
      }
    }

    this.texture.needsUpdate = true;
  }

  public dispose() {
    if (this.talkTimer) { clearInterval(this.talkTimer); this.talkTimer = null; }
    this.texture.dispose();
  }
}
