// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useConnections } from '@ren/contexts/common';
import { useDialogControl } from '@ren/contexts/import';
import {
  DialogContent,
  DialogHr,
  FlexColumn,
  FlexRow,
} from '@polkadot-live/styles/wrappers';
import { CopyButton } from '@polkadot-live/ui/components';
import styled from 'styled-components';

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

export const DialogShowAddress = ({ address }: { address: string }) => {
  const { getTheme } = useConnections();
  const { getShowAddressDialogData, setShowAddressDialogData } =
    useDialogControl();

  const theme = getTheme();

  const handleOpenChange = (open: boolean) =>
    open
      ? setShowAddressDialogData({ address, isOpen: open })
      : setShowAddressDialogData({ address: null, isOpen: open });

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

            <DialogHr $theme={theme} />

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
