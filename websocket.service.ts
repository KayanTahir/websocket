import { Injectable } from '@nestjs/common';
import * as WebSocket from 'ws';

interface WSMessage {
  event: string;
  data: any;
}

@Injectable()
export class WebsocketService {
  private wss: WebSocket.Server = null;
  private maxClients = Infinity;

  /**
   * Initialize WebSocket Server
   */
  init(server: any, path: string = '/ws') {
    this.wss = new WebSocket.Server({
      server,
      path,
    });

    this.wss.on('connection', (client) => {
      // Enforce max clients
      if (this.wss.clients.size > this.maxClients) {
        console.warn(`[WS] Max clients reached (${this.maxClients}). Rejecting connection.`);
        client.close(1000, 'Max clients reached');
        return;
      }

      console.log(`[WS] Client connected. Total: ${this.wss.clients.size}`);

      client.on('close', () => {
        console.log(`[WS] Client disconnected. Total: ${this.wss.clients.size}`);
      });

      client.on('error', (err) => {
        console.error('[WS] Client error:', err);
      });
    });

    console.log(`[WS] WebSocket server initialized at path: ${path}`);
  }

  /**
   * Emit to all clients
   */
  emit(event: string, data: any) {
    if (!this.wss) {
      console.warn('[WS] emit() failed: WebSocket server not initialized.');
      return;
    }

    const msg: WSMessage = { event, data };

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(msg));
      }
    });

    console.log(`[WS] Broadcast event '${event}' to ${this.wss.clients.size} clients`);
  }

  /**
   * Emit to a specific client
   */
  emitToClient(client: WebSocket, event: string, data: any) {
    if (client && client.readyState === WebSocket.OPEN) {
      const msg: WSMessage = { event, data };
      client.send(JSON.stringify(msg));
      console.log(`[WS] Sent event '${event}' to one client`);
    }
  }

  /**
   * Set max clients
   */
  setMaxClients(maxClients: number) {
    this.maxClients = maxClients;
    console.log(`[WS] Max client limit set to ${maxClients}`);
  }
}
