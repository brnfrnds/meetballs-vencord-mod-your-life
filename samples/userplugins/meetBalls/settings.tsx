/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { getTheme, Theme } from "@utils/discord";
import { OptionType } from "@utils/types";
import { Forms, Parser, React, TextArea, useState } from "@webpack/common";

import { DISCORD_EVENT_CONFIG } from "./constants";

export const settings = definePluginSettings({
    channelId: {
        type: OptionType.STRING,
        description: "Channel ID where the MeetBalls buttons will be active (leave empty for all channels)",
        default: "",
        placeholder: "Your channel ID here"
    },
    messageTemplate: {
        type: OptionType.COMPONENT,
        description: "Message template for creating events. Use {topic}, {type}, and {description} as placeholders",
        default: "🎉 **New MeetBalls event!**\n**Topic:** {topic}\n**Type:** {type}\n**Description:** {description}",
        component: props => {
            const [template, setTemplate] = useState(props.option.default);
            const currentValue = template || props.option.default;
            const isDarkMode = getTheme() === Theme.Dark;

            // Example preview with placeholder values
            const previewText = currentValue
                .replace(/{topic}/g, "Downtown Tournament")
                .replace(/{type}/g, "Tournament")
                .replace(/{description}/g, "A fun meetballs tournament in the city center");

            return (
                <div style={{ marginTop: "8px" }}>
                    <TextArea
                        value={currentValue}
                        onChange={newValue => {
                            setTemplate(newValue);
                            props.setValue(newValue);
                        }}
                        placeholder=""
                        style={{
                            minHeight: "180px",
                            resize: "vertical",
                            fontFamily: "monospace",
                            fontSize: "12px"
                        }}
                    />

                    <Forms.FormTitle style={{ marginTop: "16px" }}>Preview</Forms.FormTitle>
                    <div style={{
                        padding: "12px",
                        backgroundColor: "var(--background-secondary)",
                        borderRadius: "4px",
                        border: "1px solid var(--background-tertiary)",
                        marginBottom: "12px",
                        lineHeight: "1.5",
                        color: isDarkMode ? "rgba(255, 255, 255, 0.95)" : "rgba(0, 0, 0, 0.9)"
                    }}>
                        {Parser.parse(previewText)}
                    </div>

                    <Forms.FormText style={{ fontSize: "12px" }}>
                        💡 Available placeholders: <code style={{ backgroundColor: "var(--background-secondary)", padding: "2px 4px", borderRadius: "3px" }}>{"{"}</code><code style={{ backgroundColor: "var(--background-secondary)", padding: "2px 4px", borderRadius: "3px" }}>topic{"}"}</code>, <code style={{ backgroundColor: "var(--background-secondary)", padding: "2px 4px", borderRadius: "3px" }}>{"{"}</code><code style={{ backgroundColor: "var(--background-secondary)", padding: "2px 4px", borderRadius: "3px" }}>type{"}"}</code>, <code style={{ backgroundColor: "var(--background-secondary)", padding: "2px 4px", borderRadius: "3px" }}>{"{"}</code><code style={{ backgroundColor: "var(--background-secondary)", padding: "2px 4px", borderRadius: "3px" }}>description{"}"}</code>
                    </Forms.FormText>
                </div>
            );
        }
    },
    eventNameFormat: {
        type: OptionType.STRING,
        description: "Discord event name format. Use {topic} as placeholder",
        default: "",
        placeholder: `Leave empty to use default: ${DISCORD_EVENT_CONFIG.nameFormat}`
    },
    eventDescriptionFormat: {
        type: OptionType.STRING,
        description: "Discord event description format. Use {type} and {description} as placeholders",
        default: "",
        placeholder: "Leave empty to use default"
    },
    eventStartHour: {
        type: OptionType.NUMBER,
        description: "Event start hour (0-23, 24-hour format)",
        default: -1,
        placeholder: `Leave empty to use default: ${DISCORD_EVENT_CONFIG.startHour}`
    },
    eventStartMinute: {
        type: OptionType.NUMBER,
        description: "Event start minute (0-59)",
        default: -1,
        placeholder: `Leave empty to use default: ${DISCORD_EVENT_CONFIG.startMinute}`
    },
    eventDurationHours: {
        type: OptionType.NUMBER,
        description: "Event duration in hours",
        default: -1,
        placeholder: `Leave empty to use default: ${DISCORD_EVENT_CONFIG.durationHours}`
    },
    eventLocation: {
        type: OptionType.STRING,
        description: "Discord event location metadata",
        default: "",
        placeholder: `Leave empty to use default: ${DISCORD_EVENT_CONFIG.location}`
    },
    eventCoverImageUrl: {
        type: OptionType.STRING,
        description: "Discord event cover image URL (must be exactly 800x320 pixels)",
        default: "",
        placeholder: "Leave empty to use default or disable cover image"
    },
    eventIdentifier: {
        type: OptionType.STRING,
        description: "Event identifier text to differentiate MeetBalls events from other events",
        default: "",
        placeholder: `Leave empty to use default: ${DISCORD_EVENT_CONFIG.eventIdentifier}`
    }
});
