#!/usr/bin/env node

const { spawn } = require('child_process');
const readline = require('readline');

// Configuration - set these values or use environment variables
const CLIENT_ID = process.env.GCALCLI_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GCALCLI_CLIENT_SECRET || '';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Error: CLIENT_ID and CLIENT_SECRET must be set');
  console.error('Either set GCALCLI_CLIENT_ID and GCALCLI_CLIENT_SECRET environment variables');
  console.error('or edit this script to add your credentials');
  process.exit(1);
}

console.log('Starting gcalcli token refresh...');

const gcalcli = spawn('gcalcli', ['init']);

let buffer = '';

gcalcli.stdout.on('data', (data) => {
  const text = data.toString();
  buffer += text;
  process.stdout.write(text);

  // Check for the refresh prompt
  if (buffer.includes('refresh the token')) {
    console.log('\nResponding with "y" to refresh token...');
    gcalcli.stdin.write('y\n');
    buffer = '';
  }
  // Check for client ID prompt
  else if (buffer.includes('Client ID')) {
    console.log('\nProviding Client ID...');
    gcalcli.stdin.write(CLIENT_ID + '\n');
    buffer = '';
  }
  // Check for client secret prompt
  else if (buffer.includes('Client Secret')) {
    console.log('\nProviding Client Secret...');
    gcalcli.stdin.write(CLIENT_SECRET + '\n');
    buffer = '';
  }
});

gcalcli.stderr.on('data', (data) => {
  process.stderr.write(data);
});

gcalcli.on('close', (code) => {
  if (code === 0) {
    console.log('\n✓ Token refresh completed successfully');
  } else {
    console.error(`\n✗ Process exited with code ${code}`);
    process.exit(code);
  }
});

gcalcli.on('error', (err) => {
  console.error('Failed to start gcalcli:', err);
  process.exit(1);
});