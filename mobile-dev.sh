#!/bin/bash

echo "🚀 ExpenseTracker Mobile Development Helper"
echo "=========================================="

# Check if build exists
if [ ! -d "build" ]; then
    echo "📦 Building the app..."
    npm run build
fi

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync

# Show available commands
echo ""
echo "📱 Available Commands:"
echo "======================"
echo "1. Build web app:     npm run build"
echo "2. Sync Capacitor:    npx cap sync"
echo "3. Open Android:      npx cap open android"
echo "4. Open iOS:          npx cap open ios"
echo "5. Run on device:     npx cap run android/ios"
echo "6. Check status:      npx cap doctor"
echo "7. List platforms:    npx cap ls"
echo ""

# Check Capacitor status
echo "🔍 Checking Capacitor status..."
npx cap doctor

echo ""
echo "💡 Quick Tips:"
echo "=============="
echo "• Use 'npm run build' before syncing to Capacitor"
echo "• Test PWA features in mobile browser first"
echo "• Install app to home screen for best experience"
echo "• Check MOBILE_APP_GUIDE.md for detailed instructions"
echo ""
echo "🎉 Your ExpenseTracker is now mobile-ready!" 