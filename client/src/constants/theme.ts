export const COLORS = {
  primary: '#31b372',
  primaryDark: '#155734',
  pageBackground: '#efececa7',
  panelBackground: '#ebe8e8',
  softGreenBackground: '#f6fff9',
  mutedHeader: '#E0E0E0',
  white: '#ffffff',
  text: '#000000',
  mutedText: '#666666',
} as const;

export const TAILWIND_COLORS = {
  'hmis-green': COLORS.primary,
  'hmis-green-dark': COLORS.primaryDark,
  'hmis-page': COLORS.pageBackground,
  'hmis-panel': COLORS.panelBackground,
  'hmis-soft-green': COLORS.softGreenBackground,
  'hmis-muted-header': COLORS.mutedHeader,
} as const;
