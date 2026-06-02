/* ==========================================
   THE SPACE - Premium Anti-Gym JS Script
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  initLiveClock();
  initTextScramble();
  initAccordionBgSwitcher();
  initLiquidHover();
  initKineticScroll();
});

/* ==========================================
   1. Kinetic Inertial Scroll (Smooth Scroll)
   ========================================== */
function initKineticScroll() {
  // Initialize Lenis smooth scroll
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  } else {
    console.error("Lenis library not loaded.");
  }
}

/* ==========================================
   2. Text Scramble Effect (Cyberpunk Edge)
   ========================================== */
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!@#$%^&*()_+~`{}|[]\\:";<>?,./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    this.update = this.update.bind(this);
  }
  
  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => this.resolve = resolve);
    this.queue = [];
    
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 30);
      const end = start + Math.floor(Math.random() * 30);
      this.queue.push({ from, to, start, end });
    }
    
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  
  update() {
    let output = '';
    let complete = 0;
    
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="scramble-char" style="color: var(--accent-infrared);">${char}</span>`;
      } else {
        output += from;
      }
    }
    
    this.el.innerHTML = output;
    
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

function initTextScramble() {
  const scrambleElements = document.querySelectorAll('[data-scramble]');
  
  scrambleElements.forEach(el => {
    const originalText = el.getAttribute('data-scramble');
    const fx = new TextScramble(el);
    let isHovering = false;
    
    el.addEventListener('mouseenter', () => {
      if (isHovering) return;
      isHovering = true;
      fx.setText(originalText).then(() => {
        isHovering = false;
      });
    });
  });
}

/* ==========================================
   3. Liquid Displacement Hover Ripple (SVG feTurbulence)
   ========================================== */
function initLiquidHover() {
  const displacementMap = document.getElementById('displacement-map');
  const turbulence = document.querySelector('feTurbulence');
  const hoverTargets = document.querySelectorAll('.liquid-image');
  
  if (!displacementMap || !turbulence) return;
  
  let targetScale = 0;
  let currentScale = 0;
  let time = 0;
  const lerpFactor = 0.15;
  
  // Continuously cycle baseFrequency of turbulence to simulate liquid motion
  function animateLiquid() {
    time += 0.03;
    
    // Slow wave distortion fluctuation
    const baseFreq = 0.015 + Math.sin(time * 0.7) * 0.003;
    turbulence.setAttribute('baseFrequency', `${baseFreq} ${baseFreq * 1.5}`);
    
    // Lerp the displacement scale
    currentScale += (targetScale - currentScale) * lerpFactor;
    displacementMap.setAttribute('scale', currentScale);
    
    requestAnimationFrame(animateLiquid);
  }
  
  animateLiquid();
  
  // Set triggers for target scales
  hoverTargets.forEach(target => {
    target.addEventListener('mouseenter', () => {
      targetScale = 30; // Max displacement ripple size on hover
    });
    
    target.addEventListener('mouseleave', () => {
      targetScale = 0; // Return to normal state
    });
  });
}

/* ==========================================
   4. Interactive Schedule Accordion & Background switcher
   ========================================= */
function initAccordionBgSwitcher() {
  const accordionItems = document.querySelectorAll('.accordion-item');
  const bgLayers = document.querySelectorAll('.schedule-bg-layer');
  
  accordionItems.forEach(item => {
    // Change background smoothly and open accordion on Hover
    item.addEventListener('mouseenter', () => {
      // 1. Manage accordion active classes
      accordionItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      // 2. Manage background layers cross-fade
      const targetBgId = item.getAttribute('data-bg');
      bgLayers.forEach(layer => {
        if (layer.id === targetBgId) {
          layer.classList.add('active');
        } else {
          layer.classList.remove('active');
        }
      });
    });
  });
  
  // Initialize the first class as active
  if (accordionItems.length > 0) {
    accordionItems[0].classList.add('active');
    const firstBgId = accordionItems[0].getAttribute('data-bg');
    const firstBg = document.getElementById(firstBgId);
    if (firstBg) firstBg.classList.add('active');
  }
}

/* ==========================================
   5. Live Space Clock & Simulated Gym Energy
   ========================================== */
function initLiveClock() {
  const clockEl = document.getElementById('live-clock');
  const energyPercentEl = document.getElementById('energy-percentage');
  const energyValEl = document.getElementById('energy-value');
  
  if (!clockEl) return;
  
  // 1. Digital Clock ticking
  function tick() {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hrs}:${mins}:${secs}`;
  }
  
  setInterval(tick, 1000);
  tick(); // Initial call
  
  // 2. Energy state simulation (fluctuates slightly to look active)
  let baseEnergy = 92;
  
  function updateEnergy() {
    // Fluctuates between -4% and +4%
    const fluctuation = Math.floor(Math.random() * 9) - 4;
    let currentEnergy = baseEnergy + fluctuation;
    
    // Clamp between 70% and 98%
    currentEnergy = Math.max(70, Math.min(98, currentEnergy));
    
    energyPercentEl.textContent = `${currentEnergy}%`;
    
    // Update label state based on intensity
    if (currentEnergy >= 90) {
      energyValEl.textContent = 'PEAK CAPACITY';
      energyValEl.style.color = 'var(--accent-infrared)';
    } else if (currentEnergy >= 80) {
      energyValEl.textContent = 'HIGH DENSITY';
      energyValEl.style.color = 'var(--text-primary)';
    } else {
      energyValEl.textContent = 'ACTIVE FLOW';
      energyValEl.style.color = 'var(--text-muted)';
    }
  }
  
  // Update energy every 4 seconds
  setInterval(updateEnergy, 4000);
  updateEnergy(); // Initial call
}
