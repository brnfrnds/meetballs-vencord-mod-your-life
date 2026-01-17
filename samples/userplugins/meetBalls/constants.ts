/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

// UI Text Strings - All user-facing text in one place for easy localization
export const STRINGS = {
    // Modal Headers
    createEventTitle: "Create MeetBalls Event",
    nextMeetupTitle: "Next Meetup",

    // Form Labels
    topicLabel: "Topic",
    typeLabel: "Type of Meet",
    descriptionLabel: "Description",

    // Form Placeholders
    topicPlaceholder: "e.g., Lang-Chain, Docker setup party...",
    descriptionPlaceholder: "Add more details about the event...",

    // Buttons
    sendEventButton: "Submit Event",
    cancelButton: "Cancel",

    // Next Meetup Modal
    nextMeetupDate: "Date",
    nextMeetupTopic: "Topic",
    nextMeetupType: "Type",
    noTopicAssigned: "No topic assigned",
    scheduledEvent: "Scheduled Event",
    regularSchedule: "Regular Schedule",

    // Console/Error Messages
    discordEventCreatedSuccess: "Discord event created successfully",
    discordEventCreatedFailed: "Failed to create Discord event",
    discordEventNoGuild: "No guild selected",

    // Toast Messages
    toastEventCreatedSuccess: "✅ Event created successfully!",
    toastEventCreatedFailed: "❌ Failed to create Discord event",
    toastMessageSent: "✅ Event Created!",
    toastNoMeetupFound: "ℹ️ No MeetBalls event scheduled yet",

    // Event Metadata
    eventLocationDefault: "Virtual Meetup",
};

// Types of meetup
export const MEET_TYPES = [
    { label: "InfoSec", value: "infosec" },
    { label: "Funny Challenge", value: "dumbchallenge" },
    { label: "Guest Presentation", value: "guest" },
    { label: "Free Day", value: "freeday" },
    { label: "Round Table Discussion", value: "other" },
    { label: "Other", value: "other" },
];

// Portuguese national holidays 2026 (dates to exclude for Wednesday meetups)
export const PORTUGUESE_HOLIDAYS = [
    new Date(2026, 0, 1), // New Year
    new Date(2026, 2, 17), // Mardi Gras
    new Date(2026, 3, 3), // Good Friday
    new Date(2026, 3, 5), // Easter Sunday
    new Date(2026, 3, 25), // Freedom Day
    new Date(2026, 4, 1), // Labour Day
    new Date(2026, 5, 10), // Portugal Day
    new Date(2026, 7, 15), // Assumption
    new Date(2026, 9, 5), // Republic Day
    new Date(2026, 10, 1), // All Saints' Day
    new Date(2026, 10, 30), // All Souls' Day
    new Date(2026, 11, 1), // Immaculate Conception
    new Date(2026, 11, 25), // Christmas
];

// Discord Event Configuration
export const DISCORD_EVENT_CONFIG = {
    // Event identifier to differentiate MeetBalls events from other events
    eventIdentifier: "🎯 MeetBalls Event",

    // Event name format (topic will be inserted)
    nameFormat: "🎉 {topic}",

    // Event description format (type and description will be inserted)
    descriptionFormat: "**Type:** {type}\n\n{description}",

    // Event start time (24-hour format)
    startHour: 19, // 6 PM
    startMinute: 0,

    // Event duration in hours
    durationHours: 2,

    // Privacy level: GUILD_ONLY = 2
    privacyLevel: 2,

    // Entity type: EXTERNAL = 3 (allows custom times without voice channel)
    entityType: 3,

    // Event location metadata
    location: "IKEA Food Court - MarShopping Loulé",

    // Cover image (must be 800x320px)
    // Set to null/empty string to disable cover image
    coverImageUrl: "",
};
