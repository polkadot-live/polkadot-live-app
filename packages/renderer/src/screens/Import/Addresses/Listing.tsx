// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';
import * as Styles from '@polkadot-live/ui/styles';

import { useAddresses, useRenameHandler } from '@ren/contexts/import';
import { useState } from 'react';
import { Address } from './Address';
import { ItemsColumn } from '../../Home/Manage/Wrappers';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import {
  DialogBulkRename,
  DialogManageAccounts,
  DialogRename,
  DialogShowAddress,
} from '../Addresses/Dialogs';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ManageAccountsProps } from './types';

export const Listing = ({ source, setSection }: ManageAccountsProps) => {
  const { getAccounts } = useAddresses();
  const {
    getBulkRenameDialogData,
    getManageAccountDialogData,
    getShowAddressDialogData,
  } = useRenameHandler();
  const genericAccounts = getAccounts(source);

  const getAccordionTitle = (): string => {
    switch (source) {
      case 'ledger':
        return 'Ledger Accounts';
      case 'read-only':
        return 'Read Only Accounts';
      case 'wallet-connect':
        return 'Wallet Connect Accounts';
      case 'vault':
        return 'Vault Accounts';
      default:
        return 'Accounts';
    }
  };

  const title = getAccordionTitle();
  const [accordionValue, setAccordionValue] = useState(title);

  return (
    <section>
      {/* Mount Dialogs */}
      <DialogRename />

      {getBulkRenameDialogData().genericAccount && (
        <DialogBulkRename
          genericAccount={getBulkRenameDialogData().genericAccount!}
        />
      )}

      {getManageAccountDialogData().genericAccount && (
        <DialogManageAccounts
          genericAccount={getManageAccountDialogData().genericAccount!}
        />
      )}

      {getShowAddressDialogData().encodedAccount && (
        <DialogShowAddress
          encodedAccount={getShowAddressDialogData().encodedAccount!}
        />
      )}

      {/* Address List */}
      <UI.AccordionWrapper $onePart={true}>
        <Accordion.Root
          className="AccordionRoot"
          type="single"
          value={accordionValue}
          onValueChange={(val) => setAccordionValue(val as ChainID)}
        >
          <Styles.FlexColumn>
            <Accordion.Item className="AccordionItem" value={title}>
              <UI.AccordionTrigger narrow={true}>
                <ChevronDownIcon className="AccordionChevron" aria-hidden />
                <UI.TriggerHeader>{title}</UI.TriggerHeader>
              </UI.AccordionTrigger>
              <UI.AccordionContent transparent={true}>
                <ItemsColumn>
                  {genericAccounts.length ? (
                    <>
                      {genericAccounts
                        .sort((a, b) =>
                          a.accountName.localeCompare(b.accountName)
                        )
                        .map((genericAccount) => (
                          <Address
                            key={`address_${genericAccount.accountName}`}
                            genericAccount={genericAccount}
                            setSection={setSection}
                          />
                        ))}
                    </>
                  ) : (
                    <p>No accounts imported.</p>
                  )}
                </ItemsColumn>
              </UI.AccordionContent>
            </Accordion.Item>
          </Styles.FlexColumn>
        </Accordion.Root>
      </UI.AccordionWrapper>
    </section>
  );
};
