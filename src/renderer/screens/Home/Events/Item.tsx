// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AnimatePresence } from 'framer-motion';
import { ButtonMonoInvert } from '@/renderer/kits/Buttons/ButtonMonoInvert';
import { ButtonMono } from '@/renderer/kits/Buttons/ButtonMono';
import { Config as ConfigRenderer } from '@/config/processes/renderer';
import { EventItem } from './Wrappers';
import { faExternalLinkAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getEventChainId, renderTimeAgo } from '@/utils/EventUtils';
import { getAddressNonce } from '@/utils/AccountUtils';
import { isValidHttpUrl } from '@w3ux/utils';
import { Identicon } from '@app/library/Identicon';
import { useEffect, useState, memo } from 'react';
import { useEvents } from '@/renderer/contexts/Events';
import { useBootstrapping } from '@/renderer/contexts/Bootstrapping';
import { useTooltip } from '@app/contexts/Tooltip';
import type { EventAccountData } from '@/types/reporter';
import type { ItemProps } from './types';
import type { AccountSource } from '@/types/accounts';
import { faAngleDown } from '@fortawesome/pro-solid-svg-icons';

const FADE_TRANSITION = 200;

export const Item = memo(function Item({ faIcon, event }: ItemProps) {
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

  // The state of the event item display.
  const [display, setDisplay] = useState<'in' | 'fade' | 'out'>('in');

  // Allow the fade-out transition to happen before the event is dismissed from the UI.
  const handleDismissEvent = async () => {
    setDisplay('fade');
    setTimeout(() => setDisplay('out'), FADE_TRANSITION);

    const result = await window.myAPI.removeEventFromStore(event);
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
          <span>{renderTimeAgo(event.timestamp)}</span>
          {/* Dismiss button */}
          <div className="dismiss-btn">
            <FontAwesomeIcon
              icon={faTimes}
              onClick={async () => await handleDismissEvent()}
            />
          </div>

          {/* Expand actions button */}

          {actions.length > 0 && (
            <div className="show-actions-btn">
              <FontAwesomeIcon icon={faAngleDown} transform={'shrink-2'} />
            </div>
          )}

          {/* Main content */}
          <div>
            <section>
              <div>
                <div className="icon ">
                  <span
                    className="tooltip tooltip-trigger-element"
                    data-tooltip-text={address}
                    onMouseMove={() => setTooltipTextAndOpen(address)}
                  />
                  <Identicon value={address} size={29} />
                  <div className="eventIcon">
                    <FontAwesomeIcon icon={faIcon} />
                  </div>
                </div>
              </div>
              <div>
                <h4>{`${accountName}`}</h4>
                <h5>{title}</h5>
                <p>{subtitle}</p>
              </div>
            </section>

            {/* Render actions */}
            {actions.length > 0 && (
              <section className="actions">
                {actions.map((action, i) => {
                  const { uri, text } = action;
                  action.txMeta && (action.txMeta.eventUid = event.uid);

                  const isUrl = isValidHttpUrl(uri);
                  if (isUrl) {
                    return (
                      <ButtonMonoInvert
                        key={`action_${uid}_${i}`}
                        text={text || ''}
                        iconRight={faExternalLinkAlt}
                        onClick={() => {
                          window.myAPI.openBrowserURL(uri);
                        }}
                      />
                    );
                  } else if (source !== 'read-only') {
                    return (
                      <ButtonMono
                        disabled={
                          event.stale ||
                          source === 'ledger' ||
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

                          ConfigRenderer.portToAction.postMessage({
                            task: 'action:init',
                            data: JSON.stringify(action.txMeta),
                          });
                        }}
                      />
                    );
                  }
                })}
              </section>
            )}
          </div>
        </EventItem>
      )}
    </AnimatePresence>
  );
});
