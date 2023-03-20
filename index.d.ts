type TEvent = {
    id: number;
    name: string;
    guestCount: number;
};

type TGuestEntry = {
    id: number;
    name: string;
    imageUrl: string;
    checkedIn: null | string;
};

type TEventGuestList = {
    id: number;
    name: string;
    guests: TGuestEntry[];
};
