// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import * as Styles from '@polkadot-live/styles/wrappers';
import {
  ControlsWrapper,
  SortControlLabel,
} from '@polkadot-live/ui/components';
import { faQrcode, faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import { useOverlay } from '@polkadot-live/ui/contexts';
import { ErrorBoundary } from 'react-error-boundary';
import { Listing } from '../Addresses';
import { Reader } from './Reader';
import {
  ButtonText,
  ButtonPrimaryInvert,
} from '@polkadot-live/ui/kits/buttons';
import type { ManageVaultProps } from '../types';

export const Manage = ({ setSection }: ManageVaultProps) => {
  const { openOverlayWith } = useOverlay();

  return (
    <Styles.PadWrapper>
      <Styles.FlexColumn $rowGap={'2.5rem'}>
        <section>
          <UI.ActionItem showIcon={false} text={'Vault Accounts'} />

          {/* Top Controls */}
          <ControlsWrapper
            $padWrapper={true}
            $padBottom={false}
            style={{ padding: '1rem 0 0 0', marginBottom: 0 }}
          >
            <Styles.ResponsiveRow $smWidth="360px">
              <Styles.FlexRow>
                <ButtonPrimaryInvert
                  className="back-btn"
                  text="Back"
                  iconLeft={faCaretLeft}
                  onClick={() => setSection(0)}
                />
                <SortControlLabel label="Vault Accounts" />
              </Styles.FlexRow>
              <Styles.FlexRow>
                <ButtonText
                  iconLeft={faQrcode}
                  text={'Import'}
                  onClick={() => {
                    openOverlayWith(
                      <ErrorBoundary
                        fallback={<h2>Could not load QR Scanner</h2>}
                      >
                        <Reader />
                      </ErrorBoundary>,
                      'small',
                      true
                    );
                  }}
                />
              </Styles.FlexRow>
            </Styles.ResponsiveRow>
          </ControlsWrapper>
        </section>

        {/* Address List */}
        <Listing source={'vault'} setSection={setSection} />
      </Styles.FlexColumn>
    </Styles.PadWrapper>
  );
};
