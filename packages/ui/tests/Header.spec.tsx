// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '../src/components';
import userEvent from '@testing-library/user-event';
import { darkTheme } from '@polkadot-live/styles/theme/variables';
import type { AnyData } from '@polkadot-live/types/misc';
import type { UserEvent } from '@testing-library/user-event';

describe('Header', () => {
  const mockVersion = '1.0.0';

  const renderHeader = (
    showButtons: boolean,
    onCloseWindow?: AnyData,
    onDockToggle?: AnyData
  ) =>
    render(
      <Header
        theme={darkTheme}
        appLoading={false}
        showButtons={showButtons}
        dockToggled={false}
        version={mockVersion}
        onCloseWindow={onCloseWindow}
        onDockToggle={onDockToggle}
      />
    );

  const checkCalledOnClick = async (
    fn: AnyData,
    testId: string,
    user: UserEvent
  ) => {
    const button = screen.queryByTestId(testId) as HTMLElement;
    expect(button).toBeInTheDocument();
    await user.click(button);
    expect(fn).toHaveBeenCalledTimes(1);
  };

  it('should render the provided version string', () => {
    renderHeader(true, vi.fn(), vi.fn());

    const versionElement = screen.queryByTestId('version') as HTMLElement;
    expect(versionElement).toBeInTheDocument();
    expect(versionElement).toHaveTextContent(mockVersion);
  });

  it('should call the provided onCloseWindow function when the close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnCloseWindow = vi.fn();
    renderHeader(false, mockOnCloseWindow, vi.fn());

    checkCalledOnClick(mockOnCloseWindow, 'close-btn', user);
  });
});
