#!/bin/bash

# ===============================================
# 🔨 MICRO TRAINER - EXTENSION BUILD SCRIPT
# ===============================================

echo "🧠 Building Micro Trainer Extension..."

# Step 1: Build React frontend
echo "📦 Step 1: Building React frontend..."
cd ../microtrainer-frontend
npm install
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Frontend build failed"
  exit 1
fi

echo "✅ Frontend built successfully"

# Step 2: Copy to extension
echo "📋 Step 2: Copying build to extension..."
cd ../microtrainer-extension
rm -rf dist
mkdir -p dist
cp -r ../microtrainer-frontend/dist/* ./dist/

echo "✅ Files copied"

# Step 3: Create icons folder (if not exists)
echo "🎨 Step 3: Setting up icons..."
mkdir -p icons

# Check if icons exist
if [ ! -f "icons/icon16.png" ]; then
  echo "⚠️  Warning: icons/icon16.png not found"
  echo "   Please add icon files before publishing"
fi

# Step 4: Validate manifest
echo "🔍 Step 4: Validating manifest.json..."
if [ -f "manifest.json" ]; then
  echo "✅ manifest.json exists"
else
  echo "❌ manifest.json not found"
  exit 1
fi

# Step 5: Create production ZIP
echo "📦 Step 5: Creating production ZIP..."
zip -r microtrainer-extension.zip . \
  -x "*.git*" \
  -x "node_modules/*" \
  -x "*.DS_Store" \
  -x "build.sh" \
  -x "README.md"

echo "✅ Extension packaged: microtrainer-extension.zip"

# Summary
echo ""
echo "🎉 Build complete!"
echo ""
echo "📋 Next steps:"
echo "1. Test locally: chrome://extensions/ → Load unpacked"
echo "2. Test on multiple websites"
echo "3. Upload microtrainer-extension.zip to Chrome Web Store"
echo ""
echo "📁 Extension files ready in: $(pwd)"
