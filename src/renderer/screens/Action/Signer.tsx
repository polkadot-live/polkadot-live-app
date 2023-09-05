// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faSquarePen } from '@fortawesome/free-solid-svg-icons';
import { ButtonSubmit } from '@polkadot-cloud/react';
import { chainCurrency } from '@/config/chains';
import { useOverlay } from '@app/contexts/Overlay';
import { SignOverlay } from './SignOverlay';
import { EstimatedFee } from './Wrappers';
import { SubmitProps } from './types';

export const Signer = ({
  valid,
  estimatedFee,
  chain,
  from,
}: SubmitProps & {
  nonce?: number;
  from: string;
  buttons?: React.ReactNode[];
}) => {
  const { status: overlayStatus, openOverlayWith } = useOverlay();

  return (
    <>
      <div>
        <EstimatedFee>
          <p>
            <span>Estimated Fee:</span>
            {estimatedFee === '0'
              ? `...`
              : `${estimatedFee} ${chainCurrency(chain)}`}
          </p>
        </EstimatedFee>
        <p>{valid ? 'Ready to Submit' : '...'}</p>
      </div>
      <div>
        <ButtonSubmit
          text={overlayStatus !== 0 ? 'Signing' : 'Sign'}
          iconLeft={faSquarePen}
          iconTransform="grow-2"
          onClick={async () => {
            openOverlayWith(<SignOverlay from={from} />, 'small', true);
          }}
          disabled={!valid}
          pulse={!(!valid || overlayStatus !== 0)}
        />
      </div>
    </>
  );
};
