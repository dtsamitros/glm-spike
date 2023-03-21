import Dexie, { Table } from "dexie";

export interface CurrentEvent {
    currentEvent: "currentEvent";
    id: number;
    name: string;
}

export interface Guest {
    id: number;
    name: string;
    checkedIn: string | null;
    pending: boolean;
}

export interface GuestImage {
    guestId: number;
    guestImageBase64: string;
}

export class GuestListDb extends Dexie {
    // 'friends' is added by dexie when declaring the stores()
    // We just tell the typing system this is the case
    currentEvent!: Table<CurrentEvent>;
    guests!: Table<Guest>;
    guestImages!: Table<GuestImage>;

    constructor() {
        super("guest-list");
        this.version(1).stores({
            currentEvent: "currentEvent",
            guests: "id",
            guestImages: "guestId",
        });
    }
}

export const db = new GuestListDb();
