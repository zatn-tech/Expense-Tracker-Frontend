#!/bin/bash

echo "🔧 Updating IP Address for Mobile Development"
echo "============================================="

# Get current IP address
echo "🔍 Finding your current IP address..."
NEW_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

if [ -z "$NEW_IP" ]; then
    echo "❌ Could not find your IP address automatically"
    echo "Please run 'ifconfig' (Mac/Linux) or 'ipconfig' (Windows) to find your IP"
    exit 1
fi

echo "✅ Your current IP address is: $NEW_IP"

# Check if IP has changed
CURRENT_IP=$(grep "COMPUTER_IP:" src/config/mobileConfig.js | grep -o "'[^']*'" | tr -d "'")

if [ "$CURRENT_IP" = "$NEW_IP" ]; then
    echo "✅ IP address is already up to date: $CURRENT_IP"
else
    echo "🔄 Updating IP address from $CURRENT_IP to $NEW_IP"
    
    # Update the mobileConfig.js file
    sed -i '' "s/COMPUTER_IP: '$CURRENT_IP'/COMPUTER_IP: '$NEW_IP'/g" src/config/mobileConfig.js
    
    echo "✅ IP address updated successfully!"
    echo "📍 New IP: $NEW_IP"
    echo "📱 Mobile access URL: http://$NEW_IP:3000"
    echo "🌐 Backend API URL: http://$NEW_IP:2003"
fi

echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. Restart your React dev server: npm start"
echo "2. Make sure your backend is running on port 2003"
echo "3. Access from mobile at: http://$NEW_IP:3000"
echo "4. Check browser console for API URL confirmation"
echo ""

echo "🎯 Your mobile app should now work with the correct API endpoints!" 