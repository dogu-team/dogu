work_dir="{{work_dir}}"
file_url="{{file_url}}"
file_size="{{file_size}}"
dir_name="{{dir_name}}"
zip_file="{{dir_name}}.zip"

echo Start update Dogu-Agent
cd $work_dir


echo Download app...
curl -o $zip_file -L $file_url

sleep 5


echo Check File Size...
local_file_size=$(stat -f "%z" "$zip_file")
if [ "$local_file_size" -eq "$file_size" ]; then
    echo "- File size is equal to $file_size bytes."
else
    echo "- File size is not equal to $file_size bytes."
    exit 1
fi


echo "Unzipping ZIP file..."
rm -r "$dir_name"
unzip "$zip_file" -d $dir_name

cd $work_dir/$dir_name
app_bundle=$(ls | grep .app)
app_bundle_src_path=$work_dir/$dir_name/$app_bundle
app_bundle_dest_path=/Applications/$app_bundle
cd $work_dir

if [ "$app_bundle_dest_path" -eq "/Applications/" ]; then
    echo "Fatal error: $app_bundle not found."
    exit 1
fi

if [ -d "$app_bundle_src_path" ]; then
    echo "Moving app $app_bundle to $app_bundle_dest_path"
    if [ -d "$app_bundle_dest_path" ]; then
        echo "- Remove previous $app_bundle_dest_path"
        rm -r "$app_bundle_dest_path"
    fi
    mv "$app_bundle_src_path" "/Applications/"
else
    echo "- Failed to find the app bundle."
    exit 1
fi


echo "Cleaning up..."
rm "$zip_file"
rm -rf "$dir_name"


echo "Launch $app_bundle"...
/usr/bin/xattr -dr com.apple.quarantine "$app_bundle_dest_path"
open -a Finder $app_bundle_dest_path
sleep 5
open -a Finder $app_bundle_dest_path


echo "Launch $app_bundle Done"
kill -9 $(ps -p $(ps -p $PPID -o ppid=) -o ppid=) 
