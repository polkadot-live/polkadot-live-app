// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export const dispatchNotification = async (
  id: string,
  title: string,
  subtitle: string,
  body: string
) => {
  await requestNotificationPermission();
  chrome.notifications.create(id, {
    type: 'basic',
    iconUrl: 'public/icon-128.png',
    title,
    message: `${subtitle} - ${body}`,
  });
};

const requestNotificationPermission = async () => {
  if (Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.error('Notification permission denied');
    }
  }
};
