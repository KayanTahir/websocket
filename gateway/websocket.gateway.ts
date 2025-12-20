import {
    WebSocketGateway,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Injectable } from '@nestjs/common';
  import { WebsocketService } from '../websocket.service';
  import * as WebSocket from 'ws';
  
  @WebSocketGateway({ noServer: true, path: '/testing' })
  @Injectable()
  export class SimpleGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: WebSocket.Server;
  
    constructor(private wsService: WebsocketService) {}
  
    handleConnection(client: WebSocket) {
      const connectedCount = this.server.clients.size;
  
      if (connectedCount > 2) {
        console.warn(`❌ Max clients reached! (${connectedCount}/2) Rejecting client`);
        client.close(1000, 'Max clients limit reached');
        return;
      }
  
      console.log(`✅ Client connected (${connectedCount}/2)`);
  

      this.wsService.emitToClient(client, 'welcome', 'Hello! WebSocket is working ✅');
  
      client.on('message', (msg: string) => {
        console.log('Received from client:', msg.toString());
        this.wsService.emitToClient(client, 'echo', `Server received: ${msg.toString()}`);
      });
    }
  
    handleDisconnect() {
      console.log('🔌 Client disconnected');
    }
  }
  