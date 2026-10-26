import { cssVar } from '@toeverything/theme';
import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';
export const menuContent = style({
  backgroundColor: cssVar('backgroundOverlayPanelColor'),
});
export const button = style({
  backgroundColor: cssVarV2.button.primary,
  color: cssVarV2.button.pureWhiteText,
  ':hover': {
    backgroundColor: '#6d28d9',
  },
  ':focus-visible': {
    outline: `2px solid ${cssVarV2.text.emphasis}`,
    outlineOffset: 3,
  },
});
