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
import { ControlsWrapper, ReferendaGroup } from './Wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { HeadingWrapper } from '@app/screens/Home/Wrappers';
import { getSpacedOrigin } from '../utils';
import { faCaretUp } from '@fortawesome/free-solid-svg-icons';

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

  /// Utility for creating an array of `n` length.
  const createArrayWithLength = (n: number): number[] =>
    [...Array(n + 1)].map((_, i) => i);

  /// Render placeholder loaders
  const renderPlaceholders = (length: number) => (
    <div className="placeholder-content-wrapper">
      {createArrayWithLength(length).map((_, i) => (
        <div key={i} className="placeholder-content"></div>
      ))}
    </div>
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
            <div
              className={newestFirst ? 'icon-wrapper active' : 'icon-wrapper'}
              onClick={() => setNewestFirst(!newestFirst)}
            >
              <div className="icon">
                <FontAwesomeIcon icon={faTimer} />
              </div>
              <span>{newestFirst ? 'Newest First' : 'Oldest First'}</span>
            </div>
            <div
              className={groupingOn ? 'icon-wrapper active' : 'icon-wrapper'}
              onClick={() => setGroupingOn(!groupingOn)}
            >
              <div className="icon">
                <FontAwesomeIcon icon={faLayerGroup} />
              </div>
              <span>{groupingOn ? 'Grouping On' : 'Grouping Off'}</span>
            </div>
            <div
              className={expandAll ? 'icon-wrapper active' : 'icon-wrapper'}
              style={{ opacity: groupingOn ? 'inherit' : '0.25' }}
              onClick={() => handleExpandAll()}
            >
              <div className="icon">
                <FontAwesomeIcon icon={expandAll ? faCaretDown : faCaretUp} />
              </div>
              <span>{expandAll ? 'All Expanded' : 'All Collapsed'}</span>
            </div>
          </ControlsWrapper>
          {/* List referenda */}
          <section>
            {fetchingReferenda ? (
              <div>{renderPlaceholders(4)}</div>
            ) : (
              <>
                <div>{renderCategorised()}</div>
                <div>{renderListed()}</div>
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
