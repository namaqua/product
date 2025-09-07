#!/bin/bash

echo "========================================="
echo "🔍 PROGRESSIVE TESTING SCRIPT"
echo "========================================="
echo ""

cd /Users/colinroets/dev/pim-admin

function test_step() {
    local step=$1
    local file=$2
    local description=$3
    
    echo "----------------------------------------"
    echo "📋 STEP $step: $description"
    echo "----------------------------------------"
    
    if [ "$step" == "1" ]; then
        echo "Current App.tsx uses only Tailwind (no imports)"
    else
        echo "Copying $file to App.tsx..."
        cp "src/$file" "src/App.tsx"
    fi
    
    echo ""
    echo "👉 Check your browser at http://localhost:5173"
    echo "   You should see: $description"
    echo ""
    echo "✅ If it works, press ENTER to continue"
    echo "❌ If it breaks, press Ctrl+C to stop"
    read -r
}

echo "Make sure 'npm run dev' is running in another terminal!"
echo "Press ENTER to start testing..."
read -r

test_step "1" "App.tsx" "Tailwind CSS only (blue gradient, white cards)"

test_step "2" "AppStep2.tsx" "Button component import (relative path)"

test_step "3" "AppStep3.tsx" "@ alias imports"

echo "========================================="
echo "🎯 FINAL STEP: Full Dashboard"
echo "========================================="
echo "If all previous steps worked, let's try the full Dashboard:"
echo ""
echo "cp src/AppDashboard.tsx src/App.tsx"
echo ""
echo "This will test:"
echo "- ApplicationShell"
echo "- DataTable"
echo "- All components together"
echo ""
echo "Press ENTER to try the full Dashboard..."
read -r

cat > src/App.tsx << 'EOF'
import Dashboard from '@/features/dashboard/Dashboard'

function App() {
  return <Dashboard />
}

export default App
EOF

echo "✅ Full Dashboard applied!"
echo "Check your browser now."
echo ""
echo "If it breaks, we know it's one of the complex components."
echo "========================================="
