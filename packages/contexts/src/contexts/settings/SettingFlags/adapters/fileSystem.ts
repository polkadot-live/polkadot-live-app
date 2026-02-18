// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export const isFileSystemAccessApiSupported = (): boolean =>
  'showOpenFilePicker' in self;

export const readFile = async (): Promise<string> => {
  const [fileHandle] = await window.showOpenFilePicker();
  const file = await fileHandle.getFile();
  const contents = await file.text();
  return contents;
};

export const writeFile = async (
  fileHandle: FileSystemFileHandle,
  contents: string,
) => {
  const writable = await fileHandle.createWritable();
  await writable.write(contents);
  await writable.close();
};

export const getNewFileHandle = async (): Promise<FileSystemFileHandle> => {
  const options: SaveFilePickerOptions = {
    startIn: 'desktop',
    suggestedName: 'polkadot-live-data.txt',
    types: [
      {
        description: 'Text Files',
        accept: {
          'text/plain': ['.txt'],
        },
      },
    ],
  };
  const handle = await window.showSaveFilePicker(options);
  return handle;
};

export const verifyPermission = async (
  fileHandle: FileSystemFileHandle,
  mode: FileSystemPermissionMode,
) => {
  const options: FileSystemHandlePermissionDescriptor = { mode };
  // Check if permission was already granted. If so, return true.
  if ((await fileHandle.queryPermission(options)) === 'granted') {
    return true;
  }
  // Request permission. If the user grants permission, return true.
  if ((await fileHandle.requestPermission(options)) === 'granted') {
    return true;
  }
  // The user didn't grant permission, so return false.
  return false;
};
