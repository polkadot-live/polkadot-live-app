import type { AnyFunction } from '@/types/misc';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface SortControlsButtonProps {
  isActive: boolean;
  isDisabled: boolean;
  onLabel?: string;
  offLabel?: string;
  fixedWidth?: boolean;
  onClick?: AnyFunction;
  faIcon?: IconDefinition;
}

export interface SortControlLabelProps {
  label: string;
  faIcon?: IconDefinition;
  noBorder?: boolean;
}
