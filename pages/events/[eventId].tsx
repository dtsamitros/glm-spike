import { useRouter } from "next/router";
import Link from "next/link";
import { useOnlineStatus } from "@/src/onlineStatus";

function EventPage() {
    const router = useRouter();
    const eventId = router.query.eventId;

    return <p>{eventId}</p>;
}

export default function Home() {
    const online = useOnlineStatus();

    return (
        <>
            <p>Events:</p>
            <EventPage />
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
        </>
    );
}
