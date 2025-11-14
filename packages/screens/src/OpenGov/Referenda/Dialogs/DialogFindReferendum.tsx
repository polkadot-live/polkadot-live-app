// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Dialog from '@radix-ui/react-dialog';
import { useConnections, useReferenda } from '@polkadot-live/contexts';
import { useState } from 'react';
import {
  FlexColumn,
  FlexRow,
  DialogContent,
  DialogTrigger,
  DialogHr,
} from '@polkadot-live/styles/wrappers';
import { TooltipRx } from '@polkadot-live/ui/components';
import { Cross2Icon } from '@radix-ui/react-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';
import { renderToast } from '@polkadot-live/ui/utils';
import type { AnyData } from '@polkadot-live/types/misc';
import type { DialogFindReferendumProps } from './types';

export const DialogFindReferendum = ({ tab }: DialogFindReferendumProps) => {
  const { getTheme } = useConnections();
  const theme = getTheme();

  const { getActiveReferenda, getHistoryReferenda, getItemsPerPage, setPage } =
    useReferenda();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [inputVal, setInputVal] = useState<number | null>(null);

  /**
   * Utils.
   */
  const isInvalidNumber = (value: AnyData): boolean =>
    isNaN(value) || typeof value !== 'number';

  const isStrictPositiveInteger = (value: string): boolean =>
    /^\d+$/.test(value);

  const getTitle = () => {
    switch (tab) {
      case 'active':
        return 'Find Active Referendum';
      case 'history':
        return 'Find Referendum';
    }
  };

  const getDescription = () => {
    switch (tab) {
      case 'active':
        return 'Jump to an active referendum in the current list. Enter a referendum ID and click the search button.';
      case 'history':
        return 'Jump to a referendum in the current list. Enter a referendum ID and click the search button.';
    }
  };

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
            <FlexColumn $rowGap={'0.75rem'}>
              <Dialog.Title className="Dialog__Title">
                {getTitle()}
              </Dialog.Title>
              <Dialog.Description className="Dialog__Description">
                {getDescription()}
              </Dialog.Description>
            </FlexColumn>

            <DialogHr $theme={theme} />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSearchClick();
              }}
            >
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
                  type="submit"
                  className="Dialog__Button"
                  disabled={isInvalidNumber(inputVal)}
                >
                  Search
                </button>
              </FlexRow>
            </form>
          </FlexColumn>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
