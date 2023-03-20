import { useRouter } from "next/router";
import { useQueries, useQuery } from "react-query";
import axios, { AxiosError } from "axios";
import { useEffect } from "react";

export default function Home() {
    const router = useRouter();
    const eventId = router.query.eventId;

    useQueries;

    const {
        isLoading: eventLoading,
        error: eventError,
        data: event,
        isSuccess: eventSuccess,
    } = useQuery(
        ["event", eventId],
        () =>
            axios
                .get<TEventGuestList>(`/api/events/${eventId}`)
                .then((res) => res.data),
        { enabled: !!eventId }
    );

    useEffect(() => {
        if (eventSuccess && event.guests.length) {
            router.push(`/event/load-images`);
        }
    }, [eventSuccess]);

    if (eventError && eventError instanceof AxiosError) {
        return <div>Error: {eventError.message}</div>;
    }

    if (eventLoading) {
        return <p>Loading...</p>;
    }

    return (
        <>
            <pre>{JSON.stringify(event, null, 2)}</pre>
        </>
    );
}
