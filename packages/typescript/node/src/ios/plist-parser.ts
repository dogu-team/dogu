import bplist from 'bplist-parser';
import plist, { PlistObject } from 'plist';

export function readPlist(contents: string): PlistObject {
  let doc: PlistObject = {};
  try {
    const bpdoc = bplist.parseBuffer(contents);
    doc = bpdoc[0] as PlistObject;
  } catch {
    doc = plist.parse(contents) as PlistObject;
  }
  return doc;
}
