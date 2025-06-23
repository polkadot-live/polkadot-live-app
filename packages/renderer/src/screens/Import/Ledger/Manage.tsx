// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import * as Styles from '@polkadot-live/ui/styles';
import {
  ControlsWrapper,
  SortControlLabel,
} from '@polkadot-live/ui/components';
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import {
  ButtonText,
  ButtonPrimaryInvert,
} from '@polkadot-live/ui/kits/buttons';
import { Listing } from '../Addresses';
import type { ImportLedgerManageProps } from '../types';

export const Manage = ({
  setSection,
  setShowImportUi,
}: ImportLedgerManageProps) => (
  <Styles.PadWrapper>
    <Styles.FlexColumn $rowGap={'2.5rem'}>
      <section>
        <UI.ActionItem showIcon={false} text={'Ledger Accounts'} />
        {/* Top Controls */}
        <ControlsWrapper
          $padWrapper={true}
          $padBottom={false}
          style={{ padding: '1rem 0 0 0', marginBottom: 0 }}
        >
          <Styles.ResponsiveRow $smWidth="450px">
            <Styles.FlexRow>
              <ButtonPrimaryInvert
                className="back-btn"
                text="Back"
                iconLeft={faCaretLeft}
                onClick={() => {
                  setSection(0);
                }}
              />
              <SortControlLabel label="Ledger Accounts" />
            </Styles.FlexRow>
            <Styles.FlexRow>
              <ButtonText
                iconLeft={faCaretRight}
                text={'Import'}
                onClick={() => setShowImportUi(true)}
              />
            </Styles.FlexRow>
          </Styles.ResponsiveRow>
        </ControlsWrapper>
      </section>

      {/* Address List */}
      <Listing source={'ledger'} setSection={setSection} />
    </Styles.FlexColumn>
  </Styles.PadWrapper>
);
