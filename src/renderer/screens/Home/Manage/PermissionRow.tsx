// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountWrapper } from './Wrappers';
import { Switch } from '@app/library/Switch';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInfo,
  faAnglesDown,
  faList,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useHelp } from '@/renderer/contexts/common/Help';
import { useTooltip } from '@/renderer/contexts/common/Tooltip';
import {
  getTooltipClassForGroup,
  toolTipTextFor,
} from '@app/utils/renderingUtils';
import { WarningIcon } from '@/renderer/kits/Icons/IconWarning';
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
  const { setTooltipTextAndOpen } = useTooltip();

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

  return (
    <AccountWrapper whileHover={{ scale: 1.01 }}>
      <div className="inner">
        <div>
          <div className="content">
            <h3>
              <div
                className="icon-wrapper"
                onClick={() => openHelp(task.helpKey)}
              >
                <FontAwesomeIcon
                  className="info-icon"
                  icon={faInfo}
                  transform={'shrink-1'}
                />
              </div>
              {task.label}

              {/* Warning if nominating pending payouts */}
              {task.action ===
                'subscribe:account:nominating:pendingPayouts' && (
                <WarningIcon tooltip="Could Take Over 10 Seconds" />
              )}
            </h3>
          </div>
        </div>
        <div>
          {/* One Shot Button */}
          {getTaskType(task) === 'account' && (
            <div
              className={`one-shot-wrapper ${!getDisabled(task) && !oneShotProcessing ? 'tooltip-trigger-element' : ''}`}
              data-tooltip-text={'Get Notification'}
              onMouseMove={() => setTooltipTextAndOpen('Get Notification')}
            >
              {/* One-shot is enabled and not processing. */}
              {!getDisabled(task) && !oneShotProcessing && (
                <FontAwesomeIcon
                  className="enabled"
                  icon={faAnglesDown}
                  transform={'grow-4'}
                  onClick={async () =>
                    await handleOneShot(
                      task,
                      setOneShotProcessing,
                      nativeChecked
                    )
                  }
                />
              )}

              {/* One-shot is enabled and processing. */}
              {!getDisabled(task) && oneShotProcessing && (
                <FontAwesomeIcon
                  className="processing"
                  fade
                  icon={faAnglesDown}
                  transform={'grow-4'}
                />
              )}

              {/* One-shot disabled. */}
              {getDisabled(task) && (
                <FontAwesomeIcon
                  className="disabled"
                  icon={faAnglesDown}
                  transform={'grow-4'}
                />
              )}
            </div>
          )}

          {/* Native OS Notification Checkbox */}
          {task.account && (
            <div
              className={`native-wrapper ${!getDisabled(task) ? 'tooltip-trigger-element' : ''}`}
              data-tooltip-text={'OS Notifications'}
              onMouseMove={() => setTooltipTextAndOpen('OS Notifications')}
            >
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
                  transform={'grow-4'}
                />

                {/* Check overlay icon when clicked */}
                {nativeChecked && (
                  <div className="checked-icon-wrapper">
                    <FontAwesomeIcon
                      className={task.status === 'disable' ? 'disable' : ''}
                      icon={faCircleCheck}
                      transform={'shrink-3'}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Toggle Switch */}
          <div
            className={getTooltipClassForGroup(task)}
            data-tooltip={toolTipTextFor(task.category)}
            onMouseMove={() =>
              setTooltipTextAndOpen(toolTipTextFor(task.category), 'left')
            }
          >
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
          </div>
        </div>
      </div>
    </AccountWrapper>
  );
};
