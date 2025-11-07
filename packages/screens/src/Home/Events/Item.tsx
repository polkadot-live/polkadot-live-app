// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffect, useState, memo } from 'react';
import { useConnections, useEvents } from '@polkadot-live/contexts';
import { FlexColumn, FlexRow } from '@polkadot-live/styles/wrappers';
import { AnimatePresence } from 'framer-motion';
import { EventItem } from './Wrappers';
import {
  faTimes,
  faClock,
  faCircleNodes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getEventChainId, renderTimeAgo } from '@polkadot-live/core';
import { ellipsisFn } from '@w3ux/utils';
import { Identicon, TooltipRx } from '@polkadot-live/ui/components';
import { DividerVerticalIcon } from '@radix-ui/react-icons';
import { ActionsDropdown } from './Dropdowns';
import type { EventAccountData } from '@polkadot-live/types/reporter';
import type { ItemProps } from './types';

const FADE_TRANSITION = 200;

export const Item = memo(function Item({ event }: ItemProps) {
  // The state of the event item display.
  const [display, setDisplay] = useState<'in' | 'fade' | 'out'>('in');

  const { getTheme } = useConnections();
  const { dismissEvent, removeEvent } = useEvents();
  const theme = getTheme();
  const { uid, title, subtitle, txActions, uriActions /*, data*/ } = event;

  // Extract address from event.
  const address =
    event.who.origin === 'account'
      ? (event.who.data as EventAccountData).address
      : 'Chain Event';

  // Extract chain ID from event.
  const chainId = getEventChainId(event);

  // Extract account name from event.
  const accountName =
    event.who.origin === 'account'
      ? (event.who.data as EventAccountData).accountName
      : chainId;

  // Allow the fade-out transition to happen before the event is dismissed from the UI.
  const handleDismissEvent = async () => {
    setDisplay('fade');
    setTimeout(() => setDisplay('out'), FADE_TRANSITION);
    await removeEvent(event);
  };

  // Once event has faded out, send dismiss meessage to the main process. Dismissing the event
  // _after_ the fade-out ensures there will be no race conditions. E.g. the UI rendering and
  // removing the event _before_ the event transition is finished.
  useEffect(() => {
    if (display === 'out') {
      dismissEvent({ uid, who: event.who });
    }
  }, [display]);

  return (
    <AnimatePresence>
      {/* Event item wrapper */}
      {display !== 'out' && (
        <EventItem
          whileHover={{ scale: 1.01 }}
          initial="hidden"
          variants={{
            hidden: { opacity: 0, height: 0 },
            show: {
              opacity: 1,
              height: 'min-content',
            },
          }}
          animate={
            display === 'in'
              ? 'show'
              : display === 'fade'
                ? 'hidden'
                : undefined
          }
          transition={{
            duration: FADE_TRANSITION * 0.001,
            ease: 'easeInOut',
          }}
        >
          {/* Main content */}
          <div>
            <FlexColumn $rowGap={'0.4rem'}>
              <FlexRow>
                <FlexRow $gap={'0.25rem'} style={{ flex: 1, minWidth: 0 }}>
                  <h4>{accountName}</h4>

                  {!['openGov', 'debugging'].includes(event.category) && (
                    <>
                      <DividerVerticalIcon className="DividerVertical" />
                      <div className="icon-wrapper">
                        <div className="icon">
                          <TooltipRx
                            text={ellipsisFn(address, 12)}
                            theme={theme}
                          >
                            <span>
                              <Identicon value={address} fontSize={'1.3rem'} />
                            </span>
                          </TooltipRx>
                        </div>
                      </div>
                    </>
                  )}
                </FlexRow>

                {/** Buttons */}
                <FlexRow style={{ minWidth: 'fit-content' }}>
                  <TooltipRx text={chainId} theme={theme}>
                    <div className="NetworkBtn">
                      <FontAwesomeIcon
                        icon={faCircleNodes}
                        transform={'shrink-2'}
                      />
                    </div>
                  </TooltipRx>

                  <TooltipRx
                    text={renderTimeAgo(event.timestamp)}
                    theme={theme}
                  >
                    <div className="TimeAgoBtn">
                      <FontAwesomeIcon icon={faClock} transform={'shrink-2'} />
                    </div>
                  </TooltipRx>

                  <div
                    className="DismissBtn"
                    onClick={async () => await handleDismissEvent()}
                  >
                    <FontAwesomeIcon icon={faTimes} transform={'grow-2'} />
                  </div>
                </FlexRow>
              </FlexRow>

              <FlexRow>
                <h5 className="text-ellipsis">{title}</h5>
              </FlexRow>
              {uriActions.length + txActions.length > 0 ? (
                <FlexRow style={{ paddingRight: '0.5rem' }}>
                  <ActionsDropdown
                    txActions={txActions}
                    uriActions={uriActions}
                    event={event}
                  />
                  <p>{subtitle}</p>
                </FlexRow>
              ) : (
                <p>{subtitle}</p>
              )}
            </FlexColumn>
          </div>
        </EventItem>
      )}
    </AnimatePresence>
  );
});
