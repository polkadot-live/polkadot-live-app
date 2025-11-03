// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as FA from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { useContextProxy } from '@polkadot-live/contexts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TaskEntryWrapper } from '@polkadot-live/styles/wrappers';
import { Switch, TooltipRx } from '@polkadot-live/ui/components';
import { showGroupTooltip, toolTipTextFor } from '@polkadot-live/core';
import { NotificationsSwitch, OneShotSwitch } from './Controls';
import type { PermissionRowProps } from './types';

export const PermissionRow = ({
  task,
  handleToggle,
  getDisabled,
  getTaskType,
}: PermissionRowProps) => {
  const { useCtx } = useContextProxy();
  const { openHelp } = useCtx('HelpCtx')();
  const { getTheme } = useCtx('ConnectionsCtx')();
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

  /// Utility to render the toggle switch component.
  const renderToggleSwitch = () => (
    <Switch
      style={{ paddingRight: '10px' }}
      size="sm"
      type="primary"
      isOn={isToggled}
      disabled={getDisabled(task)}
      handleToggle={async () => {
        // Send an account or chain subscription task.
        await handleToggle(task);
      }}
    />
  );

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
            <>
              {/* One-shot is enabled and not processing. */}
              {!getDisabled(task) && !oneShotProcessing ? (
                <TooltipRx text={'Get Notification'} theme={theme}>
                  <OneShotSwitch
                    task={task}
                    isChecked={nativeChecked}
                    isProcessing={oneShotProcessing}
                    isDisabled={getDisabled}
                    setProcessing={setOneShotProcessing}
                  />
                </TooltipRx>
              ) : (
                <span>
                  <OneShotSwitch
                    task={task}
                    isChecked={nativeChecked}
                    isProcessing={oneShotProcessing}
                    isDisabled={getDisabled}
                    setProcessing={setOneShotProcessing}
                  />
                </span>
              )}
            </>
          )}

          {/* Native OS Notification Checkbox */}
          {task.account && (
            <div>
              {!getDisabled(task) ? (
                <TooltipRx text={'OS Notifications'} theme={theme}>
                  <div className="native-wrapper">
                    <NotificationsSwitch
                      task={task}
                      isChecked={nativeChecked}
                      isDisabled={getDisabled}
                    />
                  </div>
                </TooltipRx>
              ) : (
                <div className="native-wrapper">
                  <NotificationsSwitch
                    task={task}
                    isChecked={nativeChecked}
                    isDisabled={getDisabled}
                  />
                </div>
              )}
            </div>
          )}

          {/* Toggle Switch */}
          {showGroupTooltip(task) ? (
            <TooltipRx text={toolTipTextFor(task.category)} theme={theme}>
              <span>{renderToggleSwitch()}</span>
            </TooltipRx>
          ) : (
            <span>{renderToggleSwitch()}</span>
          )}
        </div>
      </div>
    </TaskEntryWrapper>
  );
};
