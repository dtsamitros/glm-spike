import { useRouter } from "next/router";
import { useQueries, useQuery } from "react-query";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { db } from "@/src/index-db/guest-list";
import imageApi from "@/src/api/image-api";

export default function Home() {
    const router = useRouter();
    const eventId =
        typeof router.query.eventId === "string" ? +router.query.eventId : 0;
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
        { enabled: Boolean(eventId), refetchInterval: 0, cacheTime: 0 }
    );

    useEffect(() => {
        if (!eventSuccess || !event.guests.length || !eventId || !router) {
            return;
        }

        (async () => {
            console.log("Clearing current event from indexedDB");
            await db.currentEvent?.clear();
            console.log("Clearing guests from indexedDB");
            await db.guests?.clear();

            console.log("Adding current event to indexedDB");
            await db.currentEvent.add({
                currentEvent: "currentEvent",
                id: eventId,
                name: event.name,
            });

            console.log("Processing guests");
            const imageRequests = event.guests.map(async (guest) => {
                console.log(`Adding guest ${guest.name} to indexedDB`);
                await db.guests.add({
                    id: guest.id,
                    name: guest.name,
                    checkedIn: guest.checkedIn,
                    pending: false,
                });

                return db.guestImages.get(guest.id).then((guestImage) => {
                    if (guestImage) {
                        console.log(`Guest image exists for ${guest.name}`);
                        setImageCount((imageCount) => imageCount + 1);
                        return Promise.resolve();
                    }

                    return imageApi
                        .get(guest.imageUrl, {
                            responseType: "arraybuffer",
                        })
                        .then(async (response) => {
                            console.log(`Adding guest image for ${guest.name}`);
                            await db.guestImages.add({
                                guestId: guest.id,
                                guestImageBase64: Buffer.from(
                                    response.data,
                                    "binary"
                                ).toString("base64"),
                            });

                            setImageCount((imageCount) => imageCount + 1);
                        });
                });
            });

            Promise.all(imageRequests).then(() =>
                router.push(`/events/${eventId}`)
            );
        })();
    }, [event?.guests, eventId, eventSuccess, router]);

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
