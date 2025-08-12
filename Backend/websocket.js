import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.send("Hello from server!");

    ws.on("message", (message) => {
        console.log("Received:", message.toString());
        ws.send(`You said: ${message}`);
    });

    ws.on("close", (code, reason) => {
        console.log(`Client disconnected: code=${code}, reason=${reason.toString()}`);
    });

    ws.on("error", (error) => {
        console.error("WebSocket error:", error);
    });
});

console.log("WebSocket server running on ws://localhost:8080");
