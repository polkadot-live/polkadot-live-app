// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as Select from '@radix-ui/react-select';
import * as UI from '@polkadot-live/ui/components';
import * as themeVariables from '../../theme/variables';

import { ellipsisFn } from '@w3ux/utils';
import { useTxMeta } from '@app/contexts/action/TxMeta';
import { useActionMessagePorts } from '@app/hooks/useActionMessagePorts';
import { useDebug } from '@app/hooks/useDebug';
import { getExtrinsicTitle } from './Helpers';
import { ExtrinsicItemContent } from './ExtrinsicItemContent';
import { FlexRow, Scrollable, StatsFooter } from '@polkadot-live/ui/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleDot,
  faObjectGroup,
  faWarning,
} from '@fortawesome/free-solid-svg-icons';
import { ExtrinsicDropdownMenu } from './DropdownMenu';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { useOverlay } from '@polkadot-live/ui/contexts';
import { SignOverlay } from './SignOverlay';
import { EmptyExtrinsicsWrapper } from './Wrappers';
import { useConnections } from '@app/contexts/common/Connections';
import { BarLoader } from 'react-spinners';
import type { TxStatus } from '@polkadot-live/types/tx';

export const Action = () => {
  // Set up port communication for `action` window.
  useActionMessagePorts();
  useDebug(window.myAPI.getWindowId());

  // Get state and setters from TxMeta context.
  const {
    addressesInfo,
    extrinsics,
    selectedFilter,
    getCategoryTitle,
    getFilteredExtrinsics,
    onFilterChange,
    removeExtrinsic,
    submitMockTx,
  } = useTxMeta();
  const { openOverlayWith } = useOverlay();

  const { isBuildingExtrinsic, darkMode, getOnlineMode } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

  // Utility to get title based on tx status.
  const getTxStatusTitle = (txStatus: TxStatus): string => {
    switch (txStatus) {
      case 'pending':
        return 'Pending';
      case 'submitted':
        return 'Submitted';
      case 'in_block':
        return 'In Block';
      case 'finalized':
        return 'Finalized';
      default:
        return 'Error Occured';
      case 'submitted-unkown':
        return 'Submitted';
    }
  };

  const truncateString = (target: string, maxLength: number) => {
    const targetLength = target.length;
    if (targetLength <= maxLength) {
      return target;
    } else {
      const truncated = target.slice(0, maxLength - 4);
      const endSection = target.slice(targetLength - 4, targetLength);
      return `${truncated}...${endSection}`;
    }
  };

  const fadeTxIcon = (txStatus: TxStatus) =>
    txStatus === 'submitted' || txStatus === 'in_block' ? true : false;

  return (
    <>
      <Scrollable $headerHeight={0} style={{ paddingTop: 0 }}>
        {isBuildingExtrinsic && (
          <BarLoader
            color={darkMode ? '#642763' : '#a772a6'}
            width={'100%'}
            height={2}
            cssOverride={{ position: 'fixed', top: 0, zIndex: 99 }}
            speedMultiplier={0.75}
          />
        )}
        <div
          style={{
            padding: '0.5rem 1rem 2rem',
            height:
              Array.from(extrinsics.keys()).length === 0 ? '100%' : 'auto',
          }}
        >
          <UI.ActionItem
            text={'Account Filter'}
            style={{
              marginBottom: '1rem',
              fontSize: '1.1rem',
              color: 'var(--text-color-secondary)',
            }}
          />
          <Select.Root
            value={selectedFilter}
            defaultValue="all"
            onValueChange={onFilterChange}
          >
            <UI.SelectTrigger
              aria-label="Address Filter"
              $theme={theme}
              value={selectedFilter}
            >
              <Select.Value placeholder="All Accounts" />
              <Select.Icon className="SelectIcon">
                <ChevronDownIcon />
              </Select.Icon>
            </UI.SelectTrigger>
            <Select.Portal>
              <UI.SelectContent $theme={theme} position="popper" sideOffset={3}>
                <Select.ScrollUpButton className="SelectScrollButton">
                  <ChevronUpIcon />
                </Select.ScrollUpButton>
                <Select.Viewport className="SelectViewport">
                  <Select.Group>
                    <UI.SelectItem key={'all-extrinsics'} value={'all'}>
                      <div className="innerRow">
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            height: '2.25rem',
                          }}
                        >
                          All Accounts
                        </div>
                      </div>
                    </UI.SelectItem>
                    {addressesInfo.map(({ accountName, address }) => (
                      <UI.SelectItem key={address} value={address}>
                        <div className="innerRow">
                          <FlexRow $gap={'1rem'}>
                            <UI.TooltipRx
                              theme={theme}
                              text={ellipsisFn(address, 12)}
                            >
                              <span style={{ marginLeft: '1rem' }}>
                                <UI.Identicon
                                  value={address}
                                  fontSize={'2rem'}
                                />
                              </span>
                            </UI.TooltipRx>
                            <span>{accountName}</span>
                          </FlexRow>
                        </div>
                      </UI.SelectItem>
                    ))}
                  </Select.Group>
                </Select.Viewport>
                <Select.ScrollDownButton className="SelectScrollButton">
                  <ChevronDownIcon />
                </Select.ScrollDownButton>
              </UI.SelectContent>
            </Select.Portal>
          </Select.Root>

          <UI.ActionItem
            text={'Manage Extrinsics'}
            style={{
              margin: '2.75rem 0 0.25rem',
              fontSize: '1.1rem',
              color: 'var(--text-color-secondary)',
            }}
          />

          {Array.from(extrinsics.keys()).length === 0 && (
            <EmptyExtrinsicsWrapper>
              <div>
                <p>No extrinsics have been added yet.</p>
              </div>
            </EmptyExtrinsicsWrapper>
          )}

          {Array.from(extrinsics.keys()).length > 0 && (
            <UI.AccordionWrapper>
              <Accordion.Root
                className="AccordionRoot"
                type="multiple"
                defaultValue={[]}
              >
                {getFilteredExtrinsics().map((info) => (
                  <Accordion.Item
                    key={info.txId}
                    className="AccordionItem"
                    value={info.txId}
                  >
                    <FlexRow $gap={'2px'} style={{ marginTop: '10px' }}>
                      <UI.AccordionTrigger>
                        <ChevronDownIcon
                          className="AccordionChevron"
                          aria-hidden
                        />
                        {getExtrinsicTitle(info)}
                        <span className="right">
                          <div className="stat">
                            <UI.TooltipRx
                              text={ellipsisFn(info.actionMeta.from, 12)}
                              theme={theme}
                            >
                              <span>
                                <UI.Identicon
                                  value={info.actionMeta.from}
                                  fontSize={'1.25rem'}
                                />
                              </span>
                            </UI.TooltipRx>
                            {truncateString(info.actionMeta.accountName, 8)}
                          </div>
                          <div className="stat">
                            <FontAwesomeIcon
                              icon={faObjectGroup}
                              transform={'shrink-2'}
                            />
                            {getCategoryTitle(info)}
                          </div>
                          <div className="stat">
                            <FontAwesomeIcon
                              icon={faCircleDot}
                              fade={fadeTxIcon(info.txStatus)}
                              transform={'shrink-2'}
                            />
                            {getTxStatusTitle(info.txStatus)}
                          </div>
                        </span>
                      </UI.AccordionTrigger>
                      <div className="HeaderContentDropdownWrapper">
                        <ExtrinsicDropdownMenu
                          isBuilt={info.estimatedFee !== undefined}
                          txStatus={info.txStatus}
                          onDelete={async () => await removeExtrinsic(info)}
                          onSign={() =>
                            openOverlayWith(
                              <SignOverlay
                                txId={info.txId}
                                from={info.actionMeta.from}
                              />,
                              'small',
                              true
                            )
                          }
                          onMockSign={() => submitMockTx(info.txId)}
                        />
                      </div>
                    </FlexRow>
                    <UI.AccordionContent>
                      <ExtrinsicItemContent info={info} />
                    </UI.AccordionContent>
                  </Accordion.Item>
                ))}
              </Accordion.Root>
            </UI.AccordionWrapper>
          )}
        </div>
      </Scrollable>
      <StatsFooter $chainId={'Polkadot'}>
        <div>
          <section className="left">
            <div className="footer-stat">
              <h2>Total Extrinsics:</h2>
              <span>{Array.from(extrinsics.keys()).length}</span>
            </div>
          </section>
          <section className="right">
            <div className="footer-stat">
              {!getOnlineMode() && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--accent-warning)',
                  }}
                >
                  <FontAwesomeIcon icon={faWarning} transform={'shrink-2'} />
                  <span style={{ color: 'var(--accent-warning)' }}>
                    Switch to online mode to sign extrinsics
                  </span>
                </div>
              )}
            </div>
          </section>
        </div>
      </StatsFooter>
    </>
  );
};
