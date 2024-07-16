// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
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
        <>
          {item.startsWith('#') && (
            <h4 key={`inner_def_${index}`} className="definition header">
              {item.slice(1)}
            </h4>
          )}
          {!item.startsWith('#') && (
            <h4 key={`inner_def_${index}`} className="definition">
              {item}
            </h4>
          )}
        </>
      ))}
    </div>
  </DefinitionWrapper>
);
