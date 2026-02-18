// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import axios from 'axios';
import type { AxiosInstance } from 'axios';

/**
 * Set up an Axios instance that limits the amount of requests it can process
 * at a given time.
 *
 * @todo Throw away class if it's not to be used in the initial stable version
 * of Polkadot live.
 */
export class AxiosPool {
  /// Data
  private static _axiosApi = axios.create();
  private static _pending = 0;

  private static MAX_REQUEST_COUNT = 5;
  private static INTERVAL_MS = 10;

  /// Total number of proposals to fetch.
  static target = 0;

  /// Accessors
  static get api(): AxiosInstance {
    return AxiosPool._axiosApi;
  }

  /// Initialise
  static initialise() {
    console.log('>> Initialise axios pool');

    // Axios request interceptor.
    AxiosPool._axiosApi.interceptors.request.use(
      (config) =>
        new Promise((resolve) => {
          const interval = setInterval(() => {
            if (AxiosPool._pending < AxiosPool.MAX_REQUEST_COUNT) {
              AxiosPool._pending++;
              clearInterval(interval);
              resolve(config);
            }
          }, AxiosPool.INTERVAL_MS);
        }),
    );

    // Axios response interceptor.
    AxiosPool._axiosApi.interceptors.response.use(
      (response) => {
        AxiosPool._pending = Math.max(0, AxiosPool._pending - 1);
        return Promise.resolve(response);
      },
      (error) => {
        AxiosPool._pending = Math.max(0, AxiosPool._pending - 1);
        return Promise.reject(error);
      },
    );
  }
}

AxiosPool.initialise();
