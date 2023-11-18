// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AnyElement, AnyFunction } from '@/types/misc';
import { useEffect } from 'react';

// A hook that alerts clicks outside of the passed ref.
export const useOutsideAlerter = (
  ref: AnyElement,
  callback: AnyFunction,
  ignore: string[] = []
) => {
  useEffect(() => {
    const handleClickOutside = (event: AnyElement) => {
      if (ref.current && !ref.current.contains(event.target)) {
        const invalid = ignore.find((s: string) =>
          event.target.classList.contains(s)
        );
        if (invalid === undefined) {
          callback();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);
};
