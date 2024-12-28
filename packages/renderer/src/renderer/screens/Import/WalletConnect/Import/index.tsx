// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as themeVariables from '../../../../theme/variables';

import { CheckIcon } from '@radix-ui/react-icons';
import {
  ButtonPrimaryInvert,
  ButtonText,
} from '@polkadot-live/ui/kits/buttons';
import { ItemsColumn } from '@app/screens/Home/Manage/Wrappers';
import { ContentWrapper } from '../../../Wrappers';
import { Scrollable } from '@polkadot-live/ui/styles';
import {
  faCaretLeft,
  faCaretRight,
  faCircleDot,
} from '@fortawesome/free-solid-svg-icons';

/** Temp */
import { useAddresses } from '@app/contexts/import/Addresses';
import { useConnections } from '@app/contexts/common/Connections';
import { useState } from 'react';
import { useWalletConnect } from '@ren/renderer/contexts/import/WalletConnect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ellipsisFn } from '@w3ux/utils';
import { FlexRow, WcSessionButton } from './Wrappers';
import {
  AddressListFooter,
  CheckboxRoot,
  ImportAddressRow,
  InfoCard,
} from '../../Wrappers';
import type { ImportProps } from './types';

export const Import = ({ setSection, setShowImportUi }: ImportProps) => {
  const { wcAddresses } = useAddresses();
  const { darkMode } = useConnections();

  const [accordionActiveIndices, setAccordionActiveIndices] =
    useState<number>(0);

  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;
  const {
    wcFetchedAddresses,
    wcNetworks,
    initWc,
    setWcFetchedAddresses,
    setWcNetworks,
  } = useWalletConnect();

  const getSelectedNetworkCount = () =>
    wcNetworks.filter(({ selected }) => selected).length;

  return (
    <Scrollable
      $footerHeight={4}
      style={{ paddingTop: 0, paddingBottom: '2rem' }}
    >
      {/** Bredcrumb */}
      <UI.ControlsWrapper $padWrapper={true} $padButton={false}>
        <ButtonPrimaryInvert
          className="back-btn"
          text="Back"
          iconLeft={faCaretLeft}
          onClick={() => {
            setSection(0);
          }}
        />
        <UI.SortControlLabel label="Import WalletConnect Accounts" />

        <ButtonText
          iconLeft={faCaretRight}
          text={'WalletConnect Accounts'}
          disabled={wcAddresses.length === 0}
          onClick={() => setShowImportUi(false)}
        />
      </UI.ControlsWrapper>

      {/** Content */}
      <ContentWrapper style={{ padding: '1rem 2rem 0', marginTop: '1rem' }}>
        <UI.Accordion
          multiple={false}
          defaultIndex={accordionActiveIndices}
          setExternalIndices={setAccordionActiveIndices}
          gap={'1rem'}
          panelPadding={'0.75rem 0.25rem'}
        >
          {/** Establish Session */}
          <UI.AccordionItem>
            <UI.AccordionCaretHeader
              title="Establish Session"
              itemIndex={0}
              wide={true}
            />
            <UI.AccordionPanel>
              <ItemsColumn>
                {wcNetworks.map(({ chainId, selected, ChainIcon }, i) => (
                  <ImportAddressRow key={i}>
                    <ChainIcon
                      width={'20'}
                      fill={chainId === 'Polkadot' ? '#ac2461' : ''}
                    />
                    <div className="addressInfo">
                      <h2>{chainId}</h2>
                    </div>
                    <CheckboxRoot
                      $theme={theme}
                      className="CheckboxRoot"
                      id={`c${i}`}
                      checked={selected}
                      disabled={false}
                      onCheckedChange={(checked) =>
                        setWcNetworks((prev) => {
                          const updated = prev.map((data) =>
                            data.chainId === chainId
                              ? {
                                  ...data,
                                  selected:
                                    typeof checked === 'string'
                                      ? false
                                      : Boolean(checked),
                                }
                              : data
                          );
                          return updated;
                        })
                      }
                    >
                      <Checkbox.Indicator className="CheckboxIndicator">
                        <CheckIcon />
                      </Checkbox.Indicator>
                    </CheckboxRoot>
                  </ImportAddressRow>
                ))}
                <FlexRow>
                  <InfoCard style={{ margin: '0', flex: 1 }}>
                    <span>
                      <FontAwesomeIcon
                        icon={faCircleDot}
                        transform={'shrink-3'}
                      />
                      <span style={{ flex: 1 }}>
                        Select your target networks and click Connect to fetch
                        addresses via WalletConnect.
                      </span>
                    </span>
                  </InfoCard>

                  <WcSessionButton
                    disabled={getSelectedNetworkCount() === 0}
                    onClick={async () => await initWc()}
                  >
                    Connect
                  </WcSessionButton>
                </FlexRow>
              </ItemsColumn>
            </UI.AccordionPanel>
          </UI.AccordionItem>

          {/** Import Addresses */}
          <UI.AccordionItem>
            <UI.AccordionCaretHeader
              title="Import Addresses"
              itemIndex={2}
              wide={true}
            />
            <UI.AccordionPanel>
              <InfoCard style={{ marginTop: '0', marginBottom: '0.75rem' }}>
                <span>
                  <FontAwesomeIcon icon={faCircleDot} transform={'shrink-3'} />
                  Establish a WalletConnect session to view addresses.
                </span>
              </InfoCard>
              <ItemsColumn>
                {wcFetchedAddresses.map(({ chainId, encoded, selected }, i) => (
                  <ImportAddressRow key={encoded}>
                    <UI.Identicon value={encoded} size={28} />
                    <div className="addressInfo">
                      <h2>
                        {i + 1}. {chainId} Account
                      </h2>
                      <span>{ellipsisFn(encoded, 12)}</span>
                    </div>
                    <CheckboxRoot
                      $theme={theme}
                      className="CheckboxRoot"
                      id={`${i + 1}-${chainId}`}
                      checked={selected}
                      disabled={false}
                      onCheckedChange={(checked) => {
                        setWcFetchedAddresses((prev) => {
                          const updated = prev.map((data) =>
                            data.encoded === encoded
                              ? {
                                  ...data,
                                  selected:
                                    typeof checked === 'string'
                                      ? false
                                      : Boolean(checked),
                                }
                              : data
                          );
                          return updated;
                        });
                      }}
                    >
                      <Checkbox.Indicator className="CheckboxIndicator">
                        <CheckIcon />
                      </Checkbox.Indicator>
                    </CheckboxRoot>
                  </ImportAddressRow>
                ))}
              </ItemsColumn>

              <AddressListFooter>
                <div className="importBtn">
                  <button
                    disabled={false}
                    onClick={() => console.log('todo: import')}
                  >
                    Import
                  </button>
                </div>
              </AddressListFooter>
            </UI.AccordionPanel>
          </UI.AccordionItem>
        </UI.Accordion>
      </ContentWrapper>
    </Scrollable>
  );
};
