// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useState } from 'react';
import type { FlattenedAPIData } from '@/types/apis';
import { SelectRpcWrapper } from './Wrapper';

interface SelectRpcProps {
  apiData: FlattenedAPIData;
}

export const SelectRpc = ({ apiData }: SelectRpcProps) => {
  const { chainId, endpoint } = apiData;
  const [selectedRpc, setSelectedRpc] = useState(endpoint);

  /// Handle RPC change.
  const handleRpcChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRpc(event.target.value);
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
