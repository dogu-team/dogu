import _ from 'lodash';
import path from 'path';
import url from 'url';

export function getFilenameFromUrl(fileurl: string): string {
  const parsed = url.parse(fileurl);
  const filename = path.basename(parsed.path ?? _.uniqueId()).substring(0, 50);
  return filename;
}
