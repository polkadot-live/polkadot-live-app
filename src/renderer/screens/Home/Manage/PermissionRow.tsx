// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountWrapper } from './Wrappers';
import { ButtonMono } from '@/renderer/kits/Buttons/ButtonMono';
import { Switch } from '@app/library/Switch';
import { useState } from 'react';
import type { PermissionRowProps } from './types';

export const PermissionRow = ({
  task,
  handleToggle,
  handleOneShot,
  getDisabled,
  getTaskType,
}: PermissionRowProps) => {
  const [oneShotProcessing, setOneShotProcessing] = useState(false);

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
              <ButtonMono
                style={
                  !oneShotProcessing
                    ? { position: 'relative' }
                    : { position: 'relative', color: 'inherit' }
                }
                text="show"
                disabled={getDisabled(task) || oneShotProcessing}
                onClick={async () =>
                  await handleOneShot(task, setOneShotProcessing)
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

          {/* Toggle Switch */}
          <Switch
            type="secondary"
            size="lg"
            isOn={task.status === 'enable'}
            disabled={getDisabled(task)}
            handleToggle={async () => {
              // Send an account or chain subscription task.
              await handleToggle({
                type: getTaskType(task),
                tasks: [
                  {
                    ...task,
                    actionArgs: task.actionArgs
                      ? [...task.actionArgs]
                      : undefined,
                  },
                ],
              });
            }}
          />
        </div>
      </div>
    </AccountWrapper>
  );
};
