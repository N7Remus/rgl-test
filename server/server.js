const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

//globalis valtozok
let sharedLayout = [];
let sharedItems = [];
let sharedXxx = 1;
let sharedVideoCount = 1;
let stateHistory = [];

io.on("connection", (socket) => {
  console.log("Kliens csatlakozott", socket.id);

  //uj klines aktuális állapotot kapja
  socket.emit("state:update", {
    layout: sharedLayout,
    items: sharedItems,
    xxx: sharedXxx,
    videoCount: sharedVideoCount,
  });

  //kliensek állapotváltozásai
  socket.on("state:change", (data) => {
    if (data.layout) sharedLayout = data.layout;
    if (data.items) sharedItems = data.items;
    if (data.xxx) sharedXxx = data.xxx;
    if (data.videoCount) sharedVideoCount = data.videoCount;

    //history mentés, max20
    stateHistory.push({
      layout: sharedLayout,
      items: sharedItems,
      xxx: sharedXxx,
      videoCount: sharedVideoCount,
    });
    if (stateHistory.length > 20) stateHistory.shift();

    //küldjük minden kliensnek
    socket.broadcast.emit("state:update", data);
  });

  //history
  socket.on("state:restore", (index) => {
    if (stateHistory[index]) {
      const restored = stateHistory[index];

      sharedLayout = restored.layout;
      sharedItems = restored.items;
      sharedXxx = restored.xxx;
      sharedVideoCount = restored.videoCount;

      io.emit("state:update", restored);
    }
  });

  //reorganize gomb
  socket.on("generate:layout", (data) => {
    const videoCount = data.videoCount || sharedVideoCount;

    let tmpXxx = 1;
    while (videoCount > tmpXxx * tmpXxx) tmpXxx++;

    const tmpLayout = [];
    const tmpItems = [];
    let colFill = 0, nextRow = 0;

    for (let i = 0; i < videoCount; i++) {
      tmpLayout.push({
        i: "video" + i,
        x: colFill,
        y: nextRow,
        w: 1,
        h: 1,
        constraints: [{ type: "aspectRatio", ratio: 16 / 9 }],
      });

      tmpItems.push({
        key: "video" + i,
        label: "16:9 Video" + i,
        color: (colFill % 2 === 0 && nextRow % 2 === 0)
          ? "#ff0000"
          : colFill % 2 === 0
          ? "#0000ff"
          : nextRow % 2 === 0
          ? "#00ff00"
          : "#00ffff",
      });

      colFill++;
      if (colFill >= tmpXxx) {
        colFill = 0;
        nextRow++;
      }
    }

    //globális változok frissitése
    sharedLayout = tmpLayout;
    sharedItems = tmpItems;
    sharedXxx = tmpXxx;
    sharedVideoCount = videoCount;

    io.emit("state:update", {
      layout: sharedLayout,
      items: sharedItems,
      xxx: sharedXxx,
      videoCount: sharedVideoCount,
    });
  });

  socket.on("disconnect", () => {
    console.log("Kliens lecsatlakozott", socket.id);
  });
});

server.listen(4000, () => {
  console.log("Fut a szerver a http://localhost:4000");
});