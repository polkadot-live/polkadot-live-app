// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DefinitionWrapper } from '../Wrappers';

export const ActiveDefinition = ({
  description,
}: {
  description: string[];
}) => (
  <DefinitionWrapper>
    <div>
      {description.map((item, index: number) => (
        <div key={`inner_def_${index}`}>
          {item.startsWith('#') ? (
            <h4 className="definition header">{item.slice(1)}</h4>
          ) : (
            <h4 className="definition">{item}</h4>
          )}
        </div>
      ))}
    </div>
  </DefinitionWrapper>
);
