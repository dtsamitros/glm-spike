import { useRouter } from "next/router";
import { useQueries, useQuery } from "react-query";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { db } from "@/src/index-db/guest-list";
import imageApi from "@/src/api/image-api";

export default function Home() {
    const router = useRouter();
    const eventId = router.query.eventId;
    const [imageCount, setImageCount] = useState<number>(0);

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
                    imageApi
                        .get(guest.imageUrl, { responseType: "arraybuffer" })
                        .then((response) => {
                            db.guests.get(id).then(async (guest) => {
                                if (!guest) {
                                    return;
                                }

                                guest.guestImageBase64 = Buffer.from(
                                    response.data,
                                    "binary"
                                ).toString("base64");
                                await db.guests.put(guest);

                                setImageCount((imageCount) => imageCount + 1);
                            });
                        })
                );
            }

            Promise.all(imageRequests).then(() => {
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

    if (!event?.guests.length) {
        return <p>No guests</p>;
    }

    return (
        <p>
            Loading image {imageCount} of {event.guests.length}...
        </p>
    );
}
