// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useConnections } from '@ren/contexts/common';
import { useRenameHandler } from '@ren/contexts/import';
import { DialogContent, FlexColumn, FlexRow } from '@polkadot-live/ui/styles';
import { CopyButton } from '@polkadot-live/ui/components';
import styled from 'styled-components';
import type { EncodedAccount } from '@polkadot-live/types/accounts';

const AddressText = styled.p`
  line-height: 2rem;
  font-size: 1.2rem;
  overflow-wrap: break-word;
  word-break: break-word;
  white-space: normal;
  text-align: center;

  > span {
    margin-right: 0.75rem;
  }
`;

export const DialogShowAddress = ({
  encodedAccount,
}: {
  encodedAccount: EncodedAccount;
}) => {
  const { getTheme } = useConnections();
  const { getShowAddressDialogData, setShowAddressDialogData } =
    useRenameHandler();

  const { address } = encodedAccount;
  const theme = getTheme();

  const handleOpenChange = (open: boolean) =>
    open
      ? setShowAddressDialogData({ encodedAccount, isOpen: open })
      : setShowAddressDialogData({ encodedAccount: null, isOpen: open });

  return (
    <Dialog.Root
      open={getShowAddressDialogData().isOpen}
      onOpenChange={handleOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="Dialog__Overlay" />

        <DialogContent $theme={theme}>
          <Dialog.Close className="Dialog__IconButton">
            <Cross2Icon />
          </Dialog.Close>
          <FlexColumn $rowGap={'1.5rem'}>
            <FlexColumn $rowGap={'0.75rem'}>
              <Dialog.Title className="Dialog__Title">
                Show Address
              </Dialog.Title>
            </FlexColumn>

            <span
              style={{
                borderBottom: `1px solid ${theme.textDimmed}`,
                opacity: '0.25',
              }}
            />

            <FlexRow $gap={'1rem'}>
              <AddressText style={{ color: theme.textColorSecondary }}>
                <span>{address}</span>
                <CopyButton
                  theme={theme}
                  onCopyClick={async () =>
                    await window.myAPI.copyToClipboard(address)
                  }
                />
              </AddressText>
            </FlexRow>
          </FlexColumn>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
