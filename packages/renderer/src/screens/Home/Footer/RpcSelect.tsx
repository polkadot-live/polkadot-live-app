// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useState } from 'react';
import { SelectRpcWrapper } from './Wrapper';
import { useBootstrapping } from '@ren/contexts/main';
import { useConnections } from '@ren/contexts/common';
import type { ChainID } from '@polkadot-live/types/chains';
import type { NodeEndpoint, FlattenedAPIData } from '@polkadot-live/types/apis';

interface SelectRpcProps {
  apiData: FlattenedAPIData;
  disabled: boolean;
  setWorkingEndpoint?: (chainId: ChainID, val: boolean) => void;
}

export const SelectRpc = ({
  apiData,
  disabled,
  setWorkingEndpoint,
}: SelectRpcProps) => {
  const { chainId, endpoint } = apiData;
  const [selectedRpc, setSelectedRpc] = useState(endpoint);
  const { handleNewEndpointForChain } = useBootstrapping();
  const { isConnected } = useConnections();

  /// Handle RPC change.
  const handleRpcChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setWorkingEndpoint && setWorkingEndpoint(chainId, true);
    const newEndpoint = event.target.value as NodeEndpoint;

    // Exit early if endpoint hasn't changed.
    if (newEndpoint === selectedRpc) {
      return;
    }

    // Update React state.
    setSelectedRpc(newEndpoint);

    // Re-connect and subscribe to active tasks.
    await handleNewEndpointForChain(chainId, newEndpoint);
    setWorkingEndpoint && setWorkingEndpoint(chainId, false);
  };

  /// Get class name for connected status icon.
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
          className="select-rpc"
          id={`${chainId}_rpcs`}
          value={selectedRpc}
          onChange={(e) => handleRpcChange(e)}
          disabled={disabled}
        >
          <option value={'smoldot'}>Light Client</option>
          {apiData.rpcs.map((rpc, i) => (
            <option key={i} value={rpc}>
              {rpc}
            </option>
          ))}
        </select>
      </div>
    </SelectRpcWrapper>
  );
};
