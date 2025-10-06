// Establishes and exports a Socket.IO-local-dev-connection to the backend server.

import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

export default socket;