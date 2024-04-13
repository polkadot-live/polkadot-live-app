// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountWrapper, PermissionCheckBox } from './Wrappers';
import { Switch } from '@app/library/Switch';
import { useState } from 'react';
import type { PermissionRowProps } from './types';
import { ButtonMonoInvert } from '@/renderer/kits/Buttons/ButtonMonoInvert';

export const PermissionRow = ({
  task,
  handleToggle,
  handleOneShot,
  handleNativeCheckbox,
  getDisabled,
  getTaskType,
}: PermissionRowProps) => {
  const [oneShotProcessing, setOneShotProcessing] = useState(false);
  const [nativeChecked, setNativeChecked] = useState(
    task.enableOsNotifications
  );

  return (
    <AccountWrapper whileHover={{ scale: 1.01 }}>
      <div className="inner">
        <div>
          <div className="content">
            <h3>{task.label}</h3>
          </div>
        </div>
        <div>
          {/* One Shot Button */}
          {getTaskType(task) === 'account' && (
            <div>
              <ButtonMonoInvert
                style={
                  !oneShotProcessing
                    ? {
                        position: 'relative',
                        color: 'var(--text-color-secondary)',
                        borderColor: 'var(--text-color-secondary)',
                      }
                    : {
                        position: 'relative',
                        color: 'var(--background-default)',
                      }
                }
                text="show"
                disabled={getDisabled(task) || oneShotProcessing}
                onClick={async () =>
                  await handleOneShot(task, setOneShotProcessing, nativeChecked)
                }
              />
              {oneShotProcessing && !getDisabled(task) && (
                <div style={{ position: 'absolute' }} className="lds-ellipsis">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
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
            type="secondary"
            isOn={task.status === 'enable'}
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
