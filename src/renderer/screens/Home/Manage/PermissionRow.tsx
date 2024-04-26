// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountWrapper, PermissionCheckBox } from './Wrappers';
import { Switch } from '@app/library/Switch';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { PermissionRowProps } from './types';
import { faArrowDownFromDottedLine as downArrowThin } from '@fortawesome/pro-light-svg-icons';

export const PermissionRow = ({
  task,
  handleToggle,
  handleOneShot,
  handleNativeCheckbox,
  getDisabled,
  getTaskType,
}: PermissionRowProps) => {
  const [isToggled, setIsToggled] = useState<boolean>(task.status === 'enable');
  const [oneShotProcessing, setOneShotProcessing] = useState(false);
  const [nativeChecked, setNativeChecked] = useState(
    task.enableOsNotifications
  );

  useEffect(() => {
    if (task.status === 'enable') {
      setIsToggled(true);
    } else {
      setNativeChecked(false);
      setIsToggled(false);
    }
  }, [task]);

  return (
    <AccountWrapper whileHover={{ scale: 1.01 }}>
      <div className="inner">
        <div>
          <div className="content">
            <h3>{task.label}</h3>
          </div>
        </div>
        <div>
          {/* New One Shot Button */}
          {getTaskType(task) === 'account' && (
            <div className="one-shot-wrapper">
              {/* One-shot is enabled and processing. */}
              {!getDisabled(task) && oneShotProcessing && (
                <FontAwesomeIcon
                  className="processing"
                  fade
                  icon={downArrowThin}
                  transform={'grow-8'}
                />
              )}

              {/* One-shot is enabled and not processing. */}
              {!getDisabled(task) && !oneShotProcessing && (
                <FontAwesomeIcon
                  className="enabled"
                  icon={downArrowThin}
                  transform={'grow-8'}
                  onClick={async () =>
                    await handleOneShot(
                      task,
                      setOneShotProcessing,
                      nativeChecked
                    )
                  }
                />
              )}

              {/* One-shot disabled. */}
              {getDisabled(task) && (
                <FontAwesomeIcon
                  className="disabled"
                  icon={downArrowThin}
                  transform={'grow-8'}
                />
              )}
            </div>
          )}

          {/* Native OS Notification Checkbox */}
          {task.account && (
            <PermissionCheckBox
              disabled={getDisabled(task) || task.status === 'disable'}
            >
              <div className="checkbox-wrapper-29">
                <label className="checkbox">
                  <input
                    disabled={getDisabled(task) || task.status === 'disable'}
                    type="checkbox"
                    checked={!getDisabled(task) && nativeChecked}
                    className="checkbox__input"
                    onChange={async (e) =>
                      await handleNativeCheckbox(e, task, setNativeChecked)
                    }
                  />
                  <span className="checkbox__label"></span>
                  <span className="checkbox__title">native</span>
                </label>
              </div>
            </PermissionCheckBox>
          )}

          {/* Toggle Switch */}
          <Switch
            size="sm"
            type="secondary"
            isOn={isToggled}
            disabled={getDisabled(task)}
            handleToggle={async () => {
              // Send an account or chain subscription task.
              await handleToggle(
                {
                  type: getTaskType(task),
                  tasks: [
                    {
                      ...task,
                      actionArgs: task.actionArgs
                        ? [...task.actionArgs]
                        : undefined,
                    },
                  ],
                },
                setNativeChecked
              );
            }}
          />
        </div>
      </div>
    </AccountWrapper>
  );
};
