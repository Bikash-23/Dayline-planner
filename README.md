# Dayline Planner

A small, responsive task planner built with Node.js and the built-in HTTP module. Add tasks, mark them done, filter the list, or remove tasks. Tasks are stored in `tasks.json` and kept between server restarts.

## Run locally

```sh
npm start
```

Open <http://localhost:3000>. Set the `PORT` environment variable to use another port.

## Publish the static version with GitHub Pages

GitHub Pages hosts the static version in `docs/`. It does not run `server.js` or the Node.js API. The Pages version keeps tasks in the current browser's local storage, so its task list is not shared with other devices. The full Node.js version remains available for Node-capable hosts.

1. Upload the project files to a GitHub repository, including the `docs` folder.
2. Open the repository on GitHub and select **Settings**.
3. In the sidebar, select **Pages**.
4. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
5. Select branch **main** and folder **/docs**, then select **Save**.
6. Wait for the Pages deployment to finish. The published address appears on the Pages settings screen, usually as `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.

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
