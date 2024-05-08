// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { setStateWithRef } from '@w3ux/utils';
import { useOutsideAlerter } from '@app/library/Hooks/useOutsideAlerter';
import { useRef, useState } from 'react';
import { MenuWrapper, Separator } from './Wrapper';

export const Menu = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const menuOpenRef = useRef(menuOpen);

  const toggleMenu = (val: boolean) => {
    setStateWithRef(val, setMenuOpen, menuOpenRef);
  };

  const alerterRf = useRef(null);

  useOutsideAlerter(
    alerterRf,
    () => {
      toggleMenu(!menuOpenRef.current);
    },
    ['dropdown-toggle']
  );

  return (
    <>
      {menuOpenRef.current ? (
        <button type="button" onClick={() => toggleMenu(false)}>
          <FontAwesomeIcon icon={faCog} transform="grow-1" />
        </button>
      ) : null}
      {!menuOpenRef.current ? (
        <button type="button" onClick={() => toggleMenu(true)}>
          <FontAwesomeIcon icon={faCog} transform="grow-1" />
        </button>
      ) : null}
      {menuOpen ? (
        <MenuWrapper ref={alerterRf}>
          <button
            type="button"
            onClick={() => {
              window.myAPI.openWindow('import');
              toggleMenu(false);
            }}
          >
            Manage Accounts
          </button>
          <button
            type="button"
            onClick={() => {
              window.myAPI.openWindow('settings');
              toggleMenu(false);
            }}
          >
            Settings
          </button>
          <button
            type="button"
            disabled
            onClick={() => {
              console.log('TODO: Open import data.');
            }}
          >
            Import Data
          </button>
          <button
            type="button"
            disabled
            onClick={() => {
              console.log('TODO: Open export data.');
            }}
          >
            Export Data
          </button>
          <Separator />
          <button
            type="button"
            onClick={async () => await window.myAPI.quitApp()}
            className="separator"
          >
            Exit
          </button>
        </MenuWrapper>
      ) : null}
    </>
  );
};
