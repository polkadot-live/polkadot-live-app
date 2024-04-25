// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
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
        <h4 key={`inner_def_${index}`} className="definition">
          {item}
        </h4>
      ))}
    </div>
  </DefinitionWrapper>
);
