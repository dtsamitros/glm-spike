import { useRouter } from "next/router";
import Link from "next/link";
import { useOnlineStatus } from "@/src/onlineStatus";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/src/index-db/guest-list";
import { useEffect, useState, KeyboardEvent } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// const createEmployee = async (data: Employee) => {
//     const { data: response } = await axios.post(
//         "https://employee.free.beeceptor.com/create",
//         data
//     );
//     return response.data;
// };

export default function Home() {
    const router = useRouter();
    const eventId =
        typeof router.query.eventId === "string" ? +router.query.eventId : 0;
    const online = useOnlineStatus();
    const [eventName, setEventName] = useState("");
    const [inputGuestId, setInputGuestId] = useState("");
    const [logLine, setLogLine] = useState("");
    const [guestName, setGuestName] = useState("");
    const [guestImage, setGuestImage] = useState("");

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

    if (!eventId || !guests) {
        return;
    }

    const processNewGuest = (guestId: number) => {
        const guest = guests.find((g) => g.id === guestId);
        if (!guest) {
            toast(`Guest not found`, { type: "warning" });
            return;
        }

        setGuestName(guest.name);
        db.guestImages.get(guestId).then((image) => {
            toast(
                <p>
                    {image ? (
                        <img
                            src={`data:image/jpeg;base64,${image.guestImageBase64}`}
                            style={{
                                width: "64px",
                                height: "64px",
                                float: "left",
                                marginRight: "15px",
                            }}
                        />
                    ) : undefined}
                    {guest.name} checked in!
                </p>
            );
        });
    };

    return (
        <>
            <p>
                {`${eventName}, `}
                {`Guests: ${guests.length}, `}
                {`CheckedIn: ${guests.filter((g) => g.checkedIn).length}, `}
                {`Pending: ${guests.filter((g) => g.pending).length} `}
            </p>
            <p>
                <input
                    type="text"
                    value={inputGuestId}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            processNewGuest(+inputGuestId);
                            setInputGuestId("");
                        }
                    }}
                    onChange={(e) => setInputGuestId(e.target.value)}
                />
            </p>
            {logLine ? <p>{logLine}</p> : undefined}
            <p>Guest ids between 1 and {guests.length}</p>
            <div
                style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "10px",
                    backgroundColor: online ? "green" : "red",
                }}
            ></div>
            <p>
                <Link href="/">Home</Link>
            </p>
            <ToastContainer position="bottom-center" />
        </>
    );
}
