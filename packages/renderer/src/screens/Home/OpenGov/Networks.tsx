// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';
import * as Style from '@polkadot-live/styles/wrappers';

import { useIntervalSubscriptions, useManage } from '@ren/contexts/main';
import { useState } from 'react';
import { ButtonText } from '@polkadot-live/ui/kits/buttons';
import { useConnections } from '@ren/contexts/common';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { NoOpenGov } from '@polkadot-live/ui/utils';
import type { ChainID } from '@polkadot-live/types/chains';
import type { NetworksProps } from './types';

export const Networks = ({ setBreadcrumb, setSection }: NetworksProps) => {
  const { openTab } = useConnections();
  const { setDynamicIntervalTasks } = useManage();
  const { getIntervalSubscriptionsForChain, getSortedKeys } =
    useIntervalSubscriptions();

  /**
   * Accordion state.
   */
  const [accordionValue, setAccordionValue] = useState<string[]>(['OpenGov']);

  /**
   * Set interval subscription tasks state when chain is clicked.
   */
  const handleClickOpenGovChain = (chainId: ChainID) => {
    const tasks = getIntervalSubscriptionsForChain(chainId);

    setDynamicIntervalTasks(tasks, chainId);
    setBreadcrumb(`${chainId} OpenGov`);
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
          <Style.FlexColumn>
            <Accordion.Item className="AccordionItem" value={'OpenGov'}>
              {/** Trigger */}
              <UI.AccordionTrigger narrow={true}>
                <ChevronDownIcon className="AccordionChevron" aria-hidden />
                <UI.TriggerHeader>OpenGov</UI.TriggerHeader>
              </UI.AccordionTrigger>

              {/** Content */}
              <UI.AccordionContent transparent={true}>
                {getSortedKeys().length === 0 ? (
                  <NoOpenGov
                    onClick={() =>
                      openTab('openGov', undefined, {
                        event: 'window-open-openGov',
                        data: null,
                      })
                    }
                  />
                ) : (
                  <Style.ItemsColumn>
                    {getSortedKeys().map((chainId, i) => (
                      <Style.ItemEntryWrapper
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        key={`manage_chain_${i}`}
                        onClick={() => handleClickOpenGovChain(chainId)}
                      >
                        <div className="inner">
                          <div>
                            <span>
                              <UI.ChainIcon chainId={chainId} width={16} />
                            </span>
                            <div className="content">
                              <h3>{chainId}</h3>
                            </div>
                          </div>
                          <div>
                            <ButtonText
                              text=""
                              iconRight={faChevronRight}
                              iconTransform="shrink-3"
                            />
                          </div>
                        </div>
                      </Style.ItemEntryWrapper>
                    ))}
                  </Style.ItemsColumn>
                )}
              </UI.AccordionContent>
            </Accordion.Item>
          </Style.FlexColumn>
        </Accordion.Root>
      </UI.AccordionWrapper>
    </div>
  );
};
