import type { Server as HttpServer } from "node:http";
import { Server as SocketServer } from "socket.io";

export type CollaborationUpdate = {
  projectId: string;
  content: string;
  updatedAt: string;
};

declare global {
  var blindToolkitIo: SocketServer | undefined;
}

export function initializeWebsocketServer(httpServer: HttpServer) {
  if (global.blindToolkitIo) {
    return global.blindToolkitIo;
  }

  const io = new SocketServer(httpServer, {
    path: "/socket.io",
    cors: {
      origin: "*"
    }
  });

  io.on("connection", (socket) => {
    socket.on("project:join", (projectId: string) => {
      socket.join(projectId);
    });

    socket.on("project:update", (payload: CollaborationUpdate) => {
      socket.to(payload.projectId).emit("project:update", payload);
    });

    socket.on("cursor:update", (payload: { projectId: string; line: number }) => {
      socket.to(payload.projectId).emit("cursor:update", payload);
    });
  });

  global.blindToolkitIo = io;
  return io;
}
