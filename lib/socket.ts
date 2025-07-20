import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_API_URL, {
  query: {
    userId: typeof window !== "undefined" ? localStorage.getItem("dalone:userId") : "", // optional
  },
});

export default socket;
