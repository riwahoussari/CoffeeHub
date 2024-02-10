#!/bin/bash
cd /data/data/com.termux/files/home/CoffeeHub

pm2 start server.js

am start -a android.intent.action.VIEW -d "http://localhost:5050"
