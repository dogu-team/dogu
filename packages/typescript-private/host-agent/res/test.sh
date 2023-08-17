app_bundle="a"

# Check if the app bundle exists
if [ -d "$app_bundle" ]; then
    echo "Moving app bundle to the Applications folder..."
else
    echo "Failed to find the app bundle."
fi
