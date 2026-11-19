# Dayline Planner

A small, responsive task planner built with Node.js and the built-in HTTP module. Add tasks, mark them done, filter the list, or remove tasks. Tasks are stored in `tasks.json` and kept between server restarts.

## Run locally

```sh
npm start
```

Open <http://localhost:3000>. Set the `PORT` environment variable to use another port.

## Project files

- `server.js` — Node.js web server and JSON API
- `public/index.html` — app layout
- `public/style.css` — responsive styling
- `public/app.js` — task list interactions
- `tasks.json` — saved task data

## API

- `GET /api/tasks` — list saved tasks
- `POST /api/tasks` — add a task with `{ "title": "..." }`
- `PATCH /api/tasks/:id` — update completion with `{ "done": true }`
- `DELETE /api/tasks/:id` — remove a task
