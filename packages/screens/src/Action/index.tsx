// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as FA from '@fortawesome/free-solid-svg-icons';
import * as Select from '@radix-ui/react-select';
import * as Styles from '@polkadot-live/styles/wrappers';
import * as UI from '@polkadot-live/ui';

import {
  useConnections,
  useContextProxy,
  useDialogControl,
  useHelp,
} from '@polkadot-live/contexts';
import { useEffect, useState } from 'react';
import { ellipsisFn } from '@w3ux/utils';
import { formatDistanceToNow } from 'date-fns';
import { getExtrinsicTitle } from './Helpers';
import { getSubscanSubdomain } from '@polkadot-live/consts/chains';
import { BarLoader } from 'react-spinners';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { DropdownExtrinsicsFilter, ExtrinsicDropdownMenu } from './Dropdowns';
import { DialogDeleteExtrinsic, DialogExtrinsicSummary } from './Dialogs';
import { ExtrinsicItemContent } from './ExtrinsicItemContent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ExtrinsicInfo, TxStatus } from '@polkadot-live/types/tx';

export const Action = () => {
  const { useCtx } = useContextProxy();
  const { openHelp } = useHelp();
  const {
    deleteExtrinsicDialogOpen: deleteDialogOpen,
    extrinsicSummaryDialogOpen: summaryDialogOpen,
    setDeleteExtrinsicDialogOpen: setDeleteDialogOpen,
    setExtrinsicSummaryDialogOpen: setSummaryDialogOpen,
  } = useDialogControl();

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
    setPage,
    submitMockTx,
  } = useCtx('TxMetaCtx')();

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

  const { cacheGet, getOnlineMode, getTheme, openInBrowser } = useConnections();
  const isBuildingExtrinsic = cacheGet('extrinsic:building');
  const darkMode = cacheGet('mode:dark');
  const theme = getTheme();

  // Dialog data.
  const [summaryInfo, setSummaryInfo] = useState<ExtrinsicInfo | null>(null);
  const [deleteInfo, setDeleteInfo] = useState<ExtrinsicInfo | null>(null);

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
    if (!summaryDialogOpen) {
      setSummaryInfo(null);
    }
  }, [summaryDialogOpen]);

  useEffect(() => {
    if (!deleteDialogOpen) {
      setDeleteInfo(null);
    }
  }, [deleteDialogOpen]);

  return (
    <UI.ScrollableMax>
      {!getOnlineMode() && (
        <UI.OfflineBanner rounded={true} marginTop={'1rem'} />
      )}
      <Styles.PadWrapper>
        {isBuildingExtrinsic && (
          <BarLoader
            color={darkMode ? '#642763' : '#a772a6'}
            width={'100%'}
            height={2}
            cssOverride={{
              position: 'fixed',
              top: '82px',
              left: 0,
              zIndex: 99,
            }}
            speedMultiplier={0.75}
          />
        )}
        <UI.ActionItem
          showIcon={false}
          text={'Filter'}
          style={{ marginBottom: '1rem' }}
        />

        <Styles.FlexRow $gap={'0.5rem'}>
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
                          <Styles.FlexRow $gap={'1rem'}>
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
                          </Styles.FlexRow>
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
        </Styles.FlexRow>

        {/* Summary Dialog */}
        <DialogExtrinsicSummary
          info={summaryInfo}
          dialogOpen={summaryDialogOpen}
          setDialogOpen={setSummaryDialogOpen}
          renderTrigger={false}
        />

        {/* Delete Extrinsic Dialog */}
        <DialogDeleteExtrinsic
          info={deleteInfo}
          dialogOpen={deleteDialogOpen}
          setDialogOpen={setDeleteDialogOpen}
        />

        <UI.ActionItem
          showIcon={false}
          text={'Extrinsics'}
          style={{ margin: '2rem 0 1rem' }}
        />

        {Array.from(extrinsics.keys()).length === 0 && (
          <Styles.EmptyWrapper>
            <div>
              <p>No extrinsics have been added yet.</p>
            </div>
          </Styles.EmptyWrapper>
        )}

        {Array.from(extrinsics.keys()).length > 0 && pageItems.length === 0 && (
          <Styles.EmptyWrapper>
            <div>
              <p>No extrinsics match the filters.</p>
            </div>
          </Styles.EmptyWrapper>
        )}

        {/* Pagination */}
        {pageItems.length > 0 && (
          <Styles.PaginationRow>
            <button
              className={`btn ${page === 1 && 'disable'}`}
              disabled={page === 1}
              onClick={() => onPageArrowClick('prev')}
            >
              <FontAwesomeIcon icon={FA.faCaretLeft} />
            </button>
            {getPageNumbers().map((i, j) => (
              <Styles.FlexRow key={i} $gap={'0.75rem'}>
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
              </Styles.FlexRow>
            ))}
            <button
              className={`btn ${page === pageCount && 'disable'}`}
              disabled={page === pageCount}
              onClick={() => onPageArrowClick('next')}
            >
              <FontAwesomeIcon icon={FA.faCaretRight} />
            </button>
          </Styles.PaginationRow>
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
                  <Styles.FlexRow $gap={'2px'} style={{ marginTop: '10px' }}>
                    <UI.AccordionTrigger>
                      <Styles.FlexRow $gap={'1.25rem'} style={{ flex: 1 }}>
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
                      </Styles.FlexRow>

                      <Styles.FlexRow
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
                          <UI.TriggerRightIcon
                            text={info.actionMeta.accountName}
                            theme={theme}
                            icon={FA.faUser}
                            iconTransform={'grow-2'}
                          />
                        </div>
                        <div className="stat">
                          <UI.TriggerRightIcon
                            text={getCategoryTitle(info)}
                            theme={theme}
                            icon={FA.faTag}
                            iconTransform={'grow-2'}
                          />
                        </div>
                        <div className="stat">
                          <UI.TriggerRightIcon
                            text={formatDistanceToNow(
                              new Date(info.timestamp),
                              { addSuffix: true }
                            )}
                            theme={theme}
                            icon={FA.faClock}
                          />
                        </div>
                      </Styles.FlexRow>
                    </UI.AccordionTrigger>
                    <div className="HeaderContentDropdownWrapper">
                      <ExtrinsicDropdownMenu
                        onSummaryClick={() => {
                          setSummaryInfo(info);
                          setSummaryDialogOpen(true);
                        }}
                        onBlockExplorerClick={() => {
                          if (!info.txHash) {
                            return;
                          }
                          const { chainId } = info.actionMeta;
                          const network = getSubscanSubdomain(chainId);
                          const uri = `https://${network}.subscan.io/extrinsic/${info.txHash}`;
                          openInBrowser(uri);
                        }}
                        isBuilt={info.estimatedFee !== undefined}
                        txStatus={info.txStatus}
                        hasTxHash={Boolean(info.txHash)}
                        onDelete={() => {
                          setDeleteInfo(info);
                          setDeleteDialogOpen(true);
                        }}
                        onSign={() => initTxDynamicInfo(info.txId)}
                        onMockSign={() => submitMockTx(info.txId)}
                      />
                    </div>
                  </Styles.FlexRow>
                  <UI.AccordionContent>
                    <ExtrinsicItemContent
                      info={info}
                      onClickSummary={() => {
                        setSummaryInfo(info);
                        setSummaryDialogOpen(true);
                      }}
                    />
                  </UI.AccordionContent>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </UI.AccordionWrapper>
        )}
      </Styles.PadWrapper>
      <UI.LinksFooter openHelp={openHelp} />
    </UI.ScrollableMax>
  );
};
