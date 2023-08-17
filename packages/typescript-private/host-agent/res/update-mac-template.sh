work_dir="{{work_dir}}"
app_name="{{app_name}}"
app_bundle="{{app_bundle}}"
zip_file="{{zip_file}}"

cd $work_dir

echo Start update $app_name

sleep 10

# Unzip the ZIP file
echo "Unzipping ZIP file..."
unzip "$zip_file"

# Check if the app bundle exists
if [ -d "$app_bundle" ]; then
    # Move the app bundle to the Applications folder
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


echo "Launch $app_name"
xattr -dr com.apple.quarantine "/Applications/$app_bundle"
open -a Finder /Applications/Dogu-Agent.app

sleep 10

open -a Finder /Applications/Dogu-Agent.app
echo "Launch $app_name Done"
kill -9 $(ps -p $(ps -p $PPID -o ppid=) -o ppid=) 