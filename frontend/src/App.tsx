import { Button } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import ReactGridLayout, { Layout, useContainerWidth } from "react-grid-layout";
import { aspectRatio, LayoutConstraint } from "react-grid-layout/core";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";


interface layoutItem {

  i: string,
  x: number,
  y: number,
  w: number,
  h: number,
  constraints: LayoutConstraint[]
}
interface Item {
  key: string, // peerid-mode
  label: string, // name 
  color: string
}

export default function MyGrid() {
  const { width, containerRef, mounted } = useContainerWidth();
  // Pre-create constraint instances to avoid recreating on each render
  const constraints16x9 = useMemo(() => [aspectRatio(16 / 9)], []);
  const [rowHeight, setRowHeight] = useState(30);
  const [videoCount, setVideoCount] = useState(1);
  function addXXX() {
    setXXX(xxx + 1);
  }
  function removeXXX() {
    if (xxx > 1)
      setXXX(xxx - 1);
  }

  function addVideoCount() {
    setVideoCount(videoCount + 1);
  }

  function removeVideoCount() {
    if (videoCount > 1)
      setVideoCount(videoCount - 1);
  }

  let tmpXxx = 1;
  while (videoCount > (tmpXxx * tmpXxx)) {
    tmpXxx++;
  }

  const [xxx, setXXX] = useState(tmpXxx);

  const cols = xxx;
  const rows = xxx;
  const standardWidth = 1;
  const fullWidth = standardWidth * cols;
  const standardHeight = 1;
  let colFill = 0;
  let nextRow = 0;

  function colorPick(x: boolean, y: boolean) {
    if (x) {
      if (y)
        return '#ff0000';
      else {
        return '#0000ff';
      }
    } else if (y) {
      return '#00ff00';
    }
    return '#00ffff';
  }

  function randomColor() {
    let colors = [
      // '#ff0000', '#00ff00', '#0000ff',
      "#e74c3c",
      "#c2e73cff",
      "#1c64d7ff",
      "#5c5d5fff"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  async function generateLayout() {
    console.log('generateLayout');
    let tmpItemLayout: Layout[] = [];
    let tmpItems: Item[] = [];

    let tmpXxx = 1;
    while (videoCount > (tmpXxx * tmpXxx)) {
      tmpXxx++;
    }

    for (let i = 0; i < videoCount; i++) {
      let newName: Layout = {
        i: "video" + (i),
        x: colFill,
        y: nextRow,
        w: standardWidth,
        h: standardHeight,
        constraints: constraints16x9
      };
      tmpItemLayout.push(newName);

      let newN = { key: "video" + (i), label: "16:9 Video" + (i), color: colorPick(colFill % 2 === 0, nextRow % 2 === 0) };
      tmpItems.push(newN);

      colFill++;
      if (colFill >= tmpXxx) {
        nextRow++;
        colFill = 0;
      }
    }
    console.log('generateLayout - value update');
    console.log('generateLayout - value update', tmpItemLayout, tmpItems);
    setLayoutState(tmpItemLayout);
    setItems(tmpItems);
    setXXX(tmpXxx);
  }

  // 16:9 widescreen items
  const [layout, setLayoutState] = useState<Layout[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  // generateLayout();

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
            objectFit: 'contain'
          }}
        >
          <video style={{width:'100%', height: '100%'}} autoPlay muted loop/* controls */ >
              <source src="http://localhost/flower.webm" type="video/mp4"/>
          </video>
          {/* <span className="text" style={{ color: "white", fontWeight: "bold" }}>
            {item.label}
          </span> */}
        </div>
      )),
    [layout]
  );

  useEffect(
    () => {
      // setMaxHeight(window.innerHeight);
      console.log('width', width);
      const v = Math.floor(width / (16 / 9) / rows)
      setRowHeight(v)
      console.log('rowh', v)


    }, [layout, xxx, width]);
  return (
    <>
      {/* <div ref={containerRef} style={{ minHeight: '360px', minWidth: '640px', maxHeight: '360px', maxWidth: '640px', textAlign: "center", margin: "auto", overflow: 'hidden' }}> */}
      <div ref={containerRef} style={{
        aspectRatio: '16/9', overflow: 'hidden', margin: 'auto', maxHeight: '720px',
        border: 'red', borderStyle: 'dotted'


      }}>
        {mounted && (
          <ReactGridLayout
            layout={layout}
            width={width}
            gridConfig={{ cols: fullWidth, rowHeight: rowHeight, margin: [0, 0] }}
            dragConfig={{ bounded: true }}
            resizeConfig={{ enabled: true, handles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"] }}
            onLayoutChange={
              (l) => { 
                console.log(l);
                setLayoutState(l) 
              }
            }
            constraints={constraints16x9}
          >
            {children}
          </ReactGridLayout>
        )}
      </div>
      <div style={{ textAlign: "center", margin: "auto" }}>
        <Button onClick={addVideoCount}>
          v+ {videoCount}
        </Button>
        <Button onClick={addXXX}>
          Increase Grid
        </Button>
        <Button onClick={generateLayout}>
          Reorganize Grid {xxx}
        </Button>
        <Button onClick={removeXXX}>
          Decrease Grid
        </Button>
        <Button onClick={removeVideoCount}>
          v-
        </Button>
      </div>
      <div style={{ textAlign: "center", margin: "auto" }}>
        <Button disabled>
          Apply to Live Layout
        </Button>
        <Button disabled>
          Reset to Live layout
        </Button>
      </div>
      <div style={{ textAlign: "center", margin: "auto" }}>
        <Button disabled>
          360p
        </Button>
        <Button disabled>
          HD (720p)
        </Button>
        <Button disabled>
          900p
        </Button>
        <Button disabled>
          FHD (1080p)
        </Button>
      </div>
      <div style={{ textAlign: "center", margin: "auto" }}>
        <Button disabled>
          Start Webinar
        </Button>
        <Button disabled>
          Pause Webinar
        </Button>
        <Button disabled>
          Stop Webinar
        </Button>
      </div>
    </>
  );
}