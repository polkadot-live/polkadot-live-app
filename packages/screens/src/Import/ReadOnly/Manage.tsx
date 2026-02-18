// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import * as Styles from '@polkadot-live/styles';
import * as UI from '@polkadot-live/ui';
import { Listing } from '../Addresses';
import { DialogImportReadOnly } from './Dialogs/DialogImportReadOnly';
import type { ManageReadOnlyProps } from './types';

export const Manage = ({ setSection }: ManageReadOnlyProps) => (
  <Styles.PadWrapper>
    <Styles.FlexColumn $rowGap={'2.5rem'}>
      <section>
        <UI.ActionItem showIcon={false} text={'Read-Only Accounts'} />
        <Styles.FlexColumn>
          {/* Top Controls */}
          <UI.ControlsWrapper
            $padWrapper={true}
            $padBottom={false}
            style={{ padding: '1rem 0 0 0', marginBottom: 0 }}
          >
            <UI.ButtonPrimaryInvert
              className="back-btn"
              text="Back"
              iconLeft={faCaretLeft}
              onClick={() => setSection(0)}
            />
            <UI.SortControlLabel label="Read Only Accounts" />
            <DialogImportReadOnly />
          </UI.ControlsWrapper>
        </Styles.FlexColumn>
      </section>

      {/* Address Listing */}
      <Listing source={'read-only'} setSection={setSection} />
    </Styles.FlexColumn>
  </Styles.PadWrapper>
);
