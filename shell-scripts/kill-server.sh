#!/bin/bash

# Kill the NestJS server running on port 3010

echo "========================================="
echo "Killing NestJS Server on Port 3010"
echo "========================================="
echo ""

# Method 1: Find and kill by port
echo "Finding process on port 3010..."
PID=$(lsof -ti:3010)

if [ -n "$PID" ]; then
    echo "Found process: PID $PID"
    echo "Killing process..."
    kill -9 $PID
    echo "✅ Server killed successfully!"
else
    echo "No process found on port 3010"
    echo "The server might already be stopped."
fi

# Also check port 3000 (default NestJS port)
PID_3000=$(lsof -ti:3000)
if [ -n "$PID_3000" ]; then
    echo ""
    echo "Also found process on port 3000: PID $PID_3000"
    echo "Killing it too..."
    kill -9 $PID_3000
    echo "✅ Killed process on port 3000"
fi

echo ""
echo "========================================="
echo "Server stopped. You can now restart it:"
echo "========================================="
echo ""
echo "cd /Users/colinroets/dev/projects/product/pim"
echo "npm run start:dev"
