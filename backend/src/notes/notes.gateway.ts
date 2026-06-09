import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import * as jwt from 'jsonwebtoken';

interface NoteClient extends WebSocket {
  noteId: string;
}

@WebSocketGateway({ path: '/ws' })
export class NotesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private rooms = new Map<string, Set<NoteClient>>();

  handleConnection(client: NoteClient, req: IncomingMessage) {
    const params = new URL(req.url!, 'http://localhost').searchParams;
    const noteId = params.get('noteId');
    const token = params.get('token');

    try {
      jwt.verify(token!, process.env.JWT_SECRET || 'super-secret-key');
    } catch {
      client.close(1008, 'Unauthorized');
      return;
    }

    if (!noteId) {
      client.close();
      return;
    }

    client.noteId = noteId;

    if (!this.rooms.has(noteId)) {
      this.rooms.set(noteId, new Set());
    }
    this.rooms.get(noteId)!.add(client);
  }

  handleDisconnect(client: NoteClient) {
    const { noteId } = client;
    if (noteId && this.rooms.has(noteId)) {
      this.rooms.get(noteId)!.delete(client);
      if (this.rooms.get(noteId)!.size === 0) {
        this.rooms.delete(noteId);
      }
    }
  }

  broadcastNoteUpdate(noteId: string, data: object) {
    const room = this.rooms.get(noteId);
    if (!room) return;

    const message = JSON.stringify({ type: 'note_updated', ...data });

    for (const client of room) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }
}
