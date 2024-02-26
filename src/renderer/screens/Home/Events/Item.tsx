// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faExternalLinkAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { isValidHttpUrl, remToUnit } from '@w3ux/utils';
import { useTooltip } from '@app/contexts/Tooltip';
import { Identicon } from '@app/library/Identicon';
import { EventItem } from './Wrappers';
import type { EventItemProps } from './types';
import { useEvents } from '@/renderer/contexts/Events';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ButtonMonoInvert } from '@/renderer/kits/Buttons/ButtonMonoInvert';
import { ButtonMono } from '@/renderer/kits/Buttons/ButtonMono';

const FADE_TRANSITION = 200;

export const Item = ({ faIcon, event }: EventItemProps) => {
  const { uid, title, subtitle, actions, data } = event;
  const { address, chain } = event.who;

  const { dismissEvent } = useEvents();
  const { setTooltipTextAndOpen } = useTooltip();

  // The state of the event item display.
  const [display, setDisplay] = useState<'in' | 'fade' | 'out'>('in');

  // Allow the fade-out transition to happen before the event is dismissed from the UI.
  const handleDismissEvent = async () => {
    setDisplay('fade');
    setTimeout(() => setDisplay('out'), FADE_TRANSITION);

    const result = await window.myAPI.removeEventFromStore(event);
    console.log(`Remove result: ${result}`);
  };

  // Manually define event item height. Add extra height if actions are present.
  // This could be refactored into a helper function in the future.
  const itemHeight = actions.length ? '9.25rem' : '6.25rem';

  // Once event has faded out, send dismiss meessage to the main process. Dismissing the event
  // _after_ the fade-out ensures there will be no race conditions. E.g. the UI rendering and
  // removing the event before_ the event transition is finished.
  useEffect(() => {
    if (display === 'out') {
      dismissEvent({ uid, who: { address, chain } });
    }
  }, [display]);

  return (
    <AnimatePresence>
      {display !== 'out' && (
        <EventItem
          whileHover={{ scale: 1.01 }}
          initial="hidden"
          variants={{
            hidden: { opacity: 0, height: 0 },
            show: {
              opacity: 1,
              height: remToUnit(itemHeight), // Doesn't play well with `rem` units.
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
          <button
            type="button"
            onClick={async () => await handleDismissEvent()}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <div style={{ height: `calc(${itemHeight} - 0.5rem)` }}>
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
                <h4>{title}</h4>
                <p>{subtitle}</p>
              </div>
            </section>
            {actions.length > 0 && (
              <section className="actions">
                {actions.map(({ uri, text }, i) => {
                  const isUrl = isValidHttpUrl(uri);
                  if (isUrl) {
                    return (
                      <ButtonMonoInvert
                        key={`action_${uid}_${i}`}
                        text={text || ''}
                        iconRight={faExternalLinkAlt}
                        onClick={() => {
                          window.myAPI.closeWindow('menu');
                          window.myAPI.openBrowserURL(uri);
                        }}
                      />
                    );
                  } else {
                    return (
                      <ButtonMono
                        key={`action_${uid}_${i}`}
                        text={text || ''}
                        onClick={() => {
                          window.myAPI.openWindow('action', {
                            uid,
                            action: `${uid}_${uri}`,
                            chain,
                            address,
                            data: JSON.stringify(data),
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
};
