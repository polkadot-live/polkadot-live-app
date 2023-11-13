// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ApiPromise } from '@polkadot/api';
import { GenericEvent, GenericExtrinsic } from '@polkadot/types';
import { Codec } from '@polkadot/types-codec/types';
import { Header } from '@polkadot/types/interfaces/runtime';
import {
  ApiSubscription,
  BlockStreamConfig,
  ConcreteAccount,
  ExtendedAccount,
  GenericNotification,
  MatchOutcome,
  MethodSubscription,
  AnyData,
  EventInner,
  ExtrinsicInner,
  NotificationReport,
  Reporter,
} from '@polkadot-live/types';
import { ChainID } from '@polkadot-live/types/chains';
import { MainDebug } from '../debugging';
import {
  matchEventToAccount,
  matchExtrinsicToAccount,
  subscriptionFilter,
} from '../model/Match';
import { AccountsController } from './AccountsController';
import { Discover } from './Discover';

const MAX_SKIPPED_BLOCKS = 5;

const debug = MainDebug.extend('BlockStream');

export class BlockStream {
  // The type of reporter that is being used. For Polkadot Live, the only reporter needed is the
  // LiveReporter.
  reporters: Reporter[];

  // The list of accounts to subscribe to, along with their subscription configs.
  accounts: ConcreteAccount[];

  // The type of api subscription to use, either listening to the `Head` or `Finalized` events.
  apiSubscription: ApiSubscription;

  // The chain id.
  chain: ChainID;

  // The API instance.
  api: ApiPromise;

  // The unsub object for closing down the service.
  unsub: AnyData;

  // The constructor assigns all inputs to the corresponding class variables.
  constructor(
    api: ApiPromise,
    chain: ChainID,
    reporters: Reporter[],
    config: BlockStreamConfig
  ) {
    debug.extend(chain)('🔔 Instantiating chain notification service.');

    this.reporters = reporters;
    this.apiSubscription = config.apiSubscription;

    // Take raw accounts and convert to concrete accounts.
    this.accounts = config.accounts.map((raw) => {
      return {
        ...raw,
        address: api.createType('Address', raw.address),
      };
    });

    this.api = api;
    this.chain = chain;
  }

  // Start the notification service.
  async start() {
    // Either subscribe to Head or Finalized events.
    const subFn =
      this.apiSubscription == ApiSubscription.Head
        ? this.api.rpc.chain.subscribeNewHeads
        : this.api.rpc.chain.subscribeFinalizedHeads;

    debug.extend(this.chain)(
      '⛓️  Starting listening via ',
      this.apiSubscription
    );

    let lastBlock: number | undefined = undefined;

    // Start subscription.
    const unsub = await subFn(async (header) => {
      debug.extend(this.chain)(
        `🧱 Checking block ${header.number} ${header.hash}`
      );

      // Process blocks that were skpped.
      if (
        lastBlock !== undefined &&
        header.number.toNumber() != lastBlock + 1 &&
        header.number.toNumber() > lastBlock
      ) {
        // Check if blocks were skipped, and if so, account for their existence.
        const amountSkipped = header.number.toNumber() - 1 - lastBlock;
        const listOfSkippedBlocks = Array.from(Array(amountSkipped).keys()).map(
          (x) => x + 1 + (lastBlock || 0)
        );

        // Process skipped blocks.
        if (listOfSkippedBlocks.length <= MAX_SKIPPED_BLOCKS) {
          for (const n of listOfSkippedBlocks) {
            const blockHash = await this.api.rpc.chain.getBlockHash(n);
            const thisHeader: Header =
              await this.api.rpc.chain.getHeader(blockHash);
            // Process this block for notifications.
            await this.perHeader(thisHeader);
          }
        } else {
          // Too many skipped blocks. Trigger event bootstrap for the chain to keep events in sync.
          Discover.bootstrapEvents(this.chain);
        }

        // Now caught up, set last block.
        lastBlock = header.number.toNumber();
      } else if (
        lastBlock !== undefined &&
        header.number.toNumber() != lastBlock + 1 &&
        header.number.toNumber() <= lastBlock
      ) {
        // Something has gone wrong, block is not valid.
        debug.extend(this.chain)(`🧐 This makes no sense ${header.number}`);
      } else {
        // Process the current block.
        await this.perHeader(header);
        lastBlock = header.number.toNumber();
      }
    });

    this.unsub = unsub;
  }

  // Process a block header for notifications.
  async perHeader(header: Header) {
    debug.extend(this.chain)(`🧬 Process  ${header.number} for notifications.`);

    const chain = this.chain;
    const accounts = this.accounts;
    const signedBlock = await this.api.rpc.chain.getBlock(header.hash);
    const extrinsics = signedBlock.block.extrinsics;
    const blockApi = await this.api.at(header.hash);
    const events = (await blockApi.query.system.events()) as AnyData;
    const number = header.number.toNumber();
    const hash = header.hash.toString();
    const timestamp = ((await blockApi.query.timestamp.now()) as AnyData)
      .toBn()
      .toNumber();

    // Helper function to get the method name of a notification.
    const methodOf = (generic: GenericNotification): string => {
      if (generic.type == 'event') {
        return generic.data.method.toString();
      } else {
        return (generic.data as GenericExtrinsic).meta.name.toString();
      }
    };

    // Helper function to get the pallet name of a notification.
    const palletOf = (generic: GenericNotification): string => {
      if (generic.type === 'event') {
        return (generic.data.toHuman() as AnyData).section;
      } else {
        return (generic.data as GenericExtrinsic).method.section.toString();
      }
    };

    const innerOf = (
      generic: GenericNotification
    ): EventInner | ExtrinsicInner => {
      const s = (d: Codec) => {
        const r = d.toRawType().toLowerCase();
        if (r == 'u128' || r.toLowerCase() == 'balance') {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          return formatBalance(data);
        } else {
          return d.toString();
        }
      };

      if (generic.type == 'event') {
        const event = generic.data as GenericEvent;
        const ret: EventInner = { data: event.toJSON().data, type: 'event' };
        return ret;
      } else {
        const ext = generic.data as GenericExtrinsic;
        const ret: ExtrinsicInner = {
          data: Array.from(ext.method.args).map((d) => s(d)),
          nonce: ext.nonce.toNumber(),
          signer: ext.signer.toString(),
          type: 'extrinsic',
        };
        return ret;
      }
    };

    const processMatchOutcome = (
      config: MethodSubscription,
      generic: GenericNotification,
      outcome: MatchOutcome
    ) => {
      if (outcome === true) {
        // it is a wildcard.
        const account: ExtendedAccount = 'Wildcard';
        const pallet = palletOf(generic);
        const method = methodOf(generic);
        const inner = innerOf(generic);
        const reportInput = { account, inner, pallet, method };

        if (subscriptionFilter({ pallet, method }, config)) {
          report.details.push(reportInput);
          // NOTE: delegates will never have a `Wildcard` account type.
        }
      } else if (outcome === false) {
        // it did not match.
      } else {
        // it matched with an account.
        const account = outcome.with as ConcreteAccount;
        const pallet = palletOf(generic);
        const method = methodOf(generic);
        const inner = innerOf(generic);
        const reportInput = { account, inner, pallet, method };

        // add to report if subscriptions match this event.
        if (subscriptionFilter({ pallet, method }, config)) {
          report.details.push(reportInput);

          // determine delegators & prepare report with delegator events.
          report.delegators = AccountsController.getDelegatorsOfAddress(
            account.address.toString(),
            { pallet, method }
          );
        }
      }
    };

    const report: NotificationReport = {
      _type: 'notification',
      hash,
      chain,
      number,
      timestamp,
      details: [],
      delegators: [],
    };

    // check all extrinsics to see if accounts are involved.
    debug.extend(this.chain)(`🧬 Processing ${extrinsics.length} extrinsics.`);
    for (const ext of extrinsics) {
      accounts.forEach((account) => {
        const matchOutcome = matchExtrinsicToAccount(ext, account);
        const generic: GenericNotification = { data: ext, type: 'extrinsic' };
        // filter out exrinsics that are not in the account's config.
        processMatchOutcome(account.config, generic, matchOutcome);
      });
    }

    // check events to see if accounts are involved.
    debug.extend(this.chain)(`🧬 Processing ${events.length} events.`);
    for (const event of events) {
      accounts.forEach((account) => {
        const matchOutcome = matchEventToAccount(event, account);
        const generic: GenericNotification = { data: event, type: 'event' };
        // filter out events that are not in the account's config.
        processMatchOutcome(account.config, generic, matchOutcome);
      });
    }

    // if events or extrinsics have matched, trigger a report.
    if (report.details.length) {
      await Promise.all(this.reporters.map((r) => r.report(report)));
    }
  }
}
