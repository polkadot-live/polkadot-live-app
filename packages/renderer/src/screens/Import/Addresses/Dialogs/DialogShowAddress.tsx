// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useConnections } from '@ren/contexts/common';
import { useState } from 'react';
import {
  DialogContent,
  DialogTrigger,
  FlexColumn,
  FlexRow,
} from '@polkadot-live/ui/styles';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CopyButton, TooltipRx } from '@polkadot-live/ui/components';
import styled from 'styled-components';

const ViewIconWrapper = styled.div`
  .ViewIcon {
    cursor: pointer;
    &:hover {
      color: var(--text-color-primary);
    }
  }
`;

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
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const theme = getTheme();

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
  };

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger $theme={theme}>
        <TooltipRx text={'Show Address'} theme={theme}>
          <ViewIconWrapper>
            <FontAwesomeIcon
              className="ViewIcon"
              icon={faEye}
              transform={'shrink-4'}
            />
          </ViewIconWrapper>
        </TooltipRx>
      </DialogTrigger>
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
