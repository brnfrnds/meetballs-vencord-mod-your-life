/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { GuildScheduledEventStore, RestAPI, SelectedGuildStore, Toasts } from "@webpack/common";

import { DISCORD_EVENT_CONFIG, PORTUGUESE_HOLIDAYS, STRINGS } from "./constants";
import { settings } from "./settings";

/**
 * Get Discord event config value with settings fallback
 */
export function getEventConfig() {
    const { eventNameFormat, eventDescriptionFormat, eventStartHour, eventStartMinute, eventDurationHours, eventLocation, eventCoverImageUrl, eventIdentifier } = settings.store;

    return {
        eventIdentifier: eventIdentifier || DISCORD_EVENT_CONFIG.eventIdentifier,
        nameFormat: eventNameFormat || DISCORD_EVENT_CONFIG.nameFormat,
        descriptionFormat: eventDescriptionFormat || DISCORD_EVENT_CONFIG.descriptionFormat,
        startHour: eventStartHour >= 0 ? eventStartHour : DISCORD_EVENT_CONFIG.startHour,
        startMinute: eventStartMinute >= 0 ? eventStartMinute : DISCORD_EVENT_CONFIG.startMinute,
        durationHours: eventDurationHours >= 0 ? eventDurationHours : DISCORD_EVENT_CONFIG.durationHours,
        location: eventLocation || DISCORD_EVENT_CONFIG.location,
        coverImageUrl: eventCoverImageUrl || DISCORD_EVENT_CONFIG.coverImageUrl,
        privacyLevel: DISCORD_EVENT_CONFIG.privacyLevel,
        entityType: DISCORD_EVENT_CONFIG.entityType,
    };
}

/**
 * Calculate the next Wednesday, excluding Portuguese national holidays
 */
export function getNextWednesday(): Date {
    const config = getEventConfig();
    const today = new Date();
    const currentDay = today.getDay();
    let daysUntilWednesday = (3 - currentDay + 7) % 7;
    if (daysUntilWednesday === 0) daysUntilWednesday = 7; // If today is Wednesday, get next Wednesday

    const nextWednesday = new Date(today);
    nextWednesday.setDate(nextWednesday.getDate() + daysUntilWednesday);
    nextWednesday.setHours(config.startHour, config.startMinute, 0, 0);

    // Check if this Wednesday is a holiday, if so, keep looking for next one
    while (isHoliday(nextWednesday)) {
        nextWednesday.setDate(nextWednesday.getDate() + 7);
    }

    return nextWednesday;
}

/**
 * Check if a date is a Portuguese national holiday
 */
function isHoliday(date: Date): boolean {
    return PORTUGUESE_HOLIDAYS.some(holiday =>
        holiday.getDate() === date.getDate() &&
        holiday.getMonth() === date.getMonth() &&
        holiday.getFullYear() === date.getFullYear()
    );
}

/**
 * Format a date in Portuguese locale
 */
export function formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("pt-PT", options);
}

/**
 * Format a message template with the given values
 */
export function formatMessage(template: string, topic: string, type: string, description: string): string {
    return template
        .replace(/{topic}/g, topic)
        .replace(/{type}/g, type)
        .replace(/{description}/g, description);
}

/**
 * Create a Discord scheduled event for the meetup
 */
export async function createDiscordEvent(
    topic: string,
    type: string,
    description: string,
    startTime: Date
): Promise<any> {
    const guildId = SelectedGuildStore.getGuildId();
    if (!guildId) throw new Error(STRINGS.discordEventNoGuild);

    const config = getEventConfig();
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + config.durationHours);

    const eventName = config.nameFormat.replace("{topic}", topic);
    const baseDescription = config.descriptionFormat
        .replace("{type}", type)
        .replace("{description}", description);

    // Prepend identifier to help differentiate from other events
    const eventDescription = `${config.eventIdentifier}\n\n${baseDescription}`;

    const payload: any = {
        name: eventName,
        description: eventDescription,
        privacy_level: config.privacyLevel,
        scheduled_start_time: startTime.toISOString(),
        scheduled_end_time: endTime.toISOString(),
        entity_type: config.entityType,
        entity_metadata: {
            location: config.location
        }
    };

    // Add cover image if configured
    if (config.coverImageUrl) {
        payload.image = config.coverImageUrl;
    }

    try {
        const response = await RestAPI.post({
            url: `/guilds/${guildId}/scheduled-events`,
            body: payload
        });
        Toasts.show({
            message: STRINGS.toastEventCreatedSuccess,
            type: Toasts.Type.SUCCESS,
            id: "meetballs-event-created"
        });
        return response.body;
    } catch (error) {
        console.error(STRINGS.discordEventCreatedFailed, error);
        Toasts.show({
            message: STRINGS.toastEventCreatedFailed,
            type: Toasts.Type.FAILURE,
            id: "meetballs-event-failed"
        });
        throw error;
    }
}

/**
 * Get the next scheduled event from Discord (filters for MeetBalls events only)
 */
export function getNextDiscordEvent(): any {
    const guildId = SelectedGuildStore.getGuildId();
    if (!guildId) return null;

    const config = getEventConfig();
    const events = GuildScheduledEventStore.getGuildScheduledEventsForGuild?.(guildId) || [];
    const now = new Date();

    // Filter for MeetBalls events in the future (identified by the event identifier in description)
    const futureEvents = events.filter((event: any) => {
        const eventTime = new Date(event.scheduled_start_time);
        const isMeetballsEvent = event.description?.includes(config.eventIdentifier) || false;
        return eventTime > now && event.status === 1 && isMeetballsEvent; // Status 1 = SCHEDULED
    });

    // Sort by start time and return the first one
    if (futureEvents.length > 0) {
        futureEvents.sort((a: any, b: any) =>
            new Date(a.scheduled_start_time).getTime() - new Date(b.scheduled_start_time).getTime()
        );
        return futureEvents[0];
    }

    return null;
}
