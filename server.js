const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const port = Number(process.env.PORT) || 3000;
const publicDir = path.join(__dirname, 'public');
const dataFile = path.join(__dirname, 'tasks.json');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8' };

function loadTasks() {
  try { return JSON.parse(fs.readFileSync(dataFile, 'utf8')); }
  catch { return []; }
}

let tasks = loadTasks();
function saveTasks() { fs.writeFileSync(dataFile, JSON.stringify(tasks, null, 2)); }
function sendJson(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
}
function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 8192) { reject(new Error('Request too large')); req.destroy(); }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/api/tasks' && req.method === 'GET') return sendJson(res, 200, tasks);

  if (url.pathname === '/api/tasks' && req.method === 'POST') {
    try {
      const body = await readJson(req);
      const title = String(body.title || '').trim().slice(0, 120);
      if (!title) return sendJson(res, 400, { error: 'Add a task name first.' });
      const task = { id: crypto.randomUUID(), title, done: false, createdAt: new Date().toISOString() };
      tasks.unshift(task);
      saveTasks();
      return sendJson(res, 201, task);
    } catch (error) { return sendJson(res, 400, { error: error.message }); }
  }

  const taskMatch = url.pathname.match(/^\/api\/tasks\/([\w-]+)$/);
  if (taskMatch && req.method === 'PATCH') {
    try {
      const body = await readJson(req);
      const task = tasks.find(item => item.id === taskMatch[1]);
      if (!task) return sendJson(res, 404, { error: 'Task not found.' });
      if (typeof body.done === 'boolean') task.done = body.done;
      saveTasks();
      return sendJson(res, 200, task);
    } catch (error) { return sendJson(res, 400, { error: error.message }); }
  }

  if (taskMatch && req.method === 'DELETE') {
    const before = tasks.length;
    tasks = tasks.filter(item => item.id !== taskMatch[1]);
    if (tasks.length === before) return sendJson(res, 404, { error: 'Task not found.' });
    saveTasks();
    res.writeHead(204).end();
    return;
  }

  if (url.pathname.startsWith('/api/')) return sendJson(res, 404, { error: 'Not found.' });
  const relative = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
  const file = path.resolve(publicDir, relative);
  if (!file.startsWith(publicDir + path.sep)) return res.writeHead(403).end('Forbidden');
  fs.readFile(file, (error, content) => {
    if (error) return res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    res.end(content);
  });
});

server.listen(port, '0.0.0.0', () => console.log(`Dayline running at http://localhost:${port}`));
