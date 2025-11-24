// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SideNav } from '../src/components';
import type { AnyData } from '@polkadot-live/types/misc';

interface NavState {
  isCollapsed: boolean;
  selectedId: number;
  setSelectedId: AnyData;
}

// Number of nav items hard coded into the side nav component.
const NUM_ITEMS = 3;

describe('SideNav', () => {
  const renderSideNav = (navState: NavState) =>
    render(
      <SideNav theme={{}} handleSideNavCollapse={vi.fn()} navState={navState} />
    );

  it('should render nav item headings when expanded', () => {
    renderSideNav({
      isCollapsed: false,
      selectedId: 0,
      setSelectedId: vi.fn(),
    });

    const headings = screen.getAllByRole('heading');
    expect(headings).toHaveLength(NUM_ITEMS);
  });

  it('should not render nav item headings when collapsed', () => {
    renderSideNav({
      isCollapsed: true,
      selectedId: 0,
      setSelectedId: vi.fn(),
    });

    const headings = screen.queryAllByRole('heading');
    expect(headings).toHaveLength(0);
  });

  it('should highlight the selected nav item', () => {
    const selectedId = 1;

    renderSideNav({
      isCollapsed: true,
      selectedId,
      setSelectedId: vi.fn(),
    });

    expect(
      screen.queryByTestId(`item-${selectedId}-selected`)
    ).toBeInTheDocument();

    expect(screen.queryByTestId('item-0-selected')).not.toBeInTheDocument();
    expect(screen.queryByTestId('item-2-selected')).not.toBeInTheDocument();
  });
});
