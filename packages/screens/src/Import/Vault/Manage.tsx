// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui';
import * as Styles from '@polkadot-live/styles/wrappers';
import {
  useConnections,
  useImportAddresses,
  useImportHandler,
  useOverlay,
} from '@polkadot-live/contexts';
import { faQrcode, faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import { ErrorBoundary } from 'react-error-boundary';
import { Listing } from '../Addresses';
import { Reader } from './Reader';
import { renderToast } from '@polkadot-live/ui';
import type { ManageVaultProps } from './types';

export const Manage = ({ setSection }: ManageVaultProps) => {
  const { grantCameraPermission } = useConnections();
  const { openOverlayWith, setStatus } = useOverlay();
  const { handleImportAddress } = useImportHandler();
  const { isAlreadyImported } = useImportAddresses();

  const onImportClick = () => {
    grantCameraPermission().then((res) => {
      if (!res) {
        const msg = 'Camera Permission Denied';
        renderToast(msg, 'toast-error', 'error', 'top-center');
      } else {
        openOverlayWith(
          <ErrorBoundary fallback={<h2>Could not load QR Scanner</h2>}>
            <Reader
              handleImportAddress={handleImportAddress}
              isAlreadyImported={isAlreadyImported}
              setOverlayStatus={setStatus}
            />
          </ErrorBoundary>,
          'small',
          true
        );
      }
    });
  };

  return (
    <Styles.PadWrapper>
      <Styles.FlexColumn $rowGap={'2.5rem'}>
        <section>
          <UI.ActionItem showIcon={false} text={'Vault Accounts'} />

          {/* Top Controls */}
          <UI.ControlsWrapper
            $padWrapper={true}
            $padBottom={false}
            style={{ padding: '1rem 0 0 0', marginBottom: 0 }}
          >
            <Styles.ResponsiveRow $smWidth="360px">
              <Styles.FlexRow>
                <UI.ButtonPrimaryInvert
                  className="back-btn"
                  text="Back"
                  iconLeft={faCaretLeft}
                  onClick={() => setSection(0)}
                />
                <UI.SortControlLabel label="Vault Accounts" />
              </Styles.FlexRow>
              <Styles.FlexRow>
                <UI.ButtonText
                  iconLeft={faQrcode}
                  text={'Import'}
                  onClick={() => onImportClick()}
                />
              </Styles.FlexRow>
            </Styles.ResponsiveRow>
          </UI.ControlsWrapper>
        </section>

        {/* Address List */}
        <Listing source={'vault'} setSection={setSection} />
      </Styles.FlexColumn>
    </Styles.PadWrapper>
  );
};
