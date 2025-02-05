// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as Select from '@radix-ui/react-select';
import * as themeVariables from '../../theme/variables';

import {
  AccordionContent,
  AccordionTrigger,
  AccordionWrapper,
  ActionItem,
  Identicon,
  Tx,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@polkadot-live/ui/components';
import { chainCurrency } from '@ren/config/chains';
import { ellipsisFn } from '@w3ux/utils';
import { Signer } from './Signer';
import { useEffect } from 'react';
import { useTxMeta } from '@app/contexts/action/TxMeta';
import { useActionMessagePorts } from '@app/hooks/useActionMessagePorts';
import { useDebug } from '@app/hooks/useDebug';
import { getExtrinsicSubtitle, getExtrinsicTitle } from './Helpers';
import { Scrollable, StatsFooter } from '@polkadot-live/ui/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleDot,
  faObjectGroup,
  faWarning,
} from '@fortawesome/free-solid-svg-icons';
import { ExtrinsicDropdownMenu } from './DropdownMenu';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { useOverlay, useTooltip } from '@polkadot-live/ui/contexts';
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
  const { setTooltipTextAndOpen } = useTooltip();

  const { isBuildingExtrinsic, darkMode, getOnlineMode } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

  // Reset data in the main extrinsics controller on unmount.
  useEffect(
    () => () => {
      try {
        // TODO: Get stored extrinsic data from main.
      } catch (err) {
        console.log('Warning: Action port not received yet: renderer:tx:reset');
      }
    },
    []
  );

  // TMP: Utility to get title based on tx status.
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

  // Utility to get subtitle based on tx status.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getTxStatusSubtitle = (txStatus: TxStatus): string | null => {
    switch (txStatus) {
      case 'submitted':
        return 'Waiting for block confirmation...';
      case 'in_block':
        return 'Waiting for finalized confirmation...';
      default:
        return null;
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getAccordionDefaultValue = () =>
    Array.from(extrinsics.values()).length === 0
      ? []
      : [getFilteredExtrinsics()[0].txId];

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

  const truncateDecimalPlaces = (value: string, places = 4): string => {
    const decimalIndex = value.indexOf('.');

    return value.indexOf('.') === -1 ||
      value.length - decimalIndex - 1 <= places
      ? value
      : value.slice(0, decimalIndex + (places + 1));
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
          <ActionItem
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
            <SelectTrigger
              aria-label="Address Filter"
              $theme={theme}
              value={selectedFilter}
            >
              <Select.Value placeholder="All Accounts" />
              <Select.Icon className="SelectIcon">
                <ChevronDownIcon />
              </Select.Icon>
            </SelectTrigger>
            <Select.Portal>
              <SelectContent $theme={theme} position="popper" sideOffset={3}>
                <Select.ScrollUpButton className="SelectScrollButton">
                  <ChevronUpIcon />
                </Select.ScrollUpButton>
                <Select.Viewport className="SelectViewport">
                  <Select.Group>
                    <SelectItem key={'all-extrinsics'} value={'all'}>
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
                    </SelectItem>
                    {addressesInfo.map(
                      ({ accountName, address, ChainIcon }) => (
                        <SelectItem key={address} value={address}>
                          <div className="innerRow">
                            <div>
                              <ChainIcon width={'25px'} />
                            </div>
                            <div>{accountName}</div>
                          </div>
                        </SelectItem>
                      )
                    )}
                  </Select.Group>
                </Select.Viewport>
                <Select.ScrollDownButton className="SelectScrollButton">
                  <ChevronDownIcon />
                </Select.ScrollDownButton>
              </SelectContent>
            </Select.Portal>
          </Select.Root>

          <ActionItem
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
            <AccordionWrapper>
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
                    <div
                      style={{
                        display: 'flex',
                        gap: '2px',
                        marginTop: '10px',
                      }}
                    >
                      <AccordionTrigger>
                        <ChevronDownIcon
                          className="AccordionChevron"
                          aria-hidden
                        />
                        <h3>{getExtrinsicTitle(info)}</h3>
                        <span className="right">
                          <div className="stat">
                            <div
                              className="tooltip tooltip-trigger-element"
                              data-tooltip-text={ellipsisFn(
                                info.actionMeta.from,
                                16
                              )}
                              onMouseMove={() =>
                                setTooltipTextAndOpen(
                                  ellipsisFn(info.actionMeta.from, 16),
                                  'top'
                                )
                              }
                            >
                              <Identicon
                                value={info.actionMeta.from}
                                size={18}
                              />
                            </div>
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
                      </AccordionTrigger>
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
                    </div>
                    <AccordionContent>
                      <div>
                        <p>{getExtrinsicSubtitle(info)}</p>
                        <Tx
                          label={'Signer'}
                          TxSigner={
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                              }}
                            >
                              <div
                                className="tooltip tooltip-trigger-element"
                                data-tooltip-text={ellipsisFn(
                                  info.actionMeta.from,
                                  16
                                )}
                                onMouseMove={() =>
                                  setTooltipTextAndOpen(
                                    ellipsisFn(info.actionMeta.from, 16),
                                    'right'
                                  )
                                }
                              >
                                <Identicon
                                  value={info.actionMeta.from}
                                  size={18}
                                />
                              </div>
                              <span>{info.actionMeta.accountName}</span>
                            </div>
                          }
                          notEnoughFunds={false}
                          dangerMessage={'Danger message'}
                          EstimatedFee={
                            info.estimatedFee === undefined ? (
                              <span>-</span>
                            ) : (
                              <div
                                className="tooltip tooltip-trigger-element"
                                style={{ cursor: 'default' }}
                                data-tooltip-text={`${ellipsisFn(
                                  info.estimatedFee || '-',
                                  16
                                )} ${chainCurrency(info.actionMeta.chainId)}`}
                                onMouseMove={() =>
                                  setTooltipTextAndOpen(
                                    `${
                                      info.estimatedFee || 'error'
                                    } ${chainCurrency(info.actionMeta.chainId)}`,
                                    'top'
                                  )
                                }
                              >
                                {`${truncateDecimalPlaces(info.estimatedFee || '-')}
                                  ${chainCurrency(info.actionMeta.chainId)}`}
                              </div>
                            )
                          }
                          SignerComponent={
                            <Signer
                              info={info}
                              valid={
                                !isBuildingExtrinsic &&
                                info.estimatedFee !== undefined
                              }
                            />
                          }
                        />
                      </div>
                    </AccordionContent>
                  </Accordion.Item>
                ))}
              </Accordion.Root>
            </AccordionWrapper>
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
