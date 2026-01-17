# Discord Events Integration Guide - MeetBalls Plugin

## Overview
Discord has a native **Guild Scheduled Events** system that allows servers to create, manage, and track events. This document outlines all available options for integrating with Discord's native event system to enhance the MeetBalls plugin's next meetup viewer and event creation features.

---

## Part 1: Reading/Detecting Events

### 1.1 Available Store: `GuildScheduledEventStore`

**Location:** Available via `@webpack/common` in Vencord

```typescript
import { GuildScheduledEventStore } from "@webpack/common";
```

**Key Methods:**

| Method | Returns | Purpose |
|--------|---------|---------|
| `getGuildScheduledEvent(eventId)` | `GuildScheduledEvent \| null` | Get a specific event by ID |
| `getGuildScheduledEventsForGuild(guildId)` | `GuildScheduledEvent[]` | **Get all events for a guild** |
| `getGuildScheduledEventsByIndex(status)` | `GuildScheduledEvent[]` | Get events filtered by status |
| `getGuildEventCountByIndex(status)` | `number` | Count events by status |
| `getActiveEventByChannel(channelId)` | `GuildScheduledEvent \| null` | Get active event for a specific channel |
| `getUserCount(eventId, recurrenceId)` | `number` | Get RSVP count for event |
| `isInterestedInEventRecurrence(eventId, recurrenceId)` | `boolean` | Check if current user is interested |

### 1.2 Data Structure: `GuildScheduledEvent`

```typescript
interface GuildScheduledEvent {
    id: string;                                    // Event ID (snowflake)
    guild_id: string;                              // Guild ID
    channel_id: string | null;                     // Voice/Stage channel, null for EXTERNAL
    creator_id: string | null;                     // Creator's user ID
    name: string;                                  // Event name (1-100 chars)
    description: string | null;                    // Event description (1-1000 chars)
    image: string | null;                          // Cover image hash
    scheduled_start_time: string;                  // ISO8601 timestamp
    scheduled_end_time: string | null;             // ISO8601 timestamp
    privacy_level: GuildScheduledEventPrivacyLevel; // GUILD_ONLY = 2
    status: GuildScheduledEventStatus;             // SCHEDULED=1, ACTIVE=2, COMPLETED=3, CANCELED=4
    entity_type: GuildScheduledEventEntityType;    // STAGE_INSTANCE=1, VOICE=2, EXTERNAL=3
    entity_id: string | null;                      // Associated entity ID
    entity_metadata: GuildScheduledEventEntityMetadata | null;
    sku_ids: string[];                             // Monetization IDs
    recurrence_rule: GuildScheduledEventRecurrenceRule | null;
    guild_scheduled_event_exceptions: any[];       // Recurrence exceptions
    auto_start: boolean;                           // Auto-start at scheduled time
}

// For EXTERNAL events (meetings, seminars, etc.)
interface GuildScheduledEventEntityMetadata {
    location?: string;                             // Event location (1-100 chars)
}

// Event Status Constants
enum GuildScheduledEventStatus {
    SCHEDULED = 1,    // Not started yet
    ACTIVE = 2,       // Currently happening
    COMPLETED = 3,    // Finished (cannot change)
    CANCELED = 4      // Cancelled (cannot change)
}

// Entity Types
enum GuildScheduledEventEntityType {
    STAGE_INSTANCE = 1,  // Stage channel
    VOICE = 2,           // Voice channel
    EXTERNAL = 3         // External (meetup, in-person, etc.)
}
```

### 1.3 Implementation Example: Reading Events

```typescript
import { GuildScheduledEventStore } from "@webpack/common";
import { SelectedGuildStore } from "@webpack/common";

// Get all events for current guild
function getGuildEvents() {
    const guildId = SelectedGuildStore.getGuildId();
    if (!guildId) return [];
    
    return GuildScheduledEventStore.getGuildScheduledEventsForGuild(guildId);
}

// Get next upcoming event
function getNextEvent(): GuildScheduledEvent | null {
    const events = getGuildEvents();
    const now = new Date();
    
    return events.find(e => 
        e.status === GuildScheduledEventStatus.SCHEDULED &&
        new Date(e.scheduled_start_time) > now
    ) || null;
}

// Find event by name
function getEventByName(name: string): GuildScheduledEvent | null {
    return getGuildEvents().find(e => e.name === name) || null;
}

// Get active events
function getActiveEvents(): GuildScheduledEvent[] {
    const events = getGuildEvents();
    return events.filter(e => e.status === GuildScheduledEventStatus.ACTIVE);
}
```

### 1.4 Listening for Event Changes

**Via Flux Dispatcher:**

```typescript
import { FluxDispatcher } from "@webpack/common";

function setupEventListener() {
    const handleEventCreate = (data: any) => {
        console.log("Event created:", data);
    };
    
    const handleEventUpdate = (data: any) => {
        console.log("Event updated:", data);
    };
    
    const handleEventDelete = (data: any) => {
        console.log("Event deleted:", data);
    };
    
    // Available Flux events:
    FluxDispatcher.subscribe("GUILD_SCHEDULED_EVENT_CREATE", handleEventCreate);
    FluxDispatcher.subscribe("GUILD_SCHEDULED_EVENT_UPDATE", handleEventUpdate);
    FluxDispatcher.subscribe("GUILD_SCHEDULED_EVENT_DELETE", handleEventDelete);
    
    // Return cleanup function
    return () => {
        FluxDispatcher.unsubscribe("GUILD_SCHEDULED_EVENT_CREATE", handleEventCreate);
        FluxDispatcher.unsubscribe("GUILD_SCHEDULED_EVENT_UPDATE", handleEventUpdate);
        FluxDispatcher.unsubscribe("GUILD_SCHEDULED_EVENT_DELETE", handleEventDelete);
    };
}
```

---

## Part 2: Creating/Editing Events

### 2.1 Discord REST API Endpoints

**Base URL:** `https://discord.com/api/v10/guilds/{guild.id}/scheduled-events`

#### Create Event
```
POST /guilds/{guild_id}/scheduled-events
```

**Required Fields:**
- `name` (string, 1-100 chars)
- `privacy_level` (int, value: 2 = GUILD_ONLY)
- `scheduled_start_time` (ISO8601 timestamp)
- `entity_type` (int: 1=STAGE, 2=VOICE, 3=EXTERNAL)

**Optional Fields:**
- `description` (string, 1-1000 chars)
- `channel_id` (snowflake) - Required for STAGE/VOICE, null for EXTERNAL
- `scheduled_end_time` (ISO8601) - Required for EXTERNAL, optional for others
- `entity_metadata` (object) - Required for EXTERNAL with `location` field
- `image` (base64 data URL for cover image)

#### Modify Event
```
PATCH /guilds/{guild_id}/scheduled-events/{event_id}
```
All fields optional. Can update `status` field to ACTIVE/CANCELED.

#### Delete Event
```
DELETE /guilds/{guild_id}/scheduled-events/{event_id}
```

### 2.2 Vencord Implementation: Using RestAPI

```typescript
import { RestAPI, SelectedGuildStore } from "@webpack/common";
import { GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel } from "@vencord/discord-types/enums";

interface CreateEventParams {
    name: string;
    description?: string;
    startTime: Date;
    endTime?: Date;
    channelId?: string;
    entityType: GuildScheduledEventEntityType;
    location?: string; // For EXTERNAL type
}

async function createEvent(params: CreateEventParams) {
    const guildId = SelectedGuildStore.getGuildId();
    if (!guildId) throw new Error("No guild selected");
    
    const payload: Record<string, any> = {
        name: params.name,
        privacy_level: GuildScheduledEventPrivacyLevel.GUILD_ONLY,
        scheduled_start_time: params.startTime.toISOString(),
        entity_type: params.entityType,
    };
    
    if (params.description) {
        payload.description = params.description;
    }
    
    if (params.endTime) {
        payload.scheduled_end_time = params.endTime.toISOString();
    }
    
    // For VOICE/STAGE channels
    if (params.channelId && params.entityType !== GuildScheduledEventEntityType.EXTERNAL) {
        payload.channel_id = params.channelId;
    }
    
    // For EXTERNAL events (in-person meetups)
    if (params.entityType === GuildScheduledEventEntityType.EXTERNAL) {
        payload.channel_id = null;
        if (params.location) {
            payload.entity_metadata = {
                location: params.location
            };
        }
        if (!params.endTime) {
            throw new Error("EXTERNAL events require scheduled_end_time");
        }
    }
    
    try {
        const response = await RestAPI.post({
            url: `/guilds/${guildId}/scheduled-events`,
            body: payload,
        });
        return response.body;
    } catch (error) {
        console.error("Failed to create event:", error);
        throw error;
    }
}
```

### 2.3 Example: Create MeetBalls Event

```typescript
async function createMeetBallsEvent(
    topic: string,
    type: string,
    description: string,
    startDate: Date
) {
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2); // 2-hour duration
    
    return createEvent({
        name: `🎉 ${topic}`,
        description: `**Type:** ${type}\n\n${description}`,
        startTime: startDate,
        endTime: endDate,
        entityType: GuildScheduledEventEntityType.EXTERNAL, // For meetups
        location: "Virtual Meetup" // or get from settings
    });
}
```

### 2.4 Update Event Status

```typescript
async function updateEventStatus(
    eventId: string,
    status: GuildScheduledEventStatus
) {
    const guildId = SelectedGuildStore.getGuildId();
    if (!guildId) throw new Error("No guild selected");
    
    try {
        const response = await RestAPI.patch({
            url: `/guilds/${guildId}/scheduled-events/${eventId}`,
            body: { status },
        });
        return response.body;
    } catch (error) {
        console.error("Failed to update event status:", error);
        throw error;
    }
}
```

---

## Part 3: Integration Recommendations for MeetBalls

### 3.1 **Detection Strategy**

✅ **Use Native Events as Primary Source**

```typescript
// Replace calculated next Wednesday with actual Discord event
export function getNextMeetupFromEvents(): GuildScheduledEvent | null {
    const events = GuildScheduledEventStore.getGuildScheduledEventsForGuild(
        SelectedGuildStore.getGuildId()
    );
    
    const upcomingEvents = events.filter(e => {
        const startTime = new Date(e.scheduled_start_time);
        return e.status === GuildScheduledEventStatus.SCHEDULED && 
               startTime > new Date();
    });
    
    // Return first upcoming event
    return upcomingEvents.sort((a, b) => 
        new Date(a.scheduled_start_time).getTime() - 
        new Date(b.scheduled_start_time).getTime()
    )[0] || null;
}

// Fallback to calculated date if no events exist
function getNextMeetup(): GuildScheduledEvent | null | { calculated: Date } {
    const event = getNextMeetupFromEvents();
    if (event) return event;
    
    // Fallback to existing logic
    return { calculated: getNextWednesday() };
}
```

### 3.2 **Event Creation Strategy**

✅ **Option A: Dual Creation (Recommended)**
- Create chat message (current behavior)
- **Also** create native Discord event automatically
- User sees event in Discord's event list

```typescript
async function createMeetupWithEvent(topic: string, type: string, description: string) {
    // 1. Send chat message (existing logic)
    const formattedMessage = formatMessage(settings.store.messageTemplate, {
        topic,
        type,
        description
    });
    insertTextIntoChatInputBox(formattedMessage);
    
    // 2. Create native event
    try {
        await createMeetBallsEvent(topic, type, description, getNextWednesday());
    } catch (error) {
        console.warn("Failed to create native event:", error);
        // Don't fail message creation if event creation fails
    }
}
```

✅ **Option B: Event-Only Creation**
- Only create native Discord event
- Remove manual message composition
- Cleaner integration but loses custom messaging

### 3.3 **UI Integration Options**

**Next Meetup Modal Enhancement:**

```typescript
export function EnhancedNextMeetupModal({ close, ...props }: ModalProps & { close: () => void }) {
    const event = getNextMeetupFromEvents();
    
    if (!event) {
        return <NextMeetupModal close={close} {...props} />;
    }
    
    // Show real event details
    return (
        <ModalRoot {...props}>
            <ModalHeader>
                <h2>📅 Next Meetup</h2>
                <ModalCloseButton onClick={close} />
            </ModalHeader>
            <ModalContent>
                <h3>{event.name}</h3>
                <p>{event.description}</p>
                <p>📍 {event.entity_metadata?.location || "Virtual"}</p>
                <p>⏰ {new Date(event.scheduled_start_time).toLocaleString()}</p>
                <p>👥 {`GuildScheduledEventStore.getUserCount(event.id, null)` || "0"} interested</p>
            </ModalContent>
        </ModalRoot>
    );
}
```

---

## Part 4: Implementation Checklist

### Phase 1: Detection Only (No Breaking Changes)
- [ ] Import `GuildScheduledEventStore` from `@webpack/common`
- [ ] Add utility function: `getNextEventFromDiscord()`
- [ ] Update `NextMeetupModal` to show real event data if available
- [ ] Add fallback to calculated Wednesday if no event exists
- [ ] Test with existing Discord events

### Phase 2: Event Listener Integration
- [ ] Subscribe to `GUILD_SCHEDULED_EVENT_CREATE/UPDATE/DELETE` Flux events
- [ ] Auto-refresh modal when event changes
- [ ] Add real-time update indicators

### Phase 3: Event Creation
- [ ] Add permission check (CREATE_EVENTS)
- [ ] Implement `createMeetBallsEvent()` helper
- [ ] Add checkbox to CreateModal: "Also create Discord event?"
- [ ] Handle errors gracefully

### Phase 4: Full Integration
- [ ] Make event creation optional/configurable in settings
- [ ] Add event management commands
- [ ] Sync meeting data bidirectionally
- [ ] Add event image/cover support

---

## Part 5: Permissions Required

For **reading** events: None required

For **creating** events in specific entity types:

| Entity Type | Required Permissions |
|------------|---------------------|
| EXTERNAL (in-person) | `CREATE_EVENTS` (guild-level) |
| VOICE channel | `CREATE_EVENTS`, `VIEW_CHANNEL`, `CONNECT` |
| STAGE channel | `CREATE_EVENTS`, `MANAGE_CHANNELS`, `MUTE_MEMBERS`, `MOVE_MEMBERS` |

**Check permissions:**
```typescript
import { PermissionStore } from "@webpack/common";

function canCreateEvent(guildId: string): boolean {
    return PermissionStore.can("CREATE_EVENTS", guildId);
}
```

---

## Part 6: Limitations & Considerations

⚠️ **Important Constraints:**

1. **100 event limit:** Maximum 100 SCHEDULED or ACTIVE events per guild at once
2. **Cannot delete old status:** Once COMPLETED/CANCELED, cannot change back
3. **Auto-completion:** EXTERNAL events auto-complete at `scheduled_end_time`
4. **Recurrence:** Supported but complex (RFC 3339 iCalendar rules)
5. **Rate limits:** Standard Discord API rate limits apply
6. **Timezone:** Discord stores times in UTC (ISO8601)

✅ **Best Practices:**

- Always use ISO8601 timestamps for dates
- Provide fallback UIs when event data unavailable
- Handle RSVP/interest gracefully (show in UI, let Discord handle actual RSVPs)
- Test with different entity types (VOICE, EXTERNAL, etc.)
- Consider timezone differences for international teams

---

## Part 7: Code Examples by Use Case

### Show Next Real Event or Calculated Date

```typescript
export function getNextMeetup() {
    const event = GuildScheduledEventStore.getGuildScheduledEventsForGuild(
        SelectedGuildStore.getGuildId()
    ).filter(e => new Date(e.scheduled_start_time) > new Date())
     .sort((a, b) => new Date(a.scheduled_start_time) - new Date(b.scheduled_start_time))[0];
    
    return event || { calculated: getNextWednesday() };
}
```

### Get Event Attendee Count

```typescript
function getAttendeeCount(eventId: string, recurrenceId: string | null = null): number {
    return GuildScheduledEventStore.getUserCount(eventId, recurrenceId) || 0;
}
```

### Check if User Interested

```typescript
function isUserInterested(eventId: string, recurrenceId: string | null = null): boolean {
    return GuildScheduledEventStore.isInterestedInEventRecurrence(eventId, recurrenceId);
}
```

### List All Events by Status

```typescript
function getEventsByStatus(status: GuildScheduledEventStatus) {
    return GuildScheduledEventStore.getGuildScheduledEventsByIndex(status);
}
```

---

## Summary

**Available Options:**

| Feature | Vencord Support | Complexity | Recommendation |
|---------|---|-----------|---|
| **Read Events** | ✅ Full | Low | Start here - Non-breaking |
| **Listen to Changes** | ✅ Via Flux | Medium | Add for real-time updates |
| **Create Events** | ✅ Via REST API | Medium | Use for enhanced experience |
| **Edit Events** | ✅ Via REST API | Medium | Allow users to manage |
| **Recurrence Rules** | ✅ Supported | High | Advanced feature |

**Recommended Implementation Path:**
1. Start with reading existing events (least invasive)
2. Add real-time listeners
3. Optional: Add event creation checkbox
4. Optional: Advanced event management UI

This keeps MeetBalls functional while progressively integrating with Discord's native event system.
