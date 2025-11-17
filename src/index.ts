import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { v4 as uuid } from 'uuid';
import WebSocket from 'ws';

interface User {
    nickname?: string;
    id: string;
    room: string;
    connection: WebSocket;
}

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 8080;

const wss = new WebSocketServer({ server, path: '/ws', clientTracking: true });

const clients = new Set<User>();

wss.on('connection', (ws, req) => {
    const userId = uuid();
    const nickname = `User_${userId.slice(0, 4)}`;

    const user: User = {
        id: userId,
        nickname: nickname,
        room: 'general',
        connection: ws,
    };

    clients.add(user);

    const IP = req.socket.remoteAddress;
    console.log(`New client connected from ${IP}`);
    broadcastMessage(`${user.nickname} joined the room!`, null, 'general');

    ws.send(
        `Welcome to the server ${user.nickname}! \nThere are ${clients.size} clients connected.`
    );

    ws.on('message', (data) => {
        try {
            const text = data.toString();

            console.log(`Received message: ${text}`);
            if (ws.readyState === ws.OPEN) {
                broadcastMessage(text, user, user.room);
            }
        } catch (error) {
            console.error(`Error parsing message`, error);
        }
    });

    ws.on('close', (code, reason) => {
        console.log(`Client disconnected - Code: ${code}, Reason: ${reason}`);
        broadcastMessage(`${user.nickname} disconnected.`, null, user.room);
    });
});

app.get('/', (req, res) => {
    res.send('Sup?');
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`);
});

const broadcastMessage = (
    message: string,
    sender: User | null = null,
    room: string = 'general'
) => {
    let messageToSend = '';
    if (sender != null) {
        messageToSend = `${sender?.nickname}: ${message}`;
    } else {
        messageToSend = `Global - ${message}`;
    }

    clients.forEach((user) => {
        if (
            user != sender &&
            user.connection.readyState === user.connection.OPEN &&
            user.room === room
        ) {
            try {
                user.connection.send(messageToSend);
            } catch (error) {
                console.error(`Error parsing message`, error);
            }
        }
    });
};
