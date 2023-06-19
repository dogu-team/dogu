import { useEffect, useRef } from 'react';
import { WebSocketUrlResolver } from '../utils/web-socket';

const useWebSocket = (pathWithQuery: string | null) => {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (pathWithQuery !== null) {
      if (socketRef.current === null) {
        const url = new WebSocketUrlResolver().resolve(pathWithQuery);
        const ws = new WebSocket(url);

        socketRef.current = ws;
      }
    }

    return () => {
      if (socketRef.current !== null) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [pathWithQuery]);

  return socketRef;
};

export default useWebSocket;
