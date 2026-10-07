import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import { connectDb } from "./config/db.js";
import userRouter from "./routes/user.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { errorHandler } from "./utils/error.js";
import chatRouter from "./routes/chat.js";
import { disconnect } from "cluster";
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from "./constants/events.js";
import { getSockets } from "./utils/helper.js";
import { Message } from "./models/messages.js";
dotenv.config();
export const userSocketIDs = new Map();

const port = 4000;
const app = express();

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);

io.on("connection", (socket) => {
  console.log("user connected", socket.id);
  const user = {
    _id: "fasdfa",
    name: "sharvan",
  };
  socket.on(NEW_MESSAGE, async ({ chatid, members, message }) => {
    userSocketIDs.set(user._id.toString(), socket.id);

    const msgForRealTime = {
      _id: Date.now() * Math.random(),
      sender: {
        _id: user._id,
        name: user.name,
      },
      content: message,
      chatid,
      createdAt: new Date().toISOString(),
    };

    const msgForDb = {
      content: message,
      chatid,
      sender: user._id,
    };

    const userSokets = getSockets(members);

    io.to(userSokets).emit(NEW_MESSAGE, {
      chatid,
      message: msgForRealTime,
    });
    io.to(userSokets).emit(NEW_MESSAGE_ALERT, { chatid });

    try {
      await Message.create(msgForDb);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    userSocketIDs.delete(user._id.toString());
  });
});

app.use(errorHandler);

connectDb()
  .then(() => {
    server.listen(port, () => {
      console.log(`server is running on port ${port}`);
    });
  })
  .catch((error: unknown) => {
    const message =
      error instanceof globalThis.Error ? error.message : String(error);
    console.error(`startup failed: ${message}`);
    process.exitCode = 1;
  });
