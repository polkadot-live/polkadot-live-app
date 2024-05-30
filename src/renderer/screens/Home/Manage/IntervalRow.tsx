// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useHelp } from '@/renderer/contexts/common/Help';
import { useTooltip } from '@/renderer/contexts/common/Tooltip';
import { AccountWrapper } from './Wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfo } from '@fortawesome/pro-solid-svg-icons';
import { useState } from 'react';
import {
  faArrowDownFromDottedLine,
  faListRadio,
} from '@fortawesome/pro-light-svg-icons';
import { Switch } from '@app/library/Switch';
import type { IntervalSubscription } from '@/controller/renderer/IntervalsController';

interface IntervalRowProps {
  task: IntervalSubscription;
  handleIntervalToggle: (task: IntervalSubscription) => Promise<void>;
  handleIntervalNativeCheckbox: (
    task: IntervalSubscription,
    flag: boolean
  ) => Promise<void>;
  handleIntervalOneShot: (
    task: IntervalSubscription,
    nativeChecked: boolean,
    setOneShotProcessing: (processing: boolean) => void
  ) => Promise<void>;
}

export const IntervalRow = ({
  task,
  handleIntervalToggle,
  handleIntervalNativeCheckbox,
  handleIntervalOneShot,
}: IntervalRowProps) => {
  const { openHelp } = useHelp();
  const { setTooltipTextAndOpen } = useTooltip();

  const [isToggled, setIsToggled] = useState<boolean>(task.status === 'enable');
  const [oneShotProcessing, setOneShotProcessing] = useState(false);
  const [nativeChecked, setNativeChecked] = useState(
    task.enableOsNotifications
  );

  const handleToggle = async () => {
    await handleIntervalToggle(task);
    setIsToggled(!isToggled);
  };

  const handleNativeCheckbox = async () => {
    const flag = !nativeChecked;
    await handleIntervalNativeCheckbox(task, flag);
    setNativeChecked(flag);
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
          {/* One Shot Button */}
          <div
            className={`one-shot-wrapper ${!oneShotProcessing ? 'tooltip-trigger-element' : ''}`}
            data-tooltip-text={'Execute Once'}
            onMouseMove={() => setTooltipTextAndOpen('Execute Once')}
          >
            {/* One-shot is not processing. */}
            {!oneShotProcessing && (
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

            {/* One-shot is processing */}
            {oneShotProcessing && (
              <FontAwesomeIcon
                className="processing"
                fade
                icon={faArrowDownFromDottedLine}
                transform={'grow-8'}
              />
            )}
          </div>

          {/* Native OS Notification Checkbox */}
          <div
            className={'native-wrapper tooltip-trigger-element'}
            data-tooltip-text={'Toggle OS Notifications'}
            onMouseMove={() => setTooltipTextAndOpen('Toggle OS Notifications')}
          >
            {/* Nativ checkbox enabled */}
            {task.status === 'enable' && (
              <FontAwesomeIcon
                className={nativeChecked ? 'checked' : 'unchecked'}
                icon={faListRadio}
                transform={'grow-8'}
                onClick={async () => await handleNativeCheckbox()}
              />
            )}

            {/* Native checkbox disabled */}
            {task.status === 'disable' && (
              <FontAwesomeIcon
                className="disabled"
                icon={faListRadio}
                transform={'grow-8'}
              />
            )}
          </div>

          {/* Toggle Switch */}
          <Switch
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
