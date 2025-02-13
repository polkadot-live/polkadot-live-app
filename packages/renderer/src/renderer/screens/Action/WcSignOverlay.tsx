// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ExtrinsicInfo } from '@polkadot-live/types/tx';

interface WcSignOverlayProps {
  info: ExtrinsicInfo;
}

export const WcSignOverlay = ({ info }: WcSignOverlayProps) => {
  console.log(info);

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        padding: '2rem 1rem',
      }}
    >
      <p
        style={{
          backgroundColor: 'rgba(32,32,32,0.4)',
          padding: '3rem',
        }}
      >
        WalletConnect Signer
      </p>
    </div>
  );
};
