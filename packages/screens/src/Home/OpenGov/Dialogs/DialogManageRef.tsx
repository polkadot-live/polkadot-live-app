// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as FA from '@fortawesome/free-solid-svg-icons';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  useConnections,
  useIntervalTasksManager,
} from '@polkadot-live/contexts';
import {
  DialogContent,
  DialogHr,
  DialogTrigger,
  FlexColumn,
  FlexRow,
} from '@polkadot-live/styles';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { DropdownRef } from '../Dropdowns';
import { GearTriggerWrapper, ReferendaListWrapper } from './Wrappers';
import type { ChainID } from '@polkadot-live/types';

interface DialogManageReferendaProps {
  chainId: ChainID;
  refIds: number[];
}

export const DialogManageRef = ({
  refIds,
  chainId,
}: DialogManageReferendaProps) => {
  const { getTheme } = useConnections();
  const { setIsRemoveRefDialogOpen, setRemoveRefData } =
    useIntervalTasksManager();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const theme = getTheme();

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
  };

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger $theme={theme}>
        <GearTriggerWrapper>
          <div>
            <FontAwesomeIcon className="GearIcon" icon={faGear} />
          </div>
        </GearTriggerWrapper>
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
                Active Referenda
              </Dialog.Title>
              <Dialog.Description className="Dialog__Description">
                View or remove active referenda.
              </Dialog.Description>
            </FlexColumn>

            <DialogHr $theme={theme} />

            {/** Active referenda list */}
            <ReferendaListWrapper $theme={theme}>
              {!refIds.length && <p>No referenda available.</p>}
              <FlexColumn $rowGap={'0.25rem'}>
                {refIds.map((refId, i) => (
                  <FlexRow className="RefItem" key={`${refId}-${i}`}>
                    <FontAwesomeIcon
                      icon={FA.faCaretRight}
                      transform={'shrink-2'}
                    />
                    <div style={{ flex: 1 }}>
                      <h2>Referendum {refId}</h2>
                    </div>
                    <FlexRow>
                      <button
                        type="button"
                        onClick={() => {
                          setRemoveRefData({ refId, chainId });
                          setIsRemoveRefDialogOpen(true);
                        }}
                        className="Dialog__Button"
                        style={{ padding: '0.75rem 1rem' }}
                      >
                        <FontAwesomeIcon
                          icon={FA.faClose}
                          transform={'shrink-2'}
                        />
                      </button>
                      <DropdownRef chainId={chainId} refId={refId} />
                    </FlexRow>
                  </FlexRow>
                ))}
              </FlexColumn>
            </ReferendaListWrapper>
          </FlexColumn>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
