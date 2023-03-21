import { useRouter } from "next/router";
import { useOnlineStatus } from "@/src/onlineStatus";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/src/index-db/guest-list";
import { useEffect, useState, KeyboardEvent } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useMutation } from "react-query";

function toastGuestMessage(name: string, imageBase64?: string) {
    return (
        <p>
            {imageBase64 ? (
                <img
                    src={`data:image/jpeg;base64,${imageBase64}`}
                    style={{
                        width: "64px",
                        height: "64px",
                        float: "left",
                        marginRight: "15px",
                    }}
                />
            ) : undefined}
            {name} checked in!
        </p>
    );
}

export default function Home() {
    const router = useRouter();
    const eventId =
        typeof router.query.eventId === "string" ? +router.query.eventId : 0;
    const online = useOnlineStatus();
    const [eventName, setEventName] = useState("");
    const [inputGuestId, setInputGuestId] = useState("");

    const { mutate: checkin } = useMutation(
        (guests: number[]) => {
            return axios
                .post(`/api/events/${eventId}`, guests)
                .then((response) => response.data);
        },
        {
            onSuccess: (data, variables) => {
                variables.forEach((guestId) => {
                    db.guests.update(guestId, {
                        checkedIn: new Date().toISOString(),
                        pending: false,
                    });
                });
            },
        }
    );

    const guests = useLiveQuery(() => db.guests.toArray());

    useEffect(() => {
        if (!eventId) {
            return;
        }

        db.currentEvent.get("currentEvent").then((currentEvent) => {
            if (!currentEvent || currentEvent.id !== eventId) {
                return router.push("/");
            }

            setEventName(currentEvent.name);
        });
    }, [eventId]);

    const processCheckins = () => {};

    useEffect(() => {
        if (!online || !guests) {
            return;
        }

        const pending = guests
            .filter((guest) => guest.pending)
            .map((guest) => guest.id);

        if (!pending.length) {
            return;
        }

        checkin(pending);
    }, [online, guests]);

    if (!eventId || !guests) {
        return;
    }

    const checkinGuest = (guestId: number) => {
        const guest = guests.find((g) => g.id === guestId);

        if (!guest) {
            toast(`Guest not found`, { type: "warning" });
            return;
        }

        db.guestImages.get(guestId).then((image) => {
            toast(toastGuestMessage(guest.name, image?.guestImageBase64));
        });

        db.guests.update(guestId, { pending: true });
    };

    const checkedInCount = guests.filter((g) => g.checkedIn).length;
    const totalCount = guests.length;
    const pendingCount = guests.filter((g) => g.pending).length;
    const pendingStyle = { color: "orange", fontWeight: "bold" };

    return (
        <>
            <p>
                {`${eventName}, `}
                {`CheckedIn: ${checkedInCount} / ${totalCount}, `}
                {`Pending: `}
                <span style={pendingCount ? pendingStyle : {}}>
                    {pendingCount}
                </span>
            </p>
            <p>
                <input
                    type="text"
                    value={inputGuestId}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            checkinGuest(+inputGuestId);
                            setInputGuestId("");
                        }
                    }}
                    onChange={(e) => setInputGuestId(e.target.value)}
                />
            </p>
            <p>
                <small>(Guest ids between 1 and {guests.length})</small>
            </p>
            <p>
                <button
                    disabled={pendingCount > 0}
                    onClick={() => {
                        db.delete().then(() => (window.location.href = "/"));
                    }}
                >
                    Finish!
                </button>
            </p>
            <div>
                <div
                    style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "4px",
                        backgroundColor: online ? "green" : "red",
                        marginRight: "10px",
                        float: "left",
                    }}
                ></div>
                {online ? null : " Offline"}
                {!online && pendingCount
                    ? ", please connect to the internet at your earliest convenience to upload pending checkins"
                    : null}
            </div>
            <ToastContainer position="bottom-center" />
        </>
    );
}
