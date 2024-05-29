// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccordionHeader, useAccordion } from '@/renderer/library/Accordion';
import { HeadingWrapper } from '@/renderer/screens/Home/Manage/Wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretRight } from '@fortawesome/pro-solid-svg-icons';
import { HeadingWrapper as WideHeadingWrapper } from '@/renderer/screens/Home/Wrappers';

interface AccordionCaretHeaderProps {
  title: string;
  itemIndex: number;
  wide?: boolean;
}

interface AccordionCaretSwitchHeaderProps {
  title: string;
  itemIndex: number;
  SwitchComponent: React.ReactNode;
}

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
