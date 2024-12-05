// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import {
  ButtonPrimaryInvert,
  ButtonText,
} from '@polkadot-live/ui/kits/buttons';
import { ContentWrapper } from '../../../Wrappers';
import { Scrollable } from '@polkadot-live/ui/styles';
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';

interface ImportProps {
  setSection: React.Dispatch<React.SetStateAction<number>>;
  setShowImportUi: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Import = ({ setSection, setShowImportUi }: ImportProps) => (
  <Scrollable
    $footerHeight={4}
    style={{ paddingTop: 0, paddingBottom: '2rem' }}
  >
    {/** Bredcrumb */}
    <UI.ControlsWrapper $padWrapper={true} $padButton={false}>
      <ButtonPrimaryInvert
        className="back-btn"
        text="Back"
        iconLeft={faCaretLeft}
        onClick={() => {
          setSection(0);
        }}
      />
      <UI.SortControlLabel label="Import Wallet Connect Accounts" />

      <ButtonText
        iconLeft={faCaretRight}
        text={'Wallet Connect Accounts'}
        disabled={false}
        onClick={() => setShowImportUi(false)}
      />
    </UI.ControlsWrapper>

    {/** Content */}
    <ContentWrapper style={{ padding: '1rem 2rem 0', marginTop: '1rem' }}>
      <span>Content...</span>
    </ContentWrapper>
  </Scrollable>
);
