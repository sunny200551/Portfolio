document.addEventListener("DOMContentLoaded", function () {
  // Enhanced interactions and animations

  // Random spark generation
  function createRandomSpark() {
    const sparksContainer = document.querySelector(".wires");
    const spark = document.createElement("div");
    spark.className = "spark random-spark";

    // Random position
    const x = Math.random() * 80 + 10; // 10% to 90% of width
    const y = Math.random() * 60 + 20; // 20% to 80% of height

    spark.style.left = x + "%";
    spark.style.top = y + "%";
    spark.style.animation = "spark-animation 0.8s ease-out forwards";

    sparksContainer.appendChild(spark);

    // Remove spark after animation
    setTimeout(() => {
      if (spark.parentNode) {
        spark.parentNode.removeChild(spark);
      }
    }, 800);
  }

  // Create random sparks periodically
  setInterval(createRandomSpark, 2000 + Math.random() * 3000);

  // Ancient man reactions
  const ancientMan = document.querySelector(".ancient-man");
  const leftEye = document.querySelector(".left-eye");
  const rightEye = document.querySelector(".right-eye");
  const mouth = document.querySelector(".mouth");

  // Random eye movements
  function animateEyes() {
    const moveX = (Math.random() - 0.5) * 4;
    const moveY = (Math.random() - 0.5) * 2;

    leftEye.style.transform = `translate(${moveX}px, ${moveY}px)`;
    rightEye.style.transform = `translate(${moveX}px, ${moveY}px)`;

    setTimeout(() => {
      leftEye.style.transform = "";
      rightEye.style.transform = "";
    }, 1000);
  }

  setInterval(animateEyes, 4000 + Math.random() * 2000);

  // Confused head scratch animation
  function scratchHead() {
    const rightArm = document.querySelector(".right-arm");
    rightArm.style.transform = "rotate(-60deg)";
    rightArm.style.transformOrigin = "top center";

    setTimeout(() => {
      rightArm.style.transform = "";
    }, 2000);
  }

  setInterval(scratchHead, 8000 + Math.random() * 4000);

  // Tool shake animation
  function shakeTools() {
    const tools = document.querySelectorAll(".tool");
    tools.forEach((tool, index) => {
      setTimeout(() => {
        tool.style.animation = "none";
        tool.style.transform = "rotate(" + (Math.random() * 20 - 10) + "deg)";

        setTimeout(() => {
          tool.style.animation = "";
          tool.style.transform = "";
        }, 500);
      }, index * 200);
    });
  }

  setInterval(shakeTools, 6000);

  // Wire electrical surge effect
  function electricalSurge() {
    const wires = document.querySelectorAll(".wire");
    wires.forEach((wire) => {
      wire.style.filter = "drop-shadow(0 0 20px currentColor) brightness(1.5)";

      setTimeout(() => {
        wire.style.filter = "";
      }, 300);
    });

    // Create multiple sparks during surge
    for (let i = 0; i < 5; i++) {
      setTimeout(createRandomSpark, i * 100);
    }
  }

  setInterval(electricalSurge, 10000 + Math.random() * 5000);

  // Dynamic progress bar messages
  const progressMessages = ["."];

  const progressMessage = document.querySelector(".progress-message");
  const progressPercentage = document.querySelector(".progress-percentage");
  let messageIndex = 0;
  let currentProgress = 0;

  function updateProgressMessage() {
    progressMessage.style.opacity = "0";

    setTimeout(() => {
      progressMessage.textContent = progressMessages[messageIndex];
      progressMessage.style.opacity = "1";
      messageIndex = (messageIndex + 1) % progressMessages.length;
    }, 300);
  }

  // Animate progress percentage
  function updateProgress() {
    const targetProgress = Math.min(currentProgress + Math.random() * 15, 95);
    const increment = (targetProgress - currentProgress) / 20;

    const progressInterval = setInterval(() => {
      currentProgress += increment;
      progressPercentage.textContent = Math.floor(currentProgress) + "%";

      if (currentProgress >= targetProgress) {
        clearInterval(progressInterval);
      }
    }, 50);
  }

  setInterval(updateProgressMessage, 4000);
  setInterval(updateProgress, 3000);

  // Particle system enhancement
  function createFloatingParticle() {
    const particles = document.querySelector(".particles");
    const particle = document.createElement("div");
    particle.className = "particle";

    const size = Math.random() * 6 + 2;
    const left = Math.random() * 100;
    const animationDuration = Math.random() * 4 + 4;
    const delay = Math.random() * 2;

    particle.style.width = size + "px";
    particle.style.height = size + "px";
    particle.style.left = left + "%";
    particle.style.animationDuration = animationDuration + "s";
    particle.style.animationDelay = delay + "s";

    particles.appendChild(particle);

    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, (animationDuration + delay) * 1000);
  }

  setInterval(createFloatingParticle, 1000);

  // Matrix rain effect
  function createMatrixRain() {
    const matrixContainer = document.querySelector(".matrix-rain");
    const characters =
      "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

    for (let i = 0; i < 50; i++) {
      const drop = document.createElement("div");
      drop.style.position = "absolute";
      drop.style.left = Math.random() * 100 + "%";
      drop.style.top = "-20px";
      drop.style.color = "#00f5ff";
      drop.style.fontSize = "14px";
      drop.style.fontFamily = "monospace";
      drop.style.opacity = Math.random() * 0.7 + 0.3;
      drop.style.animation = `matrix-fall ${
        Math.random() * 3 + 2
      }s linear infinite`;
      drop.textContent =
        characters[Math.floor(Math.random() * characters.length)];

      matrixContainer.appendChild(drop);

      setTimeout(() => {
        if (drop.parentNode) {
          drop.parentNode.removeChild(drop);
        }
      }, 5000);
    }
  }

  setInterval(createMatrixRain, 200);

  // Screen flash effect on electrical surge
  function screenFlash() {
    const body = document.body;
    const flash = document.createElement("div");
    flash.style.position = "fixed";
    flash.style.top = "0";
    flash.style.left = "0";
    flash.style.width = "100%";
    flash.style.height = "100%";
    flash.style.background = "rgba(255, 255, 255, 0.3)";
    flash.style.pointerEvents = "none";
    flash.style.zIndex = "9999";
    flash.style.opacity = "0";
    flash.style.transition = "opacity 0.1s";

    body.appendChild(flash);

    setTimeout(() => {
      flash.style.opacity = "1";
      setTimeout(() => {
        flash.style.opacity = "0";
        setTimeout(() => {
          body.removeChild(flash);
        }, 100);
      }, 50);
    }, 10);
  }

  // Trigger screen flash occasionally with electrical surges
  setInterval(() => {
    if (Math.random() < 0.3) {
      screenFlash();
    }
  }, 12000);

  // Add some startup animations
  setTimeout(() => {
    ancientMan.style.animation =
      "bobbing 3s ease-in-out infinite, fadeInScale 1s ease-out";
  }, 500);

  // Enhanced ancient man interactions
  function confusedReaction() {
    const head = document.querySelector(".head");
    head.style.transform = "rotate(-10deg)";

    setTimeout(() => {
      head.style.transform = "rotate(10deg)";
      setTimeout(() => {
        head.style.transform = "";
      }, 300);
    }, 300);
  }

  setInterval(confusedReaction, 7000);

  // Club hitting animation
  function clubHit() {
    const leftArm = document.querySelector(".left-arm");
    const club = document.querySelector(".club");

    leftArm.style.transform = "rotate(-90deg)";
    club.style.transform = "scale(1.2)";

    // Create impact spark
    setTimeout(() => {
      createRandomSpark();
      electricalSurge();
    }, 200);

    setTimeout(() => {
      leftArm.style.transform = "";
      club.style.transform = "";
    }, 400);
  }

  setInterval(clubHit, 12000);

  // CSS for fade in scale animation
  const style = document.createElement("style");
  style.textContent = `
        @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.5) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        @keyframes matrix-fall {
            to { transform: translateY(100vh); opacity: 0; }
        }
        
        .random-spark {
            background: radial-gradient(circle, #fff, #ffff00, #ff4757, transparent);
            box-shadow: 0 0 10px #ffff00;
        }
        
        .loading-text {
            background: linear-gradient(45deg, #00f5ff, #ff6b6b, #7bed9f, #ffa502);
            background-size: 400% 400%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: gradient-shift 3s ease infinite, loading-pulse 2s ease-in-out infinite;
        }
        
        @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
    `;
  document.head.appendChild(style);
});
