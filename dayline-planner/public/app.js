const list = document.querySelector('#task-list');
const form = document.querySelector('#task-form');
const input = document.querySelector('#task-input');
const empty = document.querySelector('#empty');
const notice = document.querySelector('#notice');
const count = document.querySelector('#count');
let tasks = [];
let filter = 'all';

const now = new Date();
document.querySelector('#today').textContent = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(now);
document.querySelector('#date-card').textContent = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(now).toUpperCase();

async function request(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || 'Something went wrong. Try again.');
  }
  return response.status === 204 ? null : response.json();
}

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
    checkbox.addEventListener('change', async () => {
      try { await request(`/api/tasks/${task.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ done: checkbox.checked }) }); task.done = checkbox.checked; notice.textContent = ''; render(); }
      catch (error) { checkbox.checked = task.done; notice.textContent = error.message; }
    });
    const title = document.createElement('span'); title.className = 'task-title'; title.textContent = task.title;
    const remove = document.createElement('button'); remove.className = 'delete'; remove.type = 'button'; remove.textContent = '×'; remove.setAttribute('aria-label', `Delete ${task.title}`);
    remove.addEventListener('click', async () => {
      try { await request(`/api/tasks/${task.id}`, { method: 'DELETE' }); tasks = tasks.filter(item => item.id !== task.id); notice.textContent = ''; render(); }
      catch (error) { notice.textContent = error.message; }
    });
    row.append(checkbox, title, remove); list.append(row);
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const title = input.value.trim();
  if (!title) { input.focus(); return; }
  const button = form.querySelector('button'); button.disabled = true;
  try {
    const task = await request('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) });
    tasks.unshift(task); input.value = ''; notice.textContent = ''; filter = 'all'; document.querySelectorAll('.filter').forEach(item => item.classList.toggle('active', item.dataset.filter === filter)); render(); input.focus();
  } catch (error) { notice.textContent = error.message; }
  finally { button.disabled = false; }
});

document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  filter = button.dataset.filter;
  document.querySelectorAll('.filter').forEach(item => item.classList.toggle('active', item === button));
  render();
}));

request('/api/tasks').then(data => { tasks = data; render(); }).catch(error => { notice.textContent = error.message; });
