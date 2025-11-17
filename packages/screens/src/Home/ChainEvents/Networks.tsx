// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as FA from '@fortawesome/free-solid-svg-icons';
import * as UI from '@polkadot-live/ui/components';
import * as Wrappers from '@polkadot-live/styles/wrappers';
import { useState } from 'react';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { ButtonText } from '@polkadot-live/ui/kits/buttons';
import type { ChainID } from '@polkadot-live/types/chains';

interface NetworksProps {
  setActiveChain: React.Dispatch<React.SetStateAction<ChainID | null>>;
  setBreadcrumb: React.Dispatch<React.SetStateAction<string>>;
  setSection: React.Dispatch<React.SetStateAction<number>>;
}

export const Networks = ({
  setActiveChain,
  setBreadcrumb,
  setSection,
}: NetworksProps) => {
  const [accordionValue, setAccordionValue] = useState(['Polkadot Asset Hub']);

  const onChainClick = (chainId: ChainID) => {
    setActiveChain(chainId);
    setBreadcrumb(chainId);
    setSection(1);
  };

  return (
    <div style={{ width: '100%' }}>
      <UI.AccordionWrapper style={{ marginTop: '1rem' }}>
        <Accordion.Root
          style={{ marginBottom: '1rem' }}
          className="AccordionRoot"
          type="multiple"
          value={accordionValue}
          onValueChange={(val) => setAccordionValue(val as string[])}
        >
          <Wrappers.FlexColumn>
            <Accordion.Item
              className="AccordionItem"
              value={'Polkadot Asset Hub'}
            >
              <UI.AccordionTrigger narrow={true}>
                <ChevronDownIcon className="AccordionChevron" aria-hidden />
                <UI.TriggerHeader>All Networks</UI.TriggerHeader>
              </UI.AccordionTrigger>

              <UI.AccordionContent transparent={true}>
                <Wrappers.ItemsColumn>
                  {(['Polkadot Asset Hub'] as ChainID[]).map((cid) => (
                    <Wrappers.ItemEntryWrapper
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      key={`${cid}-chain-events`}
                      onClick={() => onChainClick(cid)}
                    >
                      <div className="inner">
                        <div>
                          <span>
                            <UI.ChainIcon chainId={cid} width={16} />
                          </span>
                          <div className="content">
                            <h3>{cid}</h3>
                          </div>
                        </div>
                        <div>
                          <ButtonText
                            text=""
                            iconRight={FA.faChevronRight}
                            iconTransform="shrink-3"
                          />
                        </div>
                      </div>
                    </Wrappers.ItemEntryWrapper>
                  ))}
                </Wrappers.ItemsColumn>
              </UI.AccordionContent>
            </Accordion.Item>
          </Wrappers.FlexColumn>
        </Accordion.Root>
      </UI.AccordionWrapper>
    </div>
  );
};
