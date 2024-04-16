// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { motion } from 'framer-motion';
import styled from 'styled-components';

interface PermissionCheckBoxProps {
  disabled: boolean;
}

export const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  height: 100%;
  max-height: 100%;
  overflow: hidden;
  overflow-y: scroll;
  width: 105%;
  padding-right: 5%;
`;

export const BreadcrumbsWrapper = styled.div`
  color: var(--text-color-primary);
  background-color: rgba(57, 52, 58, 0.4);
  padding: 0.75rem 1.75rem;
  font-size: 0.92rem;
  font-weight: 500;
  line-height: 1.02rem;

  ul {
    margin: 4px 0;
    padding: 0;
    list-style: none;
    display: flex;
    align-items: center;
    column-gap: 8px;

    li {
      opacity: 0.6;

      &:first-child > button {
        margin-left: -0.5rem;
        font-weight: 500;
        position: 'relative';
      }

      &:last-child {
        color: var(--text-color-primary);
        opacity: 1;
      }
    }
  }
`;

export const HeadingWrapper = styled.div`
  position: sticky;
  width: 100%;
  top: 0rem;
  padding: 0.5rem 1rem;
  z-index: 3;
  opacity: 0.75;
  user-select: none;

  > div > h5 {
    display: flex;
    align-items: center;
    margin: 0.1rem 0;
    padding: 1rem;

    cursor: pointer;
    background-color: #181818;
    border-radius: 1rem;
    transition: background-color 0.15s ease-in-out;

    &:hover {
      background-color: #141414;
    }
    > span {
      margin-left: 1rem;
      color: var(--text-color-primary);
    }
    .icon {
      fill: var(--text-color-primary);
      width: 0.95rem;
      height: 0.95rem;
      margin-right: 0.5rem;
    }
  }
`;

export const AccountsWrapper = styled.div`
  --item-height: 2.75rem;
  width: 100%;
  margin-top: 1.25rem;
  margin-bottom: 2rem;
  padding: 0 0.5rem;
`;

export const PermissionCheckBox = styled.div<PermissionCheckBoxProps>`
  /* Checkbox */
  .checkbox-wrapper-29 {
    --size: 1.4rem;
    --background: var(--background-color-secondary);
    font-size: var(--size);
  }
  .checkbox-wrapper-29 *,
  .checkbox-wrapper-29 *::after,
  .checkbox-wrapper-29 *::before {
    box-sizing: border-box;
  }
  .checkbox-wrapper-29 input[type='checkbox'] {
    visibility: hidden;
    display: none;
  }
  .checkbox-wrapper-29 .checkbox__label {
    width: var(--size);
  }
  .checkbox-wrapper-29 .checkbox__label:before {
    content: ' ';
    display: block;
    height: var(--size);
    width: var(--size);
    position: absolute;
    top: calc(var(--size) * 0.125);
    left: 0;
    background: var(--background);
  }
  .checkbox-wrapper-29 .checkbox__label:after {
    content: ' ';
    display: block;
    height: var(--size);
    width: var(--size);
    border: calc(var(--size) * 0.1) solid
      ${(props: PermissionCheckBoxProps) =>
        props.disabled ? '#4a4a4a' : 'var(--text-color-secondary)'};
    border-radius: 2px;
    transition: 200ms;
    position: absolute;
    top: calc(var(--size) * 0.125);
    left: 0;
    background: var(--background);
  }
  .checkbox-wrapper-29 .checkbox__label:after {
    transition: 100ms ease-in-out;
  }
  .checkbox-wrapper-29 .checkbox__input:checked ~ .checkbox__label:after {
    border-top-style: none;
    border-right-style: none;
    -ms-transform: rotate(-45deg); /* IE9 */
    transform: rotate(-45deg);
    height: calc(var(--size) * 0.5);
    border-color: green;
    border-width: 2px;
  }
  .checkbox-wrapper-29 .checkbox {
    position: relative;
    display: flex;
    cursor: pointer;
    /* Mobile Safari: */
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }
  .checkbox-wrapper-29 .checkbox__label:after:hover,
  .checkbox-wrapper-29 .checkbox__label:after:active {
    border-color: green;
  }
  .checkbox-wrapper-29 .checkbox__label {
    margin-right: calc(var(--size) * 0.47);
  }
  .checkbox-wrapper-29 .checkbox__title {
    color: ${(props: PermissionCheckBoxProps) =>
      props.disabled ? '#4a4a4a' : 'var(--background)'};
    font-size: 1.12rem;
    margin-top: 2px;
  }
`;

export const AccountWrapper = styled(motion.div)`
  background: var(--background-default);
  width: 100%;
  position: relative;
  margin-bottom: 0.5rem;
  border-radius: 1.25rem;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.5rem;

  /* 3 Dot Spinner */
  .lds-ellipsis {
    /* change color here */
    color: #afafaf;
  }
  .lds-ellipsis,
  .lds-ellipsis div {
    box-sizing: border-box;
  }
  .lds-ellipsis {
    margin-left: 8px;
    top: 12px;
    display: inline-block;
    position: relative;
  }
  .lds-ellipsis div {
    position: absolute;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
    animation-timing-function: cubic-bezier(0, 1, 1, 0);
  }
  .lds-ellipsis div:nth-child(1) {
    left: 4px;
    animation: lds-ellipsis1 0.6s infinite;
  }
  .lds-ellipsis div:nth-child(2) {
    left: 4px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  .lds-ellipsis div:nth-child(3) {
    left: 16px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  .lds-ellipsis div:nth-child(4) {
    left: 28px;
    animation: lds-ellipsis3 0.6s infinite;
  }
  @keyframes lds-ellipsis1 {
    0% {
      transform: scale(0);
    }
    100% {
      transform: scale(1);
    }
  }
  @keyframes lds-ellipsis3 {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(0);
    }
  }
  @keyframes lds-ellipsis2 {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(12px, 0);
    }
  }

  > button {
    z-index: 2;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  > .inner {
    display: flex;
    width: 100%;
    max-width: 100%;
    align-items: center;

    > div {
      display: flex;
      position: relative;
      flex: 1;
      align-items: center;
      column-gap: 1.5rem;

      &:first-child {
        overflow: hidden;

        .icon {
          height: var(--item-height);
          position: relative;
          top: 0rem;
          display: flex;
          align-items: center;

          &.permission {
            top: 0.15rem;
          }
        }

        span > .chain-icon {
          height: var(--item-height);
          width: 22px;
          fill: rgb(160, 37, 90);
          margin-right: 4px;
        }

        .content {
          height: var(--item-height);
          flex: 1;
          position: relative;
          margin-left: 0.75rem;

          h3 {
            &.permission {
              top: 0.8rem;
            }
            position: absolute;
            top: 0.55rem;
            left: 0;
            width: 100%;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            margin: 0;
            font-size: 1rem;
          }
        }
      }
      &:last-child {
        height: var(--item-height);
        position: relative;
        top: 0.15rem;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-bottom: 0.25rem;
        flex-shrink: 0;

        &.permission {
          top: 0.3rem;
        }

        /* Scale the Switch component */
        label {
          scale: 0.9;
        }
      }
    }
  }
`;
