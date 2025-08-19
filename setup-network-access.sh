#!/bin/bash

echo "🌐 Setting up Network Access for Mobile Development"
echo "=================================================="

# Get your computer's IP address
echo "🔍 Finding your computer's IP address..."
IP_ADDRESS=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

if [ -z "$IP_ADDRESS" ]; then
    echo "❌ Could not find your IP address automatically"
    echo "Please run 'ifconfig' (Mac/Linux) or 'ipconfig' (Windows) to find your IP"
    exit 1
fi

echo "✅ Your computer's IP address is: $IP_ADDRESS"
echo ""

# Check if React dev server is running
echo "🔍 Checking if React dev server is running..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ React dev server is running on port 3000"
else
    echo "❌ React dev server is not running"
    echo "Please start it with: npm start"
    echo ""
    echo "Then access your app on mobile at:"
    echo "http://$IP_ADDRESS:3000"
    exit 1
fi

echo ""
echo "📱 Mobile Access Information"
echo "============================"
echo "Your React app should now be accessible on mobile devices at:"
echo "🌐 http://$IP_ADDRESS:3000"
echo ""

# Check firewall status on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🔒 Checking macOS Firewall..."
    FIREWALL_STATUS=$(sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate)
    echo "Firewall status: $FIREWALL_STATUS"
    
    if [[ "$FIREWALL_STATUS" == *"enabled"* ]]; then
        echo "⚠️  Firewall is enabled. You may need to allow incoming connections."
        echo "   Go to System Preferences > Security & Privacy > Firewall"
        echo "   Click 'Firewall Options' and add Node.js to allowed apps"
    fi
fi

echo ""
echo "📋 Troubleshooting Steps:"
echo "========================"
echo "1. Make sure your mobile device is on the SAME WiFi network as your computer"
echo "2. Try accessing http://$IP_ADDRESS:3000 in your mobile browser"
echo "3. If it doesn't work, check your computer's firewall settings"
echo "4. Make sure no antivirus is blocking the connection"
echo ""

echo "🚀 Quick Start Commands:"
echo "======================="
echo "• Start dev server: npm start"
echo "• Start with network access: npm run start:network"
echo "• Check if port is open: lsof -i :3000"
echo "• Test connection: curl http://localhost:3000"
echo ""

echo "💡 Pro Tips:"
echo "============"
echo "• Use 'npm run start:network' for explicit network access"
echo "• Your mobile device must be on the same WiFi network"
echo "• Some corporate networks block device-to-device communication"
echo "• Consider using ngrok for public access (see below)"
echo ""

# Check if ngrok is available
if command -v ngrok &> /dev/null; then
    echo "🌍 ngrok is available! You can also use:"
    echo "   ngrok http 3000"
    echo "   This will give you a public URL accessible from anywhere"
else
    echo "🌍 Want public access? Install ngrok:"
    echo "   npm install -g ngrok"
    echo "   ngrok http 3000"
fi

echo ""
echo "🎯 Test your mobile access now at:"
echo "   http://$IP_ADDRESS:3000"
echo ""
echo "Happy mobile development! 📱✨" 