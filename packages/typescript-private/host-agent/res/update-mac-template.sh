osascript -e "display notification \"Start update\" with title \"Dogu-Agent\""

app_name="{{app_name}}"
app_bundle="{{app_bundle}}"
zip_file="{{zip_file}}"

sleep 10

# Unzip the ZIP file
osascript -e "display notification \"Unzipping ZIP file...\" with title \"Dogu-Agent\""
echo "Unzipping ZIP file..."
unzip "$zip_file"

# Check if the app bundle exists
if [ -d "$app_bundle" ]; then
    # Move the app bundle to the Applications folder
    osascript -e "display notification \"Moving app bundle to the Applications folder...\" with title \"Dogu-Agent\""
    echo "Moving app bundle to the Applications folder..."
    rm -rf "/Applications/$app_bundle"
    mv "$app_bundle" "/Applications/"
else
    echo "Failed to find the app bundle."
    exit 1
fi

# Clean up downloaded ZIP file
echo "Cleaning up..."
rm "$zip_file"


osascript -e "display notification \"Launch $app_name\" with title \"Dogu-Agent\""
echo "Launch $app_name"
xattr -dr com.apple.quarantine "/Applications/$app_bundle"
open -a Finder /Applications/Dogu-Agent.app
sleep 10
open -a Finder /Applications/Dogu-Agent.app
osascript -e "display notification \"Launch $app_name done\" with title \"Dogu-Agent\""