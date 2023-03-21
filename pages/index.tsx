import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useQuery } from "react-query";
import axios, { AxiosError } from "axios";
import { ReactElement, useEffect, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/src/index-db/guest-list";
import { useRouter } from "next/router";

function EventList(): ReactElement {
    const {
        isLoading: eventsLoading,
        error: eventsError,
        data: events,
    } = useQuery("events", () =>
        axios.get<TEvent[]>("/api/events").then((res) => res.data)
    );

    if (eventsError && eventsError instanceof AxiosError) {
        return <div>Error: {eventsError.message}</div>;
    }

    if (eventsLoading) {
        return <div>Loading...</div>;
    }

    if (!events || !events.length) {
        return <div>No Events!</div>;
    }

    return (
        <ul className={styles.grid}>
            {events.map((event) => {
                return (
                    <li key={event.id}>
                        <Link href={`/events/${event.id}/load`}>
                            {event.name} ({event.guestCount} guests)
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}

export default function Home() {
    const router = useRouter();
    // const [currentEventExists, setCurrentEventExists] = useState(true);
    // const dbIsOpen = db.isOpen()

    // useEffect(() => {
    //     if (db)
    //     db.currentEvent.get("currentEvent").then((currentEvent) => {
    //         if (currentEvent) {
    //             router.push(`/events/${currentEvent.id}`);
    //             return;
    //         }
    //
    //         setCurrentEventExists(false);
    //     });
    // }, []);
    //
    // if (currentEventExists) {
    //     return <p>Loading...</p>
    // }

    // db.open()
    const currentEvent = useLiveQuery(() => db.currentEvent.toArray());

    if (!currentEvent || !router) {
        return <p>Loading...</p>
    }

    if (currentEvent.length) {
        router.push(`/events/${currentEvent[0].id}`)
    }

    return (
        <>
            <p>Events:</p>
            <EventList />
        </>
    );
}
