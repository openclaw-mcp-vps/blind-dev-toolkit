import { createServer } from "node:http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = Number(process.env.PORT || 3000);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new SocketIOServer(httpServer, {
    path: "/socket.io",
    cors: {
      origin: "*"
    }
  });

  io.on("connection", (socket) => {
    socket.on("project:join", (projectId) => {
      socket.join(projectId);
    });

    socket.on("project:update", (payload) => {
      socket.to(payload.projectId).emit("project:update", payload);
    });

    socket.on("cursor:update", (payload) => {
      socket.to(payload.projectId).emit("cursor:update", payload);
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
