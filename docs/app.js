const storageKey = 'dayline-planner-tasks-v1';
const list = document.querySelector('#task-list');
const form = document.querySelector('#task-form');
const input = document.querySelector('#task-input');
const empty = document.querySelector('#empty');
const count = document.querySelector('#count');
let tasks = loadTasks();
let filter = 'all';

function loadTasks() {
  try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); }
  catch { return []; }
}
function saveTasks() { localStorage.setItem(storageKey, JSON.stringify(tasks)); }

const now = new Date();
document.querySelector('#today').textContent = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(now);
document.querySelector('#date-card').textContent = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(now).toUpperCase();

function render() {
  const visible = tasks.filter(task => filter === 'all' || (filter === 'open' ? !task.done : task.done));
  list.replaceChildren();
  count.textContent = tasks.filter(task => !task.done).length;
  empty.classList.toggle('show', visible.length === 0);
  empty.querySelector('strong').textContent = filter === 'done' ? 'Nothing checked off yet.' : 'A clear page is a good start.';
  empty.querySelector('span').textContent = filter === 'done' ? 'Finish a task and it will show up here.' : 'Add your first task above.';
  for (const task of visible) {
    const row = document.createElement('li');
    row.className = `task${task.done ? ' done' : ''}`;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox'; checkbox.className = 'task-check'; checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', `Mark ${task.title} ${task.done ? 'open' : 'done'}`);
    checkbox.addEventListener('change', () => { task.done = checkbox.checked; saveTasks(); render(); });
    const title = document.createElement('span'); title.className = 'task-title'; title.textContent = task.title;
    const remove = document.createElement('button'); remove.className = 'delete'; remove.type = 'button'; remove.textContent = '×'; remove.setAttribute('aria-label', `Delete ${task.title}`);
    remove.addEventListener('click', () => { tasks = tasks.filter(item => item.id !== task.id); saveTasks(); render(); });
    row.append(checkbox, title, remove); list.append(row);
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const title = input.value.trim();
  if (!title) { input.focus(); return; }
  tasks.unshift({ id: crypto.randomUUID(), title: title.slice(0, 120), done: false });
  filter = 'all';
  document.querySelectorAll('.filter').forEach(item => item.classList.toggle('active', item.dataset.filter === filter));
  saveTasks(); render(); input.value = ''; input.focus();
});

document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  filter = button.dataset.filter;
  document.querySelectorAll('.filter').forEach(item => item.classList.toggle('active', item === button));
  render();
}));

render();
