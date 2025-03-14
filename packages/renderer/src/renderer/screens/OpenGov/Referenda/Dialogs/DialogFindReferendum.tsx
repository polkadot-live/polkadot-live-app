// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Dialog from '@radix-ui/react-dialog';
import * as themeVariables from '../../../../theme/variables';

import { useConnections } from '@app/contexts/common/Connections';
import { usePolkassembly } from '@app/contexts/openGov/Polkassembly';
import { useReferenda } from '@app/contexts/openGov/Referenda';
import { useState } from 'react';
import { FlexColumn, FlexRow } from '@polkadot-live/ui/styles';
import { TooltipRx } from '@polkadot-live/ui/components';
import { Cross2Icon } from '@radix-ui/react-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';
import { DialogContent, DialogTrigger } from './Wrappers';
import { renderToast } from '@polkadot-live/ui/utils';
import type { AnyData } from '@polkadot-live/types/misc';
import type { DialogFindReferendumProps } from './types';

export const DialogFindReferendum = ({
  description,
  title,
  tab,
}: DialogFindReferendumProps) => {
  const { darkMode } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

  const { getActiveReferenda, getHistoryReferenda, getItemsPerPage, setPage } =
    useReferenda();
  const { fetchingMetadata } = usePolkassembly();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [inputVal, setInputVal] = useState<number | null>(null);

  /**
   * Utils.
   */
  const isInvalidNumber = (value: AnyData): boolean =>
    isNaN(value) || typeof value !== 'number';

  const isStrictPositiveInteger = (value: string): boolean =>
    /^\d+$/.test(value);

  /**
   * Handle input change.
   */
  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    if (isStrictPositiveInteger(val) || val === '') {
      setInputVal(val === '' ? null : Number(val));
    }
  };

  /**
   * Reset input when dialog closed.
   */
  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setInputVal(null);
    }
  };

  /**
   * Handle search click.
   */
  const onSearchClick = () => {
    if (isInvalidNumber(inputVal)) {
      return;
    }

    // Check if referendum exists and update page.
    const referenda =
      tab === 'active' ? getActiveReferenda() : getHistoryReferenda();
    const index = referenda.findIndex(({ refId }) => refId === inputVal);

    if (index === -1) {
      renderToast('Referendum not found.', `not-found-${inputVal}`, 'error');
      return;
    }

    const pageNumber = Math.floor(index / getItemsPerPage(tab)) + 1;
    setPage(pageNumber, tab);
    setInputVal(null);
    setDialogOpen(false);
  };

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={handleOpenChange}>
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
              <Dialog.Title className="Dialog__Title">{title}</Dialog.Title>
              <Dialog.Description className="Dialog__Description">
                {description}
              </Dialog.Description>
            </FlexColumn>

            <FlexRow $gap={'1rem'}>
              <FlexRow className="Dialog__FieldSet">
                <label className="Dialog__Label" htmlFor="refId">
                  #
                </label>
                <input
                  value={inputVal || ''}
                  onChange={onInputChange}
                  className="Dialog__Input"
                  id="refId"
                  placeholder="123"
                />
              </FlexRow>
              <button
                className="Dialog__Button"
                disabled={isInvalidNumber(inputVal) || fetchingMetadata}
                onClick={() => onSearchClick()}
              >
                Search
              </button>
            </FlexRow>
          </FlexColumn>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
