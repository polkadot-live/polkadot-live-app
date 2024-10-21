// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ShiftingMeterWrapper } from './ShiftingMeter.styles';

interface ShiftingMeterProps {
  value: number;
  duration?: number;
  size?: number;
  color?: string;
}

export const ShiftingMeter = ({
  value,
  duration = 700,
  size = 3,
  color = '#f1f1f1',
}: ShiftingMeterProps) => (
  <ShiftingMeterWrapper>
    <div
      className="shifting-wrap"
      style={{
        height: `${size}rem`,
        fontSize: `${size}rem`,
        lineHeight: `${size}rem`,
      }}
    >
      {String(value)
        .split('')
        .map((val, idx) => (
          <div
            className="shifting-digits"
            key={idx}
            style={{
              color,
              marginTop: `calc( -${val}em `,
              transitionProperty: 'all',
              transitionDuration: `${duration}ms`,
              transitionDelay: `${(String(value).split('').length - idx) * 20}ms`,
            }}
          >
            <div data-val="0">0</div>
            <div data-val="1">1</div>
            <div data-val="2">2</div>
            <div data-val="3">3</div>
            <div data-val="4">4</div>
            <div data-val="5">5</div>
            <div data-val="6">6</div>
            <div data-val="7">7</div>
            <div data-val="8">8</div>
            <div data-val="9">9</div>
          </div>
        ))}
    </div>
  </ShiftingMeterWrapper>
);
