const fs = require('fs');
let s = fs.readFileSync('src/robot/FaceCanvas.ts', 'utf8');

const target = "      case 'happy': {";
const newExpressions = `      case 'enjoying': {
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

` + target;

s = s.replace(target, newExpressions);
fs.writeFileSync('src/robot/FaceCanvas.ts', s, 'utf8');
console.log('Added 5 new expressions to FaceCanvas.ts successfully!');
