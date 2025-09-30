#!/usr/bin/env node

import * as pty from "node-pty";
import { config } from "dotenv";
import { exec } from "child_process";

// Load environment variables from .env.local
config({ path: ".env.local" });

// Configuration - set these values or use environment variables
const CLIENT_ID = process.env.GCALCLI_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GCALCLI_CLIENT_SECRET || "";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Error: CLIENT_ID and CLIENT_SECRET must be set");
  console.error(
    "Either set GCALCLI_CLIENT_ID and GCALCLI_CLIENT_SECRET environment variables",
  );
  console.error("or edit this script to add your credentials");
  process.exit(1);
}

console.log("Starting gcalcli token refresh...");

const ptyProcess = pty.spawn("gcalcli", ["init"], {
  name: "xterm-color",
  cols: 80,
  rows: 30,
  cwd: process.cwd(),
  env: process.env as Record<string, string>,
});

let buffer = "";

ptyProcess.onData((data: string) => {
  buffer += data;
  process.stdout.write(data);

  // Check for the refresh prompt
  if (buffer.includes("Ignore and refresh?")) {
    ptyProcess.write("y\r");
    buffer = "";
  }
  // Check for client ID prompt
  else if (buffer.includes("Client ID:")) {
    ptyProcess.write(CLIENT_ID + "\r");
    buffer = "";
  }
  // Check for client secret prompt
  else if (buffer.includes("Client Secret:")) {
    ptyProcess.write(CLIENT_SECRET + "\r");
    buffer = "";
  }
  // Check for authorization URL
  else if (buffer.includes("https://accounts.google.com/o/oauth2/auth")) {
    const urlMatch = buffer.match(/(https:\/\/accounts\.google\.com\/o\/oauth2\/auth[^\s]+)/);
    if (urlMatch) {
      const url = urlMatch[1];
      console.log("\n\nOpening authorization URL in browser...");
      exec(`open "${url}"`, (error) => {
        if (error) {
          console.error("Failed to open browser:", error);
        }
      });
      buffer = "";
    }
  }
});

ptyProcess.onExit(({ exitCode }) => {
  if (exitCode === 0) {
    console.log("\n✓ Token refresh completed successfully");
  } else {
    console.error(`\n✗ Process exited with code ${exitCode}`);
    process.exit(exitCode);
  }
});
