// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useState } from 'react';
import { SelectRpcWrapper } from './Wrapper';
import { useBootstrapping } from '@app/contexts/main/Bootstrapping';
import type { FlattenedAPIData } from '@/types/apis';

interface SelectRpcProps {
  apiData: FlattenedAPIData;
}

export const SelectRpc = ({ apiData }: SelectRpcProps) => {
  const { chainId, endpoint } = apiData;
  const [selectedRpc, setSelectedRpc] = useState(endpoint);
  const { handleNewEndpointForChain } = useBootstrapping();

  /// Handle RPC change.
  const handleRpcChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newEndpoint = event.target.value;

    // Exit early if endpoint hasn't changed.
    if (newEndpoint === selectedRpc) {
      return;
    }

    // Update React state.
    setSelectedRpc(newEndpoint);

    // Re-connect and subscribe to active tasks.
    await handleNewEndpointForChain(chainId, newEndpoint);
  };

  /// Get class name for connected status icon.
  const getStatusClass = () =>
    apiData.status === 'connected' ? 'success' : 'danger';

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
        >
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
