import { io } from "socket.io-client";

const socket = io("http://localhost:3001", {
  query: {
    userId: typeof window !== "undefined" ? localStorage.getItem("dalone:userId") : "", // optional
  },
});

export default socket;
