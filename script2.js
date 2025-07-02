// ===== Theme Toggle Functionality =====
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem("theme") || "light";
body.setAttribute("data-theme", currentTheme);

themeToggle.addEventListener("click", () => {
  const currentTheme = body.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  body.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);

  // Add a nice animation effect
  themeToggle.style.transform = "rotate(360deg)";
  setTimeout(() => {
    themeToggle.style.transform = "rotate(0deg)";
  }, 300);
});

// ===== Mobile Navigation =====
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
});

// Close mobile menu when clicking on a nav link
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  });
});

// ===== Smooth Scrolling and Active Navigation =====
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("section");

// Function to update active navigation link
function updateActiveNavLink() {
  let current = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (window.pageYOffset >= sectionTop - 200) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
}

// Update active link on scroll
window.addEventListener("scroll", updateActiveNavLink);

// ===== Navbar Background on Scroll =====
const navbar = document.getElementById("navbar");

window.addEventListener("scroll", () => {
  if (window.scrollY > 100) {
    navbar.style.background = "var(--glass-bg)";
    navbar.style.backdropFilter = "blur(20px)";
    navbar.style.boxShadow = "0 2px 20px var(--shadow-light)";
  } else {
    navbar.style.background = "var(--glass-bg)";
    navbar.style.boxShadow = "none";
  }
});

// ===== Scroll Reveal Animation =====
function reveal() {
  const reveals = document.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right"
  );

  reveals.forEach((element) => {
    const windowHeight = window.innerHeight;
    const elementTop = element.getBoundingClientRect().top;
    const elementVisible = 150;

    if (elementTop < windowHeight - elementVisible) {
      element.classList.add("active");
    }
  });
}

window.addEventListener("scroll", reveal);

// ===== Three.js Scene =====
function initThreeScene() {
  const container = document.getElementById("threeScene");
  if (!container) return;

  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

  renderer.setSize(200, 200);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // Create a geometric shape
  const geometry = new THREE.IcosahedronGeometry(1, 0);
  const material = new THREE.MeshPhongMaterial({
    color: 0x6366f1,
    shininess: 100,
    transparent: true,
    opacity: 0.8,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  camera.position.z = 3;

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;

    renderer.render(scene, camera);
  }

  animate();

  // Handle theme changes for the 3D object
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "data-theme") {
        const isDark = document.body.getAttribute("data-theme") === "dark";
        material.color.setHex(isDark ? 0x8b5cf6 : 0x6366f1);
      }
    });
  });

  observer.observe(document.body, { attributes: true });
}

// Initialize Three.js scene when DOM is loaded
document.addEventListener("DOMContentLoaded", initThreeScene);

// ===== Typing Animation for Hero Text =====
function typeWriter(element, text, speed = 100) {
  let i = 0;
  element.innerHTML = "";

  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  type();
}

// ===== Particle Background Effect =====
function createParticles() {
  const particlesContainer = document.createElement("div");
  particlesContainer.className = "particles";
  particlesContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
    `;

  document.body.appendChild(particlesContainer);

  // Create particles
  for (let i = 0; i < 50; i++) {
    const particle = document.createElement("div");
    particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: var(--accent-color);
            border-radius: 50%;
            opacity: 0.3;
            animation: float 6s ease-in-out infinite;
            animation-delay: ${Math.random() * 6}s;
        `;

    particle.style.left = Math.random() * 100 + "%";
    particle.style.top = Math.random() * 100 + "%";

    particlesContainer.appendChild(particle);
  }
}

// Initialize particles
document.addEventListener("DOMContentLoaded", createParticles);

// ===== Intersection Observer for Better Performance =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("active");
    }
  });
}, observerOptions);

// Observe all reveal elements
document.addEventListener("DOMContentLoaded", () => {
  const revealElements = document.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right"
  );
  revealElements.forEach((el) => observer.observe(el));
});

// ===== Smooth Page Load =====
window.addEventListener("load", () => {
  document.body.classList.add("loaded");

  // Trigger initial reveal check
  reveal();
});

// ===== Keyboard Navigation =====
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    // Close mobile menu
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  }
});

// ===== Console Welcome Message =====
console.log(`
🌟 Welcome to Sunny Pasumarthi's Portfolio! 🌟
Built with HTML, CSS, and JavaScript
Theme: Glassmorphism & Modern Design
Features: Dual Theme, 3D Graphics, Smooth Animations
`);

// ===== Resume Download Functionality =====
document.addEventListener("DOMContentLoaded", () => {
  const downloadButton = document.getElementById("downloadResume");

  if (downloadButton) {
    downloadButton.addEventListener("click", () => {
      // Try to download the actual resume file first
      const link = document.createElement("a");
      link.href = "portfolio/assets/resume/Sunny_Pasumarthi_Resume.docx"; // Adjust the path as needed
      link.download = "portfolio/assets/resume/Sunny_Pasumarthi_Resume.docx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
});

// Add reveal classes to elements
document.addEventListener("DOMContentLoaded", () => {
  // Add reveal classes to sections
  const aboutSection = document.querySelector(".about-content");
  if (aboutSection) {
    aboutSection.querySelector(".about-image").classList.add("reveal-left");
    aboutSection.querySelector(".about-info").classList.add("reveal-right");
  }

  // Add reveal classes to education cards
  const educationCards = document.querySelectorAll(".education-card");
  educationCards.forEach((card, index) => {
    card.classList.add("reveal");
    card.style.animationDelay = `${index * 0.2}s`;
  });

  // Add reveal classes to contact items
  const contactItems = document.querySelectorAll(".contact-item");
  contactItems.forEach((item, index) => {
    item.classList.add("reveal");
    item.style.animationDelay = `${index * 0.1}s`;
  });

  const projectCards = document.querySelectorAll(".project-card");
  projectCards.forEach((card, index) => {
    card.classList.add("reveal");
    card.style.animationDelay = `${index * 0.2}s`;
  });

  const resumeCard = document.querySelector(".resume-card");
  if (resumeCard) {
    resumeCard.classList.add("reveal");
  }
});
