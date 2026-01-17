/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import crypto from "crypto";
import http from "http";
import { Socket } from "net";

// Default port
let PORT = 4458;

// The Player Page (Served to OBS)
const PLAYER_HTML = /* html*/`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>body{margin:0;background:transparent;overflow:hidden}video{width:100vw;height:100vh;object-fit:contain}</style>
</head>
<body>
    <video id="v" autoplay playsinline muted></video>
    <script>
        // Get Stream ID from URL (e.g., /watch/Zinix_video)
        const pathParts = window.location.pathname.split("/");
        const id = pathParts.pop() || pathParts.pop();
        const port = window.location.port;

        const ws = new WebSocket("ws://localhost:" + port + "/" + id);
        const pc = new RTCPeerConnection();

        // When we get the track, play it
        pc.ontrack = e => {
            const v = document.getElementById("v");
            if (v.srcObject !== e.streams[0]) v.srcObject = e.streams[0];
        };

        // Standard WebRTC Signaling
        pc.onicecandidate = e => e.candidate && ws.send(JSON.stringify({candidate: e.candidate}));

        ws.onmessage = async msg => {
            const data = JSON.parse(msg.data);
            if (data.sdp) {
                await pc.setRemoteDescription(data.sdp);
                if (data.sdp.type === "offer") {
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    ws.send(JSON.stringify({sdp: pc.localDescription}));
                }
            } else if (data.candidate) await pc.addIceCandidate(data.candidate);
        };

        // Auto-reconnect logic could go here
    </script>
</body>
</html>
`;

// Minimalist WebSocket Wrapper (Zero Deps)
class TinyWebSocket {
    socket: Socket;
    onmessage: ((data: string) => void) | null = null;
    onclose: (() => void) | null = null;

    constructor(socket: Socket) {
        this.socket = socket;
        this.socket.on("data", chunk => this.parse(chunk));
        this.socket.on("close", () => this.onclose?.());
        this.socket.on("error", () => this.socket.destroy());
    }

    send(data: string) {
        const payload = Buffer.from(data);
        const len = payload.length;
        let frame: Buffer;

        if (len < 126) {
            frame = Buffer.alloc(2 + len);
            frame[0] = 0x81; frame[1] = len;
            payload.copy(frame, 2);
        } else if (len < 65536) {
            frame = Buffer.alloc(4 + len);
            frame[0] = 0x81; frame[1] = 126;
            frame.writeUInt16BE(len, 2);
            payload.copy(frame, 4);
        } else {
            frame = Buffer.alloc(10 + len);
            frame[0] = 0x81; frame[1] = 127;
            frame.writeBigUInt64BE(BigInt(len), 2);
            payload.copy(frame, 10);
        }
        this.socket.write(frame);
    }

    private buffer = Buffer.alloc(0);
    private parse(chunk: Buffer) {
        this.buffer = Buffer.concat([this.buffer, chunk]);
        while (this.buffer.length >= 2) {
            const payloadLen = this.buffer[1] & 0x7F;
            let offset = 2, length = payloadLen;
            if (payloadLen === 126) { if (this.buffer.length < 4) return; length = this.buffer.readUInt16BE(2); offset = 4; }
            else if (payloadLen === 127) { if (this.buffer.length < 10) return; length = Number(this.buffer.readBigUInt64BE(2)); offset = 10; }

            const mask = this.buffer.slice(offset, offset + 4);
            offset += 4;
            if (this.buffer.length < offset + length) return;

            const payload = this.buffer.slice(offset, offset + length);
            for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4];

            if (this.onmessage) this.onmessage(payload.toString());
            this.buffer = this.buffer.slice(offset + length);
        }
    }
}

const senders = new Map<string, TinyWebSocket>();
const receivers = new Map<string, TinyWebSocket>();
let httpServer: http.Server | null = null;

export function startWebServer(port: number = 4458) {
    if (httpServer !== null) { console.log("[StreamerCord | Native] Web server is already running."); return; }
    PORT = port;
    console.log(`[StreamerCord | Native] Starting web server on port ${PORT}...`);

    httpServer = http.createServer((req, res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        if (req.url?.startsWith("/watch/")) {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(PLAYER_HTML);
        } else {
            res.writeHead(404);
            res.end("Stream Not Found");
        }
    });

    httpServer.on("upgrade", (req, socket, head) => {
        const key = req.headers["sec-websocket-key"];
        if (!key) { socket.destroy(); return; }

        const accept = crypto.createHash("sha1").update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64");
        socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);

        const ws = new TinyWebSocket(socket as Socket);
        const url = req.url || "";
        const id = url.split("/").pop() || "";
        const isSender = url.includes("mode=sender");

        if (isSender) {
            console.log(`[StreamerCord | Native] Stream Source Connected: ${id}`);
            senders.set(id, ws);
            ws.onmessage = msg => receivers.get(id)?.send(msg);
        } else {
            console.log(`[StreamerCord | Native] OBS Viewer Connected: ${id}`);
            receivers.set(id, ws);
            ws.onmessage = msg => senders.get(id)?.send(msg);
        }

        ws.onclose = () => {
            if (isSender) senders.delete(id);
            else receivers.delete(id);
        };
    });

    httpServer.listen(PORT, "127.0.0.1", () => console.log(`[StreamerCord | Native] Server running on port ${PORT}`));
}

export function stopWebServer() {
    if (httpServer) {
        httpServer.close();
        httpServer = null;
        senders.forEach(s => s.socket.destroy());
        receivers.forEach(r => r.socket.destroy());
        senders.clear();
        receivers.clear();
    }
}
