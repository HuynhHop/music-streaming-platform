
let io;
const onlineUsers = [];

const addNewUser = (_id, socketId) => {
  const user = onlineUsers.find((user) => user._id === _id);
  if (user) {
    user.socketId = socketId; 
  } else {
    onlineUsers.push({ _id, socketId });
  }
};

const removeUser = (socketId) => {
  const index = onlineUsers.findIndex((user) => user.socketId === socketId);
  if (index !== -1) {
    onlineUsers.splice(index, 1);
  }
};

const getUser = (_id) => {
  return onlineUsers.find((user) => user._id === _id);
};

const initSocket = (socketIo) => {
  io = socketIo;

io.on("connection", (socket) => {
  console.log('New client connected:', socket.id);

  socket.on("newUser", (_id) => {
    console.log(`New user connected with ID: ${_id}`);
    addNewUser(_id, socket.id);
  });

  socket.on("disconnect", () => {
    console.log('Client disconnected');
    removeUser(socket.id);
  });

  socket.on("sendNotification", ({senderId, receiverId}) => {
    handleNotification({senderId, receiverId});
  });
});
}

function handleNotification({senderId, receiverId}) {
  io.emit("fetchComment");

  if (senderId === receiverId) {
      console.log("Sender and receiver are the same person.");
      return;
  }

  console.log(`${senderId} to ${receiverId}: send Notification!`);
  const receiver = getUser(receiverId);

  if (receiver) {
      console.log(`Receiver found: ${receiver.socketId}`);
      io.to(receiver.socketId).emit("getNotification");
  } else {
      console.log(`Receiver with ID: ${receiverId} is not online.`);
  }
}

module.exports = { initSocket };
