// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/// Required imports.
import { AccountsController } from '@/controller/renderer/AccountsController';
import { APIsController } from '@/controller/renderer/APIsController';
import BigNumber from 'bignumber.js';
import { chainUnits } from '@/config/chains';
import { Config as ConfigRenderer } from '@/config/processes/renderer';
import { encodeAddress } from '@polkadot/util-crypto';
import { ExtrinsicsController } from '@/controller/renderer/ExtrinsicsController';
import {
  fetchBalanceForAccount,
  fetchNominatingDataForAccount,
  fetchNominationPoolDataForAccount,
} from '@/utils/AccountUtils';
import { getApiInstanceOrThrow, handleApiDisconnects } from '@/utils/ApiUtils';
import { isObject, u8aConcat } from '@polkadot/util';
import { planckToUnit, rmCommas } from '@w3ux/utils';
import { SubscriptionsController } from '@/controller/renderer/SubscriptionsController';

/// Main window contexts.
import { useAddresses } from '@app/contexts/main/Addresses';
import { useBootstrapping } from '@app/contexts/main/Bootstrapping';
import { useChains } from '@app/contexts/main/Chains';
import { useEffect } from 'react';
import { useEvents } from '@app/contexts/main/Events';
import { useManage } from '@app/screens/Home/Manage/provider';
import { useSubscriptions } from '@app/contexts/main/Subscriptions';

/// Type imports.
import type { AccountSource, LocalAddress } from '@/types/accounts';
import type { ActiveReferendaInfo } from '@/types/openGov';
import type { AnyData } from '@/types/misc';

export const useMainMessagePorts = () => {
  /// Main renderer contexts.
  const { importAddress, removeAddress, setAddresses } = useAddresses();
  const { handleDockedToggle, handleToggleSilenceOsNotifications } =
    useBootstrapping();
  const { addChain } = useChains();
  const { updateEventsOnAccountRename } = useEvents();
  const { setRenderedSubscriptions } = useManage();
  const { setAccountSubscriptions, updateAccountNameInTasks } =
    useSubscriptions();

  /**
   * @name handleImportAddress
   * @summary Imports a new account when a message is received from `import` window.
   */
  const handleImportAddress = async (ev: MessageEvent) => {
    const { chainId, source, address, name } = ev.data.data;

    // Add address to accounts controller.
    const account = AccountsController.add(chainId, source, address, name);

    if (!account) {
      // Account could not be added, probably already added.
      return;
    }

    if (await window.myAPI.getOnlineStatus()) {
      // Fetch account nonce and balance.
      await fetchBalanceForAccount(account);

      // Initialize nomination pool data for account if necessary.
      await fetchNominationPoolDataForAccount(account);

      // Initialize nominating data for account if necessary.
      await fetchNominatingDataForAccount(account);

      // Disconnect from any API instances that are not currently needed.
      await handleApiDisconnects();
    }

    // Add account to address context state.
    importAddress(chainId, source, address, name);

    // Update account subscriptions data.
    setAccountSubscriptions(
      SubscriptionsController.getAccountSubscriptions(
        AccountsController.accounts
      )
    );

    // Send message back to import window to reset account's processing flag.
    ConfigRenderer.portToImport.postMessage({
      task: 'import:account:processing',
      data: {
        address,
        source,
        status: false,
      },
    });
  };

  /**
   * @name handleRemoveAddress
   * @summary Removes an account a message is received from `import` window.
   */
  const handleRemoveAddress = async (ev: MessageEvent) => {
    const { address, chainId } = ev.data.data;

    // Retrieve the account.
    const account = AccountsController.get(chainId, address);

    if (!account) {
      console.log('Account could not be fetched, probably not imported yet');
      return;
    }

    // Unsubscribe from all active tasks.
    await AccountsController.removeAllSubscriptions(account);

    // Remove account from controller and store.
    AccountsController.remove(chainId, address);

    // Remove address from context.
    removeAddress(chainId, address);

    // Update account subscriptions data.
    setAccountSubscriptions(
      SubscriptionsController.getAccountSubscriptions(
        AccountsController.accounts
      )
    );

    // Disconnect from any API instances that are not currently needed.
    await handleApiDisconnects();

    // Report chain connections to UI.
    for (const apiData of APIsController.getAllFlattenedAPIData()) {
      addChain(apiData);
    }

    // Transition away from rendering toggles.
    setRenderedSubscriptions({ type: '', tasks: [] });
  };

  /**
   * @name handleRenameAccount
   * @summary Rename an account managed by the accounts controller and update state.
   */
  const handleRenameAccount = async (ev: MessageEvent) => {
    const { address, chainId, newName } = ev.data.data;
    const account = AccountsController.get(chainId, address);

    if (!account) {
      // Account not found in controller.
      console.log('account not imported');
      return;
    }

    // Set new account name and persist new account data to storage.
    account.name = newName;
    await AccountsController.set(chainId, account);

    // Update account react state.
    setAddresses(AccountsController.getAllFlattenedAccountData());

    // Update subscription task react state.
    updateAccountNameInTasks(address, newName);

    // The updated events will be sent back to the renderer for updating React state.
    const updated = await window.myAPI.updateAccountNameForEventsAndTasks(
      address,
      newName
    );

    if (updated && updated.length > 0) {
      updateEventsOnAccountRename(updated, chainId);
    }
  };

  /// Utility to post message to settings window.
  const postToSettings = (res: boolean, text: string) => {
    ConfigRenderer.portToSettings.postMessage({
      task: 'settings:render:toast',
      data: { success: res, text },
    });
  };

  /// Utility to post message to import window.
  const postToImport = (json: LocalAddress) => {
    ConfigRenderer.portToImport.postMessage({
      task: 'import:account:add',
      data: { json },
    });
  };

  /**
   * @name getLocalAddresses
   * @summary Utility to fetch local addresses from local storage.
   */
  const getLocalAddresses = (source: AccountSource) => {
    const key =
      source === 'vault'
        ? 'vault_addresses'
        : source === 'read-only'
          ? 'read_only_addresses'
          : '';

    const fetched: string | null = localStorage.getItem(key);
    return key === '' || !fetched
      ? []
      : (JSON.parse(fetched) as LocalAddress[]);
  };

  /**
   * @name handleDataExport
   * @summary Write Polkadot Live data to a file.
   */
  const handleDataExport = async () => {
    // Get data to export.
    let accountsJson: LocalAddress[] = [];
    for (const source of ['vault', 'read-only'] as AccountSource[]) {
      accountsJson = accountsJson.concat(
        getLocalAddresses(source).map((a) => ({
          ...a,
          isImported: false,
        }))
      );
    }

    // Serialize and export data in main process.
    const serialized = JSON.stringify(accountsJson);
    const { result, msg } = await window.myAPI.exportAppData(serialized);

    // Render toastify message in settings window.
    switch (msg) {
      case 'success': {
        postToSettings(result, 'Data exported successfully.');
        break;
      }
      case 'error': {
        postToSettings(result, 'Data export error.');
        break;
      }
      case 'canceled': {
        // Don't do anything on cancel.
        break;
      }
      case 'executing': {
        postToSettings(result, 'Export dialog is already open.');
        break;
      }
      default: {
        throw new Error('Message not recognized');
      }
    }
  };

  /**
   * @name handleDataImport
   * @summary Import and process Polkadot Live data.
   */
  const handleDataImport = async () => {
    const response = await window.myAPI.importAppData();

    switch (response.msg) {
      case 'success': {
        try {
          const json: LocalAddress[] = JSON.parse(response.data.serialized);
          for (const accountJson of json) {
            // TODO: Support importing ledger addresses.
            if (accountJson.source === 'ledger') {
              continue;
            }
            postToImport(accountJson);
          }
          postToSettings(response.result, 'Data imported successfully.');
        } catch (err) {
          postToSettings(false, 'Error parsing JSON.');
        }

        break;
      }
      case 'canceled': {
        // Don't do anything on cancel.
        break;
      }
      case 'error': {
        postToSettings(response.result, 'Data import error.');
        break;
      }
      default: {
        throw new Error('Message not recognized');
      }
    }
  };

  /**
   * @name handleActionTxInit
   * @summary Initialize extrinsics controller with tx data.
   */
  const handleActionTxInit = async (ev: MessageEvent) => {
    const { chainId, from, nonce, pallet, method, args, eventUid } =
      ev.data.data;

    await ExtrinsicsController.new(
      chainId,
      from,
      nonce,
      pallet,
      method,
      args,
      eventUid
    );
  };

  /**
   * @name handleTxVaultSubmit
   * @summary Set signature and submit transaction.
   */
  const handleTxVaultSubmit = (ev: MessageEvent) => {
    const { signature } = ev.data.data;

    ExtrinsicsController.setSignature(signature);
    ExtrinsicsController.submit();
  };

  /**
   * @name handleGetTracks
   * @summary Use API to get a network's OpenGov tracks.
   */
  const handleGetTracks = async (ev: MessageEvent) => {
    const { chainId } = ev.data.data;
    const { api } = await getApiInstanceOrThrow(chainId, 'Error');
    const result = api.consts.referenda.tracks.toHuman();

    ConfigRenderer.portToOpenGov.postMessage({
      task: 'openGov:tracks:receive',
      data: { result },
    });
  };

  /**
   * @name handleGetReferenda
   * @summary Use API to get a network's OpenGov referenda.
   */
  const handleGetReferenda = async (ev: MessageEvent) => {
    // Make API call to fetch referenda entries.
    const { chainId } = ev.data.data;
    const { api } = await getApiInstanceOrThrow(chainId, 'Error');
    const results = await api.query.referenda.referendumInfoFor.entries();

    // Populate referenda map.
    const activeReferenda: ActiveReferendaInfo[] = [];

    for (const [storageKey, storage] of results) {
      const info: AnyData = storage.toHuman();

      if (isObject(info) && 'Ongoing' in info) {
        // Instantiate and push next referenda to state.
        const next: ActiveReferendaInfo = {
          referendaId: parseInt((storageKey.toHuman() as string[])[0]),
          Ongoing: {
            ...info.Ongoing,
          },
        };

        activeReferenda.push(next);
      }
    }

    // Serialize data before sending to open gov window.
    const json = JSON.stringify(activeReferenda);

    ConfigRenderer.portToOpenGov.postMessage({
      task: 'openGov:referenda:receive',
      data: { json },
    });
  };

  /**
   * @name handleInitTreasury
   * @summary Use API to get treasury data for OpenGov window.
   */
  const handleInitTreasury = async (ev: MessageEvent) => {
    const { chainId } = ev.data.data;
    const { api } = await getApiInstanceOrThrow(chainId, 'Error');

    // Get raw treasury public key.
    const EMPTY_U8A_32 = new Uint8Array(32);
    const publicKey = u8aConcat(
      'modl',
      api.consts.treasury.palletId
        ? api.consts.treasury.palletId.toU8a(true)
        : 'py/trsry',
      EMPTY_U8A_32
    ).subarray(0, 32);

    // Get free balance.
    // TODO: Dynamic SS58 prefix.
    const encoded = encodeAddress(publicKey, 0);
    const result: AnyData = (await api.query.system.account(encoded)).toHuman();
    const { free } = result.data;
    const freeBalance: string = planckToUnit(
      new BigNumber(rmCommas(String(free))),
      chainUnits(chainId)
    ).toString();

    // Get next burn.
    const burn = api.consts.treasury.burn;
    const toBurn = new BigNumber(burn.toString())
      .dividedBy(Math.pow(10, 6))
      .multipliedBy(new BigNumber(rmCommas(String(free))));
    const nextBurn = planckToUnit(toBurn, chainUnits(chainId)).toString();

    // Get to be awarded.
    const [approvals, proposals] = await Promise.all([
      api.query.treasury.approvals(),
      api.query.treasury.proposals.entries(),
    ]);

    let toBeAwarded = new BigNumber(0);
    const toBeAwardedProposalIds = approvals.toHuman() as string[];

    for (const [rawProposalId, rawProposalData] of proposals) {
      const proposalId: string = (rawProposalId.toHuman() as [string])[0];
      if (toBeAwardedProposalIds.includes(proposalId)) {
        const proposal: AnyData = rawProposalData.toHuman();
        toBeAwarded = toBeAwarded.plus(
          new BigNumber(rmCommas(String(proposal.value)))
        );
      }
    }

    const toBeAwardedAsStr = planckToUnit(
      toBeAwarded,
      chainUnits(chainId)
    ).toString();

    ConfigRenderer.portToOpenGov.postMessage({
      task: 'openGov:treasury:set',
      data: { publicKey, freeBalance, nextBurn, toBeAwardedAsStr },
    });
  };

  /**
   * @name handleReceivedPort
   * @summary Determines whether the received port is for the `main` or `import` window and
   * sets up message handlers accordingly.
   */
  const handleReceivedPort = (e: MessageEvent) => {
    console.log(`received port: ${e.data.target}`);

    switch (e.data.target) {
      case 'main-import:main': {
        ConfigRenderer.portToImport = e.ports[0];

        ConfigRenderer.portToImport.onmessage = async (ev: MessageEvent) => {
          // Message received from `import`.
          switch (ev.data.task) {
            case 'renderer:address:import': {
              await handleImportAddress(ev);
              break;
            }
            case 'renderer:address:remove': {
              await handleRemoveAddress(ev);
              break;
            }
            case 'renderer:address:delete': {
              await handleRemoveAddress(ev);
              break;
            }
            case 'renderer:account:rename': {
              await handleRenameAccount(ev);
              break;
            }
            default: {
              throw new Error(`Port task not recognized (${ev.data.task})`);
            }
          }
        };

        ConfigRenderer.portToImport.start();
        break;
      }
      case 'main-action:main': {
        ConfigRenderer.portToAction = e.ports[0];

        ConfigRenderer.portToAction.onmessage = async (ev: MessageEvent) => {
          // Message received from `action`.
          switch (ev.data.task) {
            case 'renderer:tx:init': {
              console.log('> handle renderer:tx:init');
              await handleActionTxInit(ev);
              break;
            }
            case 'renderer:tx:vault:submit': {
              console.log('> handle renderer:tx:vault:submit');
              handleTxVaultSubmit(ev);
              break;
            }
            case 'renderer:tx:reset': {
              console.log('> handle renderer:tx:reset');
              ExtrinsicsController.reset();
              break;
            }
            default: {
              throw new Error(`Port task not recognized (${ev.data.task})`);
            }
          }
        };

        ConfigRenderer.portToAction.start();
        break;
      }
      case 'main-settings:main': {
        ConfigRenderer.portToSettings = e.ports[0];

        ConfigRenderer.portToSettings.onmessage = async (ev: MessageEvent) => {
          // Message received from `settings`.
          switch (ev.data.task) {
            case 'settings:execute:dockedWindow': {
              handleDockedToggle();
              break;
            }
            case 'settings:execute:showOnAllWorkspaces': {
              window.myAPI.toggleWindowWorkspaceVisibility();
              break;
            }
            case 'settings:execute:silenceOsNotifications': {
              handleToggleSilenceOsNotifications();
              break;
            }
            case 'settings:execute:exportData': {
              await handleDataExport();
              break;
            }
            case 'settings:execute:importData': {
              await handleDataImport();
              break;
            }
            default: {
              throw new Error(`Port task not recognized (${ev.data.task})`);
            }
          }
        };

        ConfigRenderer.portToSettings.start();
        break;
      }
      case 'main-openGov:main': {
        ConfigRenderer.portToOpenGov = e.ports[0];

        ConfigRenderer.portToOpenGov.onmessage = async (ev: MessageEvent) => {
          // Message received from `openGov`.
          switch (ev.data.task) {
            case 'openGov:tracks:get': {
              await handleGetTracks(ev);
              break;
            }
            case 'openGov:referenda:get': {
              await handleGetReferenda(ev);
              break;
            }
            case 'openGov:treasury:init': {
              await handleInitTreasury(ev);
              break;
            }
            default: {
              throw new Error(`Port task not recognized (${ev.data.task})`);
            }
          }
        };

        ConfigRenderer.portToOpenGov.start();
        break;
      }
      default: {
        console.error('Something went wrong.');
        break;
      }
    }
  };

  useEffect(() => {
    /**
     * Provide `onmessage` function.
     */
    window.onmessage = handleReceivedPort;

    /**
     * Cleanup message listener.
     */
    return () => {
      window.removeEventListener('message', handleReceivedPort, false);
    };
  }, []);
};
