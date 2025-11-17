import { WebSocket } from 'ws';

export interface ChatWebSocket extends WebSocket {
    id: string;
    nickname: string;
    room: string;
}
