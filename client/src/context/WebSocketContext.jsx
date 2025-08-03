import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.channel === 'global') {
          // Handle global messages
          if (data.action === 'BID_STARTED') {
            toast.info(`New bid started on item ${data.itemId}`);
          }
          if (data.action === 'BID_WON') {
            toast.success(data.message);
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onopen = () => {
      console.log('WebSocket connected');
      setSocket({
        subscribe: (channel, callback) => {
          ws.send(JSON.stringify({ event: 'subscribe', channel }));
          ws.addEventListener('message', (event) => {
            try {
              const data = JSON.parse(event.data);
              callback(data);
            } catch (error) {
              console.error('Error parsing WebSocket message:', error);
            }
          });
        },
        unsubscribe: (channel) => {
          ws.send(JSON.stringify({ event: 'unsubscribe', channel }));
        }
      });
    };

    ws.onmessage = handleMessage;

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setSocket(null);
    };

    return () => {
      ws.removeEventListener('message', handleMessage);
      ws.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};