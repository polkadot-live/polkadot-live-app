// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as themeVariables from '../../../theme/variables';
import { TaskEntryWrapper } from './Wrappers';
import { Switch, TooltipRx } from '@polkadot-live/ui/components';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInfo,
  faAnglesDown,
  faList,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useConnections } from '@app/contexts/common/Connections';
import { useHelp } from '@app/contexts/common/Help';
import { showGroupTooltip, toolTipTextFor } from '@app/utils/renderingUtils';
import type { PermissionRowProps } from './types';

export const PermissionRow = ({
  task,
  handleToggle,
  handleOneShot,
  handleNativeCheckbox,
  getDisabled,
  getTaskType,
}: PermissionRowProps) => {
  const { openHelp } = useHelp();
  const { darkMode } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

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

  /// Handle clicking on OS Notifications toggle button.
  const handleOsNotificationClick = async () => {
    await handleNativeCheckbox(!nativeChecked, task, setNativeChecked);
  };

  /// Utility to render the one-shot component.
  const renderOneShotSwitch = () => (
    <div className="one-shot-wrapper">
      {/* One-shot is enabled and not processing. */}
      {!getDisabled(task) && !oneShotProcessing && (
        <FontAwesomeIcon
          className="enabled"
          icon={faAnglesDown}
          transform={'grow-3'}
          onClick={async () =>
            await handleOneShot(task, setOneShotProcessing, nativeChecked)
          }
        />
      )}

      {/* One-shot is enabled and processing. */}
      {!getDisabled(task) && oneShotProcessing && (
        <FontAwesomeIcon
          className="processing"
          fade
          icon={faAnglesDown}
          transform={'grow-3'}
        />
      )}

      {/* One-shot disabled. */}
      {getDisabled(task) && (
        <FontAwesomeIcon
          className="disabled"
          icon={faAnglesDown}
          transform={'grow-3'}
        />
      )}
    </div>
  );

  /// Utility to render the OS notifications switch component.
  const renderOsNotificationsSwitch = () => (
    <div
      className="native-content"
      onClick={async () =>
        !getDisabled(task) &&
        task.status === 'enable' &&
        handleOsNotificationClick()
      }
    >
      {/* Main icon */}
      <FontAwesomeIcon
        className={
          !getDisabled(task) && task.status === 'enable'
            ? nativeChecked
              ? 'checked'
              : 'unchecked'
            : 'disabled'
        }
        icon={faList}
        transform={'grow-3'}
      />

      {/* Check overlay icon when clicked */}
      {nativeChecked && (
        <div className="checked-icon-wrapper">
          <FontAwesomeIcon
            className={task.status === 'disable' ? 'disable' : ''}
            icon={faCircleCheck}
            transform={'shrink-5'}
          />
        </div>
      )}
    </div>
  );

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
                <FontAwesomeIcon icon={faInfo} transform={'shrink-1'} />
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
                  {renderOneShotSwitch()}
                </TooltipRx>
              ) : (
                <span>{renderOneShotSwitch()}</span>
              )}
            </>
          )}

          {/* Native OS Notification Checkbox */}
          {task.account && (
            <div>
              {!getDisabled(task) ? (
                <TooltipRx text={'OS Notifications'} theme={theme}>
                  <div className="native-wrapper">
                    {renderOsNotificationsSwitch()}
                  </div>
                </TooltipRx>
              ) : (
                <div className="native-wrapper">
                  {renderOsNotificationsSwitch()}
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
