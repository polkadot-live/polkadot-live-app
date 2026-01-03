// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui';
import {
  ChainPallets,
  getReadablePallet,
} from '@polkadot-live/consts/subscriptions/chainEvents';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SubscriptionRow } from './SubscriptionRow';
import { faCaretLeft, faSplotch } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import {
  useApiHealth,
  useChainEvents,
  useConnections,
} from '@polkadot-live/contexts';
import {
  FlexColumn,
  FlexRow,
  ItemsColumn,
} from '@polkadot-live/styles/wrappers';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ChainEventSubscription } from '@polkadot-live/types';
import type { SubscriptionsProps } from './types';

export const Subscriptions = ({
  breadcrumb,
  setSection,
  subscriptions,
}: SubscriptionsProps) => {
  const { activeChain } = useChainEvents();
  const { getOnlineMode } = useConnections();
  const { hasConnectionIssue } = useApiHealth();

  const [accordionVal, setAccordionVal] = useState<string>('');

  // Utility to determine if a connection issue exists.
  const showConnectionIssue = (): boolean => {
    const chainId = breadcrumb as ChainID;
    return chainId ? hasConnectionIssue(chainId) : false;
  };

  // Handle back click.
  const onBack = () => {
    setSection(0);
  };

  // Get categorized subscriptions.
  const getCategorised = (): Record<string, ChainEventSubscription[]> => {
    const result: Record<string, ChainEventSubscription[]> = {};
    const pallets = activeChain ? ChainPallets[activeChain] : [];
    for (const pallet of pallets) {
      result[pallet] = subscriptions
        .filter(({ pallet: p }) => p === pallet)
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    return result;
  };

  // Get number of active subscriptions for pallet.
  const activeSubCountForPallet = (pallet: string): number =>
    subscriptions
      .filter((s) => s.pallet === pallet)
      .filter(({ enabled }) => enabled).length;

  return (
    <>
      <UI.ControlsWrapper $sticky={false} style={{ marginBottom: '1.5rem' }}>
        <div className="left">
          <UI.ButtonPrimaryInvert
            className="back-btn"
            text="Back"
            iconLeft={faCaretLeft}
            onClick={() => onBack()}
          />
          <UI.SortControlLabel label={breadcrumb} />
        </div>
      </UI.ControlsWrapper>

      {!getOnlineMode() && <UI.OfflineBanner rounded={true} />}
      {getOnlineMode() && showConnectionIssue() && (
        <UI.OfflineBanner
          rounded={true}
          text={'Reconnect chain to restore API access.'}
        />
      )}

      <UI.ScreenInfoCard>
        <div>Toggle chain subscriptions.</div>
      </UI.ScreenInfoCard>

      <FlexColumn>
        <UI.AccordionWrapper style={{ marginTop: '1rem' }}>
          <Accordion.Root
            className="AccordionRoot"
            collapsible={true}
            type="single"
            value={accordionVal}
            onValueChange={(val) => setAccordionVal(val as string)}
          >
            <FlexColumn>
              {Object.entries(getCategorised()).map(([pallet, subs]) => (
                <Accordion.Item
                  key={pallet}
                  className="AccordionItem"
                  value={pallet}
                >
                  <FlexRow $gap={'2px'}>
                    <UI.AccordionTrigger narrow={true}>
                      <ChevronDownIcon
                        className="AccordionChevron"
                        aria-hidden
                      />
                      <UI.TriggerHeader>
                        <FlexRow>
                          <span style={{ flex: 1 }}>
                            {getReadablePallet(pallet)}
                          </span>
                          {activeSubCountForPallet(pallet) > 0 && (
                            <FontAwesomeIcon
                              className="splotch"
                              icon={faSplotch}
                            />
                          )}
                        </FlexRow>
                      </UI.TriggerHeader>
                    </UI.AccordionTrigger>
                  </FlexRow>

                  <UI.AccordionContent transparent={true}>
                    <ItemsColumn>
                      {subs.map((sub, i) => (
                        <SubscriptionRow
                          key={`${pallet}-${sub.eventName}-${i}`}
                          subscription={sub}
                        />
                      ))}
                    </ItemsColumn>
                  </UI.AccordionContent>
                </Accordion.Item>
              ))}
            </FlexColumn>
          </Accordion.Root>
        </UI.AccordionWrapper>
      </FlexColumn>
    </>
  );
};
