// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as Select from '@radix-ui/react-select';
import * as themeVariables from '../../theme/variables';

import { ActionItem, Tx } from '@polkadot-live/ui/components';
import { chainCurrency } from '@ren/config/chains';
import { ellipsisFn } from '@w3ux/utils';
import { Signer } from './Signer';
import { forwardRef, useEffect } from 'react';
import { useTxMeta } from '@app/contexts/action/TxMeta';
import { useActionMessagePorts } from '@app/hooks/useActionMessagePorts';
import { useDebug } from '@app/hooks/useDebug';
import { ComponentFactory } from './TxActionItem';
import { Scrollable, StatsFooter } from '@polkadot-live/ui/styles';
import { AccordionContent, AccordionTrigger } from './Accordion';
import { AccordionWrapper } from './Accordion/Wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleDot,
  faObjectGroup,
  faSpinner,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { ExtrinsicDropdownMenu } from './DropdownMenu';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@radix-ui/react-icons';
import { useOverlay } from '@polkadot-live/ui/contexts';
import { SignOverlay } from './SignOverlay';
import { EmptyExtrinsicsWrapper } from './Wrappers';
import { SelectContent, SelectTrigger } from '../Import/Ledger/Import/Wrappers';
import { useConnections } from '@app/contexts/common/Connections';
import type { AnyData } from '@polkadot-live/types/misc';
import type { TxStatus } from '@polkadot-live/types/tx';

const SelectItem = forwardRef(function SelectItem(
  { children, className, ...props }: AnyData,
  forwardedRef
) {
  return (
    <Select.Item
      className={`SelectItem ${className}`}
      {...props}
      ref={forwardedRef}
    >
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator className="SelectItemIndicator">
        <CheckIcon />
      </Select.ItemIndicator>
    </Select.Item>
  );
});

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
    initTxDynamicInfo,
    onFilterChange,
    removeExtrinsic,
  } = useTxMeta();
  const { openOverlayWith } = useOverlay();

  const { darkMode } = useConnections();
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
        return 'An Error Occured';
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
      : [getFilteredExtrinsics(selectedFilter)[0].txId];

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

  return (
    <>
      <Scrollable $headerHeight={0} style={{ paddingTop: 0 }}>
        <div
          style={{
            padding: '0.5rem 1rem 2rem',
            height:
              Array.from(extrinsics.keys()).length === 0 ? '100%' : 'auto',
          }}
        >
          {Array.from(extrinsics.keys()).length === 0 && (
            <EmptyExtrinsicsWrapper>
              <div>
                <FontAwesomeIcon
                  icon={faSpinner}
                  style={{ fontSize: '7rem', opacity: '0.6' }}
                />
                <p>No extrinsics have been added yet.</p>
              </div>
            </EmptyExtrinsicsWrapper>
          )}

          {Array.from(extrinsics.keys()).length !== 0 && (
            <>
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
                  <SelectContent
                    $theme={theme}
                    position="popper"
                    sideOffset={3}
                  >
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

              <AccordionWrapper>
                <Accordion.Root
                  className="AccordionRoot"
                  type="multiple"
                  defaultValue={[]}
                >
                  {getFilteredExtrinsics(selectedFilter).map((info) => (
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
                          {ComponentFactory[info.actionMeta.action].title}
                          <span className="right">
                            <div className="stat">
                              <FontAwesomeIcon
                                icon={faUser}
                                transform={'shrink-2'}
                              />
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
                                transform={'shrink-2'}
                              />
                              {getTxStatusTitle(info.txStatus)}
                            </div>
                          </span>
                        </AccordionTrigger>
                        <div className="HeaderContentDropdownWrapper">
                          <ExtrinsicDropdownMenu
                            isBuilt={info.dynamicInfo !== undefined}
                            onBuild={() => initTxDynamicInfo(info.txId)}
                            onDelete={() =>
                              removeExtrinsic(info.txId, info.actionMeta.from)
                            }
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
                          />
                        </div>
                      </div>
                      <AccordionContent>
                        <div>
                          {ComponentFactory[info.actionMeta.action].description}
                          <Tx
                            label={'Signer'}
                            name={ellipsisFn(info.actionMeta.from)}
                            notEnoughFunds={false}
                            dangerMessage={'Danger message'}
                            estimatedFee={
                              info.dynamicInfo === undefined
                                ? '-'
                                : `${info.dynamicInfo?.estimatedFee} ${chainCurrency(info.actionMeta.chainId)}`
                            }
                            SignerComponent={
                              <Signer
                                txId={info.txId}
                                txBuilt={info.dynamicInfo !== undefined}
                                submitting={info.submitting}
                                valid={!info.submitting}
                                from={info.actionMeta.from}
                              />
                            }
                          />
                        </div>
                      </AccordionContent>
                    </Accordion.Item>
                  ))}
                </Accordion.Root>
              </AccordionWrapper>
            </>
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
        </div>
      </StatsFooter>
    </>
  );
};
