import { Module } from '@nestjs/common';
import { WebsocketService } from './websocket.service';
import { SimpleGateway } from './gateway/websocket.gateway';

@Module({
  providers: [WebsocketService, SimpleGateway]
})
export class WebsocketModule {}
