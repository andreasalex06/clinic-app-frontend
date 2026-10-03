import { useEffect, useRef } from "react";
import { getDashboardSocket } from "../api/socket";
import { useAuthStore } from "../stores/authStore";

export function useDashboardSocketEvent(eventName, onEvent, delay = 300) {
  const token = useAuthStore((state) => state.token);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!token) return undefined;

    const socket = getDashboardSocket(token);
    let timeoutId;
    const handleEvent = (payload) => {
      if (delay === 0) {
        void onEventRef.current(payload);
        return;
      }
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        void onEventRef.current(payload);
      }, delay);
    };

    socket.on(eventName, handleEvent);

    return () => {
      window.clearTimeout(timeoutId);
      socket.off(eventName, handleEvent);
    };
  }, [delay, eventName, token]);
}
