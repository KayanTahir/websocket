/***
 * WSClient - Lightweight WebSocket client library
 * Designed by Kayan Tahir
 * GitHub - https://github.com/KayanTahir
 ***/

/****
 * Usage Example (React / Browser)
 * 
import { WSClient } from './ws-client';
import { useEffect, useState } from 'react';

export default function App() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const ws = new WSClient('ws://localhost:3000/testing', { autoReconnect: true });

    ws.on('welcome', (data) => setMessages(prev => [...prev, `Server: ${data}`]));
    ws.on('echo', (data) => setMessages(prev => [...prev, `Server: ${data}`]));

    try {
      ws.emit('test', 'Hello from React client');
    } catch (err) {
      console.error('WSClient emit error:', err);
    }

    return () => ws.disconnect();
  }, []);

  return (
    <div>
      <h1>WebSocket Messages</h1>
      <ul>
        {messages.map((msg, idx) => <li key={idx}>{msg}</li>)}
      </ul>
    </div>
  );
}
 *
 */

type EventCallback = (data: any) => void;

interface Listener {
  [event: string]: EventCallback[];
}

interface WSClientOptions {
  autoReconnect?: boolean;
  reconnectInterval?: number; 
}

export class WSClient {
  private ws: WebSocket | null = null;
  private listeners: Listener = {};
  private url: string;
  private connected: boolean = false;
  private options: WSClientOptions;

  constructor(url: string, options?: WSClientOptions) {
    this.url = url;
    this.options = options || { autoReconnect: false, reconnectInterval: 3000 };
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.connected = true;
      console.log(`[WSClient] Connected to ${this.url}`);
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const { event: eventName, data } = msg;

        if (!eventName) {
          throw new Error('Received WS message without event name');
        }

        if (this.listeners[eventName]) {
          this.listeners[eventName].forEach((cb) => cb(data));
        }
      } catch (err: any) {
        console.error('[WSClient] Invalid WS message:', event.data, '| Error:', err.message);
      }
    };

    this.ws.onclose = () => {
      this.connected = false;
      console.warn(`[WSClient] Disconnected from ${this.url}`);

      if (this.options.autoReconnect) {
        console.log(`[WSClient] Reconnecting in ${this.options.reconnectInterval}ms...`);
        setTimeout(() => this.connect(), this.options.reconnectInterval);
      }
    };

    this.ws.onerror = (err) => {
      console.error('[WSClient] WS error:', err);
    };
  }

  /**
   * Listen for a specific event
   * @param event Event name
   * @param callback Callback function
   */

  on(event: string, callback: EventCallback) {
    if (!event || typeof callback !== 'function') {
      throw new Error('[WSClient] Invalid arguments for .on(event, callback)');
    }
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  /**
   * Emit event with data to server
   * @param event Event name
   * @param data Data to send
   */

  emit(event: string, data: any) {
    if (!this.ws) {
      throw new Error('[WSClient] WebSocket not initialized');
    }

    if (this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('[WSClient] WebSocket is not open. Cannot send message.');
    }

    this.ws.send(JSON.stringify({ event, data }));
  }

  /**
   * Disconnect from WebSocket server
   */

  disconnect() {
    if (!this.ws) {
      console.warn('[WSClient] WebSocket not initialized');
      return;
    }
    this.ws.close();
    this.connected = false;
  }
}


/**
 *  
 *    Socket.io always emitted the message in the form of emitter and the connect will be created on the emitter .io
 *    but the issue in it non sturctured the code and the multiple connection on the time been it will crash the socket.io.
 *    make the TR-069 inform @Params 1000+ threat passing on the connection which is impossible to track. 
 * 
 *    So thats why I choose the WEB - Socket to make it more effective and light weight then socket.io 
 *    proper service to handle the multiple request on the server but we need to create different namespace for the another 
 *    connections.
 * 
 */