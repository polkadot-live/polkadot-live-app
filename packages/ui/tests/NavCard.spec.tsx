// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { render, screen } from '@testing-library/react';
import { NavCard } from '../src/components';
import userEvent from '@testing-library/user-event';

describe('NavCard', () => {
  const containerClass = 'methodCard';

  const renderNavCard = () =>
    render(
      <NavCard
        title={'Ledger'}
        onClick={vi.fn()}
        openHelp={vi.fn()}
        childrenLogo={<span>Logo</span>}
        childrenSubtitle={<a href="url1">Subtitle</a>}
      />
    );

  it('should render the provided title text', () => {
    renderNavCard();

    const heading = screen.getByRole('heading');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/ledger/i);
  });

  it('should render the provided subtitle anchor with the correct url', () => {
    renderNavCard();

    const anchor = screen.getByRole('link', { name: /subtitle/i });
    expect(anchor).toBeInTheDocument();
    expect(anchor).toHaveAttribute('href', 'url1');
  });

  it('should not render a help button when a help key is not provided', () => {
    renderNavCard();

    const helpIcon = screen.queryByTestId('help-icon');
    expect(helpIcon).not.toBeInTheDocument();
  });

  it('should call the provided openHelp function when info button is clicked', async () => {
    const user = userEvent.setup();
    const mockOpenHelp = vi.fn();

    render(
      <NavCard
        title={'Ledger'}
        onClick={vi.fn()}
        openHelp={mockOpenHelp}
        helpKey="help:import:ledger"
        childrenLogo={<span>Logo</span>}
        childrenSubtitle={<a href="url1">Subtitle</a>}
      />
    );

    const helpIcon = screen.getByTestId('help-icon');
    expect(helpIcon).toBeInTheDocument();

    await user.click(helpIcon);
    expect(mockOpenHelp).toHaveBeenCalledTimes(1);
  });

  it('should call the provided onClick function when the card is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();

    const { container } = render(
      <NavCard
        title={'Ledger'}
        onClick={mockOnClick}
        openHelp={vi.fn()}
        helpKey="help:import:ledger"
        childrenLogo={<span>Logo</span>}
        childrenSubtitle={<a href="url1">Subtitle</a>}
      />
    );

    const cardElement = container.getElementsByClassName(containerClass)[0];
    expect(cardElement).toBeInTheDocument();

    await user.click(cardElement);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
