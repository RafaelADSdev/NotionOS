import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const root = style({
  display: 'flex',
  gap: 4,
  padding: 4,
  border: `1px solid ${cssVarV2.layer.insideBorder.border}`,
  borderRadius: 10,
  background: cssVarV2.layer.background.secondary,
});

export const option = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 7,
  flex: 1,
  minHeight: 36,
  padding: '6px 10px',
  border: 0,
  borderRadius: 7,
  font: 'inherit',
  fontSize: 13,
  fontWeight: 500,
  color: cssVarV2.text.secondary,
  background: 'transparent',
  cursor: 'pointer',
  ':hover': { background: cssVarV2.layer.background.hoverOverlay },
  ':focus-visible': {
    outline: `2px solid ${cssVarV2.text.emphasis}`,
    outlineOffset: 2,
  },
  selectors: {
    '&[aria-pressed="true"]': {
      background: 'var(--nexo-active-background)',
      color: 'var(--nexo-active-foreground)',
    },
  },
});
