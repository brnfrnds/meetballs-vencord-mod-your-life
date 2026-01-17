/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./styles.css";

import { Button } from "@components/Button";
import { ModalContent, ModalRoot, ModalSize, openModal } from "@utils/modal";

import { ScIconL } from "./uiUtils";

export function VCscPanel() {
    return (
        <div className="vc-panel-container">
            <div className="vc-icon-wrapper" onClick={() => {
                openModal(props => (
                    <ModalRoot {...props} size={ModalSize.DYNAMIC} role="dialog">
                        <ModalContent>
                            <Button onClick={() => {
                                console.log("[StreamerCord] Starting Test Stream");
                            }}>Start StreamerCord Test Stream</Button>
                        </ModalContent>
                    </ModalRoot>
                ));
            }}>
                <ScIconL width={24} height={24} />
            </div>
        </div>
    );
}
