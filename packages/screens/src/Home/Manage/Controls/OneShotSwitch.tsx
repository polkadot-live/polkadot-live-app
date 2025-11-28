// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as FA from '@fortawesome/free-solid-svg-icons';
import { useConnections, useSubscriptions } from '@polkadot-live/contexts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TooltipRx } from '@polkadot-live/ui/components';
import type { OneShotSwitchProps } from './types';

export const OneShotSwitch = ({
  task,
  isChecked,
  isProcessing,
  isDisabled,
  setProcessing,
}: OneShotSwitchProps) => {
  const { onOneShot } = useSubscriptions();
  const { getTheme } = useConnections();

  return (
    <TooltipRx text={'Get Notification'} theme={getTheme()}>
      <div className="one-shot-wrapper">
        {/* One-shot is enabled and not processing. */}
        {!isDisabled(task) && !isProcessing && (
          <FontAwesomeIcon
            className="enabled"
            icon={FA.faAnglesDown}
            transform={'grow-3'}
            onClick={async () =>
              await onOneShot(task, setProcessing, isChecked)
            }
          />
        )}

        {/* One-shot is enabled and processing. */}
        {!isDisabled(task) && isProcessing && (
          <FontAwesomeIcon
            className="processing"
            fade
            icon={FA.faAnglesDown}
            transform={'grow-3'}
          />
        )}

        {/* One-shot disabled. */}
        {isDisabled(task) && (
          <FontAwesomeIcon
            className="disabled"
            icon={FA.faAnglesDown}
            transform={'grow-3'}
          />
        )}
      </div>
    </TooltipRx>
  );
};
