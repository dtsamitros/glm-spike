import {useEffect, useState} from "react";

export function useOnlineStatus() {
    const [online, setOnline] = useState(false);

    useEffect(() => {
        function handleOnline() {
            setOnline(true);
        }
        function handleOffline() {
            setOnline(false);
        }

        setOnline(window.navigator.onLine);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return online;
}
