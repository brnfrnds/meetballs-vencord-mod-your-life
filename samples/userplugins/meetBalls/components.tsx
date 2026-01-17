/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { insertTextIntoChatInputBox } from "@utils/discord";
import { Margins } from "@utils/margins";
import { ModalCloseButton, ModalContent, ModalHeader, ModalProps, ModalRoot } from "@utils/modal";
import { Button, Forms, React, Select, TextArea, TextInput, Toasts, useState } from "@webpack/common";

import { MEET_TYPES, STRINGS } from "./constants";
import { settings } from "./settings";
import { createDiscordEvent, formatDate, formatMessage, getNextDiscordEvent, getNextWednesday } from "./utils";

export function CreateMeetModal({ close, ...props }: ModalProps & { close: () => void }) {
    const [topic, setTopic] = useState("");
    const [meetType, setMeetType] = useState<string>("casual");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { messageTemplate } = settings.use(["messageTemplate"]);

    const handleCreateMeet = async () => {
        setIsLoading(true);
        try {
            const meetTypeLabel = MEET_TYPES.find(t => t.value === meetType)?.label || meetType;
            const message = formatMessage(messageTemplate, topic, meetTypeLabel, description);

            // Insert the message first
            insertTextIntoChatInputBox(message + " ");
            Toasts.show({
                message: STRINGS.toastMessageSent,
                type: Toasts.Type.SUCCESS,
                id: "meetballs-message-sent"
            });

            // Try to create the Discord event
            const nextWednesday = getNextWednesday();
            try {
                await createDiscordEvent(topic, meetTypeLabel, description, nextWednesday);
            } catch (error) {
                // Toast is shown in createDiscordEvent function
            }

            close();
        } finally {
            setIsLoading(false);
        }
    };

    const isValid = topic.trim() && description.trim() && !isLoading;

    return (
        <ModalRoot {...props}>
            <ModalHeader className="vc-meetup-modal-header">
                <Forms.FormTitle tag="h2">{STRINGS.createEventTitle}</Forms.FormTitle>
                <ModalCloseButton onClick={close} />
            </ModalHeader>

            <ModalContent className="vc-meetup-modal-content">
                <div style={{ padding: "0" }}>
                    <Forms.FormTitle>{STRINGS.topicLabel}</Forms.FormTitle>
                    <TextInput
                        placeholder={STRINGS.topicPlaceholder}
                        value={topic}
                        onChange={setTopic}
                        style={{ marginBottom: "16px" }}
                    />

                    <Forms.FormTitle className={Margins.top20}>{STRINGS.typeLabel}</Forms.FormTitle>
                    <div style={{ marginBottom: "16px" }}>
                        <Select
                            options={MEET_TYPES}
                            isSelected={v => v === meetType}
                            select={v => setMeetType(v)}
                            serialize={v => v}
                        />
                    </div>

                    <Forms.FormTitle className={Margins.top20}>{STRINGS.descriptionLabel}</Forms.FormTitle>
                    <TextArea
                        placeholder={STRINGS.descriptionPlaceholder}
                        value={description}
                        onChange={setDescription}
                        style={{
                            marginBottom: "16px",
                            minHeight: "100px",
                            resize: "vertical"
                        }}
                    />
                </div>
            </ModalContent>

            <div style={{ padding: "16px", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <Button color="brand" onClick={handleCreateMeet} disabled={!isValid}>
                    {STRINGS.sendEventButton}
                </Button>
                <Button color="primary" onClick={close}>
                    {STRINGS.cancelButton}
                </Button>
            </div>
        </ModalRoot>
    );
}

export function NextMeetupModal({ close, ...props }: ModalProps & { close: () => void }) {
    // Try to get the next Discord event, fallback to calculated next Wednesday
    const discordEvent = getNextDiscordEvent();
    const displayDate = discordEvent
        ? new Date(discordEvent.scheduled_start_time)
        : getNextWednesday();
    const topicText = discordEvent?.name?.replace(/^🎉\s*/, "") || STRINGS.noTopicAssigned;

    const isDarkMode = true;

    // Show toast if no scheduled event found
    React.useEffect(() => {
        if (!discordEvent) {
            Toasts.show({
                message: STRINGS.toastNoMeetupFound,
                type: Toasts.Type.MESSAGE,
                id: "meetballs-no-event"
            });
        }
    }, [discordEvent]);

    return (
        <ModalRoot {...props}>
            <ModalHeader className="vc-meetup-modal-header" justify="between" align="center">
                <Forms.FormTitle tag="h2" style={{ margin: 0 }}>{STRINGS.nextMeetupTitle}</Forms.FormTitle>
                <ModalCloseButton onClick={close} />
            </ModalHeader>

            <ModalContent className="vc-meetup-modal-content">
                <div style={{
                    position: "relative",
                    padding: "24px",
                    borderRadius: "12px",
                    overflow: "hidden",
                    background: isDarkMode
                        ? "linear-gradient(135deg, rgba(88, 101, 242, 0.1) 0%, rgba(88, 101, 242, 0.05) 100%)"
                        : "linear-gradient(135deg, rgba(88, 101, 242, 0.15) 0%, rgba(88, 101, 242, 0.08) 100%)",
                    border: `2px solid ${isDarkMode ? "rgba(88, 101, 242, 0.3)" : "rgba(88, 101, 242, 0.4)"}`,
                    boxShadow: isDarkMode
                        ? "0 8px 32px rgba(88, 101, 242, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                        : "0 8px 32px rgba(88, 101, 242, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)"
                }}>
                    {/* Tech grid background pattern */}
                    <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `
                            repeating-linear-gradient(
                                0deg,
                                ${isDarkMode ? "rgba(88, 101, 242, 0.03)" : "rgba(88, 101, 242, 0.05)"} 0px,
                                ${isDarkMode ? "rgba(88, 101, 242, 0.03)" : "rgba(88, 101, 242, 0.05)"} 1px,
                                transparent 1px,
                                transparent 40px
                            ),
                            repeating-linear-gradient(
                                90deg,
                                ${isDarkMode ? "rgba(88, 101, 242, 0.03)" : "rgba(88, 101, 242, 0.05)"} 0px,
                                ${isDarkMode ? "rgba(88, 101, 242, 0.03)" : "rgba(88, 101, 242, 0.05)"} 1px,
                                transparent 1px,
                                transparent 40px
                            )
                        `,
                        pointerEvents: "none",
                        borderRadius: "12px"
                    }} />

                    {/* Content */}
                    <div style={{ position: "relative", zIndex: 1 }}>
                        {/* Status Badge */}
                        <div style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            backgroundColor: isDarkMode
                                ? "rgba(88, 101, 242, 0.25)"
                                : "rgba(88, 101, 242, 0.2)",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "600",
                            letterSpacing: "0.5px",
                            color: isDarkMode ? "rgba(88, 101, 242, 1)" : "rgba(88, 101, 242, 0.95)",
                            marginBottom: "16px",
                            textTransform: "uppercase"
                        }}>
                            {discordEvent ? STRINGS.scheduledEvent : STRINGS.regularSchedule}
                        </div>

                        {/* Topic (Primary) */}
                        <div style={{ marginBottom: "20px" }}>
                            <Forms.FormText style={{
                                fontSize: "12px",
                                fontWeight: "600",
                                color: isDarkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)",
                                marginBottom: "6px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px"
                            }}>
                                {STRINGS.nextMeetupTopic}
                            </Forms.FormText>
                            <Forms.FormTitle style={{
                                fontSize: "28px",
                                fontWeight: "700",
                                color: isDarkMode ? "rgba(255, 255, 255, 0.95)" : "rgba(0, 0, 0, 0.9)",
                                margin: "0",
                                wordBreak: "break-word"
                            }}>
                                {topicText}
                            </Forms.FormTitle>
                        </div>

                        {/* Date */}
                        <div style={{ marginBottom: "16px" }}>
                            <Forms.FormText style={{
                                fontSize: "12px",
                                fontWeight: "600",
                                color: isDarkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)",
                                marginBottom: "6px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px"
                            }}>
                                {STRINGS.nextMeetupDate}
                            </Forms.FormText>
                            <Forms.FormText style={{
                                fontSize: "16px",
                                fontWeight: "500",
                                color: isDarkMode ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.8)",
                                margin: "0"
                            }}>
                                📅 {formatDate(displayDate)}
                            </Forms.FormText>
                        </div>

                        {/* Type (if Discord event) */}
                        {discordEvent && (
                            <div style={{ marginBottom: "16px" }}>
                                <Forms.FormText style={{
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    color: isDarkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)",
                                    marginBottom: "6px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px"
                                }}>
                                    {STRINGS.nextMeetupType}
                                </Forms.FormText>
                                {discordEvent.description && (
                                    <Forms.FormText style={{
                                        fontSize: "13px",
                                        color: isDarkMode ? "rgba(255, 255, 255, 0.75)" : "rgba(0, 0, 0, 0.7)",
                                        margin: "0",
                                        whiteSpace: "pre-wrap",
                                        lineHeight: "1.4"
                                    }}>
                                        {discordEvent.description}
                                    </Forms.FormText>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <style>{`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.8; transform: scale(1.1); }
                    }
                `}</style>
            </ModalContent>
        </ModalRoot>
    );
}
