work_dir="{{work_dir}}"
file_url="{file_url}}"
file_name="{file_name}}"
file_size="{file_size}}"
app_name="{{app_name}}"
app_bundle="{{app_bundle}}"
zip_file="{{zip_file}}"

cd $work_dir

echo Start update $app_name

curl -o $file_name -L $file_url

sleep 5

local_file_size=$(stat -f "%z" "$file_name")
if [ "$local_file_size" -eq "$file_size" ]; then
    echo "File size is equal to $file_size bytes."
else
    echo "File size is not equal to $file_size bytes."
    exit 1
fi

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