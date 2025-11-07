// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Dialog from '@radix-ui/react-dialog';
import * as Styles from '@polkadot-live/styles/wrappers';
import { useConnections, useContextProxy } from '@polkadot-live/contexts';
import { Cross2Icon } from '@radix-ui/react-icons';
import type { DialogDeleteExtrinsicProps } from './types';

export const DialogDeleteExtrinsic = ({
  dialogOpen,
  info,
  setDialogOpen,
}: DialogDeleteExtrinsicProps) => {
  const { useCtx } = useContextProxy();
  const { getTheme } = useConnections();
  const { removeExtrinsic } = useCtx('TxMetaCtx')();
  const theme = getTheme();

  const onDeleteClick = async () => {
    if (info) {
      await removeExtrinsic(info);
      setDialogOpen(false);
    }
  };

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="Dialog__Overlay" />

        <Styles.DialogContent $theme={theme}>
          <Dialog.Close className="Dialog__IconButton">
            <Cross2Icon />
          </Dialog.Close>
          <Styles.FlexColumn $rowGap={'1.5rem'}>
            <Styles.FlexColumn $rowGap={'0.75rem'}>
              <Dialog.Title className="Dialog__Title">
                Delete Extrinsic
              </Dialog.Title>

              <Dialog.Description className="Dialog__Description">
                Confirm removal of extrinsic.
              </Dialog.Description>

              <Styles.DialogHr $theme={theme} />

              <Styles.FlexRow>
                <Dialog.Close className="Dialog__Button" style={{ flex: 1 }}>
                  Cancel
                </Dialog.Close>
                <button
                  className="Dialog__Button Danger"
                  onClick={async () => await onDeleteClick()}
                  style={{ flex: 1 }}
                >
                  Delete
                </button>
              </Styles.FlexRow>
            </Styles.FlexColumn>
          </Styles.FlexColumn>
        </Styles.DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
