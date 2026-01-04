// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ContentWrapper, HeightWrapper, OverlayWrapper } from './Wrappers';
import type { OverlayContextInterface } from '@polkadot-live/contexts';

export const Overlay = ({
  overlayCtx,
}: {
  overlayCtx: OverlayContextInterface;
}) => {
  const {
    closeOverlay,
    size,
    status,
    transparent,
    Overlay: OverlayInner,
    disableClose,
  } = overlayCtx;

  if (status === 0) {
    return null;
  }

  /**
   * Mechanism to close overlay only if a specific flag is set in the context.
   */
  const handleCloseOverlay = () => {
    if (!disableClose && status !== 0) {
      closeOverlay();
    }
  };

  return (
    <OverlayWrapper>
      <div>
        <HeightWrapper size={size}>
          <ContentWrapper
            className={transparent === true ? 'transparent' : 'bg'}
          >
            {OverlayInner}
          </ContentWrapper>
        </HeightWrapper>
        <button
          type="button"
          className="close"
          onClick={() => handleCloseOverlay()}
        >
          &nbsp;
        </button>
      </div>
    </OverlayWrapper>
  );
};
