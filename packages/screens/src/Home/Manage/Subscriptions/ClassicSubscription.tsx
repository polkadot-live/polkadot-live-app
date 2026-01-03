// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as FA from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import {
  useConnections,
  useHelp,
  useSubscriptions,
} from '@polkadot-live/contexts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TaskEntryWrapper } from '@polkadot-live/styles/wrappers';
import { Switch, TooltipRx } from '@polkadot-live/ui';
import { NotificationsSwitch, OneShotSwitch } from '../Controls';
import type { ClassicSubscriptionProps } from './types';

export const ClassicSubscription = ({
  task,
  getDisabled,
}: ClassicSubscriptionProps) => {
  const { openHelp } = useHelp();
  const { getTheme } = useConnections();
  const { getTaskType, handleQueuedToggle } = useSubscriptions();
  const theme = getTheme();

  const [isToggled, setIsToggled] = useState<boolean>(task.status === 'enable');
  const [oneShotProcessing, setOneShotProcessing] = useState(false);
  const [nativeChecked, setNativeChecked] = useState(
    task.enableOsNotifications
  );

  useEffect(() => {
    if (task.status === 'enable') {
      setIsToggled(true);
      setNativeChecked(true);
    } else {
      setIsToggled(false);
    }
  }, [task.status]);

  useEffect(() => {
    setNativeChecked(task.enableOsNotifications);
  }, [task.enableOsNotifications]);

  return (
    <TaskEntryWrapper whileHover={{ scale: 1.01 }}>
      <div className="inner">
        <div>
          <div className="content">
            <h3>
              <div
                className="icon-wrapper"
                onClick={() => openHelp(task.helpKey)}
              >
                <FontAwesomeIcon icon={FA.faInfo} transform={'shrink-1'} />
              </div>
              {task.label}
            </h3>
          </div>
        </div>
        <div>
          {/* One Shot Button */}
          {getTaskType(task) === 'account' && (
            <OneShotSwitch
              task={task}
              isChecked={nativeChecked}
              isProcessing={oneShotProcessing}
              isDisabled={getDisabled}
              setProcessing={setOneShotProcessing}
            />
          )}
          {/* Native OS Notification Checkbox */}
          {task.account && (
            <TooltipRx text={'OS Notifications'} theme={theme}>
              <div className="native-wrapper">
                <NotificationsSwitch
                  task={task}
                  isChecked={nativeChecked}
                  isDisabled={getDisabled}
                />
              </div>
            </TooltipRx>
          )}
          {/* Toggle Switch */}
          <span style={{ scale: '0.9' }}>
            <Switch
              style={{ paddingRight: '10px' }}
              size="sm"
              type="primary"
              isOn={isToggled}
              disabled={getDisabled(task)}
              handleToggle={async () => {
                await handleQueuedToggle(task);
              }}
            />
          </span>
        </div>
      </div>
    </TaskEntryWrapper>
  );
};
