// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccordionHeader, useAccordion } from './Accordion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { HeadingWrapper, WideHeadingWrapper } from './AccordionHeaders.styles';
import type {
  AccordionCaretHeaderProps,
  AccordionCaretSwitchHeaderProps,
} from './types';

/**
 * @name AccordionCaretHeader
 * @summary Header with dynamic caret that changes when accordion is expanded and collapsed.
 */
export const AccordionCaretHeader = ({
  title,
  itemIndex,
  wide,
}: AccordionCaretHeaderProps) => {
  const { activeIndex } = useAccordion();

  const innerMarkup = () => (
    <AccordionHeader>
      <div className="flex">
        <div className="left">
          <div className="icon-wrapper">
            {activeIndex.includes(itemIndex) ? (
              <FontAwesomeIcon icon={faCaretDown} transform={'shrink-1'} />
            ) : (
              <FontAwesomeIcon icon={faCaretRight} transform={'shrink-1'} />
            )}
          </div>
          <h5>
            <span>{title}</span>
          </h5>
        </div>
      </div>
    </AccordionHeader>
  );

  if (wide) {
    return (
      <WideHeadingWrapper style={{ padding: '0' }}>
        {innerMarkup()}
      </WideHeadingWrapper>
    );
  } else {
    return <HeadingWrapper>{innerMarkup()}</HeadingWrapper>;
  }
};

/**
 * @name AccordionCaretSwitchHeader
 * @summary Header with dynamic caret that changes when accordion is expanded and collapsed.
 *
 * Takes a switch component that renders on the right side of the header.
 */
export const AccordionCaretSwitchHeader = ({
  title,
  itemIndex,
  SwitchComponent,
}: AccordionCaretSwitchHeaderProps) => {
  const { activeIndex } = useAccordion();

  return (
    <HeadingWrapper>
      <AccordionHeader>
        <div className="flex">
          <div className="left">
            <div className="icon-wrapper">
              {activeIndex.includes(itemIndex) ? (
                <FontAwesomeIcon icon={faCaretDown} transform={'shrink-1'} />
              ) : (
                <FontAwesomeIcon icon={faCaretRight} transform={'shrink-1'} />
              )}
            </div>
            <h5>
              <span>{title}</span>
            </h5>
          </div>
          <div className="right">{SwitchComponent}</div>
        </div>
      </AccordionHeader>
    </HeadingWrapper>
  );
};
