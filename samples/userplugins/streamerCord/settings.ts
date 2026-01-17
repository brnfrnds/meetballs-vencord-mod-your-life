/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

import { SCConfig } from "./settingsPanel";

export const optionDefs = {
    // --- Server Settings ---
    serverPort: {
        label: "Web Server Port",
        type: OptionType.NUMBER,
        description: "The local port for OBS to connect to (Default: 4458). Restart required.",
        default: 4458,
        min: 1024,
        max: 65535
    },
    autoStartServer: {
        label: "Auto-Start Server",
        type: OptionType.BOOLEAN,
        description: "Automatically start the streaming server when Discord launches.",
        default: true
    },

    // --- Stream Settings ---
    videoBitrate: {
        label: "Target Video Bitrate (Mbps)",
        type: OptionType.SLIDER,
        description: "Higher = Better Quality but more Network/CPU usage.",
        default: 6,
        markers: [2, 6, 12, 20, 50],
        min: 1,
        max: 50,
        step: 1
    },
    forceKeyframeInterval: {
        label: "Keyframe Interval (Seconds)",
        type: OptionType.SLIDER,
        description: "How often to send a full frame. Lower = Faster recovery in OBS but slightly lower quality.",
        default: 2,
        markers: [1, 2, 5, 10],
        min: 1,
        max: 10
    },

    // --- UI & UX ---
    showStreamInfoOverlay: {
        label: "Show Stream Info Overlay",
        type: OptionType.BOOLEAN,
        description: "Displays a small overlay on stream tiles showing their OBS Link status.",
        default: true
    },
    copyTemplate: {
        label: "OBS Link Template",
        type: OptionType.SELECT,
        description: "Format for copying links to clipboard.",
        options: [
            { label: "Standard URL (http://...)", value: "url", default: true },
            { label: "VDO.ninja Style", value: "vdo" },
            { label: "Browser Source JSON (Advanced)", value: "json" }
        ]
    },

    // --- Debugging ---
    debugLogging: {
        label: "Debug Logging",
        type: OptionType.BOOLEAN,
        description: "Log WebRTC signaling events to the console (Ctrl+Shift+I).",
        default: false
    },

    // --- Advanced ---
    showTestButton: {
        label: "Show Test Button",
        type: OptionType.BOOLEAN,
        description: "Show a test button in chat to verify the plugin is active.",
        default: false
    }
} as const;

export const settings = definePluginSettings({
    config: {
        type: OptionType.COMPONENT,
        component: SCConfig
    }
}).withPrivateSettings<{
    serverPort?: number;
    autoStartServer?: boolean;
    videoBitrate?: number;
    forceKeyframeInterval?: number;
    showStreamInfoOverlay?: boolean;
    copyTemplate?: string;
    debugLogging?: boolean;
    showTestButton?: boolean;
}>();
