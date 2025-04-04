// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as Select from '@radix-ui/react-select';
import * as UI from '@polkadot-live/ui/components';
import * as FA from '@fortawesome/free-solid-svg-icons';
import * as themeVariables from '../../theme/variables';

import { DropdownExtrinsicsFilter, ExtrinsicDropdownMenu } from './Dropdowns';
import { ellipsisFn } from '@w3ux/utils';
import { formatDistanceToNow } from 'date-fns';
import { useTxMeta } from '@app/contexts/action/TxMeta';
import { useActionMessagePorts } from '@app/hooks/useActionMessagePorts';
import { useDebug } from '@app/hooks/useDebug';
import { getExtrinsicTitle } from './Helpers';
import { ExtrinsicItemContent } from './ExtrinsicItemContent';
import { EmptyWrapper, FlexRow, PadWrapper } from '@polkadot-live/ui/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { TriggerRightIconWrapper } from './Wrappers';
import { useConnections } from '@app/contexts/common/Connections';
import { BarLoader } from 'react-spinners';
import { LinksFooter } from '@ren/utils/RenderingUtils';
import { DialogExtrinsicSummary } from './Dialogs';
import { useEffect, useState } from 'react';
import { PaginationRow } from '../OpenGov/Referenda/Wrappers';
import type { ExtrinsicInfo, TxStatus } from '@polkadot-live/types/tx';
import type { TriggerRightIconProps } from './types';

const TriggerRightIcon = ({
  text,
  theme,
  icon,
  iconTransform,
}: TriggerRightIconProps) => (
  <TriggerRightIconWrapper>
    <UI.TooltipRx text={text} theme={theme}>
      <FontAwesomeIcon icon={icon} transform={iconTransform} />
    </UI.TooltipRx>
  </TriggerRightIconWrapper>
);

export const Action = () => {
  // Set up port communication for `action` window.
  useActionMessagePorts();
  useDebug(window.myAPI.getWindowId());

  // Get state and setters from TxMeta context.
  const {
    addressesInfo,
    extrinsics,
    pagedExtrinsics,
    selectedFilter,
    getCategoryTitle,
    getPageNumbers,
    initTxDynamicInfo,
    onFilterChange,
    removeExtrinsic,
    setPage,
    submitMockTx,
  } = useTxMeta();

  const { page, pageCount, items: pageItems } = pagedExtrinsics;

  const onPageClick = (val: number) => {
    if (pagedExtrinsics.page !== val) {
      setPage(val);
    }
  };

  const onPageArrowClick = (dir: 'prev' | 'next') => {
    dir === 'prev'
      ? setPage(page > 1 ? page - 1 : page)
      : setPage(page < pageCount ? page + 1 : page);
  };

  const { isBuildingExtrinsic, darkMode } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

  const [dialogInfo, setDialogInfo] = useState<ExtrinsicInfo | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

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
      case 'submitted-unknown':
        return 'Submitted';
    }
  };

  // Utility to get address info in alphabetical order.
  const getOrderedAddressInfo = () =>
    addressesInfo.sort((a, b) => a.accountName.localeCompare(b.accountName));

  const fadeTxIcon = (txStatus: TxStatus) =>
    txStatus === 'submitted' || txStatus === 'in_block' ? true : false;

  useEffect(() => {
    if (!dialogOpen) {
      setDialogInfo(null);
    }
  }, [dialogOpen]);

  return (
    <UI.ScrollableMax>
      <PadWrapper>
        {isBuildingExtrinsic && (
          <BarLoader
            color={darkMode ? '#642763' : '#a772a6'}
            width={'100%'}
            height={2}
            cssOverride={{ position: 'fixed', top: 0, zIndex: 99 }}
            speedMultiplier={0.75}
          />
        )}
        <UI.ActionItem
          showIcon={false}
          text={'Filter'}
          style={{ marginBottom: '1rem' }}
        />

        <FlexRow $gap={'0.5rem'}>
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
                    {getOrderedAddressInfo().map(({ accountName, address }) => (
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
                            <span className="text-ellipsis">{accountName}</span>
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

          {/* Filters Dropdown */}
          <DropdownExtrinsicsFilter />
        </FlexRow>

        {/* Summary Dialog */}
        <DialogExtrinsicSummary
          info={dialogInfo}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          renderTrigger={false}
        />

        <UI.ActionItem
          showIcon={false}
          text={'Extrinsics'}
          style={{ margin: '2rem 0 1rem' }}
        />

        {Array.from(extrinsics.keys()).length === 0 && (
          <EmptyWrapper>
            <div>
              <p>No extrinsics have been added yet.</p>
            </div>
          </EmptyWrapper>
        )}

        {Array.from(extrinsics.keys()).length > 0 && pageItems.length === 0 && (
          <EmptyWrapper>
            <div>
              <p>No extrinsics match the filters.</p>
            </div>
          </EmptyWrapper>
        )}

        {/* Pagination */}
        {pageItems.length > 0 && (
          <PaginationRow>
            <button
              className={`btn ${page === 1 && 'disable'}`}
              disabled={page === 1}
              onClick={() => onPageArrowClick('prev')}
            >
              <FontAwesomeIcon icon={FA.faCaretLeft} />
            </button>
            {getPageNumbers().map((i, j) => (
              <FlexRow key={i} $row={'0.75rem'}>
                {j === 2 && getPageNumbers().length !== 5 && pageCount > 4 && (
                  <button className="btn placeholder">
                    <FontAwesomeIcon className="icon" icon={FA.faEllipsis} />
                  </button>
                )}
                <button
                  onClick={() => onPageClick(i)}
                  className={`btn ${page === i && 'selected'} ${j === 2 && getPageNumbers().length === 5 && 'middle'}`}
                >
                  {i}
                </button>
              </FlexRow>
            ))}
            <button
              className={`btn ${page === pageCount && 'disable'}`}
              disabled={page === pageCount}
              onClick={() => onPageArrowClick('next')}
            >
              <FontAwesomeIcon icon={FA.faCaretRight} />
            </button>
          </PaginationRow>
        )}

        {/* Extrinsic Items */}
        {pageItems.length > 0 && (
          <UI.AccordionWrapper>
            <Accordion.Root
              className="AccordionRoot"
              type="multiple"
              defaultValue={[]}
            >
              {pageItems.map((info) => (
                <Accordion.Item
                  key={info.txId}
                  className="AccordionItem"
                  value={info.txId}
                >
                  <FlexRow $gap={'2px'} style={{ marginTop: '10px' }}>
                    <UI.AccordionTrigger>
                      <FlexRow $gap={'1.25rem'} style={{ flex: 1 }}>
                        <ChevronDownIcon
                          className="AccordionChevron"
                          aria-hidden
                        />

                        <UI.TooltipRx
                          text={ellipsisFn(info.actionMeta.from, 12)}
                          theme={theme}
                        >
                          <span>
                            <UI.Identicon
                              value={info.actionMeta.from}
                              fontSize={'1.5rem'}
                            />
                          </span>
                        </UI.TooltipRx>
                        {getExtrinsicTitle(info)}
                      </FlexRow>

                      <FlexRow
                        $gap={'1.5rem'}
                        className="right extrinsics-right"
                      >
                        <div className="stat" style={{ minWidth: '80px' }}>
                          <FontAwesomeIcon
                            icon={FA.faCircleDot}
                            fade={fadeTxIcon(info.txStatus)}
                            transform={'shrink-2'}
                          />
                          {getTxStatusTitle(info.txStatus)}
                        </div>
                        <div className="stat">
                          <TriggerRightIcon
                            text={info.actionMeta.accountName}
                            theme={theme}
                            icon={FA.faUser}
                            iconTransform={'grow-2'}
                          />
                        </div>
                        <div className="stat">
                          <TriggerRightIcon
                            text={getCategoryTitle(info)}
                            theme={theme}
                            icon={FA.faTag}
                            iconTransform={'grow-2'}
                          />
                        </div>
                        <div className="stat">
                          <TriggerRightIcon
                            text={formatDistanceToNow(
                              new Date(info.timestamp),
                              { addSuffix: true }
                            )}
                            theme={theme}
                            icon={FA.faClock}
                          />
                        </div>
                      </FlexRow>
                    </UI.AccordionTrigger>
                    <div className="HeaderContentDropdownWrapper">
                      <ExtrinsicDropdownMenu
                        onSummaryClick={() => {
                          setDialogInfo(info);
                          setDialogOpen(true);
                        }}
                        isBuilt={info.estimatedFee !== undefined}
                        txStatus={info.txStatus}
                        onDelete={async () => await removeExtrinsic(info)}
                        onSign={() => initTxDynamicInfo(info.txId)}
                        onMockSign={() => submitMockTx(info.txId)}
                      />
                    </div>
                  </FlexRow>
                  <UI.AccordionContent>
                    <ExtrinsicItemContent
                      info={info}
                      onClickSummary={() => {
                        setDialogInfo(info);
                        setDialogOpen(true);
                      }}
                    />
                  </UI.AccordionContent>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </UI.AccordionWrapper>
        )}
      </PadWrapper>
      <LinksFooter />
    </UI.ScrollableMax>
  );
};
