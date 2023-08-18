export function isMajorMinorMatch(a: string, b: string): boolean {
  const aArr = a.split('.');
  const bArr = b.split('.');
  if (aArr.length < 3 || bArr.length < 3) {
    return false;
  }
  return aArr[0] === bArr[0] && aArr[1] === bArr[1];
}

export function compareSemverDesc(av: string, bv: string): number {
  if (av && bv) {
    const arr: string[] = av.split('.');
    const brr: string[] = bv.split('.');

    const len = Math.min(arr.length, brr.length);

    for (let i = 0; i < len; i++) {
      const a2 = +arr[i] || 0;
      const b2 = +brr[i] || 0;

      if (a2 !== b2) {
        return a2 > b2 ? -1 : 1;
      }
    }

    return arr.length - brr.length;
  }

  return -1;
}

export function parseSemver(str: string): string {
  const match: RegExpMatchArray | null | undefined = str.match(
    /(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
  );
  if (match) {
    return match[0];
  }
  throw new Error(`Invalid semver string: ${str}`);
}
