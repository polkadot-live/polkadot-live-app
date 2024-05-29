// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccordionHeader, useAccordion } from '@/renderer/library/Accordion';
import { HeadingWrapper } from '@app/screens/Home/Wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretRight } from '@fortawesome/pro-solid-svg-icons';
import type { AnyData } from '@/types/misc';

export const AccordionCaretHeader = ({ title, index }: AnyData) => {
  const { activeIndex } = useAccordion();

  return (
    <HeadingWrapper>
      <AccordionHeader>
        <div className="flex">
          <div className="left">
            <div className="icon-wrapper">
              {activeIndex.includes(index) ? (
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
