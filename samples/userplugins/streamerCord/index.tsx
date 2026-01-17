/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ChatBarButton, ChatBarButtonFactory } from "@api/ChatButtons";
import ErrorBoundary from "@components/ErrorBoundary";
import { Heading } from "@components/Heading";
import { Devs } from "@utils/constants";
import { ModalContent, ModalRoot, ModalSize, openModal } from "@utils/modal";
import definePlugin, { StartAt } from "@utils/types";

import { stopAllBroadcasts } from "./engine/broadcaster";
import { startDomScan, stopDomScan } from "./engine/domObserver";
import { settings } from "./settings";
import { ScIconXS } from "./ui/uiUtils";
import { VCscPanel } from "./ui/vcPanel";

const Native = VencordNative.pluginHelpers.StreamerCord;

/**
 * Renders a debug button in the chat bar.
 * Only visible if we are in a chat and the user has enabled the test button in settings.
 */
const scButton: ChatBarButtonFactory = ({ isAnyChat }) => {
    if (!isAnyChat || !settings.store.showTestButton) return null;
    return (
        <ChatBarButton tooltip="StreamerCord Test" onClick={() => {
            openModal(props => (
                <ModalRoot {...props} size={ModalSize.DYNAMIC} role="dialog">
                    <ModalContent>
                        <div style={{ padding: "1em", display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Heading style={{ color: "white" }}>StreamerCord Test</Heading>
                            <p style={{ color: "white" }}>Plugin is active!</p>
                        </div>
                    </ModalContent>
                </ModalRoot>
            ));
        }}>
            <ScIconXS />
        </ChatBarButton>
    );
};

export default definePlugin({
    name: "StreamerCord",
    description: "Adds some streamer-related features to Discord.",
    authors: [Devs.zinixyt],
    // Render a basic chat input button for testing.

    startAt: StartAt.WebpackReady,
    chatBarButton: {
        icon: ScIconXS,
        render: scButton
    },
    settings,
    start() {
        // 1. Auto-start server if enabled
        console.log(`[StreamerCord | Main] Auto-Start is ${(settings.store.autoStartServer) ? "enabled" : "disabled"}.`);
        if (settings.store.autoStartServer) {
            Native.startWebServer(settings.store.serverPort);
            console.log("[StreamerCord | Main] Auto-starting web server.");
        }

        startDomScan();
    },

    stop() {
        console.log("[StreamerCord | Main] Shutting down, closing all pipes.");
        stopDomScan();
        stopAllBroadcasts();
        Native.stopWebServer();
    },

    patches: [
        {
            // Find the module responsible for the "Voice Connected" bottom tray
            find: "center-control-tray",
            replacement: {
                // Regex Breakdown:
                // 1. \i.eventPromptsContainer -> Anchor to the identifier above the tray
                // 2. \i.wrapper -> Finds the main container of the buttons
                // 3. children:\[ -> Stops right at the start of the children array
                match: /\i.eventPromptsContainer.*?ref:\i.*?\i.wrapper.*?children:\[/,
                // Injects the custom panel component ($self.VCscPanel)
                // into the children array alongside the existing controls.
                replace: "$&$self.VCscPanel(),"
            }
        }
    ],

    // Wraps the custom UI component in an ErrorBoundary.
    // This ensures that if the NDI panel crashes, it doesn't break the entire Voice Tray.
    VCscPanel: ErrorBoundary.wrap(VCscPanel, { noop: true })
});
