"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000";

let socketInstance: Socket | null = null;

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        withCredentials: true,
        transports: ["websocket", "polling"],
      });
    }
    socketRef.current = socketInstance;

    return () => {
      // Don't disconnect on unmount — keep the socket alive for the session
    };
  }, []);

  const joinRoom = useCallback((conversationId: string) => {
    socketRef.current?.emit("join_chat", conversationId);
  }, []);

  const sendSocketMessage = useCallback((data: { conversationId: string; text: string; sender: string }) => {
    socketRef.current?.emit("send_message", data);
  }, []);

  const onMessage = useCallback(
    (cb: (data: { conversationId: string; text: string; sender: string; createdAt: string }) => void) => {
      socketRef.current?.on("receive_message", cb);
      return () => {
        socketRef.current?.off("receive_message", cb);
      };
    },
    []
  );

  return { joinRoom, sendSocketMessage, onMessage, socket: socketRef.current };
}
