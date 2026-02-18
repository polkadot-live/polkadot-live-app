// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import * as Styles from '@polkadot-live/styles';
import * as UI from '@polkadot-live/ui';
import { Listing } from '../Addresses';

interface ImportWcManageProps {
  setSection: React.Dispatch<React.SetStateAction<number>>;
  setShowImportUi: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Manage = ({
  setSection,
  setShowImportUi,
}: ImportWcManageProps) => (
  <Styles.PadWrapper>
    <Styles.FlexColumn $rowGap={'2.5rem'}>
      <section>
        <UI.ActionItem showIcon={false} text={'WalletConnect Accounts'} />
        {/* Top Controls */}
        <UI.ControlsWrapper
          $padWrapper={true}
          $padBottom={false}
          style={{ padding: '1rem 0 0 0', marginBottom: 0 }}
        >
          <Styles.ResponsiveRow $smWidth="500px">
            <Styles.FlexRow>
              <UI.ButtonPrimaryInvert
                className="back-btn"
                text="Back"
                iconLeft={faCaretLeft}
                onClick={() => {
                  setSection(0);
                }}
              />
              <UI.SortControlLabel label="WalletConnect Accounts" />
            </Styles.FlexRow>
            <Styles.FlexRow>
              <UI.ButtonText
                iconLeft={faCaretRight}
                text={'Import'}
                onClick={() => setShowImportUi(true)}
              />
            </Styles.FlexRow>
          </Styles.ResponsiveRow>
        </UI.ControlsWrapper>
      </section>

      {/* Address List */}
      <Listing source={'wallet-connect'} setSection={setSection} />
    </Styles.FlexColumn>
  </Styles.PadWrapper>
);
