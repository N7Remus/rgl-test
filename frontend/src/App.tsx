import { Button } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import ReactGridLayout, { Layout, useContainerWidth } from "react-grid-layout";
import { aspectRatio, LayoutConstraint } from "react-grid-layout/core";
import { io } from "socket.io-client";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
//import Header from "./components/Header"

const socket = io("http://localhost:4000");

interface layoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  constraints: LayoutConstraint[];
}

interface Item {
  key: string;
  label: string;
  color: string;
}

export default function MyGrid() {
  const { width, containerRef, mounted } = useContainerWidth();
  const constraints16x9 = useMemo(() => [aspectRatio(16 / 9)], []);

  const [rowHeight, setRowHeight] = useState(30);
  const [videoCount, setVideoCount] = useState(1);

  let tmpXxx = 1;
  while (videoCount > tmpXxx * tmpXxx) tmpXxx++;

  const [xxx, setXXX] = useState(tmpXxx);

  const cols = xxx;
  const rows = xxx;
  const standardWidth = 1;
  const fullWidth = standardWidth * cols;

  const [layout, setLayoutState] = useState<Layout[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  //állapotváltás
  const [prevState, setPrevState] = useState<{
    layout: Layout[];
    items: Item[];
    xxx: number;
    videoCount: number;
  } | null>(null);

  let colFill = 0;
  let nextRow = 0;

  //állapotmentes
  function savePrevState() {
    if (!prevState) {
      setPrevState({
        layout: layout,
        items: items,
        xxx: xxx,
        videoCount: videoCount,
      });
    }
  }

  function addXXX() {
    savePrevState();
    const newVal = xxx + 1;
    setXXX(newVal);
    emitState(layout, items, newVal, videoCount);
  }

  function removeXXX() {
    if (xxx > 1) {
      savePrevState();
      const newVal = xxx - 1;
      setXXX(newVal);
      emitState(layout, items, newVal, videoCount);
    }
  }

  function addVideoCount() {
    savePrevState();
    const newVal = videoCount + 1;
    setVideoCount(newVal);
    emitState(layout, items, xxx, newVal);
  }

  function removeVideoCount() {
    if (videoCount > 1) {
      savePrevState();
      const newVal = videoCount - 1;
      setVideoCount(newVal);
      emitState(layout, items, xxx, newVal);
    }
  }

  function emitState(l: Layout[], it: Item[], x: number, v: number) {
    savePrevState();
    socket.emit("state:change", { layout: l, items: it, xxx: x, videoCount: v });
  }

  function colorPick(x: boolean, y: boolean) {
    if (x) return y ? "#ff0000" : "#0000ff";
    if (y) return "#00ff00";
    return "#00ffff";
  }

  function generateAndSyncLayout() {
    savePrevState();
    socket.emit("generate:layout", { videoCount });
  }

  function toggleHistory() {
    if (prevState) {
      //hisotry vissza
      const currentState = {
        layout: layout,
        items: items,
        xxx: xxx,
        videoCount: videoCount,
      };
      setLayoutState(prevState.layout);
      setItems(prevState.items);
      setXXX(prevState.xxx);
      setVideoCount(prevState.videoCount);
      emitState(prevState.layout, prevState.items, prevState.xxx, prevState.videoCount);
      setPrevState(currentState); // toggle kész, most ez az előző állapot
    }
  }

  //szerver felol
  useEffect(() => {
    socket.on("state:update", (data) => {
      if (data.layout) setLayoutState(data.layout);
      if (data.items) setItems(data.items);
      if (data.xxx) setXXX(data.xxx);
      if (data.videoCount) setVideoCount(data.videoCount);
    });
    return () => {
      socket.off("state:update");
    };
  }, []);

  const children = useMemo(
    () =>
      items.map((item) => (
        <div
          key={item.key}
          style={{
            backgroundColor: item.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            objectFit: "contain",
          }}
        >
          <video style={{ width: "100%", height: "100%" }} autoPlay muted loop>
            <source src="http://localhost/flower.webm" type="video/mp4" />
          </video>
        </div>
      )),
    [items]
  );

  useEffect(() => {
    if (!width) return;
    const v = Math.floor(width / (16 / 9) / rows);
    setRowHeight(v);
  }, [layout, xxx, width]);

  return (
    <>
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        height: "48px",
        padding: "0 16px",
        backgroundColor: "#FFD700",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
      }}>

        <Button onClick={addVideoCount}>v+ {videoCount}</Button>
        <Button onClick={addXXX}>Increase Grid</Button>
        <Button onClick={generateAndSyncLayout}>Reorganize Grid {xxx}</Button>
        <Button onClick={removeXXX}>Decrease Grid</Button>
        <Button onClick={removeVideoCount}>v-</Button>
        <Button onClick={toggleHistory}>History Back</Button>
      </div>

      <div
        ref={containerRef}
        style={{
          aspectRatio: "16/9",
          overflow: "hidden",
          margin: "auto",
          maxHeight: "720px",
          border: "red",
          borderStyle: "dotted",
        }}
      >

        {mounted && (
          <ReactGridLayout
            layout={layout}
            width={width}
            gridConfig={{ cols: fullWidth, rowHeight: rowHeight, margin: [0, 0] }}
            dragConfig={{ bounded: true }}
            resizeConfig={{ enabled: true, handles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"] }}
            onLayoutChange={(newLayout) => {
              savePrevState();
              setLayoutState(newLayout);
              emitState(newLayout, items, xxx, videoCount);
            }}
            constraints={constraints16x9}
          >
            {children}
          </ReactGridLayout>
        )}
      </div>

      <div style={{ textAlign: "center", margin: "auto" }}>
        <Button disabled>Apply to Live Layout</Button>
        <Button disabled>Reset to Live layout</Button>
      </div>

      <div style={{ textAlign: "center", margin: "auto" }}>
        <Button disabled>360p</Button>
        <Button disabled>HD (720p)</Button>
        <Button disabled>900p</Button>
        <Button disabled>FHD (1080p)</Button>
      </div>

      <div style={{ textAlign: "center", margin: "auto" }}>
        <Button disabled>Start Webinar</Button>
        <Button disabled>Pause Webinar</Button>
        <Button disabled>Stop Webinar</Button>
      </div>
    </>
  );
}