/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { IconComponent } from "@utils/types";

export const ScIconXS: IconComponent = ({ height = 20, width = 20, className }) => (
    <svg height={height} width={width} viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        {/* A bold, blocky 'NDI' designed for small sizes */}
        <path fillRule="evenodd" d="m9.387 20-.666 2H6.613l3.286-9.859a3 3 0 1 1 4.202 0L17.387 22H15.28l-.666-2zm1.334-4-.667 2h3.892l-.667-2zm.666-2h1.226l-.338-1.012a3 3 0 0 1-.55 0zM12 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2m8.109-8.433A10.96 10.96 0 0 1 23 10a10.96 10.96 0 0 1-2.891 7.433l-1.475-1.351A8.97 8.97 0 0 0 21 10c0-2.345-.897-4.48-2.366-6.082zM17.16 5.27A6.98 6.98 0 0 1 19 10a6.98 6.98 0 0 1-1.84 4.73l-1.474-1.351A4.98 4.98 0 0 0 17 10a4.98 4.98 0 0 0-1.314-3.379zM3.891 2.567l1.475 1.351A8.97 8.97 0 0 0 3 10c0 2.344.897 4.48 2.366 6.081L3.89 17.433A10.96 10.96 0 0 1 1 10a10.96 10.96 0 0 1 2.891-7.433M6.84 5.27l1.474 1.35A4.98 4.98 0 0 0 7 10c0 1.302.498 2.488 1.314 3.378L6.84 14.73A6.98 6.98 0 0 1 5 10a6.97 6.97 0 0 1 1.84-4.73" />
    </svg>
);

export const ScIconL: IconComponent = ({ height = 128, width = 128, className }) => (
    <svg height={height} width={width} viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        {/* Combined path for Headphones and Broadcast Signal */}
        <path fillRule="evenodd" d="m9.387 20-.666 2H6.613l3.286-9.859a3 3 0 1 1 4.202 0L17.387 22H15.28l-.666-2zm1.334-4-.667 2h3.892l-.667-2zm.666-2h1.226l-.338-1.012a3 3 0 0 1-.55 0zM12 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2m8.109-8.433A10.96 10.96 0 0 1 23 10a10.96 10.96 0 0 1-2.891 7.433l-1.475-1.351A8.97 8.97 0 0 0 21 10c0-2.345-.897-4.48-2.366-6.082zM17.16 5.27A6.98 6.98 0 0 1 19 10a6.98 6.98 0 0 1-1.84 4.73l-1.474-1.351A4.98 4.98 0 0 0 17 10a4.98 4.98 0 0 0-1.314-3.379zM3.891 2.567l1.475 1.351A8.97 8.97 0 0 0 3 10c0 2.344.897 4.48 2.366 6.081L3.89 17.433A10.96 10.96 0 0 1 1 10a10.96 10.96 0 0 1 2.891-7.433M6.84 5.27l1.474 1.35A4.98 4.98 0 0 0 7 10c0 1.302.498 2.488 1.314 3.378L6.84 14.73A6.98 6.98 0 0 1 5 10a6.97 6.97 0 0 1 1.84-4.73" />
    </svg>
);
