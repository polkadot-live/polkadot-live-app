// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useHelp } from '@/renderer/contexts/common/Help';
import { useTooltip } from '@/renderer/contexts/common/Tooltip';
import { AccountWrapper } from './Wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faInfo,
  faTriangleExclamation,
} from '@fortawesome/pro-solid-svg-icons';
import { useEffect, useRef, useState } from 'react';
import {
  faArrowDownFromDottedLine,
  faListRadio,
  faTimer,
  faXmark,
} from '@fortawesome/pro-light-svg-icons';
import { Switch } from '@app/library/Switch';
import { IntervalsController } from '@/controller/renderer/IntervalsController';
import type { AnyData } from '@/types/misc';
import type { IntervalSubscription } from '@/types/subscriptions';
import { useBootstrapping } from '@/renderer/contexts/main/Bootstrapping';

interface IntervalRowProps {
  task: IntervalSubscription;
  handleIntervalToggle: (task: IntervalSubscription) => Promise<void>;
  handleIntervalNativeCheckbox: (
    task: IntervalSubscription,
    flag: boolean
  ) => Promise<void>;
  handleChangeIntervalDuration: (
    event: React.ChangeEvent<HTMLSelectElement>,
    task: IntervalSubscription,
    setIntervalSetting: (ticksToWait: number) => void
  ) => void;
  handleIntervalOneShot: (
    task: IntervalSubscription,
    nativeChecked: boolean,
    setOneShotProcessing: (processing: boolean) => void
  ) => Promise<void>;
  handleRemoveIntervalSubscription: (
    task: IntervalSubscription
  ) => Promise<void>;
  isTaskDisabled: () => boolean;
}

export const IntervalRow = ({
  task,
  handleIntervalToggle,
  handleIntervalNativeCheckbox,
  handleChangeIntervalDuration,
  handleIntervalOneShot,
  handleRemoveIntervalSubscription,
  isTaskDisabled,
}: IntervalRowProps) => {
  const { openHelp } = useHelp();
  const { setTooltipTextAndOpen } = useTooltip();
  const { online: isConnected } = useBootstrapping();

  const [isToggled, setIsToggled] = useState<boolean>(task.status === 'enable');
  const [oneShotProcessing, setOneShotProcessing] = useState(false);
  const [nativeChecked, setNativeChecked] = useState(
    task.enableOsNotifications
  );
  const [removeClicked, setRemoveClicked] = useState(false);
  const removeTimeoutRef = useRef<null | AnyData>(null);

  const [intervalClicked, setIntervalClicked] = useState(false);
  const [intervalSetting, setIntervalSetting] = useState(
    task.intervalSetting.ticksToWait
  );

  useEffect(() => {
    const newStatusToBoolean = task.status === 'enable';
    newStatusToBoolean !== isToggled && setIsToggled(newStatusToBoolean);
  }, [task.status]);

  useEffect(() => {
    if (!isConnected) {
      setIntervalClicked(false);
    }
  }, [isConnected]);

  const handleToggle = async () => {
    await handleIntervalToggle(task);
    setIsToggled(!isToggled);
  };

  const handleNativeCheckbox = async () => {
    if (!isTaskDisabled() && task.status === 'enable') {
      const flag = !nativeChecked;
      await handleIntervalNativeCheckbox(task, flag);
      setNativeChecked(flag);
    }
  };

  const handleRemove = async () => {
    if (removeTimeoutRef.current !== null) {
      clearTimeout(removeTimeoutRef.current);
      removeTimeoutRef.current = null;
    }
    // Remove subscription.
    await handleRemoveIntervalSubscription(task);
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
            </h3>
          </div>
        </div>
        <div>
          {/* Remove Button */}
          <div
            style={{ display: intervalClicked ? 'none' : 'block' }}
            className="remove-wrapper tooltip-trigger-element"
            data-tooltip-text={'Click Twice to Remove'}
            onMouseMove={() => setTooltipTextAndOpen('Click Twice to Remove')}
          >
            {!removeClicked ? (
              <FontAwesomeIcon
                className="enabled"
                icon={faXmark}
                transform={'grow-8'}
                onClick={() => {
                  removeTimeoutRef.current = setTimeout(() => {
                    removeTimeoutRef.current !== null &&
                      setRemoveClicked(false);
                  }, 5000);
                  setRemoveClicked(true);
                }}
              />
            ) : (
              <FontAwesomeIcon
                className="enabled"
                icon={faTriangleExclamation}
                transform={'grow-8'}
                onClick={async () => await handleRemove()}
              />
            )}
          </div>

          {/* One Shot Button */}
          <div
            style={{ display: intervalClicked ? 'none' : 'block' }}
            className={`one-shot-wrapper ${!oneShotProcessing ? 'tooltip-trigger-element' : ''}`}
            data-tooltip-text={'Get Notification'}
            onMouseMove={() => setTooltipTextAndOpen('Get Notification')}
          >
            {/* One-shot is enabled and not processing. */}
            {!isTaskDisabled() && !oneShotProcessing && (
              <FontAwesomeIcon
                className="enabled"
                icon={faArrowDownFromDottedLine}
                transform={'grow-8'}
                onClick={async () =>
                  await handleIntervalOneShot(
                    task,
                    nativeChecked,
                    setOneShotProcessing
                  )
                }
              />
            )}

            {/* One-shot is enabled and processing */}
            {!isTaskDisabled() && oneShotProcessing && (
              <FontAwesomeIcon
                className="processing"
                fade
                icon={faArrowDownFromDottedLine}
                transform={'grow-8'}
              />
            )}

            {/* One-shot disabled */}
            {isTaskDisabled() && (
              <FontAwesomeIcon
                className="disabled"
                icon={faArrowDownFromDottedLine}
                transform={'grow-8'}
              />
            )}
          </div>

          {/* Interval Selector */}
          <div
            className="interval-wrapper tooltip-trigger-element"
            data-tooltip-text={'Set Interval'}
            onMouseMove={() => setTooltipTextAndOpen('Set Interval')}
          >
            {!intervalClicked || isTaskDisabled() ? (
              <FontAwesomeIcon
                style={
                  isTaskDisabled() ? { opacity: '0.3', cursor: 'default' } : {}
                }
                className="enabled"
                icon={faTimer}
                transform={'grow-8'}
                onClick={() =>
                  setIntervalClicked((prev) =>
                    isTaskDisabled() ? prev : !prev
                  )
                }
              />
            ) : (
              <div className="select-wrapper">
                <select
                  disabled={isTaskDisabled()}
                  className="select-interval"
                  id="select-interval"
                  value={intervalSetting}
                  onChange={(e) =>
                    handleChangeIntervalDuration(e, task, setIntervalSetting)
                  }
                >
                  {IntervalsController.durations.map(
                    ({ label, ticksToWait }, i) => (
                      <option key={`interval_setting_${i}`} value={ticksToWait}>
                        {label}
                      </option>
                    )
                  )}
                </select>
                <FontAwesomeIcon
                  className="enabled"
                  icon={faXmark}
                  transform={'grow-2'}
                  onClick={() => setIntervalClicked(false)}
                />
              </div>
            )}
          </div>

          {/* Native OS Notification Checkbox */}
          <div
            className={'native-wrapper tooltip-trigger-element'}
            data-tooltip-text={'OS Notifications'}
            onMouseMove={() => setTooltipTextAndOpen('OS Notifications')}
          >
            <div
              className="native-content"
              onClick={async () => await handleNativeCheckbox()}
            >
              {/* Main icon */}
              <FontAwesomeIcon
                className={
                  !isTaskDisabled() && task.status === 'enable'
                    ? nativeChecked
                      ? 'checked'
                      : 'unchecked'
                    : 'disabled'
                }
                icon={faListRadio}
                transform={'grow-8'}
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

          {/* Toggle Switch */}
          <Switch
            disabled={isTaskDisabled()}
            size="sm"
            type="secondary"
            isOn={isToggled}
            handleToggle={async () => await handleToggle()}
          />
        </div>
      </div>
    </AccountWrapper>
  );
};
