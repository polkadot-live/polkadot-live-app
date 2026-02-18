// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyElement } from '@polkadot-live/types/misc';

/*
 * A hook that wraps multiple context providers to a component and makes each parent context accessible.
 */
export const withProviders =
  (...providers: AnyElement) =>
  (WrappedComponent: AnyElement) =>
  (props: AnyElement) =>
    providers.reduceRight(
      (acc: AnyElement, prov: AnyElement, index: number) => {
        let Provider = prov;
        if (Array.isArray(prov)) {
          Provider = prov[0];
          return (
            <Provider key={index} {...prov[1]}>
              {acc}
            </Provider>
          );
        }

        return <Provider key={index}>{acc}</Provider>;
      },
      <WrappedComponent {...props} />,
    );
