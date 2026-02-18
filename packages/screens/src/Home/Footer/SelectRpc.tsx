// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { hasLightClientSupport } from '@polkadot-live/consts/chains';
import { useState } from 'react';
import { SelectRpcWrapper } from './Wrapper';
import type { NodeEndpoint } from '@polkadot-live/types/apis';
import type { SelectRpcProps } from './types';

export const SelectRpc = ({
  apiData,
  disabled,
  cacheGet,
  onEndpointChange,
  setWorkingEndpoint,
}: SelectRpcProps) => {
  const isConnected = cacheGet('mode:connected');
  const { chainId, endpoint } = apiData;
  const [selectedRpc, setSelectedRpc] = useState(endpoint);

  /**
   * Handle RPC change.
   */
  const handleRpcChange = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setWorkingEndpoint?.(chainId, true);
    const newEndpoint = event.target.value as NodeEndpoint;

    // Exit early if endpoint hasn't changed.
    if (newEndpoint === selectedRpc) {
      return;
    }

    // Update React state.
    setSelectedRpc(newEndpoint);

    // Re-connect and subscribe to active tasks.
    await onEndpointChange(chainId, newEndpoint);
    setWorkingEndpoint?.(chainId, false);
  };

  /**
   * Get class name for connected status icon.
   */
  const getStatusClass = () =>
    !isConnected
      ? 'danger'
      : apiData.status === 'connected'
        ? 'success'
        : 'danger';

  return (
    <SelectRpcWrapper>
      <div className="select-wrapper">
        <div className="icon-wrapper">
          <div className={getStatusClass()}></div>
        </div>

        <select
          id={`${chainId}_rpcs`}
          value={selectedRpc}
          onChange={(e) => handleRpcChange(e)}
          disabled={disabled}
        >
          <option value={'rpc'}>Auto RPC</option>
          {hasLightClientSupport(chainId) && (
            <option value={'smoldot'}>Light Client</option>
          )}
        </select>
      </div>
    </SelectRpcWrapper>
  );
};
