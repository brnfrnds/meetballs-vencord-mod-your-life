/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ChatBarButton, ChatBarButtonFactory } from "@api/ChatButtons";
import { Button } from "@components/Button";
import { insertTextIntoChatInputBox } from "@utils/discord";
import { ModalCloseButton, ModalContent, ModalHeader, ModalRoot, ModalSize,openModal } from "@utils/modal";
import definePlugin, { IconComponent } from "@utils/types";
import { TextInput, Tooltip } from "@webpack/common";
import { useState } from "@webpack/common/react";

const kaomojiData = [
    // --- The Classics (Essential for survival) ---
    { name: "The Shrug", content: "¯\\_(ツ)_/¯" },
    { name: "Table Flip", content: "(╯°□°）╯︵ ┻━┻" },
    { name: "Table Un-Flip", content: "┬─┬ノ( º _ ºノ)" },
    { name: "Disapproval", content: "ಠ_ಠ" },

    // --- The "Vibes" (For when words fail) ---
    { name: "Lenny", content: "( ͡° ͜ʖ ͡°)" },
    { name: "Magic/Sparkle", content: "(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧" },
    { name: "Cool/Sunglasses", content: "(•_•) ( •_•)>⌐■-■ (⌐■_■)" },
    { name: "Thinking/Sus", content: "( ͠° ͟ʖ ͡°)" },

    // --- Aggressive / Action ---
    { name: "Square Up", content: "(ง'̀-'́)ง" },
    { name: "Gun", content: "( ▀ ͜͞ʖ▀) =ε/̵͇̿/’̿’̿ ̿ ̿̿ ̿̿ ̿" },
    { name: "Riot", content: "୧༼ಠ益ಠ༽୨" },

    // --- Cute / Wholesome ---
    { name: "Flower Girl", content: "(◕‿◕✿)" },
    { name: "Blushing", content: "(⁄ ⁄•⁄ω⁄•⁄ ⁄)" },
    { name: "Bear", content: "ʕ•ᴥ•ʔ" },
    { name: "Cat", content: "(=^･ω･^=)" },

    // --- The "I'm Done" Collection ---
    { name: "Dead", content: "(x_x)" },
    { name: "Crying", content: "(qwq )" },
    { name: "Giving Energy", content: "༼ つ ◕_◕ ༽つ" }
];

export const KmIcon: IconComponent = ({ height = 20, width = 20, className }) => {
    return (
        <svg
            role="img"
            width={width}
            height={height}
            className={className}
            viewBox="0 0 24 24"
        >
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
        </svg>
    );
};

const KmModal = ({ onClose, transitionState }: { onClose: () => void, transitionState: any }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const filtered = kaomojiData.filter(k =>
        k.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ModalRoot transitionState={transitionState} size={ModalSize.MEDIUM}>
            <ModalHeader separator={false}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <h2 style={{ color: "white", fontWeight: "bold", margin: 0 }}>
                        Kaomoji Board
                    </h2>
                    <ModalCloseButton onClick={onClose} />
                </div>
            </ModalHeader>

            <ModalContent style={{ paddingBottom: "16px" }}>
                <TextInput
                    placeholder="Search emotions..."
                    autoFocus={true}
                    value={searchTerm}
                    onChange={setSearchTerm}
                    style={{ marginBottom: "16px" }}
                />

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "8px",
                }}>
                    {filtered.map(k => (
                        <Tooltip text={k.name} key={k.name}>
                            {(props: any) => (
                                <Button
                                    {...props}
                                    color="primary"
                                    variant="filled"
                                    size="small"
                                    onClick={() => {
                                        insertTextIntoChatInputBox(k.content);
                                        onClose();
                                    }}
                                >
                                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {k.content}
                                    </span>
                                </Button>
                            )}
                        </Tooltip>
                    ))}
                    {filtered.length === 0 && (
                        <div style={{ gridColumn: "span 3", textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>
                            No vibes found ¯\\_(ツ)_/¯
                        </div>
                    )}
                </div>
            </ModalContent>
        </ModalRoot>
    );
};

const KmButton: ChatBarButtonFactory = ({ isMainChat }) => {
    if (!isMainChat) return null;

    return (
        <ChatBarButton
            tooltip="Kaomoji Board"
            onClick={() => openModal(props => <KmModal {...props} />)}
        >
            <KmIcon />
        </ChatBarButton>
    );
};

export default definePlugin({
    name: "MB-Kaomoji",
    description: "The very cool Kaomoji board from the MeetBalls Session",
    authors: [{ name: "Zinix", id: 495542786263613452n }],
    chatBarButton: {
        icon: KmIcon,
        render: KmButton
    }
});
