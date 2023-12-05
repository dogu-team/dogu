import _ from 'lodash';
import path from 'path';
import url from 'url';

export function getFilenameFromUrl(fileurl: string, maxLength = 100): string {
  const parsed = url.parse(fileurl);
  const filename = path.basename(parsed.path ?? _.uniqueId()).substring(0, maxLength);
  return filename;
}

export function parseHttpUrl(urlString: string): URL {
  const parsed = new URL(urlString);
  if (!parsed.protocol.startsWith('http')) {
    throw new Error(`Not a http url: ${urlString}`);
  }

  if (parsed.protocol.startsWith('http')) {
    parsed.port = parsed.port || '80';
  }

  if (parsed.protocol.startsWith('https')) {
    parsed.port = parsed.port || '443';
  }

  return parsed;
}

export function parseWsUrlFromHttpUrl(urlString: string): URL {
  const parsed = parseHttpUrl(urlString);
  parsed.protocol = parsed.protocol.replace('http', 'ws');
  return parsed;
}
