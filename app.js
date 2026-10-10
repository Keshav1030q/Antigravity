// -----------------------------------------
// 1. Live System Clock & Greeting
// -----------------------------------------
function updateClock() {
  const clockEl = document.getElementById('clock');
  const dateEl = document.getElementById('date');
  const greetingEl = document.getElementById('greeting');

  const now = new Date();
  
  // Format Time
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  clockEl.textContent = `${hours}:${minutes}:${seconds}`;

  // Format Date
  const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
  dateEl.textContent = now.toLocaleDateString(undefined, options);

  // Dynamic Greeting
  const currentHour = now.getHours();
  let greetingText = 'Good evening';
  if (currentHour < 12) greetingText = 'Good morning';
  else if (currentHour < 17) greetingText = 'Good afternoon';
  
  greetingEl.textContent = `${greetingText}, Keshav! 👋`;
}

setInterval(updateClock, 1000);
updateClock();


// -----------------------------------------
// 2. Interactive Zero-Gravity Canvas Physics
// -----------------------------------------
const canvas = document.getElementById('gravityCanvas');
const ctx = canvas.getContext('2d');

let width, height;
function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let particles = [];
let driftDirection = -1; // -1 for upward drift (antigravity), 1 for downward

class Particle {
  constructor(x, y) {
    this.x = x || Math.random() * width;
    this.y = y || Math.random() * height;
    this.radius = Math.random() * 2.5 + 1;
    this.vx = (Math.random() - 0.5) * 0.8;
    this.vy = (Math.random() * 0.6 + 0.2) * driftDirection;
    this.color = Math.random() > 0.5 ? 'rgba(56, 189, 248, ' : 'rgba(168, 85, 247, ';
    this.alpha = Math.random() * 0.7 + 0.2;
  }

  update(pointer) {
    this.x += this.vx;
    this.y += this.vy;

    // Boundary wrapping
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;

    // Repulsion from touch / cursor
    if (pointer.active) {
      const dx = this.x - pointer.x;
      const dy = this.y - pointer.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120;
        this.x += (dx / dist) * force * 5;
        this.y += (dy / dist) * force * 5;
      }
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color + this.alpha + ')';
    ctx.fill();
  }
}

// Initial particles
function initParticles(count = 60) {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
}
initParticles();

// Pointer tracking (Mouse and Mobile Touch)
const pointer = { x: 0, y: 0, active: false };

window.addEventListener('mousemove', (e) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.active = true;
});

window.addEventListener('mouseleave', () => {
  pointer.active = false;
});

window.addEventListener('touchmove', (e) => {
  if (e.touches.length > 0) {
    pointer.x = e.touches[0].clientX;
    pointer.y = e.touches[0].clientY;
    pointer.active = true;
  }
}, { passive: true });

window.addEventListener('touchend', () => {
  pointer.active = false;
});

// Canvas animation loop
function animate() {
  ctx.clearRect(0, 0, width, height);

  // Connect nearby particles with subtle lines
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 90) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.15 * (1 - dist / 90)})`;
        ctx.lineWidth = 0.6;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }

  particles.forEach(p => {
    p.update(pointer);
    p.draw();
  });

  requestAnimationFrame(animate);
}
animate();

// Button controls
document.getElementById('addParticlesBtn').addEventListener('click', () => {
  for (let i = 0; i < 25; i++) {
    particles.push(new Particle());
  }
});

document.getElementById('invertGravityBtn').addEventListener('click', () => {
  driftDirection *= -1;
  particles.forEach(p => {
    p.vy = (Math.random() * 0.6 + 0.2) * driftDirection;
  });
});


// -----------------------------------------
// 3. Local Notes Scratchpad (LocalStorage)
// -----------------------------------------
const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');

const STORAGE_KEY = 'antigravity_test_notes';

function loadTodos() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [
    { id: 1, text: '🎉 First test note (saved locally!)' },
    { id: 2, text: '📱 Open this website on phone to test responsiveness' }
  ];
}

function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function renderTodos() {
  const todos = loadTodos();
  todoList.innerHTML = '';

  if (todos.length === 0) {
    todoList.innerHTML = '<li class="empty-state">No notes yet. Add one above!</li>';
    return;
  }

  todos.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.innerHTML = `
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <button class="todo-delete" title="Delete note" onclick="deleteTodo(${todo.id})">&times;</button>
    `;
    todoList.appendChild(li);
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

window.deleteTodo = function(id) {
  let todos = loadTodos();
  todos = todos.filter(t => t.id !== id);
  saveTodos(todos);
  renderTodos();
};

todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;

  const todos = loadTodos();
  todos.unshift({ id: Date.now(), text });
  saveTodos(todos);
  renderTodos();
  todoInput.value = '';
});

renderTodos();
