export function getValueInObject(dict: { [key: string]: string }, key: string, defaultValue: string) {
  if (false === key in dict) {
    return defaultValue;
  }
  return dict[key];
}
