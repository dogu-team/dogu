import fs from 'fs';
import os from 'os';
import shelljs from 'shelljs';

function getMyLocalNetworkIp(): string {
  const nets = os.networkInterfaces();
  // get local network ip
  const results = Object.keys(nets).reduce((acc, key) => {
    const net = nets[key];
    if (!net) return acc;
    const result = net.find((n) => n.family === 'IPv4' && !n.internal);
    if (result) {
      acc.push(result.address);
    }
    return acc;
  }, [] as string[]);
  if (results.length === 0) throw new Error('no local network ip found');
  const result = results.find((r) => r.startsWith('192'));
  if (result) return result;
  return results[0];
}

const localNetIp = getMyLocalNetworkIp();
shelljs.exec('yarn workspaces foreach  -pvi --jobs unlimited run env:local');
shelljs
  .find('.')
  .filter((file) => file.endsWith('.env') || file.endsWith('.env.local'))
  .forEach((file) => {
    let contents = fs.readFileSync(file, 'utf8');
    contents = contents.replaceAll(/localhost/g, localNetIp);
    contents = contents.replaceAll(/127.0.0.1/g, localNetIp);
    fs.writeFileSync(file, contents);
  });
