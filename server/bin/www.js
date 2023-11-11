#!/usr/bin/env node

/**
 * Module dependencies.
 */
import app from "../app";
import debugLib from "debug";
import http from "http";
import socketIO from "socket.io";
const debug = debugLib("backend:server");
import { saveMessage } from "../controllers/chat.controller";

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || "8082");
app.set("port", port);

/**
 * Listen on provided port, on all network interfaces.
 */

var server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
  },
});

var userIdToSocketIdMap = {}; // maps user ID to socket object

const getSocketIdFromUserID = (userid) => userIdToSocketIdMap[userid];

io.on("connection", async (socket) => {
  socket.on("disconnect", function () {
    console.log("user disconnected");
  });

  socket.on("message", async function (params) {
    console.log(params)
    io.to(params.to_user_id).emit("new_msg", params);
    await saveMessage(params);
  });

  socket.on("chat_join", async ({ user_id}) => {
    socket.join(user_id);
  });
});

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}
