import { useRouter } from "next/router";
import { useQueries, useQuery } from "react-query";
import axios, { AxiosError } from "axios";
import { useEffect } from "react";
import { db } from "@/src/index-db/guest-list";
import imageApi from "@/src/api/image-api";

export default function Home() {
    const router = useRouter();
    const eventId = router.query.eventId;

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
        { enabled: !!eventId, refetchInterval: 0 }
    );

    useEffect(() => {
        if (!eventSuccess || !event.guests.length || !eventId) {
            return;
        }

        (async () => {
            await db.guests.where("eventId").equals(event.id).delete();

            const imageRequests: Promise<any>[] = [];

            for (let guest of event.guests) {
                const id = await db.guests.add({
                    eventId: event.id,
                    guestId: guest.id,
                    guestName: guest.name,
                    guestImageUrl: guest.imageUrl,
                    checkedIn: guest.checkedIn,
                    pending: false,
                });

                imageRequests.push(
                    imageApi.get(guest.imageUrl).then(() => {
                        db.guests.get(id);
                    })
                );
            }

            Promise.all(imageRequests).then(() => {
                console.log("Done!!");
                router.push(`/events/${eventId}`);
            });
        })();
    }, [eventSuccess]);

    if (eventError && eventError instanceof AxiosError) {
        return <div>Error: {eventError.message}</div>;
    }

    if (eventLoading) {
        return <p>Loading...</p>;
    }

    return <p>Loading images (...</p>;
}
