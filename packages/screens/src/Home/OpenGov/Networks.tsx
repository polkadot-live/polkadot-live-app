// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';
import * as Style from '@polkadot-live/styles/wrappers';
import {
  useChainEvents,
  useConnections,
  useIntervalSubscriptions,
} from '@polkadot-live/contexts';
import { useEffect, useState } from 'react';
import { ButtonText } from '@polkadot-live/ui/kits/buttons';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { faChevronRight, faSplotch } from '@fortawesome/free-solid-svg-icons';
import { NoOpenGov } from '@polkadot-live/ui/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ChainID } from '@polkadot-live/types/chains';
import type { NetworksProps } from './types';

export const Networks = ({
  section,
  setBreadcrumb,
  setSection,
}: NetworksProps) => {
  const { openTab } = useConnections();
  const { subscriptions, getSortedKeys } = useIntervalSubscriptions();
  const {
    activeRefChain,
    getActiveRefIds,
    refChainHasSubs,
    setActiveRefChain,
  } = useChainEvents();

  const [isReferendaAdded, setIsReferendaAdded] = useState(true);

  // Accordion state.
  const [accordionValue, setAccordionValue] = useState<string[]>(['OpenGov']);

  // Set interval subscription tasks state when chain is clicked.
  const handleClickOpenGovChain = (chainId: ChainID) => {
    setActiveRefChain(chainId);
    setBreadcrumb(`${chainId} OpenGov`);
    setSection(1);
  };

  // Determine if a chain has active subscriptions.
  const chainHasSubs = (chainId: ChainID): boolean => {
    const hasSmart = refChainHasSubs(chainId);
    const hasClassic = Boolean(
      subscriptions.get(chainId)?.find((s) => s.status === 'enable')
    );
    return hasSmart || hasClassic;
  };

  useEffect(() => {
    const hasActive = async () => (await getActiveRefIds()).length > 0;
    hasActive().then((res) => setIsReferendaAdded(res));
  }, [activeRefChain, section, subscriptions]);

  return (
    <div style={{ width: '100%' }}>
      <UI.ScreenInfoCard>
        <div>Select a network to manage OpenGov subscriptions.</div>
      </UI.ScreenInfoCard>

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
                {!isReferendaAdded ? (
                  <NoOpenGov
                    onClick={() =>
                      openTab('openGov', {
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
                          <Style.FlexRow>
                            {chainHasSubs(chainId) && (
                              <FontAwesomeIcon
                                style={{ color: 'var(--accent-primary)' }}
                                icon={faSplotch}
                              />
                            )}
                            <ButtonText
                              text=""
                              iconRight={faChevronRight}
                              iconTransform="shrink-3"
                            />
                          </Style.FlexRow>
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
