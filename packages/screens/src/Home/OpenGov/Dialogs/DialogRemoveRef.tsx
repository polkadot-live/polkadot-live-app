// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Dialog from '@radix-ui/react-dialog';
import * as Styles from '@polkadot-live/styles';
import { Cross2Icon } from '@radix-ui/react-icons';
import {
  useChainEvents,
  useConnections,
  useIntervalSubscriptions,
  useIntervalTasksManager,
} from '@polkadot-live/contexts';

export const DialogRemoveRef = () => {
  const { getTheme } = useConnections();
  const { activeRefChain, removeSubsForRef } = useChainEvents();
  const { removeAllSubscriptions } = useIntervalTasksManager();
  const { subscriptions } = useIntervalSubscriptions();
  const { isRemoveRefDialogOpen, refIdToRemove, setIsRemoveRefDialogOpen } =
    useIntervalTasksManager();
  const theme = getTheme();

  const onRemoveClick = async () => {
    if (activeRefChain && refIdToRemove) {
      // Remove referenda-scoped subscriptions.
      removeSubsForRef(activeRefChain, refIdToRemove);

      // Remove interval subscriptions.
      const subs = subscriptions.get(activeRefChain) ?? [];
      const filtered = subs.filter((s) => s.referendumId === refIdToRemove);
      await removeAllSubscriptions(activeRefChain, refIdToRemove, filtered);
    }
    setIsRemoveRefDialogOpen(false);
  };

  return (
    <Dialog.Root
      open={isRemoveRefDialogOpen}
      onOpenChange={setIsRemoveRefDialogOpen}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="Dialog__Overlay" />

        <Styles.DialogContent $theme={theme}>
          <Dialog.Close className="Dialog__IconButton">
            <Cross2Icon />
          </Dialog.Close>
          <Styles.FlexColumn $rowGap={'1.5rem'}>
            <Styles.FlexColumn $rowGap={'0.75rem'}>
              <Dialog.Title className="Dialog__Title">
                Referendum {refIdToRemove}
              </Dialog.Title>

              <Dialog.Description className="Dialog__Description">
                Remove this referendum and all its subscriptions.
              </Dialog.Description>

              <Styles.DialogHr $theme={theme} />

              <Styles.FlexRow>
                <Dialog.Close className="Dialog__Button" style={{ flex: 1 }}>
                  Cancel
                </Dialog.Close>
                <button
                  className="Dialog__Button Danger"
                  onClick={async () => await onRemoveClick()}
                  style={{ flex: 1 }}
                >
                  Remove
                </button>
              </Styles.FlexRow>
            </Styles.FlexColumn>
          </Styles.FlexColumn>
        </Styles.DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
