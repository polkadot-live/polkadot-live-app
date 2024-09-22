// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  Accordion,
  AccordionItem,
  AccordionPanel,
} from '@/renderer/library/Accordion';
import { faArrowDown, faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import { Address } from './Address';
import { determineStatusFromCodes } from './Utils';
import { ButtonText } from '@/renderer/kits/Buttons/ButtonText';
import { ContentWrapper, HeaderWrapper } from '../../Wrappers';
import { DragClose } from '@/renderer/library/DragClose';
import { getSortedLocalLedgerAddresses } from '@/renderer/utils/ImportUtils';
import { useState } from 'react';
import { AccordionCaretHeader } from '@/renderer/library/Accordion/AccordionCaretHeaders';
import { ButtonPrimaryInvert } from '@/renderer/kits/Buttons/ButtonPrimaryInvert';
import {
  ControlsWrapper,
  StatsFooter,
  Scrollable,
  SortControlLabel,
} from '@/renderer/utils/common';
import type { ImportLedgerManageProps } from '../types';

export const Manage = ({
  addresses,
  isImporting,
  statusCodes,
  toggleImport,
  cancelImport,
  setSection,
}: ImportLedgerManageProps) => {
  // Active accordion indices for account subscription tasks categories.
  const [accordionActiveIndices, setAccordionActiveIndices] = useState<
    number[]
  >(
    Array.from(
      {
        length:
          Array.from(getSortedLocalLedgerAddresses(addresses).keys()).length +
          1,
      },
      (_, index) => index
    )
  );

  return (
    <>
      {/* Header */}
      <HeaderWrapper>
        <div className="content">
          <DragClose windowName="import" />
          <h4>Manage Accounts</h4>
        </div>
      </HeaderWrapper>

      <Scrollable style={{ paddingTop: 0 }}>
        {/* Top Controls */}
        <ControlsWrapper
          $padWrapper={true}
          $padBottom={false}
          style={{ marginBottom: 0 }}
        >
          <ButtonPrimaryInvert
            className="back-btn"
            text="Back"
            iconLeft={faCaretLeft}
            onClick={() => setSection(0)}
          />
          <SortControlLabel label="Ledger Accounts" />

          <ButtonText
            iconLeft={faArrowDown}
            text={
              isImporting
                ? 'Getting Account'
                : 'Get Another Account (Coming Soon)'
            }
            disabled={isImporting || true}
            onClick={() => toggleImport(true)}
          />
        </ControlsWrapper>

        <ContentWrapper style={{ padding: '1rem 2rem 0' }}>
          {/* Address List */}
          {addresses.length ? (
            <Accordion
              multiple
              defaultIndex={accordionActiveIndices}
              setExternalIndices={setAccordionActiveIndices}
            >
              {Array.from(
                getSortedLocalLedgerAddresses(addresses).entries()
              ).map(([chainId, chainAddresses], i) => (
                <div key={`${chainId}_ledger_addresses`}>
                  <AccordionItem>
                    <AccordionCaretHeader
                      title={`${chainId} Accounts`}
                      itemIndex={i}
                      wide={true}
                    />
                    <AccordionPanel>
                      <div className="items-wrapper">
                        <div className="items round-primary-border">
                          {chainAddresses.map(
                            ({ address, index, isImported, name }, j) => (
                              <Address
                                key={`address_${name}`}
                                address={address}
                                source={'ledger'}
                                accountName={name}
                                index={index || 0}
                                isImported={isImported}
                                orderData={{
                                  curIndex: j,
                                  lastIndex: chainAddresses.length - 1,
                                }}
                                setSection={setSection}
                              />
                            )
                          )}
                        </div>
                      </div>
                    </AccordionPanel>
                  </AccordionItem>
                </div>
              ))}
            </Accordion>
          ) : null}
        </ContentWrapper>
      </Scrollable>

      <StatsFooter $chainId={'Polkadot'}>
        <div>
          <section className="left">
            <div className="footer-stat">
              <h2>Imported Ledger Accounts:</h2>
              <span>
                {!isImporting
                  ? `${addresses.length}`
                  : !statusCodes.length
                    ? 'Connecting...'
                    : determineStatusFromCodes(statusCodes, true).title}
              </span>
            </div>
          </section>
          <section className="right">
            {/* Look at HardwareStatusBar component when looking into ledger processing */}
            {isImporting && (
              <ButtonPrimaryInvert
                text={'Cancel'}
                style={{
                  padding: '0.3rem 1.25rem',
                  color: 'rgb(169, 74, 117)',
                  borderColor: 'rgb(169, 74, 117)',
                }}
                onClick={() => cancelImport()}
              />
            )}
          </section>
        </div>
      </StatsFooter>
    </>
  );
};
