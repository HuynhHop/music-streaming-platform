// socket.test.js

const { Server } = require("socket.io");
const http = require("http");
const { initSocket } = require("./path/to/socketModule"); // Đảm bảo đường dẫn đúng

let server;
let io;

beforeAll(() => {
  // Set up HTTP server và socket.io server
  server = http.createServer();
  io = new Server(server);
  initSocket(io); // Khởi tạo các sự kiện socket
  server.listen(5000); // Khởi tạo server tại cổng 5000
});

afterAll(() => {
  server.close(); // Đóng server sau khi tất cả test kết thúc
});

test("should add a new user on newUser event", (done) => {
  const socket = require("socket.io-client")("http://localhost:5000");

  socket.on("connect", () => {
    socket.emit("newUser", "someUserId");

    // Kiểm tra sự kiện server gửi phản hồi về client
    socket.on("serverResponse", (data) => {
      expect(data).toBe("someUserId added"); // Giả sử server gửi phản hồi là ID của người dùng được thêm
      done(); // Kết thúc test
    });
  });
});
