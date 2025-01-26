// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useOverlay } from '@polkadot-live/ui/contexts';
import { ButtonSubmit } from '@polkadot-live/ui/kits/buttons';
import { faSquarePen } from '@fortawesome/free-solid-svg-icons';
import { useTxMeta } from '@ren/renderer/contexts/action/TxMeta';
import type { SubmitProps } from './types';

export const Signer = ({
  txId,
  valid,
}: SubmitProps & {
  buttons?: React.ReactNode[];
}) => {
  const { status: overlayStatus } = useOverlay();
  const { initTxDynamicInfo } = useTxMeta();

  return (
    <div className="signer-container">
      <ButtonSubmit
        text="Sign"
        iconLeft={faSquarePen}
        iconTransform="grow-2"
        onClick={async () => {
          initTxDynamicInfo(txId);
        }}
        disabled={!valid}
        pulse={!(!valid || overlayStatus !== 0)}
      />
    </div>
  );
};
