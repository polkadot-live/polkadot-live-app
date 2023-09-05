// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faCircle as faCircleRegular } from '@fortawesome/free-regular-svg-icons';
import {
  faAngleDown,
  faAngleUp,
  faCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useChains } from '@app/contexts/Chains';
import { useState } from 'react';
import { ReactComponent as PolkadotIcon } from '../../svg/polkadotIcon.svg';
import { FooterWrapper, NetworkItem } from './Wrapper';
export const Footer = () => {
  const { chains } = useChains();

  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <FooterWrapper className={expanded ? 'expanded' : undefined}>
      <section className="status">
        {chains.length ? (
          <FontAwesomeIcon icon={faCircle} transform="shrink-6" />
        ) : (
          <FontAwesomeIcon icon={faCircleRegular} transform="shrink-6" />
        )}

        <div>
          <h5>
            {chains.length
              ? `Connected to ${chains.length} network${
                  chains.length === 1 ? '' : 's'
                }`
              : 'Disconnected'}{' '}
          </h5>
        </div>
        <button type="button" onClick={() => setExpanded(!expanded)}>
          <FontAwesomeIcon
            icon={expanded ? faAngleDown : faAngleUp}
            transform="grow-0"
          />
        </button>
      </section>
      {expanded && (
        <section>
          <NetworkItem>
            <PolkadotIcon className="icon" />
            <h4>Polkadot</h4>
          </NetworkItem>
        </section>
      )}
    </FooterWrapper>
  );
};
