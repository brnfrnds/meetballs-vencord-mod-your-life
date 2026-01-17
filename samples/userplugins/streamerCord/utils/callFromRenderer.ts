/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export function consoleLogFromRenderer(message: string, caller?: string) {
    console.log(`[StreamerCord | ${caller || "Somewhere"}] ${message}`);
}
