// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountWrapper } from './Wrappers';
import { Switch } from '@app/library/Switch';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { PermissionRowProps } from './types';
import {
  faArrowDownFromDottedLine,
  faListRadio,
} from '@fortawesome/pro-light-svg-icons';

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
                  icon={faArrowDownFromDottedLine}
                  transform={'grow-8'}
                />
              )}

              {/* One-shot is enabled and not processing. */}
              {!getDisabled(task) && !oneShotProcessing && (
                <FontAwesomeIcon
                  className="enabled"
                  icon={faArrowDownFromDottedLine}
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
                  icon={faArrowDownFromDottedLine}
                  transform={'grow-8'}
                />
              )}
            </div>
          )}

          {/* Native OS Notification Checkbox */}
          {task.account && (
            <div className="native-wrapper">
              {/* Native checkbox enabled */}
              {!getDisabled(task) && task.status === 'enable' && (
                <FontAwesomeIcon
                  className={nativeChecked ? 'checked' : 'unchecked'}
                  icon={faListRadio}
                  transform={'grow-8'}
                  onClick={async () => {
                    await handleNativeCheckbox(
                      !nativeChecked,
                      task,
                      setNativeChecked
                    );
                  }}
                />
              )}

              {/* Native checkbox disabled */}
              {(getDisabled(task) || task.status === 'disable') && (
                <FontAwesomeIcon
                  className="disabled"
                  icon={faListRadio}
                  transform={'grow-8'}
                />
              )}
            </div>
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
