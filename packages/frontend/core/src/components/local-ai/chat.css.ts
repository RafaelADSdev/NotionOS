import { globalStyle, style } from '@vanilla-extract/css';

export const root = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  minHeight: 0,
  color: 'var(--affine-text-primary-color)',
  containerType: 'inline-size',
});
export const toolbar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  width: '100%',
  minHeight: 44,
  padding: '4px 8px',
  borderBottom: '0.5px solid var(--affine-border-color)',
});
export const tools = style({ display: 'flex', alignItems: 'center', gap: 4 });
export const quietButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  minHeight: 28,
  padding: '4px 8px',
  border: 0,
  borderRadius: 6,
  background: 'transparent',
  color: 'var(--affine-text-secondary-color)',
  cursor: 'pointer',
  font: 'inherit',
  fontSize: 13,
  ':hover': { background: 'var(--affine-hover-color)' },
  ':disabled': { opacity: 0.45, cursor: 'default' },
  ':focus-visible': {
    outline: '2px solid var(--affine-primary-color)',
    outlineOffset: 2,
  },
});
export const newChat = style([
  quietButton,
  {
    color: 'var(--affine-text-primary-color)',
    background: 'var(--affine-background-secondary-color)',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
]);
export const iconButton = style([
  quietButton,
  { width: 36, height: 36, padding: 8, flexShrink: 0 },
]);
globalStyle(`${iconButton} svg`, { width: 20, height: 20 });
export const body = style({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
  width: '100%',
  overflowY: 'auto',
});
export const column = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: 800,
  margin: '0 auto',
  padding: '16px 24px',
  minHeight: 0,
  flex: 1,
  '@container': { '(max-width: 540px)': { padding: '12px' } },
});
export const emptyColumn = style([
  column,
  {
    justifyContent: 'center',
    flex: '1 0 auto',
    paddingBottom: 64,
    '@container': { '(max-width: 540px)': { paddingBottom: 24 } },
  },
]);
export const greeting = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 28,
  marginBottom: 8,
});
export const greetingIcon = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: 44,
  height: 44,
  borderRadius: 8,
  color: 'var(--affine-primary-color)',
  border: '0.5px solid var(--affine-border-color)',
  boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
  background: 'var(--affine-background-primary-color)',
});
globalStyle(`${greetingIcon} svg`, { width: 28, height: 28 });
export const heading = style({
  margin: 0,
  fontSize: 18,
  lineHeight: '26px',
  fontWeight: 600,
  textAlign: 'center',
});
export const transcript = style({
  flex: 1,
  overflowY: 'auto',
  minHeight: 100,
  paddingBottom: 24,
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  scrollbarWidth: 'thin',
  scrollbarColor: 'var(--affine-border-color) transparent',
});
export const message = style({
  padding: '4px 0',
  overflowWrap: 'anywhere',
  lineHeight: 1.7,
  fontSize: 14,
});
export const userMessage = style([
  message,
  {
    alignSelf: 'flex-end',
    maxWidth: '92%',
    padding: '10px 14px',
    borderRadius: 12,
    background: 'var(--affine-background-secondary-color)',
  },
]);
export const content = style({ whiteSpace: 'pre-wrap', margin: '8px 0' });
export const composer = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  width: '100%',
  padding: 12,
  minHeight: 94,
  borderRadius: 16,
  border: '0.5px solid var(--affine-border-color)',
  background:
    'var(--affine-v2-input-background, var(--affine-background-primary-color))',
  boxShadow: '0 2px 3px rgba(0,0,0,0.05)',
  ':focus-within': { borderColor: 'var(--affine-primary-color)' },
});
export const textarea = style({
  width: '100%',
  minHeight: 36,
  maxHeight: 180,
  resize: 'none',
  padding: 0,
  border: 0,
  borderRadius: 0,
  background: 'transparent',
  color: 'var(--affine-text-primary-color)',
  font: 'inherit',
  fontSize: 14,
  lineHeight: '22px',
  outline: 'none',
  '::placeholder': { color: 'var(--affine-text-secondary-color)' },
});
export const composerTools = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
});
export const model = style([
  quietButton,
  {
    maxWidth: 'min(240px, 55cqw)',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    justifyContent: 'flex-start',
  },
]);
globalStyle(`${model} svg`, { width: 16, height: 16, flexShrink: 0 });
export const send = style([
  iconButton,
  {
    borderRadius: '50%',
    width: 30,
    height: 30,
    minHeight: 30,
    padding: 5,
    color: 'var(--affine-background-primary-color)',
    background: 'var(--affine-primary-color)',
    ':disabled': { opacity: 0.4 },
    ':hover': { background: 'var(--affine-primary-color)' },
  },
]);
export const footnote = style({
  margin: '10px 0 0',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 12,
  lineHeight: '18px',
  color: 'var(--affine-text-secondary-color)',
});
globalStyle(`${footnote} svg`, { width: 14, height: 14, flexShrink: 0 });
export const hint = style({
  margin: '8px 0 0',
  fontSize: 12,
  lineHeight: '18px',
  color: 'var(--affine-text-secondary-color)',
});
export const menuAnchor = style({ position: 'relative' });
export const menu = style({
  position: 'absolute',
  zIndex: 10,
  bottom: 'calc(100% + 8px)',
  left: 0,
  width: 'min(300px, 78cqw)',
  maxHeight: 360,
  overflowY: 'auto',
  padding: 8,
  borderRadius: 8,
  border: '1px solid var(--affine-border-color)',
  boxShadow: 'var(--affine-shadow-2)',
  background:
    'var(--affine-background-overlay-panel-color, var(--affine-background-primary-color))',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});
export const menuItem = style([
  quietButton,
  {
    justifyContent: 'flex-start',
    textAlign: 'left',
    width: '100%',
    minHeight: 36,
  },
]);
export const chips = style({ display: 'flex', flexWrap: 'wrap', gap: 4 });
globalStyle(`${chips}:empty`, { display: 'none' });
export const contextButton = style([
  iconButton,
  { width: 28, height: 28, minHeight: 28, padding: 4 },
]);
export const chip = style([
  quietButton,
  {
    background: 'var(--affine-background-secondary-color)',
    maxWidth: '100%',
    overflowWrap: 'anywhere',
  },
]);
export const hiddenInput = style({ display: 'none' });
export const appPreview = style({
  width: '100%',
  height: '60vh',
  border: '1px solid var(--affine-border-color)',
  borderRadius: 8,
  background: 'white',
});
export const historyContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  width: 'min(300px, calc(100vw - 32px))',
});
globalStyle(`${root} *`, { boxSizing: 'border-box' });
globalStyle(`${root} ::selection`, {
  background: 'var(--affine-primary-color)',
  color: 'var(--affine-background-primary-color)',
});
