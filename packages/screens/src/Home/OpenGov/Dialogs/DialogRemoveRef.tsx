// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  useChainEvents,
  useConnections,
  useIntervalSubscriptions,
  useIntervalTasksManager,
} from '@polkadot-live/contexts';
import * as Styles from '@polkadot-live/styles';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';

export const DialogRemoveRef = () => {
  const { getTheme } = useConnections();
  const { removeSubsForRef } = useChainEvents();
  const { removeAllSubscriptions } = useIntervalTasksManager();
  const { subscriptions } = useIntervalSubscriptions();
  const {
    isRemoveRefDialogOpen,
    removeRefData,
    setRemoveRefData,
    setIsRemoveRefDialogOpen,
  } = useIntervalTasksManager();
  const theme = getTheme();

  const onRemoveClick = async () => {
    if (removeRefData) {
      // Remove referenda-scoped subscriptions.
      const { refId, chainId } = removeRefData;
      removeSubsForRef(chainId, refId);

      // Remove interval subscriptions.
      const subs = subscriptions.get(chainId) ?? [];
      const filtered = subs.filter((s) => s.referendumId === refId);
      await removeAllSubscriptions(chainId, refId, filtered);
    }
    setRemoveRefData(null);
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
                Referendum {removeRefData?.refId ?? '-'}
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
                  type="button"
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
