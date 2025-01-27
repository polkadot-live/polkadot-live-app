// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  faCoins,
  faPenToSquare,
  faWarning,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Wrapper } from './Wrapper';
import { appendOrEmpty } from '@w3ux/utils';
import type { ReactElement } from 'react';

export type DisplayFor = 'default' | 'modal' | 'canvas';

export interface TxProps {
  // whether there is margin on top.
  margin?: boolean;
  // account type for the transaction signing.
  label: string;
  // account id
  TxSigner: ReactElement;
  // whether there is enough funds for the transaction.
  notEnoughFunds: boolean;
  // warning messgae.
  dangerMessage: string;
  // for estimated fee.
  EstimatedFee: ReactElement;
  // signing component.
  SignerComponent: ReactElement;
  // display for.
  displayFor?: DisplayFor;
}

/**
 * @name Tx
 * @summary A wrapper to handle transaction submission.
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
