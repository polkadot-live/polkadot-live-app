// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Dialog from '@radix-ui/react-dialog';
import * as themeVariables from '../../../../theme/variables';

import { useConnections } from '@app/contexts/common/Connections';
import { FlexColumn, FlexRow } from '@polkadot-live/ui/styles';
import { TooltipRx } from '@polkadot-live/ui/components';
import { Cross2Icon } from '@radix-ui/react-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';
import { DialogContent, DialogTrigger } from './Wrappers';

export const DialogFindReferendum = () => {
  const { darkMode } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

  return (
    <Dialog.Root>
      <DialogTrigger $theme={theme}>
        <TooltipRx text={'Find Referendum'} theme={theme}>
          <div className="Dialog__OpenIcon">
            <FontAwesomeIcon icon={faLocationCrosshairs} />
          </div>
        </TooltipRx>
      </DialogTrigger>
      <Dialog.Portal>
        <Dialog.Overlay className="Dialog__Overlay" />

        <DialogContent $theme={theme}>
          <Dialog.Close className="Dialog__IconButton">
            <Cross2Icon />
          </Dialog.Close>
          <FlexColumn $rowGap={'1.5rem'}>
            <FlexColumn $rowGap={'0.25rem'}>
              <Dialog.Title className="Dialog__Title">
                Find Referendum
              </Dialog.Title>
              <Dialog.Description className="Dialog__Description">
                Enter a referendum ID and click the search button.
              </Dialog.Description>
            </FlexColumn>

            <FlexRow $gap={'1rem'}>
              <FlexRow className="Dialog__FieldSet">
                <label className="Dialog__Label" htmlFor="refId">
                  #
                </label>
                <input className="Dialog__Input" id="refId" placeholder="123" />
              </FlexRow>
              <button className="Dialog__Button">Search</button>
            </FlexRow>
          </FlexColumn>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
