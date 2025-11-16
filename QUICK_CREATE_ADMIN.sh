#!/bin/bash

echo "========================================"
echo "Creating Admin Account in Production"
echo "========================================"
echo ""

cd "$(dirname "$0")/server"

export MONGODB_URI="mongodb+srv://pluslee:pluslee219@cluster0.vr0unwy.mongodb.net/tonpay-africa?appName=Cluster0"

echo "Connecting to Production MongoDB..."
echo ""

if [ -z "$1" ]; then
    echo "Usage: ./QUICK_CREATE_ADMIN.sh admin@tonpay.com yourpassword"
    echo ""
    echo "Example:"
    echo "  ./QUICK_CREATE_ADMIN.sh admin@tonpay.com mypassword123"
    echo ""
    exit 1
fi

if [ -z "$2" ]; then
    echo "Error: Password is required!"
    echo "Usage: ./QUICK_CREATE_ADMIN.sh admin@tonpay.com yourpassword"
    echo ""
    exit 1
fi

node scripts/create-admin.js "$1" "$2"

echo ""
echo "========================================"
echo "Done! Now try logging in at:"
echo "https://tonpay-africa.vercel.app/admin"
echo "========================================"

