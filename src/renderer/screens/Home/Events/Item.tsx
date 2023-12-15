// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faExternalLinkAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ButtonMono, ButtonMonoInvert } from '@polkadot-cloud/react';
import { isValidHttpUrl } from '@polkadot-cloud/utils';
import { useTooltip } from '@app/contexts/Tooltip';
import { Identicon } from '@app/library/Identicon';
import { EventItem } from './Wrappers';
import type { EventItemProps } from './types';
import type { DismissEvent } from '@/types/reporter';
import { useEvents } from '@/renderer/contexts/Events';

export const Item = ({
  who,
  chain,
  categoryKey,
  eventKey,
  uid,
  title,
  subtitle,
  faIcon,
  actions,
  data,
}: EventItemProps) => {
  const { address } = who;
  const { setTooltipTextAndOpen } = useTooltip();
  const { dismissEvent } = useEvents();

  const handleDismissEvent = (dismiss: DismissEvent) => {
    dismissEvent(dismiss);
  };

  return (
    <EventItem whileHover={{ scale: 1.01 }}>
      <button type="button" onClick={() => handleDismissEvent({ uid, who })}>
        <FontAwesomeIcon icon={faTimes} />
      </button>
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
            <h4>{title}</h4>
            <p>{subtitle}</p>
          </div>
        </section>
        <section>
          {actions.map(({ uri, text }, i) => {
            const isUrl = isValidHttpUrl(uri);
            if (isUrl) {
              return (
                <ButtonMonoInvert
                  key={`${chain}_cat_${categoryKey}_event_${eventKey}_action_${i}`}
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
                  key={`event_action_${i}`}
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
      </div>
    </EventItem>
  );
};
