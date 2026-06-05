# Island Siege

This is an open-source online implementation of [Island Siege](https://boardgamegeek.com/boardgame/133405/island-siege).
**This implementation is not affiliated with APE Games in any way**.
Please consider [buying the game](https://www.amazon.com/APE-Games-Island-Siege-Multi/dp/099942887X/) to show support to the creators.

This project is built using TypeScript, React, and Vite.

## Setup

```
npm install
```

## Development

```
npm run dev
```

Starts the Express backend on port 3001 and the Vite frontend on port 5173. Open `http://localhost:5173` to play. The frontend proxies `/api` and `/ws` to the backend automatically.

To run them separately:

- Frontend only: `npm start`
- Server only: `npm run server:dev`

## Production build

```
npm run build:all
```

Builds the React app to `dist/` and compiles the server to `dist-server/`. The server serves the frontend statically, so only one process needs to run:

```
node dist-server/server/index.js
```

## Testing

```
npm test
```

## Deployment

The app is deployed as a single service on [Render](https://render.com):

- **Build command:** `npm run build:all`
- **Start command:** `node dist-server/server/index.js`

Render injects the `PORT` environment variable automatically.
