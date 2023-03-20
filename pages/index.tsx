import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useQuery } from "react-query";
import axios, { AxiosError } from "axios";
import { ReactElement } from "react";
import Link from "next/link";

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
    return (
        <>
            <p>Events:</p>
            <EventList />
        </>
    );
}
