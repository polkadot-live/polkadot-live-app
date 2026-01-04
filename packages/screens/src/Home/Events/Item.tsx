// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as FA from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState, memo, useRef } from 'react';
import { useConnections, useEvents } from '@polkadot-live/contexts';
import { FlexColumn, FlexRow, MenuButton } from '@polkadot-live/styles';
import { AnimatePresence } from 'framer-motion';
import { EventItem } from './Wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getEventChainId, renderTimeAgo } from '@polkadot-live/core';
import { ellipsisFn } from '@w3ux/utils';
import { Identicon, TooltipRx } from '@polkadot-live/ui';
import { DividerVerticalIcon } from '@radix-ui/react-icons';
import { ActionsDropdown } from './Dropdowns';
import type { EventAccountData } from '@polkadot-live/types/reporter';
import type { ItemProps } from './types';

const FADE_TRANSITION = 200;

export const Item = memo(function Item({ event }: ItemProps) {
  // The state of the event item display.
  const [display, setDisplay] = useState<'in' | 'fade' | 'out'>('in');

  const { cacheGet, getTheme } = useConnections();
  const {
    dismissEvent,
    removeEvent,
    setDataDialogOpen,
    setEncodedInfo,
    setDataDialogEvent,
    startLoading,
    finishLoading,
  } = useEvents();
  const theme = getTheme();
  const darkMode = cacheGet('mode:dark');
  const { uid, title, subtitle, txActions, uriActions, encodedInfo } = event;

  // Used for running the event `onAnimationStart` function exactly once.
  const hasShownRef = useRef(false);

  // Extract address from event.
  const address =
    event.who.origin === 'account'
      ? (event.who.data as EventAccountData).address
      : 'Chain Event';

  // Whether to show identicon.
  const showIdenticon = event.who.origin === 'account';

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
      dismissEvent({ uid });
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
          onAnimationStart={(definition) => {
            if (definition === 'show' && !hasShownRef.current) {
              hasShownRef.current = true;
              startLoading();
              setTimeout(() => {
                finishLoading();
              }, FADE_TRANSITION);
            }
          }}
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

                  {showIdenticon && (
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
                        icon={FA.faCircleNodes}
                        transform={'shrink-2'}
                      />
                    </div>
                  </TooltipRx>

                  <TooltipRx
                    text={renderTimeAgo(event.timestamp)}
                    theme={theme}
                  >
                    <div className="TimeAgoBtn">
                      <FontAwesomeIcon
                        icon={FA.faClock}
                        transform={'shrink-2'}
                      />
                    </div>
                  </TooltipRx>

                  <div
                    className="DismissBtn"
                    onClick={async () => await handleDismissEvent()}
                  >
                    <FontAwesomeIcon icon={FA.faTimes} transform={'grow-2'} />
                  </div>
                </FlexRow>
              </FlexRow>

              <FlexRow>
                <h5 className="text-ellipsis">{title}</h5>
              </FlexRow>

              <FlexRow $gap="0.75rem" style={{ paddingRight: '0.5rem' }}>
                {uriActions.length + txActions.length > 0 && (
                  <ActionsDropdown
                    txActions={txActions}
                    uriActions={uriActions}
                    event={event}
                  />
                )}
                {encodedInfo?.length && (
                  <MenuButton
                    onClick={() => {
                      setEncodedInfo(encodedInfo);
                      setDataDialogEvent(event);
                      setDataDialogOpen(true);
                    }}
                    style={{ width: '32px', height: '18px' }}
                    $dark={darkMode}
                    aria-label="Event Data"
                  >
                    <TooltipRx text="View Data" side="top" theme={theme}>
                      <FontAwesomeIcon
                        className="icon"
                        icon={FA.faBarsStaggered}
                        transform={'shrink-2'}
                      />
                    </TooltipRx>
                  </MenuButton>
                )}
                <p>{subtitle}</p>
              </FlexRow>
            </FlexColumn>
          </div>
        </EventItem>
      )}
    </AnimatePresence>
  );
});
