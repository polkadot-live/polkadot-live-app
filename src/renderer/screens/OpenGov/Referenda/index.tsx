// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ContentWrapper, HeaderWrapper } from '@app/screens/Wrappers';
import { DragClose } from '@/renderer/library/DragClose';
import type { ReferendaProps } from '../types';
import { OpenGovFooter } from '../Wrappers';
import { ButtonPrimaryInvert } from '@/renderer/kits/Buttons/ButtonPrimaryInvert';
import { faCaretLeft } from '@fortawesome/pro-solid-svg-icons';
import { useReferenda } from '@/renderer/contexts/openGov/Referenda';

export const Referenda = ({ setSection, chainId }: ReferendaProps) => {
  const { fetchingReferenda, getSortedActiveReferenda } = useReferenda();

  return (
    <>
      <HeaderWrapper>
        <div className="content">
          <DragClose windowName="openGov" />
          <h3>{chainId} Referenda</h3>
        </div>
      </HeaderWrapper>
      <ContentWrapper>
        {fetchingReferenda ? (
          <p>Loading referenda...</p>
        ) : (
          <>
            {getSortedActiveReferenda().map((referenda, i) => (
              <span
                key={i}
                style={{
                  width: '40px',
                  display: 'inline-block',
                }}
              >
                <span>{referenda.referendaId}</span>
              </span>
            ))}
          </>
        )}
      </ContentWrapper>
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
