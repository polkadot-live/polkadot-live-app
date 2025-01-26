// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigRenderer } from '@ren/config/processes/renderer';
import { AnimatePresence, motion } from 'framer-motion';
import { ButtonMonoInvert, ButtonMono } from '@polkadot-live/ui/kits/buttons';
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
import { ellipsisFn } from '@w3ux/utils';
import { Identicon } from '@polkadot-live/ui/components';
import { useEffect, useState, memo } from 'react';
import { useBootstrapping } from '@app/contexts/main/Bootstrapping';
import { useConnections } from '@app/contexts/common/Connections';
import { useEvents } from '@app/contexts/main/Events';
import { useTooltip } from '@polkadot-live/ui/contexts';
import type { ActionMeta } from 'packages/types/src';
import type { AccountSource } from '@polkadot-live/types/accounts';
import type { EventAccountData } from '@polkadot-live/types/reporter';
import type { ItemProps } from './types';
import Governance from '@ren/config/svg/governance.svg?react';

const FADE_TRANSITION = 200;

type ActionsActiveSide = 'left' | 'right';

export const Item = memo(function Item({ event }: ItemProps) {
  // The state of the event item display.
  const [display, setDisplay] = useState<'in' | 'fade' | 'out'>('in');

  const { isConnecting } = useBootstrapping();
  const { getOnlineMode, isBuildingExtrinsic } = useConnections();
  const { dismissEvent } = useEvents();
  const { setTooltipTextAndOpen } = useTooltip();

  const { uid, title, subtitle, txActions, uriActions /*, data*/ } = event;

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
  // removing the event _before_ the event transition is finished.
  useEffect(() => {
    if (display === 'out') {
      dismissEvent({ uid, who: event.who });
    }
  }, [display]);

  const showIconTooltip = () =>
    event.category !== 'openGov' && event.category !== 'debugging';

  // Flag to determine if primary actions exist for this event.
  const hasTxActions: boolean = txActions.length > 0 && source !== 'read-only';
  const hasUriActions: boolean = uriActions.length > 0;

  // Variants for actions section.
  const actionsVariants = {
    openLeft: { height: 'auto', marginLeft: 0 },
    openRight: {
      height: 'auto',
      marginLeft: hasTxActions ? '-114%' : '-100%',
    },
    closedLeft: { height: 0, marginLeft: 0 },
    closedRight: {
      height: 0,
      marginLeft: hasUriActions ? '-114%' : '-100%',
    },
  };

  // Flag indicating if action buttons are showing.
  const [showActions, setShowActions] = useState(hasTxActions);
  const [activeSide, setActiveSide] = useState<ActionsActiveSide>(() =>
    hasTxActions ? 'left' : hasUriActions ? 'right' : 'left'
  );

  const getActionsVariant = () =>
    showActions
      ? activeSide === 'left'
        ? 'openLeft'
        : 'openRight'
      : activeSide === 'left'
        ? 'closedLeft'
        : 'closedRight';

  /**
   * Open action window and initialize with the event's tx data.
   */
  const openActionWindow = async (txMeta: ActionMeta, btnLabel: string) => {
    // Relay building extrinsic flag to app.
    window.myAPI.relayModeFlag('isBuildingExtrinsic', true);

    const extrinsicsViewOpen = await window.myAPI.isViewOpen('action');

    if (!extrinsicsViewOpen) {
      // Relay init task to extrinsics window after its DOM has loaded.
      window.myAPI.openWindow('action', {
        windowId: 'action',
        task: 'action:init',
        serData: JSON.stringify(txMeta),
      });

      // Analytics.
      window.myAPI.umamiEvent('window-open-extrinsics', {
        action: `${event.category}-${btnLabel?.toLowerCase()}`,
      });
    } else {
      window.myAPI.openWindow('action');

      // Send init task directly to extrinsics window if it's already open.
      ConfigRenderer.portToAction?.postMessage({
        task: 'action:init',
        data: JSON.stringify(txMeta),
      });
    }
  };

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
          {hasUriActions && (
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

            {(hasTxActions || hasUriActions) && (
              <motion.section
                className="actions-wrapper"
                initial={{ marginLeft: 0 }}
                animate={getActionsVariant()}
                variants={actionsVariants}
                transition={{ type: 'spring', duration: 0.25, bounce: 0 }}
              >
                {/** Tx Actions */}
                <div className="actions">
                  {txActions.map(({ label, txMeta }, i) => {
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
                          <ButtonMono disabled={true} text={label} />
                        </div>
                      );
                    } else if (source !== 'read-only') {
                      return (
                        <ButtonMono
                          disabled={
                            isBuildingExtrinsic ||
                            event.stale ||
                            !getOnlineMode() ||
                            (getOnlineMode() && isConnecting)
                          }
                          key={`action_${uid}_${i}`}
                          text={label}
                          onClick={async () => openActionWindow(txMeta, label)}
                        />
                      );
                    }
                  })}

                  {hasUriActions && (
                    <ButtonMonoInvert
                      text="Links"
                      iconRight={faAngleRight}
                      iconTransform="shrink-2"
                      onClick={() => setActiveSide('right')}
                    />
                  )}
                </div>

                {/** URI Actions */}
                <div className="actions">
                  {hasTxActions && (
                    <ButtonMono
                      text=""
                      iconLeft={faAngleLeft}
                      iconTransform="shrink-2"
                      onClick={() => setActiveSide('left')}
                    />
                  )}

                  {uriActions.map(({ uri, label }, i) => (
                    <ButtonMonoInvert
                      key={`action_${uid}_${i}`}
                      text={label}
                      iconRight={faExternalLinkAlt}
                      iconTransform="shrink-2"
                      onClick={() => {
                        window.myAPI.openBrowserURL(uri);
                        window.myAPI.umamiEvent('link-open', {
                          dest: label.toLowerCase(),
                        });
                      }}
                    />
                  ))}
                </div>
              </motion.section>
            )}
          </div>
        </EventItem>
      )}
    </AnimatePresence>
  );
});
