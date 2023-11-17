import { IElectronIpc } from '../shares/electron-ipc';

export const ipc = window as unknown as IElectronIpc;

export const focusCallbacks: (() => Promise<void> | void)[] = [];
export const onFocus = (callback: () => Promise<void> | void): void => {
  focusCallbacks.push(callback);
};
export const offFocus = (callback: () => Promise<void> | void): void => {
  const index = focusCallbacks.indexOf(callback);
  if (index > -1) {
    focusCallbacks.splice(index, 1);
  }
};

window.onfocus = () => {
  focusCallbacks.forEach((callback) => {
    (async () => {
      await callback();
    })().catch((e) => {
      console.error('onfocus error', e);
    });
  });
};
