// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  useConnections,
  useContextProxy,
  useOverlay,
} from '@polkadot-live/contexts';
import { ButtonSubmit } from '@polkadot-live/ui/kits/buttons';
import { faSquarePen } from '@fortawesome/free-solid-svg-icons';
import type { SubmitProps } from './types';

export const Signer = ({
  info,
  valid,
}: SubmitProps & {
  buttons?: React.ReactNode[];
}) => {
  const { useCtx } = useContextProxy();
  const { getOnlineMode } = useConnections();
  const { status: overlayStatus } = useOverlay();
  const { initTxDynamicInfo } = useCtx('TxMetaCtx')();

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
