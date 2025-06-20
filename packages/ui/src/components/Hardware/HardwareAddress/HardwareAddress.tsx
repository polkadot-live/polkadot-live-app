// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  faPlus,
  faMinus,
  faTrash,
  faPenSquare,
} from '@fortawesome/free-solid-svg-icons';
import { ellipsisFn } from '@w3ux/utils';
import { EllipsisSpinner } from '../../Spinners';
import { ButtonMono } from '../../../kits/Buttons';
import { HardwareAddressWrapper } from './Wrapper';
import { TooltipRx } from '../../TooltipRx';
import { FlexColumn, FlexRow } from '../../../styles';
import { ChainIcon } from '../../ChainIcon';
import { CopyButton } from '../../CopyButton';
import type { ChainID } from '@polkadot-live/types/chains';
import type { HardwareAddressProps } from './types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const HardwareAddress = ({
  genericAccount,
  isConnected,
  anyProcessing,
  theme,
  isProcessing,
  openConfirmHandler,
  openRemoveHandler,
  openDeleteHandler,
  onClipboardCopy,
  setIsDialogOpen,
}: HardwareAddressProps) => {
  const { accountName, encodedAccounts } = genericAccount;

  return (
    <HardwareAddressWrapper style={{ paddingBottom: '1.5rem' }}>
      {/* Account name */}
      <FlexRow
        $gap={'0.75rem'}
        style={{ padding: '1rem 0 1rem 1rem', width: '100%' }}
        className="input-wrapper"
      >
        <h2>{accountName}</h2>
        <div style={{ flex: 1 }}>
          <TooltipRx text={'Rename Accounts'} theme={theme}>
            <button type="button" aria-label="Rename Accounts">
              <FontAwesomeIcon
                icon={faPenSquare}
                onClick={() => setIsDialogOpen(genericAccount, true)}
                transform={'shrink-1'}
              />
            </button>
          </TooltipRx>
        </div>

        {/* Account buttons */}
        <FlexRow $gap={'0.75rem'}>
          <TooltipRx text={'Delete'} theme={theme}>
            <div style={{ position: 'relative' }}>
              <ButtonMono
                disabled={anyProcessing}
                className="action-btn white-hover"
                iconLeft={faTrash}
                iconTransform="shrink-2"
                text={''}
                onClick={() => openDeleteHandler()}
              />
            </div>
          </TooltipRx>
        </FlexRow>
      </FlexRow>

      {/* Encoded addresses */}
      <FlexColumn $rowGap={'1.25rem'}>
        {Array.from(Object.entries(encodedAccounts)).map(([cid, a]) => (
          <FlexRow $gap={'1.25rem'} key={`${cid}-encoded`}>
            {/* Chain icon */}
            <ChainIcon
              style={{
                width: '14px',
                height: '14px',
                fill: cid === 'Polkadot' ? '#ac2461' : undefined,
                marginLeft: '1rem',
              }}
              chainId={cid as ChainID}
            />
            <FlexRow $gap="0.6rem" style={{ flex: 1 }}>
              <span>{ellipsisFn(a.address, 12)}</span>
              <CopyButton
                iconFontSize="0.96rem"
                theme={theme}
                onCopyClick={async () => await onClipboardCopy(a.address)}
              />
            </FlexRow>

            {/* Manage buttons */}
            <FlexRow $gap={'0.75rem'}>
              {a.isImported && !isProcessing(a) ? (
                <TooltipRx text={'Remove From Main Window'} theme={theme}>
                  <div style={{ position: 'relative' }}>
                    <ButtonMono
                      className="action-btn white-hover"
                      iconLeft={faMinus}
                      iconTransform={'grow-0'}
                      text={''}
                      onClick={() => openRemoveHandler(a)}
                    />
                  </div>
                </TooltipRx>
              ) : (
                <div>
                  {isProcessing(a) ? (
                    <div style={{ position: 'relative' }}>
                      <ButtonMono
                        disabled={!isConnected}
                        iconLeft={faPlus}
                        iconTransform="grow-0"
                        text={''}
                        className={'action-btn processing'}
                      />
                      <EllipsisSpinner style={{ top: '8px' }} />
                    </div>
                  ) : (
                    <TooltipRx
                      text={
                        isConnected ? 'Add To Main Window' : 'Currently Offline'
                      }
                      theme={theme}
                    >
                      <div style={{ position: 'relative' }}>
                        <ButtonMono
                          disabled={!isConnected}
                          iconLeft={faPlus}
                          iconTransform="grow-0"
                          text={''}
                          onClick={() => openConfirmHandler(a)}
                          className={'action-btn white-hover'}
                        />
                      </div>
                    </TooltipRx>
                  )}
                </div>
              )}
            </FlexRow>
          </FlexRow>
        ))}
      </FlexColumn>
    </HardwareAddressWrapper>
  );
};
