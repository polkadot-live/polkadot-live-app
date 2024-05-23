// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
} from '@/renderer/library/Accordion';
import { ContentWrapper, HeaderWrapper } from '@app/screens/Wrappers';
import { DragClose } from '@/renderer/library/DragClose';
import type { ReferendaProps } from '../types';
import { OpenGovFooter, Scrollable } from '../Wrappers';
import { ButtonPrimaryInvert } from '@/renderer/kits/Buttons/ButtonPrimaryInvert';
import {
  faCaretDown,
  faCaretLeft,
  faCaretRight,
  faLayerGroup,
  faTimer,
} from '@fortawesome/pro-solid-svg-icons';
import { useReferenda } from '@/renderer/contexts/openGov/Referenda';
import { ReferendumRow } from './ReferendumRow';
import { ReferendaGroup } from './Wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { HeadingWrapper } from '@app/screens/Home/Wrappers';
import { getSpacedOrigin } from '../utils';
import { faCaretUp } from '@fortawesome/free-solid-svg-icons';
import {
  ControlsWrapper,
  SortControlButton,
  renderPlaceholders,
} from '@/renderer/utils/common';

export const Referenda = ({ setSection, chainId }: ReferendaProps) => {
  const {
    referenda,
    fetchingReferenda,
    getSortedActiveReferenda,
    getCategorisedReferenda,
  } = useReferenda();

  /// Sorting controls state.
  const [newestFirst, setNewestFirst] = useState(true);
  const [groupingOn, setGroupingOn] = useState(false);
  const [expandAll, setExpandAll] = useState(false);

  /// Accordion state.
  const [accordionActiveIndices, setAccordionActiveIndices] = useState<
    number[]
  >(
    Array.from(
      {
        length: Array.from(getCategorisedReferenda(newestFirst).keys()).length,
      },
      (_, index) => index
    )
  );

  /// Open all accordion items when new referenda is loaded.
  useEffect(() => {
    setAccordionActiveIndices(
      Array.from(
        {
          length: Array.from(getCategorisedReferenda(newestFirst).keys())
            .length,
        },
        (_, index) => index
      )
    );
    setExpandAll(true);
  }, [referenda]);

  /// Render categorized referenda.
  const renderCategorised = () => (
    <section style={{ display: groupingOn ? 'block' : 'none' }}>
      <Accordion
        multiple
        defaultIndex={accordionActiveIndices}
        setExternalIndices={setAccordionActiveIndices}
      >
        {Array.from(getCategorisedReferenda(newestFirst).entries()).map(
          ([origin, infos], i) => (
            <AccordionItem key={`${origin}_referenda_group`}>
              <HeadingWrapper>
                <AccordionHeader>
                  <div className="flex">
                    <div className="left">
                      <div className="icon-wrapper">
                        {accordionActiveIndices.includes(i) ? (
                          <FontAwesomeIcon
                            icon={faCaretDown}
                            transform={'shrink-1'}
                          />
                        ) : (
                          <FontAwesomeIcon
                            icon={faCaretRight}
                            transform={'shrink-1'}
                          />
                        )}
                      </div>
                      <h5 style={{ marginTop: '0' }}>
                        {getSpacedOrigin(origin)}
                      </h5>
                    </div>
                  </div>
                </AccordionHeader>
              </HeadingWrapper>
              <AccordionPanel>
                <ReferendaGroup>
                  {infos.map((referendum, j) => (
                    <ReferendumRow key={j} referendum={referendum} />
                  ))}
                </ReferendaGroup>
              </AccordionPanel>
            </AccordionItem>
          )
        )}
      </Accordion>
    </section>
  );

  /// Render referenda as single list.
  const renderListed = () => (
    <ReferendaGroup style={{ display: groupingOn ? 'none' : 'block' }}>
      {getSortedActiveReferenda(newestFirst).map((referendum, i) => (
        <ReferendumRow key={i} referendum={referendum} />
      ))}
    </ReferendaGroup>
  );

  /// Handle expanding or collapsing all accordion panels.
  const handleExpandAll = () => {
    if (!groupingOn) {
      return;
    }

    if (expandAll) {
      setExpandAll(false);
      setAccordionActiveIndices([]);
    } else {
      setExpandAll(true);
      setAccordionActiveIndices(
        Array.from(
          {
            length: Array.from(getCategorisedReferenda(newestFirst).keys())
              .length,
          },
          (_, index) => index
        )
      );
    }
  };

  return (
    <>
      <HeaderWrapper>
        <div className="content">
          <DragClose windowName="openGov" />
          <h3>{chainId} Referenda</h3>
        </div>
      </HeaderWrapper>
      <Scrollable>
        <ContentWrapper style={{ padding: '1rem 2rem 0' }}>
          {/* Sorting controls */}
          <ControlsWrapper>
            <SortControlButton
              isActive={newestFirst}
              isDisabled={fetchingReferenda}
              faIcon={faTimer}
              onClick={() => setNewestFirst(!newestFirst)}
              onLabel="Newest First"
              offLabel="Oldest First"
            />
            <SortControlButton
              isActive={groupingOn}
              isDisabled={fetchingReferenda}
              faIcon={faLayerGroup}
              onClick={() => setGroupingOn(!groupingOn)}
              onLabel="Grouping On"
              offLabel="Grouping Off"
            />
            <SortControlButton
              isActive={expandAll}
              isDisabled={fetchingReferenda || !groupingOn}
              faIcon={expandAll ? faCaretDown : faCaretUp}
              onClick={() => handleExpandAll()}
              onLabel="All Expanded"
              offLabel="All Collapsed"
            />
          </ControlsWrapper>
          {/* List referenda */}
          <section>
            {fetchingReferenda ? (
              <>{renderPlaceholders(4)}</>
            ) : (
              <>
                {renderCategorised()}
                {renderListed()}
              </>
            )}
          </section>
        </ContentWrapper>
      </Scrollable>
      <OpenGovFooter $chainId={chainId}>
        <div>
          <section className="left"></section>
          <section className="right">
            <ButtonPrimaryInvert
              text={'Back'}
              iconLeft={faCaretLeft}
              style={{
                padding: '0.3rem 1.25rem',
                color:
                  chainId === 'Polkadot'
                    ? 'rgb(169, 74, 117)'
                    : 'rgb(133, 113, 177)',
                borderColor:
                  chainId === 'Polkadot'
                    ? 'rgb(169, 74, 117)'
                    : 'rgb(133, 113, 177)',
              }}
              onClick={() => setSection(0)}
            />
          </section>
        </div>
      </OpenGovFooter>
    </>
  );
};
