// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import { Tx } from '@polkadot-live/ui/components';
import { chainCurrency } from '@ren/config/chains';
import { ContentWrapper } from '@app/screens/Wrappers';
import { ellipsisFn } from '@w3ux/utils';
import { Signer } from './Signer';
import React, { useEffect } from 'react';
import { useTxMeta } from '@app/contexts/action/TxMeta';
import { useActionMessagePorts } from '@app/hooks/useActionMessagePorts';
import { useDebug } from '@app/hooks/useDebug';
import { ComponentFactory } from './TxActionItem';
import { Scrollable } from '@polkadot-live/ui/styles';
import type { AnyData, TxStatus } from 'packages/types/src';
// TMP
import { ChevronDownIcon } from '@radix-ui/react-icons';
import styled from 'styled-components';

//import { ButtonMonoInvert } from '@polkadot-live/ui/kits/buttons';
//import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//import { SubmittedTxWrapper } from './Wrappers';

const AccordionWrapper = styled.div`
  margin-top: 1rem;

  .AccordionRoot {
    width: 100%;
  }

  .AccordionItem {
    overflow: hidden;
  }
  .AccordionItem:first-child {
    margin-top: 0;
    border-top-left-radius: 0.375rem;
    border-top-right-radius: 0.375rem;
  }
  .AccordionItem:last-child {
    border-bottom-left-radius: 0.375rem;
    border-bottom-right-radius: 0.375rem;
  }
  // Focused item - applies to both header and content.
  .AccordionItem:focus-within {
    position: relative;
  }

  .AccordionHeader {
    display: flex;
    margin: 0.5rem 0 0.25rem;
  }

  .AccordionTrigger {
    color: var(--text-color-primary);
    display: flex;
    flex: 1;
    gap: 1rem;
    background-color: transparent;
    padding: 0.5rem 1rem;
    height: 45px;
    align-items: center;
    font-family: InterSemiBold, sans-serif;
    font-size: 1.2rem;
    font-weight: 500;
    line-height: 1.6rem;

    .HeaderContent {
      flex: 1;
      text-align: left;
    }
  }
  .AccordionTrigger:hover {
    transition: background-color 0.15s ease-in-out;
    &:hover {
      background-color: var(--accordion-background-hover);
    }
  }

  .AccordionContent {
    overflow: hidden;
  }
  .AccordionContent[data-state='open'] {
    animation: slideDown 200ms cubic-bezier(0.87, 0, 0.13, 1);
  }
  .AccordionContent[data-state='closed'] {
    animation: slideUp 200ms cubic-bezier(0.87, 0, 0.13, 1);
  }

  .AccordionChevron {
    margin-top: -2px;
    color: var(--text-color-secondary);
    transition: transform 200ms cubic-bezier(0.87, 0, 0.13, 1);
    transform: rotate(-90deg);
  }
  .AccordionTrigger[data-state='open'] > .AccordionChevron {
    transform: rotate(0deg);
  }

  // TMP
  .AccordionContentText {
    padding: 0 1.5rem;
    p {
      margin-top: 0.25rem;
      padding: 0 0.5rem;
      margin-bottom: 1rem;
      line-height: 1.75rem;
    }
  }

  @keyframes slideDown {
    from {
      height: 0;
    }
    to {
      height: var(--radix-accordion-content-height);
    }
  }

  @keyframes slideUp {
    from {
      height: var(--radix-accordion-content-height);
    }
    to {
      height: 0;
    }
  }
`;

const AccordionTrigger = React.forwardRef(
  ({ children, className, ...props }: AnyData, forwardedRef) => (
    <Accordion.Header className="AccordionHeader">
      <Accordion.Trigger
        className={`AccordionTrigger ${className}`}
        {...props}
        ref={forwardedRef}
      >
        <ChevronDownIcon className="AccordionChevron" aria-hidden />
        <div className="HeaderContent">{children}</div>
      </Accordion.Trigger>
    </Accordion.Header>
  )
);

const AccordionContent = React.forwardRef(
  ({ children, className, ...props }: AnyData, forwardRef) => (
    <Accordion.Content
      className={`AccordionContent ${className}`}
      {...props}
      ref={forwardRef}
    >
      <div className="AccordionContentText">{children}</div>
    </Accordion.Content>
  )
);

AccordionTrigger.displayName = 'AccordionTrigger';
AccordionContent.displayName = 'AccordionContent';

export const Action = () => {
  // Set up port communication for `action` window.
  useActionMessagePorts();
  useDebug(window.myAPI.getWindowId());

  // Get state and setters from TxMeta context.
  const { extrinsics } = useTxMeta();

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

  // Utility to get title based on tx status.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getTxStatusTitle = (txStatus: TxStatus): string => {
    switch (txStatus) {
      case 'pending':
        return 'Transaction Pending';
      case 'submitted':
        return 'Transaction Submitted';
      case 'in_block':
        return 'Transaction In Block';
      case 'finalized':
        return 'Transaction Finalized';
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

  return (
    <Scrollable
      $footerHeight={0}
      $headerHeight={0}
      style={{ paddingTop: 0, paddingBottom: 20 }}
    >
      {/*
      {txStatus !== 'pending' && (
        <SubmittedTxWrapper>
          <div>
            <FontAwesomeIcon
              icon={faCheckCircle}
              style={{ width: '75px', height: '75px' }}
            />
          </div>
          <h2>{getTxStatusTitle()}</h2>
          <h4>{getTxStatusSubtitle() || `This window can be closed.`}</h4>
          <div className="close">
            <ButtonMonoInvert
              text="Close Window"
              lg
              onClick={() => window.close()}
            />
          </div>
        </SubmittedTxWrapper>
      )}
      */}

      <ContentWrapper style={{ padding: 0, margin: '0.25rem' }}>
        {Array.from(extrinsics.keys()).length === 0 && (
          <p>No extrinsics created yet...</p>
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
                  <AccordionTrigger>
                    {ComponentFactory[info.actionMeta.action].title}
                  </AccordionTrigger>
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
      </ContentWrapper>
    </Scrollable>
  );
};
