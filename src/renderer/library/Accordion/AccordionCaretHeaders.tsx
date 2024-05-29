// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccordionHeader, useAccordion } from '@/renderer/library/Accordion';
import { HeadingWrapper } from '@/renderer/screens/Home/Manage/Wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretRight } from '@fortawesome/pro-solid-svg-icons';

interface AccordionCaretHeaderProps {
  title: string;
  itemIndex: number;
}

interface AccordionCaretSwitchHeaderProps {
  title: string;
  itemIndex: number;
  SwitchComponent: React.ReactNode;
}

export const AccordionCaretHeader = ({
  title,
  itemIndex,
}: AccordionCaretHeaderProps) => {
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
        </div>
      </AccordionHeader>
    </HeadingWrapper>
  );
};

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
