// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faPenToSquare, faWarning } from '@fortawesome/free-solid-svg-icons';
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
  name: string;
  // whether there is enough funds for the transaction.
  notEnoughFunds: boolean;
  // warning messgae.
  dangerMessage: string;
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
  name,
  notEnoughFunds,
  dangerMessage,
  SignerComponent,
  displayFor = 'default',
}: TxProps) => (
  <Wrapper className={margin ? 'margin' : undefined}>
    <div className={`inner${appendOrEmpty(displayFor === 'canvas', 'canvas')}`}>
      <p className="sign">
        <span className="badge">
          <FontAwesomeIcon icon={faPenToSquare} className="icon" />
          {label}
        </span>
        {name}
        {notEnoughFunds && (
          <span className="not-enough">
            / &nbsp;
            <FontAwesomeIcon
              icon={faWarning}
              className="danger"
              transform="shrink-1"
            />{' '}
            <span className="danger">{dangerMessage}</span>
          </span>
        )}
      </p>
      <section>{SignerComponent}</section>
    </div>
  </Wrapper>
);
