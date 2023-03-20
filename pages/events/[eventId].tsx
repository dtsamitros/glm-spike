import { useRouter } from "next/router";
import Head from "next/head";
import styles from "@/styles/Home.module.css";

function EventPage() {
  const router = useRouter();
  const eventId = router.query.eventId;

  return <p>{eventId}</p>;
}

export default function Home() {
  return (
    <>
      <p>Events:</p>
      <EventPage />
    </>
  );
}
