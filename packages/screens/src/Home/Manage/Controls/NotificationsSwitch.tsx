// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as FA from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSubscriptions } from '@polkadot-live/contexts';
import type { NotificationsSwitchProps } from './types';

export const NotificationsSwitch = ({
  task,
  isChecked,
  isDisabled,
}: NotificationsSwitchProps) => {
  const { onNotificationToggle } = useSubscriptions();

  return (
    <button
      type="button"
      disabled={task.status === 'disable'}
      style={{
        opacity: task.enableOsNotifications ? '1' : '0.3',
        cursor: task.status === 'disable' ? 'not-allowed' : 'pointer',
      }}
      onClick={async () =>
        !isDisabled(task) &&
        task.status === 'enable' &&
        onNotificationToggle(!isChecked, task)
      }
    >
      <div className="native-wrapper">
        <FontAwesomeIcon icon={FA.faList} />
      </div>
    </button>
  );
};
