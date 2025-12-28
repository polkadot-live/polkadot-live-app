// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useConnections, useEvents } from '@polkadot-live/contexts';
import {
  DialogContent,
  DialogHr,
  FlexColumn,
} from '@polkadot-live/styles/wrappers';
import { ChainListWrapper } from '../Wrappers';
import { EncodedField } from './components';

export const DialogEventData = () => {
  const { getTheme } = useConnections();
  const {
    encodedInfo,
    setEncodedInfo,
    dataDialogOpen: dialogOpen,
    setDataDialogOpen: setDialogOpen,
    setDataDialogEvent,
  } = useEvents();

  const theme = getTheme();

  return (
    <Dialog.Root
      open={dialogOpen}
      onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          setEncodedInfo(null);
          setDataDialogEvent(null);
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="Dialog__Overlay" />

        <DialogContent $theme={theme}>
          <Dialog.Close className="Dialog__IconButton">
            <Cross2Icon />
          </Dialog.Close>
          <FlexColumn $rowGap={'1.5rem'}>
            <FlexColumn $rowGap={'0.75rem'}>
              <Dialog.Title className="Dialog__Title">Event Data</Dialog.Title>
              <Dialog.Description className="Dialog__Description">
                Inspect data associated with an event.
              </Dialog.Description>
            </FlexColumn>

            <DialogHr $theme={theme} />

            <ChainListWrapper $theme={theme}>
              <FlexColumn $rowGap={'0.25rem'}>
                {!encodedInfo?.length ? (
                  <p style={{ color: theme.textColorPrimary }}>
                    No event data.
                  </p>
                ) : (
                  encodedInfo.map((item, index) => (
                    <EncodedField key={index} encoded={item} />
                  ))
                )}
              </FlexColumn>
            </ChainListWrapper>
          </FlexColumn>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
