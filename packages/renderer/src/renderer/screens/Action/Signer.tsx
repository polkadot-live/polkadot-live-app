// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useOverlay } from '@polkadot-live/ui/contexts';
import { ButtonSubmit } from '@polkadot-live/ui/kits/buttons';
import { faDatabase, faSquarePen } from '@fortawesome/free-solid-svg-icons';
import { SignOverlay } from './SignOverlay';
import type { SubmitProps } from './types';
import { useTxMeta } from '@app/contexts/action/TxMeta';

export const Signer = ({
  txId,
  txBuilt,
  valid,
  from,
}: SubmitProps & {
  from: string;
  txBuilt: boolean;
  buttons?: React.ReactNode[];
}) => {
  const { status: overlayStatus, openOverlayWith } = useOverlay();
  const { initTxDynamicInfo } = useTxMeta();

  return (
    <div className="signer-container">
      <p>{valid && txBuilt ? 'Ready to Submit' : 'Build Extrinsic'}</p>

      {!txBuilt ? (
        /** Build extrinsic. */
        <ButtonSubmit
          text={'Build'}
          iconLeft={faDatabase}
          iconTransform="grow-2"
          onClick={() => {
            initTxDynamicInfo(txId);
          }}
        />
      ) : (
        /** Submit extrinsic. */
        <ButtonSubmit
          text={overlayStatus !== 0 ? 'Signing' : 'Sign'}
          iconLeft={faSquarePen}
          iconTransform="grow-2"
          onClick={async () => {
            openOverlayWith(
              <SignOverlay txId={txId} from={from} />,
              'small',
              true
            );
          }}
          disabled={!valid}
          pulse={!(!valid || overlayStatus !== 0)}
        />
      )}
    </div>
  );
};
