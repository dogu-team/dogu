// HOW TO USE
// 1. Enter https://storage.googleapis.com/play_public/supported_devices.html and download CSV file
// 2. Modify csv file directory (default: __dirname + '/supported_devices.csv')
// 3. Run `yarn util:parse-device`
// 4. JSON file will be written; `"modelID": "modelName"` formed

import fs from 'fs';

const dir = __dirname + '/supported_devices.csv';
const csvFile = fs.readFileSync(dir, { encoding: 'utf16le', flag: 'r' });

const lines = csvFile.split('\n');

const data: Record<string, string> = {};
lines.forEach((line, i) => {
  if (i === 0) {
    return;
  }

  const sl = line.split(',');
  const modelName = sl[1];
  const modelId = sl[3]?.replaceAll('\r', '');
  if (modelName && modelId) {
    data[modelId] = modelName;
  }
});

fs.writeFileSync(__dirname + '/devices.json', JSON.stringify(data), 'utf8');
