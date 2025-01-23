// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import { Tx } from '@polkadot-live/ui/components';
import { chainCurrency } from '@ren/config/chains';
import { ellipsisFn } from '@w3ux/utils';
import { Signer } from './Signer';
import { useEffect } from 'react';
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
} from '@fortawesome/free-solid-svg-icons';
import { ExtrinsicDropdownMenu } from './DropdownMenu';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { useOverlay } from '@polkadot-live/ui/contexts';
import { SignOverlay } from './SignOverlay';
import { EmptyExtrinsicsWrapper } from './Wrappers';
import type { ExtrinsicInfo, TxStatus } from '@polkadot-live/types/tx';

export const Action = () => {
  // Set up port communication for `action` window.
  useActionMessagePorts();
  useDebug(window.myAPI.getWindowId());

  // Get state and setters from TxMeta context.
  const { extrinsics, initTxDynamicInfo, removeExtrinsic } = useTxMeta();
  const { openOverlayWith } = useOverlay();

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

  // TMP: Utility to get cartegory title.
  const getCategoryTitle = (info: ExtrinsicInfo): string => {
    switch (info.actionMeta.pallet) {
      case 'nominationPools': {
        return 'Nomination Pools';
      }
      default: {
        return 'Unknown.';
      }
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

  return (
    <>
      <Scrollable $headerHeight={0}>
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
            <AccordionWrapper>
              <Accordion.Root
                className="AccordionRoot"
                type="multiple"
                defaultValue={[Array.from(extrinsics.keys())[0]]}
              >
                {Array.from(extrinsics.entries()).map(([txUid, info]) => (
                  <Accordion.Item
                    key={txUid}
                    className="AccordionItem"
                    value={txUid}
                  >
                    <div
                      style={{ display: 'flex', gap: '2px', marginTop: '10px' }}
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
                          onBuild={() => initTxDynamicInfo(txUid)}
                          onDelete={() => removeExtrinsic(txUid)}
                          onSign={() =>
                            openOverlayWith(
                              <SignOverlay
                                txId={txUid}
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
