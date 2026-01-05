/* Simple WebSocket signaling server for demo purposes
   Usage: node signaling/server.js
   - Listens on port 3001 by default (or use SIGNALING_PORT env)
   - Expects simple JSON messages: { type, roomId, clientId, token, from, to, payload }
   - On 'join' from a client, server replies with a 'participants' message listing other clientIds in the room
   - Forwards 'offer', 'answer', and 'candidate' messages to the target client
   - Validates room tokens for access control

   NOTE: This is a minimal demo server. For production use a more robust implementation (auth, rooms lifecycle, scaling).
*/

// Simple in-memory token store (roomId -> token)
const roomTokens = new Map();

// Generate a simple token for a room
function generateRoomToken(roomId) {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  roomTokens.set(roomId, token);
  return token;
}

// Validate room token
function validateRoomToken(roomId, token) {
  return roomTokens.get(roomId) === token;
}

// Clean up empty rooms and their tokens
function cleanupRoom(roomId) {
  const room = rooms.get(roomId);
  if (room && room.size === 0) {
    rooms.delete(roomId);
    roomTokens.delete(roomId);
  }
}

const WebSocket = require('ws');

const PORT = process.env.SIGNALING_PORT ? parseInt(process.env.SIGNALING_PORT, 10) : 3001;

const wss = new WebSocket.Server({ port: PORT });
console.log(`Signaling server listening on ws://localhost:${PORT}`);

// roomId -> Map(clientId -> ws)
const rooms = new Map();

function send(ws, data) {
  try {
    ws.send(JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to send message', e);
  }
}

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message.toString());
    } catch (e) {
      console.warn('Invalid JSON', e);
      return;
    }

    const { type, roomId, clientId, token, from, to, payload } = data;
    
    if (type === 'create-room') {
      // Create a new room and return token
      if (!roomId) return;
      const newToken = generateRoomToken(roomId);
      send(ws, { type: 'room-created', roomId, token: newToken });
      return;
    }
    
    if (type === 'join') {
      if (!roomId || !clientId || !token) {
        send(ws, { type: 'auth-error', message: 'Missing roomId, clientId, or token' });
        return;
      }
      
      // Validate token
      if (!validateRoomToken(roomId, token)) {
        send(ws, { type: 'auth-error', message: 'Invalid room token' });
        return;
      }
      
      ws.clientId = clientId;
      ws.roomId = roomId;
      ws.token = token;

      if (!rooms.has(roomId)) rooms.set(roomId, new Map());
      const room = rooms.get(roomId);
      room.set(clientId, ws);

      // reply with participants (other clients)
      const others = Array.from(room.keys()).filter(id => id !== clientId);
      send(ws, { type: 'participants', roomId, payload: others });

      // notify others a new participant joined (optional)
      for (const [id, clientWs] of room.entries()) {
        if (id === clientId) continue;
        send(clientWs, { type: 'participant-joined', roomId, from: clientId });
      }

      return;
    }

    // Routing messages to intended recipient
    if (roomId && to) {
      const room = rooms.get(roomId);
      if (!room) return;
      const target = room.get(to);
      if (target && target.readyState === WebSocket.OPEN) {
        send(target, { type, roomId, from, to, payload });
      }
    }

    // Handle leave / close optionally
    if (type === 'leave') {
      if (!roomId || !clientId) return;
      const room = rooms.get(roomId);
      if (!room) return;
      room.delete(clientId);
      // notify others
      for (const [, clientWs] of room.entries()) {
        send(clientWs, { type: 'participant-left', roomId, from: clientId });
      }
    }
  });

  ws.on('close', () => {
    const { roomId, clientId } = ws;
    if (roomId && clientId) {
      const room = rooms.get(roomId);
      if (room) {
        room.delete(clientId);
        for (const [, clientWs] of room.entries()) {
          send(clientWs, { type: 'participant-left', roomId, from: clientId });
        }
        if (room.size === 0) rooms.delete(roomId);
        // Clean up token for empty room
        cleanupRoom(roomId);
      }
    }
  });
});

// Simple ping to detect dead connections
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping(() => {});
  });
}, 30000);
