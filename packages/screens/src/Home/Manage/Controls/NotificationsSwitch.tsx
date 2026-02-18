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
      className="native-content"
      onClick={async () =>
        !isDisabled(task) &&
        task.status === 'enable' &&
        onNotificationToggle(!isChecked, task)
      }
    >
      {/* Main icon */}
      <FontAwesomeIcon
        className={
          !isDisabled(task) && task.status === 'enable'
            ? isChecked
              ? 'checked'
              : 'unchecked'
            : 'disabled'
        }
        icon={FA.faList}
        transform={'grow-3'}
      />

      {/* Check overlay icon when clicked */}
      {isChecked && (
        <div className="checked-icon-wrapper">
          <FontAwesomeIcon
            className={task.status === 'disable' ? 'disable' : ''}
            icon={FA.faCircleCheck}
            transform={'shrink-5'}
          />
        </div>
      )}
    </button>
  );
};
