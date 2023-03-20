import Dexie, { Table } from "dexie";

export interface GuestList {
    eventId: number;
    guestId: number;
    guestName: string;
    guestImageUrl: string;
    guestImageBase64?: string;
    checkedIn: string | null;
    pending: boolean;
}

export class GuestListDb extends Dexie {
    // 'friends' is added by dexie when declaring the stores()
    // We just tell the typing system this is the case
    guests!: Table<GuestList>;

    constructor() {
        super("guest-list");
        this.version(1).stores({
            guests: "[eventId+guestId]", // Primary key
        });
    }
}

export const db = new GuestListDb();
