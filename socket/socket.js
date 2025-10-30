// Creates and exports a Socket.IO client instance connected to the backend server (running locally on port 4000).

import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

export default socket;