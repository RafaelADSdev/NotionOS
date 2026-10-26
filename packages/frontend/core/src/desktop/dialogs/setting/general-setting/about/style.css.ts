import { cssVar } from '@toeverything/theme';
import { globalStyle, style } from '@vanilla-extract/css';
export const checkUpdateDesc = style({
  color: cssVar('textSecondaryColor'),
  fontSize: cssVar('fontXs'),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  selectors: {
    '&.active': {
      color: cssVar('textEmphasisColor'),
    },
    '&.error': {
      color: cssVar('errorColor'),
    },
  },
});
globalStyle(`${checkUpdateDesc} svg`, {
  marginRight: '4px',
});
export const appImageRow = style({
  flexDirection: 'row-reverse',
  selectors: {
    '&.two-col': {
      justifyContent: 'flex-end',
    },
  },
});
globalStyle(`${appImageRow} .right-col`, {
  paddingLeft: '0',
  paddingRight: '20px',
});
export const snapshotImportExportRow = style({
  marginTop: '12px',
});
