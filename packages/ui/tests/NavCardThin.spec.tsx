// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NavCardThin } from '../src/components';
import userEvent from '@testing-library/user-event';

describe('NavCardThin', () => {
  const containerClass = 'methodCard';
  const renderNavCardThin = () =>
    render(
      <NavCardThin
        title={'Polkadot'}
        onClick={vi.fn()}
        childrenLogo={<span>Logo</span>}
        childrenSubtitle={<span>Subtitle</span>}
      />
    );

  it('should render the provided title text', () => {
    renderNavCardThin();

    const heading = screen.getByRole('heading');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/polkadot/i);
  });

  it('should render the provided subtitle text', () => {
    renderNavCardThin();

    const subtitle = screen.getByText(/subtitle/i);
    expect(subtitle).toBeInTheDocument();
  });

  it('should call the provided onClick function when the card is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();

    const { container } = render(
      <NavCardThin
        title={'Polkadot'}
        onClick={mockOnClick}
        childrenLogo={<span>Logo</span>}
        childrenSubtitle={<span>Subtitle</span>}
      />
    );

    const cardElement = container.getElementsByClassName(containerClass)[0];
    expect(cardElement).toBeInTheDocument();

    await user.click(cardElement);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
