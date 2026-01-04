// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Dialog from '@radix-ui/react-dialog';
import * as FA from '@fortawesome/free-solid-svg-icons';
import { Cross2Icon } from '@radix-ui/react-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  useApiHealth,
  useChains,
  useConnections,
} from '@polkadot-live/contexts';
import {
  DialogContent,
  DialogHr,
  FlexColumn,
  FlexRow,
} from '@polkadot-live/styles';
import { ChainListWrapper } from './Wrappers';
import { PuffLoader } from 'react-spinners';
import type { ChainID } from '@polkadot-live/types/chains';

export const DialogConnectChains = () => {
  const { getOnlineMode, getTheme } = useConnections();
  const { isWorking, onConnectClick } = useChains();
  const {
    failedConnections,
    reconnectDialogOpen: dialogOpen,
    setReconnectDialogOpen: setDialogOpen,
  } = useApiHealth();

  const theme = getTheme();
  const isConnected = getOnlineMode();

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="Dialog__Overlay" />

        <DialogContent $theme={theme}>
          <Dialog.Close className="Dialog__IconButton">
            <Cross2Icon />
          </Dialog.Close>
          <FlexColumn $rowGap={'1.5rem'}>
            <FlexColumn $rowGap={'0.75rem'}>
              <Dialog.Title className="Dialog__Title">
                Reconnect Networks
              </Dialog.Title>
              <Dialog.Description className="Dialog__Description">
                Retry connecting to networks with failed attempts.
              </Dialog.Description>
            </FlexColumn>

            <DialogHr $theme={theme} />

            <ChainListWrapper $theme={theme}>
              <FlexColumn $rowGap={'0.25rem'}>
                {failedConnections.size === 0 && (
                  <p style={{ color: theme.accentSuccess }}>
                    No failed connections.
                  </p>
                )}
                {[...failedConnections.keys()].map((chainId, i) => (
                  <FlexRow
                    className="ChainItem"
                    $gap={'0.75rem'}
                    key={`${chainId}-${i}`}
                  >
                    <FontAwesomeIcon
                      icon={FA.faCaretRight}
                      transform={'shrink-2'}
                    />
                    <div style={{ flex: 1 }}>
                      <h2>{chainId}</h2>
                    </div>
                    {isWorking(chainId) && (
                      <PuffLoader size={16} color={theme.textColorSecondary} />
                    )}
                    <button
                      onClick={() => onConnectClick(chainId)}
                      className="Dialog__Button"
                      disabled={isWorking(chainId as ChainID) || !isConnected}
                      style={{ padding: '0.75rem 1rem' }}
                    >
                      <FlexRow $gap={'0.75rem'}>
                        <FontAwesomeIcon icon={FA.faPlug} />
                        <span>Connect</span>
                      </FlexRow>
                    </button>
                  </FlexRow>
                ))}
              </FlexColumn>
            </ChainListWrapper>
          </FlexColumn>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
