/**
 * HABIT TRACKER DAILY - Confetti Celebration Engine
 * Pure Vanilla JS canvas particles for celebratory feedback
 */

class ConfettiCelebration {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationId = null;
    this.initCanvas();
  }

  initCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'confetti-canvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '9999';
    this.canvas.style.display = 'none';
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    window.addEventListener('resize', () => {
      if (this.canvas.style.display !== 'none') {
        this.resize();
      }
    });
  }

  resize() {
    this.canvas.width = window.innerWidth * window.devicePixelRatio;
    this.canvas.height = window.innerHeight * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  fire(originX = window.innerWidth / 2, originY = window.innerHeight / 2) {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.canvas.style.display = 'block';
    this.resize();
    this.particles = [];

    const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F43F5E', '#EC4899'];
    const count = 90;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 4 + Math.random() * 8;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 6 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        gravity: 0.22,
        drag: 0.96
      });
    }

    const startTime = performance.now();
    const duration = 2200; // 2.2 seconds

    const animate = (now) => {
      const elapsed = now - startTime;
      if (elapsed > duration) {
        this.canvas.style.display = 'none';
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.animationId = null;
        return;
      }

      this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const p of this.particles) {
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, 1 - (elapsed / duration));

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = p.opacity;
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        this.ctx.restore();
      }

      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);

    // Optional haptic feedback if mobile
    if (typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([40, 60, 40]);
      } catch (e) {}
    }
  }
}

window.confetti = new ConfettiCelebration();
