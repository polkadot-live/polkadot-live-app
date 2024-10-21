// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionCaretHeader,
  ControlsWrapper,
  SortControlLabel,
} from '@app/library/components';
import { faArrowDown, faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import { Address } from './Address';
import { determineStatusFromCodes } from './Utils';
import { ButtonText } from '@/renderer/kits/Buttons/ButtonText';
import { ContentWrapper } from '../../Wrappers';
import { getSortedLocalLedgerAddresses } from '@/renderer/utils/ImportUtils';
import { useAddresses } from '@/renderer/contexts/import/Addresses';
import { useState } from 'react';
import { ButtonPrimaryInvert } from '@/renderer/kits/Buttons/ButtonPrimaryInvert';
import { Scrollable, StatsFooter } from '@/renderer/library/styles';
import type { ImportLedgerManageProps } from '../types';

export const Manage = ({
  isImporting,
  statusCodes,
  toggleImport,
  cancelImport,
  setSection,
}: ImportLedgerManageProps) => {
  const { ledgerAddresses: addresses } = useAddresses();

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
                          {chainAddresses.map((localAddress, j) => (
                            <Address
                              key={`address_${localAddress.name}`}
                              localAddress={localAddress}
                              orderData={{
                                curIndex: j,
                                lastIndex: chainAddresses.length - 1,
                              }}
                              setSection={setSection}
                            />
                          ))}
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
