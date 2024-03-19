// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ButtonSubmit } from '@/renderer/kits/Buttons/ButtonSubmit';
import { chainCurrency } from '@/config/chains';
import { EstimatedFee } from './Wrappers';
import { faSquarePen } from '@fortawesome/free-solid-svg-icons';
import { SignOverlay } from './SignOverlay';
import { useOverlay } from '@app/contexts/Overlay';
import type { SubmitProps } from './types';

export const Signer = ({
  valid,
  estimatedFee,
  chain,
  from,
}: SubmitProps & {
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
