// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import * as Styles from '@polkadot-live/ui/styles';
import { Listing } from '../Addresses';
import { ButtonPrimaryInvert } from '@polkadot-live/ui/kits/buttons';
import { renderToast } from '@polkadot-live/ui/utils';
import { checkAddress } from '@polkadot/util-crypto';
import { decodeAddress, u8aToHex } from 'dedot/utils';
import { ellipsisFn, unescape } from '@w3ux/utils';
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import {
  useAccountStatuses,
  useAddresses,
  useImportHandler,
} from '@ren/contexts/import';
import type { FormEvent } from 'react';
import type { ManageReadOnlyProps } from '../types';

export const Manage = ({ setSection }: ManageReadOnlyProps) => {
  const { isAlreadyImported } = useAddresses();
  const { insertAccountStatus } = useAccountStatuses();
  const { handleImportAddress } = useImportHandler();

  /// Component state.
  const [editName, setEditName] = useState<string>('');

  /// Verify that the address is compatible with the supported networks.
  const validateAddress = (address: string) => {
    for (const prefix of [0, 2, 42]) {
      const result = checkAddress(address, prefix);

      if (result !== null) {
        const [isValid] = result;

        if (isValid) {
          return true;
        }
      }
    }

    return false;
  };

  /// Cancel button clicked for address field.
  const onCancel = () => {
    setEditName('');
  };

  // Input change handler.
  const onChange = (e: FormEvent<HTMLInputElement>) => {
    let val = e.currentTarget.value || '';
    val = unescape(val);
    setEditName(val);
  };

  /// Handle import button click.
  const onImport = async () => {
    const trimmed = editName.trim();
    const isValid = validateAddress(trimmed);

    // Validate address.
    if (!isValid) {
      renderToast('Invalid Address.', `toast-${trimmed}`, 'error');
      return;
    }

    // Check if public key is already imported.
    if (isAlreadyImported(u8aToHex(decodeAddress(trimmed)))) {
      renderToast('Address is already imported.', `toast-${trimmed}`, 'error');
      return;
    }

    // The default account name.
    const accountName = ellipsisFn(trimmed);

    // Reset read-only address input state.
    setEditName('');

    // Add account status entry.
    insertAccountStatus(trimmed, 'read-only');

    // Set processing flag to true if online and import via main renderer.
    await handleImportAddress(trimmed, 'read-only', accountName, true);
  };

  return (
    <Styles.PadWrapper>
      <Styles.FlexColumn $rowGap={'2.5rem'}>
        <section>
          <UI.ActionItem showIcon={false} text={'Read-Only Accounts'} />
          <Styles.FlexColumn>
            {/* Top Controls */}
            <UI.ControlsWrapper
              $padWrapper={true}
              $padBottom={false}
              style={{ padding: '1rem 0 0 0', marginBottom: 0 }}
            >
              <ButtonPrimaryInvert
                className="back-btn"
                text="Back"
                iconLeft={faCaretLeft}
                onClick={() => setSection(0)}
              />
              <UI.SortControlLabel label="Read Only Accounts" />
            </UI.ControlsWrapper>

            {/* Add Read Only Address */}
            <UI.HardwareAddressWrapper
              style={{
                backgroundColor: 'inherit',
                padding: '0 0.25rem',
              }}
            >
              <Styles.FlexRow>
                <div className="identicon">
                  <UI.Identicon value={editName} fontSize={'2.5rem'} />
                </div>
                <Styles.FlexRow style={{ flex: 1 }}>
                  <input
                    className="add-input"
                    type="text"
                    placeholder="Input Address"
                    value={editName}
                    onChange={(e) => onChange(e)}
                  />
                  <button
                    style={{
                      color: 'var(--background-primary)',
                      fontSize: '0.95rem',
                    }}
                    className="btn-mono lg"
                    onPointerDown={async () => await onImport()}
                  >
                    Add
                  </button>
                  <button
                    style={{ fontSize: '0.95rem' }}
                    className="btn-mono-invert lg"
                    onPointerDown={() => onCancel()}
                  >
                    Clear
                  </button>
                </Styles.FlexRow>
              </Styles.FlexRow>
            </UI.HardwareAddressWrapper>
          </Styles.FlexColumn>
        </section>

        {/* Address Listing */}
        <Listing source={'read-only'} setSection={setSection} />
      </Styles.FlexColumn>
    </Styles.PadWrapper>
  );
};
