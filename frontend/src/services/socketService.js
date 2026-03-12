import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:5000"; // Replace with your server URL
let socket;

export const connectSocket = (userId) => {
  socket = io(SOCKET_SERVER_URL);

  socket.on("connect", () => {
    console.log("Connected to socket server with ID:", socket.id);
  });

  // Emit the user ID when a user connects
  socket.emit("newUser", userId);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    console.log("Disconnected from socket server");
  }
};

export const sendNotify = ({senderId, receiverId}) => {
  const socket = getSocket();

  if (socket && socket.connected) {
    socket.emit("sendNotification", {senderId, receiverId});
    console.log("Notification sent:", {senderId, receiverId});
  } else {
    console.error("Socket is not connected. Unable to send notification.");
  }
};

export const sendNotifications = ({ senderId, receivers}) => {
  console.log("Sending notifications to:", receivers);
  const socket = getSocket();

  if (socket && socket.connected) {
    receivers.forEach((user) => {
      const receiverId = user._id;
      const receiverName = user.fullname;
      socket.emit("sendNotification", { senderId, receiverId});
      console.log(`Notification sent from ${senderId} to ${receiverId}`);
    });
  } else {
    console.error("Socket is not connected. Unable to send notifications.");
  }
};

export const getSocket = () => socket;
