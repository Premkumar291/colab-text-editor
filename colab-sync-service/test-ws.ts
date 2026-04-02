import { HocuspocusProvider } from "@hocuspocus/provider";
import * as Y from "yjs";
import dotenv from "dotenv";
import WebSocket from "ws";

dotenv.config();

const docId = "5f3e08e5-d8f3-4e09-a75d-a2e67c138d2b"; // From diagnostic script
// For testing purposes, we need a valid JWT token. 
// We'll skip token test for now and just check if the port is open and accepting WebSocket connections.

async function testWS() {
  console.log("Testing WebSocket connection to ws://localhost:1234...");
  
  const ws = new WebSocket("ws://localhost:1234");
  
  ws.on("open", () => {
    console.log("SUCCESS: WebSocket handshake completed.");
    process.exit(0);
  });
  
  ws.on("error", (err) => {
    console.error("FAILED: WebSocket connection error:", err.message);
    process.exit(1);
  });
  
  setTimeout(() => {
    console.error("FAILED: Connection timed out.");
    process.exit(1);
  }, 5000);
}

testWS();
