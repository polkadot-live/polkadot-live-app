// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useOverlay } from '@polkadot-live/ui/contexts';
import { ButtonSubmit } from '@polkadot-live/ui/kits/buttons';
import { faSquarePen } from '@fortawesome/free-solid-svg-icons';
import { useConnections } from '@ren/contexts/common/Connections';
import { useTxMeta } from '@ren/contexts/action/TxMeta';
import type { SubmitProps } from './types';

export const Signer = ({
  info,
  valid,
}: SubmitProps & {
  buttons?: React.ReactNode[];
}) => {
  const { getOnlineMode } = useConnections();
  const { status: overlayStatus } = useOverlay();
  const { initTxDynamicInfo } = useTxMeta();

  const enablePulse = () => {
    const cond1 = !(!valid || overlayStatus !== 0);
    const cond2 = info.txStatus === 'pending';
    return cond1 && cond2;
  };

  const getButtonText = () =>
    info.txStatus === 'finalized' ? 'Submitted' : 'Sign';

  return (
    <div className="signer-container">
      <ButtonSubmit
        text={getButtonText()}
        iconLeft={faSquarePen}
        iconTransform="grow-2"
        onClick={() => initTxDynamicInfo(info.txId)}
        disabled={!valid || info.txStatus !== 'pending' || !getOnlineMode()}
        pulse={enablePulse()}
      />
    </div>
  );
};
