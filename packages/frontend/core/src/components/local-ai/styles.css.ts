import { globalStyle, style } from '@vanilla-extract/css';

export const muted = style({
  color: 'var(--affine-text-secondary-color)',
  fontSize: 13,
  lineHeight: 1.6,
});
export const actions = style({ display: 'flex', gap: 8, flexWrap: 'wrap' });
export const form = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
});
export const field = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: 14,
});
export const checkbox = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 13,
});
globalStyle(`${checkbox} input[type="checkbox"]`, {
  appearance: 'auto',
  display: 'inline-block',
  width: 16,
  height: 16,
  flex: '0 0 16px',
  accentColor: 'var(--affine-primary-color)',
});
export const control = style({
  width: '100%',
  minHeight: 36,
  padding: '8px 10px',
  borderRadius: 6,
  color: 'var(--affine-text-primary-color)',
  background: 'var(--affine-background-primary-color)',
  border: '1px solid var(--affine-border-color)',
  font: 'inherit',
  ':focus-visible': {
    outline: '2px solid var(--affine-primary-color)',
    outlineOffset: 2,
  },
});
export const button = style({
  minHeight: 32,
  padding: '6px 10px',
  borderRadius: 6,
  cursor: 'pointer',
  font: 'inherit',
  fontSize: 13,
  border: '1px solid var(--affine-border-color)',
  color: 'var(--affine-text-primary-color)',
  background: 'var(--affine-background-secondary-color)',
  ':hover': { background: 'var(--affine-hover-color)' },
  ':focus-visible': {
    outline: '2px solid var(--affine-primary-color)',
    outlineOffset: 2,
  },
  ':disabled': { cursor: 'default', opacity: 0.5 },
});
export const primary = style([
  button,
  {
    background: 'var(--affine-primary-color)',
    color: 'var(--affine-background-primary-color)',
    ':hover': {
      background: 'var(--affine-primary-color)',
      filter: 'brightness(0.95)',
    },
  },
]);
export const status = style({
  fontSize: 13,
  lineHeight: 1.6,
  overflowWrap: 'anywhere',
});
export const settings = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  maxWidth: 600,
});
globalStyle(`${settings} *`, { boxSizing: 'border-box' });
