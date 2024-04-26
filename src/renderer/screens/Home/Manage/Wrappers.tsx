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
`;

export const BreadcrumbsWrapper = styled.div`
  color: var(--text-color-primary);
  background-color: var(--background-default);
  border-bottom: 1px solid #262626;
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
  cursor: pointer;

  .flex {
    padding: 0.25rem 0.5rem;
    transition: background-color 0.15s ease-in-out;
    border-bottom: 1px solid var(--border-secondary-color);

    &:hover {
      background-color: #141414;
    }
    > div {
      display: flex;
      flex-direction: row;
      align-items: center;
      column-gap: 1rem;
      padding: 0.5rem;
    }

    .left {
      display: flex;
      justify-content: flex-start;
      flex: 1;
    }
    .right {
      display: flex;
      justify-content: flex-end;
    }
  }

  h5 {
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
  border: 1px solid var(--border-primary-color);
  width: 100%;
  position: relative;
  border-radius: 1.25rem;
  padding: 0.6rem 1.25rem;
  margin: 1rem 0;

  /* One-shot icon */
  .one-shot-wrapper {
    cursor: pointer;
    background-color: var(--background-default);
    margin-left: 1rem;

    .enabled {
      padding: 0.5rem;
      transition: opacity 0.1s ease-in-out;
      &:hover {
        opacity: 0.6;
      }
    }
    .processing {
      padding: 0.5rem;
    }
    .disabled {
      padding: 0.5rem;
      cursor: default;
      opacity: 0.4;
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
