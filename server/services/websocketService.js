import WebSocket from 'ws';

let wss = null;
const subscribers = {};

export const initializeWebSocket = (server) => {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      try {
        const { event, channel } = JSON.parse(message);
        if (event === 'subscribe' && channel) {
          if (!subscribers[channel]) {
            subscribers[channel] = new Set();
          }
          subscribers[channel].add(ws);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      Object.keys(subscribers).forEach(channel => {
        if (subscribers[channel].has(ws)) {
          subscribers[channel].delete(ws);
        }
      });
    });
  });
};

export const publishMessage = (channel, message) => {
  if (subscribers[channel]) {
    subscribers[channel].forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
};