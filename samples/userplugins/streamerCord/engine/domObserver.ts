/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { handleNewVideoElement, handleRemovedVideoElement } from "./streamManager";

let observer: MutationObserver | null = null;

export function startDomScan() {
    if (observer) return;

    observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            // 1. Detect New Videos
            mutation.addedNodes.forEach(node => {
                if (node instanceof HTMLElement) {
                    if (node instanceof HTMLVideoElement) handleNewVideoElement(node);
                    else node.querySelectorAll("video").forEach(v => handleNewVideoElement(v));
                }
            });

            // 2. Detect Removed Videos (Cleanup)
            mutation.removedNodes.forEach(node => {
                if (node instanceof HTMLElement) {
                    if (node instanceof HTMLVideoElement) handleRemovedVideoElement(node);
                    else node.querySelectorAll("video").forEach(v => handleRemovedVideoElement(v));
                }
            });
        }
    });

    // Watch the whole app
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial Scan
    document.querySelectorAll("video").forEach(v => handleNewVideoElement(v));
    console.log("[StreamerCord | DOMObserver] Started watching for streams.");
}

export function stopDomScan() {
    observer?.disconnect();
    observer = null;
}
