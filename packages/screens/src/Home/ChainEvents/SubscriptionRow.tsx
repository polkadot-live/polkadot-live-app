// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as FA from '@fortawesome/free-solid-svg-icons';
import {
  useChainEvents,
  useConnections,
  useHelp,
} from '@polkadot-live/contexts';
import { Switch, TooltipRx } from '@polkadot-live/ui/components';
import { FlexRow, TaskEntryWrapper } from '@polkadot-live/styles/wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { SubscriptionRowProps } from './types';

export const SubscriptionRow = ({ subscription }: SubscriptionRowProps) => {
  const { toggle, toggleOsNotify } = useChainEvents();
  const { getTheme } = useConnections();
  const { openHelp } = useHelp();
  const theme = getTheme();

  return (
    <TaskEntryWrapper whileHover={{ scale: 1.01 }}>
      <div className="inner">
        <div style={{ flex: 1 }}>
          <div className="content">
            <h3>
              <div
                className="icon-wrapper"
                style={{ marginRight: '0.5rem' }}
                onClick={() =>
                  subscription.helpKey && openHelp(subscription.helpKey)
                }
              >
                <FontAwesomeIcon icon={FA.faInfo} transform={'shrink-1'} />
              </div>
              {subscription.label}
            </h3>
          </div>
        </div>
        <div style={{ flex: 0 }}>
          <FlexRow $gap="1.75rem">
            {/* Notification Checkbox */}
            <button
              style={{ opacity: subscription.osNotify ? '1' : '0.3' }}
              onClick={() => toggleOsNotify(subscription)}
            >
              <TooltipRx text={'OS Notifications'} theme={theme}>
                <div className="native-wrapper">
                  <FontAwesomeIcon icon={FA.faList} transform={'grow-3'} />
                </div>
              </TooltipRx>
            </button>

            {/* Toggle Switch */}
            <span style={{ scale: '0.9' }}>
              <Switch
                style={{ paddingRight: '10px' }}
                size="sm"
                type="primary"
                isOn={subscription.enabled}
                handleToggle={async () => {
                  await toggle(subscription);
                }}
              />
            </span>
          </FlexRow>
        </div>
      </div>
    </TaskEntryWrapper>
  );
};
