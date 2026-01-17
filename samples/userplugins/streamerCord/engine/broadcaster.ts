/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

// Map to track active streams
const activeBroadcasts = new Map<string, { pc: RTCPeerConnection, ws: WebSocket; }>();

export async function broadcastStream(track: MediaStreamTrack, streamId: string, port: number = 4458) {
    // If we are already broadcasting this ID, stop the old one first to prevent collisions
    if (activeBroadcasts.has(streamId)) {
        console.log(`[StreamerCord | Broadcaster] Restarting stream: ${streamId}`);
        stopBroadcast(streamId);
    }

    console.log(`[StreamerCord | Broadcaster] Starting stream: ${streamId}`);
    const ws = new WebSocket(`ws://127.0.0.1:${port}/${streamId}?mode=sender`);
    const pc = new RTCPeerConnection();

    activeBroadcasts.set(streamId, { pc, ws });

    const stream = new MediaStream([track]);
    pc.addTrack(track, stream);

    // FIX: Check readiness before sending to avoid "CLOSING" errors
    pc.onicecandidate = e => {
        if (e.candidate && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ candidate: e.candidate }));
        }
    };

    ws.onmessage = async msg => {
        try {
            const data = JSON.parse(msg.data);
            if (data.sdp) await pc.setRemoteDescription(data.sdp);
            else if (data.candidate) await pc.addIceCandidate(data.candidate);
        } catch (e) {
            console.error(e);
        }
    };

    ws.onopen = async () => {
        if (pc.signalingState === "closed") return;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ sdp: offer }));
        }
    };

    // Cleanup logic
    const cleanup = () => stopBroadcast(streamId);

    // If the track ends (Discord destroys the video tile), clean up
    track.onended = cleanup;
    ws.onclose = cleanup;
    ws.onerror = e => {
        console.warn(`[StreamerCord | Broadcaster] WS Error for ${streamId}`, e);
        cleanup();
    };
}

export function stopBroadcast(streamId: string) {
    const session = activeBroadcasts.get(streamId);
    if (session) {
        // Remove from map IMMEDIATELY so new streams can start with same ID
        activeBroadcasts.delete(streamId);

        try {
            session.pc.close();
            // Force close code 1000 (Normal Closure)
            if (session.ws.readyState === WebSocket.OPEN) session.ws.close(1000);
        } catch (e) { /* ignore cleanup errors */ }

        console.log(`[StreamerCord | Broadcaster] Stopped stream: ${streamId}`);
    }
}

export function stopAllBroadcasts() {
    activeBroadcasts.forEach((_, id) => stopBroadcast(id));
}
