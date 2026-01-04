// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ButtonMono, ButtonMonoInvert, Identicon } from '@polkadot-live/ui';
import { ConfirmWrapper } from './Wrappers';
import { FlexColumn, FlexRow } from '@polkadot-live/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ellipsisFn } from '@w3ux/utils';
import { faKey } from '@fortawesome/free-solid-svg-icons';
import type { DeleteProps } from './types';

export const Delete = ({
  genericAccount,
  handleDeleteAddress,
  setSection,
  setStatus,
}: DeleteProps) => {
  const { accountName, publicKeyHex } = genericAccount;

  // Click handler function.
  const handleDeleteClick = async () => {
    const goBack = await handleDeleteAddress(genericAccount);
    setStatus(0);
    goBack && setSection(0);
  };

  return (
    <ConfirmWrapper>
      <Identicon value={publicKeyHex} fontSize={'4rem'} />
      <FlexColumn $rowGap={'0.5rem'} style={{ alignItems: 'center' }}>
        <h3>Delete Account</h3>
        <h4>{accountName}</h4>
        <FlexRow $gap={'0.4rem'}>
          <FontAwesomeIcon icon={faKey} transform={'shrink-5'} />
          <h5>{ellipsisFn(publicKeyHex, 12)}</h5>
        </FlexRow>
      </FlexColumn>
      <p>
        Deleting this account will turn off all of its active subscriptions. It
        will need to be re-imported into the application after deletion.
      </p>
      <div className="footer">
        <ButtonMonoInvert text="Cancel" onClick={() => setStatus(0)} />
        <ButtonMono
          className="confirm-action"
          text="Delete Account"
          onClick={async () => await handleDeleteClick()}
        />
      </div>
    </ConfirmWrapper>
  );
};
