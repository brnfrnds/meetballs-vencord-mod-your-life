/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ChatBarButton, ChatBarButtonFactory } from "@api/ChatButtons";
import { closeModal, openModal } from "@utils/modal";
import definePlugin from "@utils/types";

import { CreateMeetModal, NextMeetupModal } from "./components";
import { ClockIcon, MeetupIcon } from "./icons";
import { settings } from "./settings";

const MeetupButtons: ChatBarButtonFactory = ({ isMainChat, channel }) => {
    const { channelId } = settings.use(["channelId"]);

    // Only show buttons in main chat and if no channel ID is set or if it matches the current channel
    if (!isMainChat) return null;
    if (channelId && channel.id !== channelId) return null;

    return (
        <>
            <ChatBarButton
                tooltip="Create MeetBalls Event"
                onClick={() => {
                    const key = openModal(props => (
                        <CreateMeetModal
                            {...props}
                            close={() => closeModal(key)}
                        />
                    ));
                }}
                buttonProps={{ "aria-haspopup": "dialog" }}
            >
                <MeetupIcon />
            </ChatBarButton>

            <ChatBarButton
                tooltip="View Next Meetup"
                onClick={() => {
                    const key = openModal(props => (
                        <NextMeetupModal
                            {...props}
                            close={() => closeModal(key)}
                        />
                    ));
                }}
                buttonProps={{ "aria-haspopup": "dialog" }}
            >
                <ClockIcon />
            </ChatBarButton>
        </>
    );
};

export default definePlugin({
    name: "MeetBallCord",
    description: "Create and announce MeetBalls events. Automatically calculates next meetup day (Wednesdays)!",
    authors: [{ name: "Bruno Fernandes", id: 495542786263613452n }],
    settings,

    chatBarButton: {
        icon: MeetupIcon,
        render: MeetupButtons
    }
});
