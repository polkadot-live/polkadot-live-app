// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AnimatePresence, motion } from 'framer-motion';
import { Config as ConfigRenderer } from '@/config/processes/renderer';
import { BodyInterfaceWrapper } from '@app/Wrappers';
import { useAddresses } from '@/renderer/contexts/main/Addresses';
import { useEvents } from '@/renderer/contexts/main/Events';
import { Footer } from '@app/library/Footer';
import { Header } from '@app/library/Header';
import { useEffect, useState } from 'react';
import IconSVG from '@app/svg/polkadotIcon.svg?react';
import { Events } from './Events';
import {
  faBarsStaggered,
  faCubesStacked,
  faDownLeftAndUpRightToCenter,
  faGaugeSimple,
  faUpRightAndDownLeftFromCenter,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Manage } from './Manage';
import { IconWrapper } from './Wrappers';
import { useBootstrapping } from '@app/contexts/main/Bootstrapping';
import { useInitIpcHandlers } from '@app/hooks/useInitIpcHandlers';
import { useMainMessagePorts } from '@/renderer/hooks/useMainMessagePorts';
import { useAppModesSyncing } from '@/renderer/hooks/useAppModesSyncing';
import styled from 'styled-components';
import type { ChainID } from '@/types/chains';
import type { EventCallback } from '@/types/reporter';
import type { IpcRendererEvent } from 'electron';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';

export const Home = () => {
  // Set up port communication for the `main` renderer.
  useMainMessagePorts();
  useAppModesSyncing();

  // Set up app initialization and online/offline switching handlers.
  useInitIpcHandlers();

  const { getAddresses } = useAddresses();
  const { addEvent, markStaleEvent, removeOutdatedEvents } = useEvents();

  // Get app loading flag.
  const { appLoading } = useBootstrapping();
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    // Listen for event callbacks.
    window.myAPI.reportNewEvent(
      (_: IpcRendererEvent, eventData: EventCallback) => {
        // Remove any outdated events in the state, if setting enabled.
        if (!ConfigRenderer.keepOutdatedEvents) {
          removeOutdatedEvents(eventData);
        }

        // Add received event to state.
        addEvent({ ...eventData });
      }
    );

    // Listen for stale events.
    window.myAPI.reportStaleEvent(
      (_: IpcRendererEvent, uid: string, chainId: ChainID) => {
        markStaleEvent(uid, chainId);
      }
    );
  }, []);

  return (
    <>
      <Header showMenu={true} appLoading={appLoading} />
      <div
        style={{
          display: 'flex',
          width: '100%',
          position: 'fixed',
          top: '3rem',
          bottom: '3rem',
          left: 0,
          color: 'rgb(241 245 249)',
        }}
      >
        <SideNav selected={selected} setSelected={setSelected} />

        <BodyInterfaceWrapper $maxHeight>
          {/* Render Events Content */}
          {appLoading && (
            <>
              <IconWrapper>
                <IconSVG width={175} opacity={0.01} />
              </IconWrapper>
              <div className="app-loading">
                <div className="lds-grid">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
                <p>Loading Polkadot Live</p>
              </div>
            </>
          )}
          {!appLoading && selected === 0 && (
            <ScrollWrapper>
              <IconWrapper>
                <IconSVG width={175} opacity={0.02} />
              </IconWrapper>
              <div style={{ padding: '2rem 1rem' }}>
                <h1>Summary</h1>
              </div>
            </ScrollWrapper>
          )}
          {!appLoading && selected === 1 && (
            <ScrollWrapper>
              <IconWrapper>
                <IconSVG width={175} opacity={0.02} />
              </IconWrapper>
              <Events />
            </ScrollWrapper>
          )}
          {/* Render Subscriptions Content */}
          {!appLoading && selected === 2 && (
            <ScrollWrapper>
              <IconWrapper>
                <IconSVG width={175} opacity={0.02} />
              </IconWrapper>
              <div className="container">
                <Manage addresses={getAddresses()} />
              </div>
            </ScrollWrapper>
          )}
        </BodyInterfaceWrapper>
      </div>
      <Footer />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Wrappers                                                           */
/* ------------------------------------------------------------------ */

export const SideNavWrapper = styled.nav<{ $isCollapsed: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-self: stretch;
  max-width: ${(props) => (props.$isCollapsed ? '74px' : '98px')};
  background-color: #1a1919;
  padding: ${(props) => (props.$isCollapsed ? '0' : '0 0.7rem')};
  padding-top: 2rem;
  padding-bottom: 1rem;
  align-items: center;
  gap: 0.75rem;
  overflow-y: auto;
`;

export const NavItemWrapper = styled(motion.button).attrs<{ $size: string }>(
  (props) => ({
    $size: props.$size,
  })
)`
  width: ${(props) => (props.$size === 'fill' ? '90%' : '65%')};
  min-height: ${(props) => (props.$size === 'fill' ? '72px' : '45px')};
  position: relative;
  padding: 0.5rem;
  font-size: 1.25rem;
  line-height: 1.75rem;
  background-color: #313131;
  border: none;
  border-radius: 0.375rem;
  color: #c9c9c9;
  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke, width, height;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
  cursor: pointer;

  &:hover {
    background-color: #3d3d3d;
  }

  .children-container {
    display: block;
    position: relative;
    z-index: 10;

    h2 {
      font-size: 0.95rem;
      font-weight: 600;
      margin-top: 0.5rem;
    }
  }
`;

export const ExpandButtonWrapper = styled(motion.div)`
  position: relative;
  width: 100%;
  min-height: 50px;
  padding: 0.5rem;
  font-size: 1.25rem;
  line-height: 1.75rem;
`;

/* ------------------------------------------------------------------ */
/* Navbar Code                                                        */
/* ------------------------------------------------------------------ */

export const SideNav = ({
  selected,
  setSelected,
}: {
  selected: number;
  setSelected: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    // NOTE: In prod, you'd likely set height to h-screen and fix to the viewport
    <SideNavWrapper $isCollapsed={isCollapsed}>
      <NavItem
        selected={selected === 0}
        id={0}
        setSelected={setSelected}
        isCollapsed={isCollapsed}
        icon={faGaugeSimple}
        label={'Summary'}
      />

      <NavItem
        selected={selected === 1}
        id={1}
        setSelected={setSelected}
        isCollapsed={isCollapsed}
        icon={faBarsStaggered}
        label={'Events'}
      />

      <NavItem
        selected={selected === 2}
        id={2}
        setSelected={setSelected}
        isCollapsed={isCollapsed}
        icon={faCubesStacked}
        label={'Subscribe'}
      />

      <NavItemWrapper
        $size={'half'}
        style={
          isCollapsed
            ? { marginTop: 'auto' }
            : { marginTop: 'auto', maxWidth: '48px' }
        }
        onClick={() => setIsCollapsed((pv) => !pv)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FontAwesomeIcon
          icon={
            isCollapsed
              ? faUpRightAndDownLeftFromCenter
              : faDownLeftAndUpRightToCenter
          }
          transform={'shrink-2'}
        />
      </NavItemWrapper>
    </SideNavWrapper>
  );
};

interface NavItemProps {
  children?: JSX.Element;
  icon?: IconProp;
  label?: string;
  selected: boolean;
  id: number;
  isCollapsed: boolean;
  setSelected: React.Dispatch<React.SetStateAction<number>>;
}

export const NavItem = ({
  children,
  selected,
  id,
  setSelected,
  isCollapsed,
  icon,
  label,
}: NavItemProps) => (
  <NavItemWrapper
    $size={isCollapsed ? 'half' : 'fill'}
    onClick={() => setSelected(id)}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <span className="children-container">
      {children && children}
      {icon && (
        <FontAwesomeIcon
          icon={icon}
          transform={isCollapsed ? 'shrink-1' : 'grow-4'}
          style={{ marginTop: isCollapsed ? '0.5rem' : '0.5rem' }}
        />
      )}
      {!isCollapsed && label && (
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {label}
        </motion.h2>
      )}
    </span>
    <AnimatePresence>
      {selected && (
        <motion.span
          style={{
            position: 'absolute',
            inset: '0px',
            borderRadius: '0.375rem',
            backgroundColor: '#ac2461',
            zIndex: '0',
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        />
      )}
    </AnimatePresence>
  </NavItemWrapper>
);

export const ScrollWrapper = styled.div`
  scrollbar-color: inherit transparent;

  overflow-y: auto;
  overflow-x: hidden;
  position: relative;

  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-track {
    background-color: #101010;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #212121;
  }
`;
