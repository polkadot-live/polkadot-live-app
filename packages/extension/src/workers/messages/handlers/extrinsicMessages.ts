// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  getAllExtrinsics,
  handleBuildExtrinsic,
  handleGetEstimatedFee,
  handleLedgerSignSubmit,
  handlePersistExtrinsic,
  handleSubmitExtrinsic,
  handleSubmitMockExtrinsic,
  removeExtrinsic,
  updateExtrinsic,
} from '../../extrinsics';
import { dispatchNotification } from '../../notifications';
import {
  getBrowserTabId,
  getPendingActionMeta,
  setActiveTabs,
  setBrowserTabId,
  setPendingActionMeta,
  setPendingTabData,
} from '../../state';
import { isMainTabOpen, sendChromeMessage } from '../../utils';
import type { ActionMeta, ExtrinsicInfo } from '@polkadot-live/types/tx';
import type { AnyData } from '@polkadot-live/types/misc';
import type { LedgerTaskResponse } from '@polkadot-live/types/ledger';
import type { TabData } from '@polkadot-live/types/communication';

export const handleExtrinsicMessage = (
  message: AnyData,
  sendResponse: (response?: AnyData) => void
): boolean => {
  switch (message.task) {
    case 'buildExtrinsic': {
      const { info }: { info: ExtrinsicInfo } = message.payload;
      handleBuildExtrinsic(info).then((res) => sendResponse(res));
      return true;
    }
    case 'dispatchNotification': {
      const { title, body }: { title: string; body: string } = message.payload;
      dispatchNotification(Date.now().toString(), title, body);
      return false;
    }
    case 'getAll': {
      getAllExtrinsics().then((res) => sendResponse(res));
      return true;
    }
    case 'getEstimatedFee': {
      const { info }: { info: ExtrinsicInfo } = message.payload;
      handleGetEstimatedFee(info).then((res) => sendResponse(res));
      return true;
    }
    case 'persist': {
      const { info }: { info: ExtrinsicInfo } = message.payload;
      handlePersistExtrinsic(info);
      return false;
    }
    case 'update': {
      const { info }: { info: ExtrinsicInfo } = message.payload;
      updateExtrinsic(info);
      return false;
    }
    case 'remove': {
      const { txId }: { txId: string } = message.payload;
      removeExtrinsic(txId);
      return false;
    }
    case 'initTxRelay': {
      // Cache action meta and fetch from extrinsics window when open.
      const { actionMeta }: { actionMeta: ActionMeta } = message.payload;
      const tabData: TabData = {
        id: -1,
        viewId: 'action',
        label: 'Extrinsics',
      };
      const { viewId } = tabData;

      isMainTabOpen().then((tab) => {
        const browserTabOpen = Boolean(tab);
        browserTabOpen && setBrowserTabId(tab?.id || null);
        const url = chrome.runtime.getURL(`src/tab/index.html#${viewId}`);

        if (browserTabOpen) {
          const browserTabId = getBrowserTabId();
          browserTabId &&
            chrome.tabs.update(Number(browserTabId), { active: true });
          sendChromeMessage('tabs', 'openTab', { tabData });
          sendChromeMessage('extrinsics', 'tryInitTx', { actionMeta });
        } else {
          setActiveTabs([]);
          setPendingTabData(tabData);
          setPendingActionMeta(actionMeta);
          chrome.tabs.create({ url }).then((newTab) => {
            setBrowserTabId(newTab.id || null);
          });
        }
      });
      return false;
    }
    case 'initTx': {
      const actionMeta = getPendingActionMeta();
      setPendingActionMeta(null);
      sendResponse(actionMeta);
      return true;
    }
    case 'submit': {
      const { info }: { info: ExtrinsicInfo } = message.payload;
      handleSubmitExtrinsic(info);
      return false;
    }
    case 'submitMock': {
      const { info }: { info: ExtrinsicInfo } = message.payload;
      handleSubmitMockExtrinsic(info);
      return false;
    }
    case 'ledgerSignSubmit': {
      const { info }: { info: ExtrinsicInfo } = message.payload;
      handleLedgerSignSubmit(info).then((result: LedgerTaskResponse) =>
        sendResponse(result)
      );
      return true;
    }
    default: {
      console.warn(`Unknown extrinsic task: ${message.task}`);
      return false;
    }
  }
};
