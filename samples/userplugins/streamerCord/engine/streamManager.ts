/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { settings } from "@plugins/streamerCord/settings";

import { broadcastStream, stopBroadcast } from "./broadcaster";

const activeMediaStreams = new Map<string, MediaStream>();
const capturedElements = new WeakSet<HTMLVideoElement>();

export function handleNewVideoElement(video: HTMLVideoElement) {
    if (capturedElements.has(video)) return;
    capturedElements.add(video);

    // 1. FILTER: Ignore the initial 0x0 / spinner videos immediately
    // If it's ready right now, grab it. If not, wait for 'playing'.
    if (isValidVideo(video)) {
        startCapture(video);
    } else {
        // Wait for the video to actually start rendering frames
        const onPlaying = () => {
            video.removeEventListener("playing", onPlaying);
            if (isValidVideo(video)) startCapture(video);
        };
        video.addEventListener("playing", onPlaying);

        // Backup: sometimes 'playing' doesn't fire if it's already buffering
        // Check again in 500ms
        setTimeout(() => {
            if (isValidVideo(video)) startCapture(video);
        }, 500);
    }
}

// Helper: Defines what a "Real" video looks like
function isValidVideo(video: HTMLVideoElement): boolean {
    if (!video.isConnected) return false; // Must be in DOM
    if (video.videoWidth < 50 || video.videoHeight < 50) return false; // Must not be icon/spinner
    if (video.readyState < 2) return false; // Must have data
    return true;
}

function startCapture(video: HTMLVideoElement) {
    // 2. IDENTIFICATION
    const tile = video.closest("[data-selenium-video-tile]");
    let username = "Unknown";
    let userId = "";

    if (tile) {
        userId = tile.getAttribute("data-selenium-video-tile") || "";
        const focusTarget = tile.querySelector("[aria-label^='Call tile']");
        if (focusTarget) {
            const label = focusTarget.getAttribute("aria-label") || "";
            const parts = label.split(",");
            if (parts.length > 0) {
                username = parts[parts.length - 1].replace(/\.$/, "").trim();
            }
        }
    }

    if (!userId) userId = Math.random().toString(36).substring(7);

    // Clean ID
    const safeName = username !== "Unknown" ? username.replace(/[^a-zA-Z0-9_-]/g, "") : `User_${userId}`;
    const streamId = safeName;
    const port = settings.store.serverPort || 4455;

    // Prevent double-capture of the exact same ID if it's already active
    if (activeMediaStreams.has(streamId)) {
        // Discord is replacing the video. We let the OLD one die via track.onended
        // and just update the reference, OR we force kill the old one.
        // Let's force kill to be safe.
        // stopBroadcast(`${streamId}_video`); // Broadcaster handles this now
    }

    console.log(`[StreamerCord | StreamManager] Locking onto ${username} (ID: ${userId})`);

    // 3. CAPTURE
    let stream: MediaStream;
    try {
        // @ts-ignore
        stream = video.captureStream();
    } catch (e) {
        // @ts-ignore
        stream = video.mozCaptureStream ? video.mozCaptureStream() : null;
    }

    if (!stream) return;

    activeMediaStreams.set(streamId, stream);

    // 4. BROADCAST
    stream.getTracks().forEach(track => {
        const finalId = `${streamId}_${track.kind}`;

        track.onended = () => {
            console.log(`[StreamerCord | StreamManager] Video element destroyed: ${finalId}`);
            activeMediaStreams.delete(streamId);
            stopBroadcast(finalId);

            // Re-scan immediately to catch the replacement video
            setTimeout(forceRescan, 100);
        };

        broadcastStream(track, finalId, port);
    });
}

function forceRescan() {
    document.querySelectorAll("video").forEach(v => {
        if (!capturedElements.has(v)) handleNewVideoElement(v);
    });
}

export function handleRemovedVideoElement(video: HTMLVideoElement) {
    // We rely on track.onended
}
