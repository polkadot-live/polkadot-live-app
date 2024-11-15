// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AnimatePresence, motion } from 'framer-motion';
import { ButtonMonoInvert, ButtonMono } from '@polkadot-live/ui/kits/buttons';
import { Config as ConfigRenderer } from '@ren/config/processes/renderer';
import { EventItem } from './Wrappers';
import {
  faAngleLeft,
  faAngleRight,
  faExternalLinkAlt,
  faTimes,
  faAngleDown,
  faAngleUp,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getEventChainId } from '@ren/utils/EventUtils';
import { renderTimeAgo } from '@ren/utils/TextUtils';
import { getAddressNonce } from '@ren/utils/AccountUtils';
import { ellipsisFn, isValidHttpUrl } from '@w3ux/utils';
import { Identicon } from '@polkadot-live/ui/components';
import { useEffect, useState, memo } from 'react';
import { useEvents } from '@app/contexts/main/Events';
import { useBootstrapping } from '@app/contexts/main/Bootstrapping';
import { useTooltip } from '@polkadot-live/ui/contexts';
import type { EventAccountData } from '@polkadot-live/types/reporter';
import type { ItemProps } from './types';
import type { AccountSource } from '@polkadot-live/types/accounts';
import Governance from '@ren/config/svg/governance.svg?react';

const FADE_TRANSITION = 200;

type ActionsActiveSide = 'left' | 'right';

export const Item = memo(function Item({ event }: ItemProps) {
  // The state of the event item display.
  const [display, setDisplay] = useState<'in' | 'fade' | 'out'>('in');

  const { dismissEvent } = useEvents();
  const { online: isOnline, isConnecting } = useBootstrapping();
  const { setTooltipTextAndOpen } = useTooltip();

  const { uid, title, subtitle, actions /*, data*/ } = event;

  // Extract address from event.
  const address =
    event.who.origin === 'account'
      ? (event.who.data as EventAccountData).address
      : 'Chain Event';

  // Extract account source from event.
  const source: AccountSource =
    event.who.origin === 'account'
      ? (event.who.data as EventAccountData).source
      : 'ledger';

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

    const result = await window.myAPI.sendEventTaskAsync({
      action: 'events:remove',
      data: { event },
    });

    console.log(`Remove result: ${result}`);
  };

  // Once event has faded out, send dismiss meessage to the main process. Dismissing the event
  // _after_ the fade-out ensures there will be no race conditions. E.g. the UI rendering and
  // removing the event before_ the event transition is finished.
  useEffect(() => {
    if (display === 'out') {
      dismissEvent({ uid, who: event.who });
    }
  }, [display]);

  const showIconTooltip = () =>
    event.category !== 'openGov' && event.category !== 'debugging';

  // Get primary actions that will always be rendered.
  const getPrimaryActions = () =>
    actions.filter(({ uri }) => !isValidHttpUrl(uri));

  // Get secondary actions for rendering in actions menu.
  const getSecondaryActions = () =>
    actions.filter(({ uri }) => isValidHttpUrl(uri));

  // Flag to determine of primary actions exist for this event.
  const hasPrimaryActions: boolean =
    getPrimaryActions().length > 0 && source !== 'read-only';

  const hasSecondaryActions: boolean = getSecondaryActions().length > 0;

  // Variants for actions section.
  const actionsVariants = {
    openLeft: { height: 'auto', marginLeft: 0 },
    openRight: {
      height: 'auto',
      marginLeft: hasPrimaryActions ? '-114%' : '-100%',
    },
    closedLeft: { height: 0, marginLeft: 0 },
    closedRight: {
      height: 0,
      marginLeft: hasPrimaryActions ? '-114%' : '-100%',
    },
  };

  // Flag indicating if action buttons are showing.
  const [showActions, setShowActions] = useState(hasPrimaryActions);

  const [activeSide, setActiveSide] = useState<ActionsActiveSide>(() =>
    hasPrimaryActions ? 'left' : hasSecondaryActions ? 'right' : 'left'
  );

  const getActionsVariant = () =>
    showActions
      ? activeSide === 'left'
        ? 'openLeft'
        : 'openRight'
      : activeSide === 'left'
        ? 'closedLeft'
        : 'closedRight';

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
          {/* Time ago */}
          <div
            className="time-ago-btn tooltip tooltip-trigger-element"
            data-tooltip-text={renderTimeAgo(event.timestamp)}
            onMouseMove={() =>
              setTooltipTextAndOpen(renderTimeAgo(event.timestamp), 'left')
            }
          >
            <FontAwesomeIcon icon={faClock} />
          </div>

          {/* Dismiss button */}
          <div
            className="dismiss-btn"
            onClick={async () => await handleDismissEvent()}
          >
            <FontAwesomeIcon icon={faTimes} transform={'grow-2'} />
          </div>

          {/* Expand actions button */}
          {hasSecondaryActions && (
            <div
              className="show-actions-btn"
              onClick={() => setShowActions(!showActions)}
            >
              <FontAwesomeIcon
                icon={showActions ? faAngleUp : faAngleDown}
                transform={'grow-2'}
              />
            </div>
          )}

          {/* Main content */}
          <div>
            <section className="item-main">
              <div>
                <div className="icon ">
                  {showIconTooltip() && (
                    <span
                      className="tooltip tooltip-trigger-element"
                      data-tooltip-text={ellipsisFn(address, 16)}
                      onMouseMove={() =>
                        setTooltipTextAndOpen(ellipsisFn(address, 16), 'right')
                      }
                    />
                  )}

                  {event.category === 'openGov' ? (
                    <Governance
                      width="32px"
                      height="32px"
                      style={{ opacity: '0.85' }}
                    />
                  ) : (
                    <Identicon value={address} size={32} />
                  )}
                </div>
              </div>
              <div>
                <h4>{accountName}</h4>
                <h5>{title}</h5>
                <p>{subtitle}</p>
              </div>
            </section>

            {actions.length > 0 && (
              <motion.section
                className="actions-wrapper"
                initial={{ marginLeft: 0 }}
                animate={getActionsVariant()}
                variants={actionsVariants}
                transition={{ type: 'spring', duration: 0.25, bounce: 0 }}
              >
                {/* Render primary actions */}
                <div className="actions">
                  {getPrimaryActions().map((action, i) => {
                    const { text } = action;
                    action.txMeta && (action.txMeta.eventUid = event.uid);

                    if (source === 'ledger') {
                      return (
                        <div
                          key={`action_${uid}_${i}`}
                          className="tooltip tooltip-trigger-element"
                          data-tooltip-text={'Ledger Signing Unsupported'}
                          onMouseMove={() =>
                            setTooltipTextAndOpen(
                              'Ledger Signing Not Supported'
                            )
                          }
                        >
                          <ButtonMono disabled={true} text={text || ''} />
                        </div>
                      );
                    } else if (source !== 'read-only') {
                      return (
                        <ButtonMono
                          disabled={
                            event.stale ||
                            !isOnline ||
                            (isOnline && isConnecting)
                          }
                          key={`action_${uid}_${i}`}
                          text={text || ''}
                          onClick={async () => {
                            window.myAPI.openWindow('action');

                            // Set nonce.
                            if (action.txMeta) {
                              action.txMeta.nonce = await getAddressNonce(
                                address,
                                chainId
                              );
                            }

                            ConfigRenderer.portToAction?.postMessage({
                              task: 'action:init',
                              data: JSON.stringify(action.txMeta),
                            });

                            // Analytics.
                            window.myAPI.umamiEvent('window-open-extrinsics', {
                              action:
                                `${event.category}-${text?.toLowerCase()}` ||
                                'unknown',
                            });
                          }}
                        />
                      );
                    }
                  })}

                  {hasSecondaryActions && (
                    <ButtonMonoInvert
                      text="Links"
                      iconRight={faAngleRight}
                      iconTransform="shrink-2"
                      onClick={() => setActiveSide('right')}
                    />
                  )}
                </div>
                <div className="actions">
                  {hasPrimaryActions && (
                    <ButtonMono
                      text=""
                      iconLeft={faAngleLeft}
                      iconTransform="shrink-2"
                      onClick={() => setActiveSide('left')}
                    />
                  )}

                  {getSecondaryActions().map((action, i) => {
                    const { uri, text } = action;
                    action.txMeta && (action.txMeta.eventUid = event.uid);

                    return (
                      <ButtonMonoInvert
                        key={`action_${uid}_${i}`}
                        text={text || ''}
                        iconRight={faExternalLinkAlt}
                        iconTransform="shrink-2"
                        onClick={() => {
                          window.myAPI.openBrowserURL(uri);
                          window.myAPI.umamiEvent('link-open', {
                            dest: text?.toLowerCase() || 'unknown',
                          });
                        }}
                      />
                    );
                  })}
                </div>
              </motion.section>
            )}
          </div>
        </EventItem>
      )}
    </AnimatePresence>
  );
});
