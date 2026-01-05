Signaling Server (WebSocket)

This repository includes a minimal WebSocket signaling server for demoing the WebRTC peer-to-peer flow used by the `VideoCall` component.

## Development Setup

### Option 1: Concurrently (Cross-platform, recommended for most users)

Install dependencies and run both servers:

```bash
npm install
npm run dev:all
```

This uses `concurrently` to run Next.js dev server and signaling server in parallel.

### Option 2: PowerShell Script (Windows only)

For Windows PowerShell users, use the dedicated script:

```bash
npm run dev:all:win
```

This script:
- Checks if ports are available
- Starts both servers in background jobs
- Monitors for failures
- Provides colored output
- Handles graceful shutdown (Ctrl+C)

### Option 3: PM2 (Advanced users)

For production-like process management:

```bash
npm install -g pm2  # or locally: npm install pm2
npm run dev:all:pm2
```

Stop with: `pm2 stop ecosystem.config.js && pm2 delete ecosystem.config.js`

### Individual Servers

Run servers separately:

```bash
# Terminal 1: Signaling server
npm run signaling

# Terminal 2: Next.js dev server
npm run dev
```

## How it works

- Clients send a JSON `join` message: `{ type: 'join', roomId, clientId }`.
- Server replies with `participants` listing existing participant ids in the room.
- Clients exchange `offer`, `answer`, and `candidate` messages via the server. Messages should follow the shape:
  `{ type: 'offer'|'answer'|'candidate', roomId, from, to, payload }
- The server simply forwards messages to the intended recipient in the same room.

## Notes

- This server is for development and demo only. It does not implement authentication, rate-limiting, nor persistence.
- For production use, consider an SFU (mediasoup/Janus/Jitsi) or a managed solution.
