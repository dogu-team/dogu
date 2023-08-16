osascript -e "display notification \"Start update\" with title \"Dogu-Agent\""

app_name="{{app_name}}"
app_bundle="{{app_bundle}}"
zip_file="{{zip_file}}"

sleep 10

# Unzip the ZIP file
osascript -e "display notification \"1. Unzipping ZIP file...\" with title \"Dogu-Agent\""
echo "1. Unzipping ZIP file..."
unzip "$zip_file"

# Check if the app bundle exists
if [ -d "$app_bundle" ]; then
    # Move the app bundle to the Applications folder
    osascript -e "display notification \"2. Moving app bundle to the Applications folder...\" with title \"Dogu-Agent\""
    echo "2. Moving app bundle to the Applications folder..."
    rm -rf "/Applications/$app_bundle"
    mv "$app_bundle" "/Applications/"
else
    echo "Failed to find the app bundle."
    exit 1
fi

# Clean up downloaded ZIP file
echo "Cleaning up..."
rm "$zip_file"
xattr -dr com.apple.quarantine "/Applications/$app_bundle"

sleep 3

osascript -e "display notification \"Launch $app_name\" with title \"Dogu-Agent\""
echo "3. Launch $app_name"
open /Applications/$app_bundle