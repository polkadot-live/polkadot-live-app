// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  faCoins,
  faPenToSquare,
  faWarning,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { appendOrEmpty } from '@w3ux/utils';
import { Wrapper } from './Wrapper';
import type { TxProps } from './types';

/**
 * @name Tx
 * @summary A wrapper to handle transaction submission.
 * @deprecated
 */
export const Tx = ({
  margin,
  label,
  TxSigner,
  notEnoughFunds,
  dangerMessage,
  EstimatedFee,
  SignerComponent,
  displayFor = 'default',
}: TxProps) => (
  <Wrapper className={margin ? 'margin' : undefined}>
    <div className={`inner${appendOrEmpty(displayFor === 'canvas', 'canvas')}`}>
      <div className="sign">
        <span className="badge">
          <FontAwesomeIcon
            icon={faPenToSquare}
            className="icon"
            transform="shrink-3"
          />
          {label}
        </span>

        <span>{TxSigner}</span>

        {notEnoughFunds && (
          <span className="not-enough">
            / &nbsp;
            <FontAwesomeIcon
              icon={faWarning}
              className="danger"
              transform="shrink-3"
            />{' '}
            <span className="danger">{dangerMessage}</span>
          </span>
        )}

        <span className="badge">
          <FontAwesomeIcon
            icon={faCoins}
            className="icon"
            transform="shrink-3"
          />
          Estimated Fee
        </span>
        {EstimatedFee}
      </div>
      <section>{SignerComponent}</section>
    </div>
  </Wrapper>
);
