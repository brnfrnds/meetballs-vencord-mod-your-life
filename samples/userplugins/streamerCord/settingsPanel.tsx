/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Button } from "@components/Button";
import ErrorBoundary from "@components/ErrorBoundary";
import { Heading } from "@components/Heading";
import { Paragraph } from "@components/Paragraph";
import { OptionComponentMap } from "@components/settings/tabs/plugins/components";
import { cl as globalCl } from "@components/settings/tabs/plugins/components/Common";
import { classes } from "@utils/misc";
import { React, Toasts, useState } from "@webpack/common";

const Native = VencordNative.pluginHelpers.StreamerCord;

import { optionDefs, settings } from "./settings";

const categories = [
    {
        id: "server",
        label: "Server",
        keys: ["serverPort", "autoStartServer"]
    },
    {
        id: "quality",
        label: "Quality",
        keys: ["videoBitrate", "forceKeyframeInterval"]
    },
    {
        id: "interface",
        label: "Interface",
        keys: ["showStreamInfoOverlay", "copyTemplate"]
    },
    {
        id: "advanced",
        label: "Advanced",
        keys: ["debugLogging", "showTestButton"]
    }
];

export function SCConfig() {
    const [active, setActive] = useState(categories[0].id);
    const s = settings.use();

    // Helper to restart server if port changes
    const handleServerToggle = async () => {
        try {
            // We can add a toast or visual indicator here later
            Native.stopWebServer();
            Native.startWebServer();
            Toasts.show({ id: "server-restart", message: "Server Restarted!", type: Toasts.Type.SUCCESS });
        } catch (e) {
            console.error(e);
        }
    };

    const renderSetting = (key: string) => {
        const def = optionDefs[key as keyof typeof optionDefs];
        if (!def) return null;

        const OptionComp = OptionComponentMap[def.type];
        if (!OptionComp) return null;

        return (
            <OptionComp
                key={key}
                option={def}
                id={key}
                pluginSettings={settings.store as any}
                definedSettings={settings}
                onChange={(v: any) => settings.store[key] = v}
            />
        );
    };

    const activeCategory = categories.find(c => c.id === active) ?? categories[0];
    const categoryKeys = activeCategory.keys.filter(k => k in optionDefs);

    const rootStyle = {
        display: "flex",
        flexDirection: "column" as const,
        gap: "1rem",
        "--header-primary": "#fff"
    } as any;

    return (
        <ErrorBoundary>
            <div style={rootStyle}>
                {/* Server Status Header */}
                <div style={{ background: "var(--background-secondary)", padding: "10px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <Heading tag="h3" style={{ margin: 0 }}>WebRTC Server</Heading>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.85em" }}>
                            OBS Link: <code style={{ userSelect: "text" }}>http://localhost:{s.serverPort || 4455}</code>
                        </span>
                    </div>
                    <Button
                        onClick={handleServerToggle}
                    >
                        Restart Server
                    </Button>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", width: "100%", gap: ".5rem", alignItems: "center", overflowX: "auto", borderBottom: "1px solid var(--background-modifier-accent)" }}>
                    {categories.map(cat => (
                        <Button
                            key={cat.id}
                            onClick={() => setActive(cat.id)}
                            className={classes(globalCl("section"), active === cat.id && "vc-active-category")}
                            style={active === cat.id
                                ? { flex: 1, minWidth: 0, borderBottom: "2px solid var(--interactive-active)", color: "var(--interactive-active)", borderRadius: 0 } as any
                                : { flex: 1, minWidth: 0, color: "var(--interactive-normal)", borderRadius: 0 }}
                        >
                            {cat.label}
                        </Button>
                    ))}
                </div>

                {/* Content */}
                <div>
                    <Heading tag="h3" style={{ marginBottom: 10 }}>{activeCategory.label}</Heading>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {categoryKeys.length === 0 && (
                            <Paragraph>No options available.</Paragraph>
                        )}
                        {categoryKeys.map(k => renderSetting(k))}
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}
export default SCConfig;
