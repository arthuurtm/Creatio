import type { GlobalThemeOverrides } from 'naive-ui'

const FOCUS_ACCENT = '#1778fb'

export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#0b6a90',
    primaryColorHover: '#3375f8',
    primaryColorPressed: '#06394e',
    primaryColorSuppl: '#3375f8',

    infoColor: '#2980b9',
    infoColorHover: '#409ad5',
    infoColorPressed: '#216494',
    infoColorSuppl: '#409ad5',

    successColor: '#31a526',
    successColorHover: '#3dce30',
    successColorPressed: '#206b19',
    successColorSuppl: '#3dce30',

    warningColor: '#ffad29',
    warningColorHover: '#ffbd52',
    warningColorPressed: '#cc8800',
    warningColorSuppl: '#ffbd52',

    errorColor: '#bb2a2a',
    errorColorHover: '#d54343',
    errorColorPressed: '#781b1b',
    errorColorSuppl: '#d54343',

    baseColor: '#ffffff',

    textColorBase: '#111111',
    textColor1: '#111111',
    textColor2: 'rgba(17, 17, 17, 0.82)',
    textColor3: '#666666',
    textColorDisabled: 'rgba(17, 17, 17, 0.38)',

    placeholderColor: '#707070',
    placeholderColorDisabled: 'rgba(17, 17, 17, 0.24)',

    iconColor: 'rgba(17, 17, 17, 0.48)',
    iconColorHover: 'rgba(17, 17, 17, 0.65)',
    iconColorPressed: 'rgba(17, 17, 17, 0.8)',
    iconColorDisabled: 'rgba(17, 17, 17, 0.25)',

    bodyColor: '#f7f8fa',

    cardColor: '#ffffff',
    modalColor: '#ffffff',
    popoverColor: '#ffffff',

    tableColor: '#ffffff',

    tableColorHover: 'rgba(11, 106, 144, 0.055)',
    hoverColor: 'rgba(11, 106, 144, 0.075)',

    tagColor: '#f7f8fa',

    inputColor: '#f0f2f4',
    inputColorDisabled: 'rgba(240, 242, 244, 0.65)',

    actionColor: '#ffffff',

    closeColorHover: 'rgba(0, 0, 0, 0.09)',
    closeColorPressed: 'rgba(0, 0, 0, 0.14)',

    buttonColor2: 'rgba(90, 90, 90, 0.10)',
    buttonColor2Hover: 'rgba(90, 90, 90, 0.16)',
    buttonColor2Pressed: 'rgba(90, 90, 90, 0.22)',

    borderColor: '#9ca3aa',

    dividerColor: 'rgba(70, 75, 80, 0.22)',

    scrollbarColor: 'rgba(90, 95, 100, 0.38)',
    scrollbarColorHover: 'rgba(70, 75, 80, 0.58)',

    railColor: '#313033',

    borderRadius: '10px',
    borderRadiusSmall: '6px',

    fontWeightStrong: '600',

    boxShadow1:
      '0 1px 2px -1px rgba(30, 40, 50, 0.10), 0 2px 5px rgba(30, 40, 50, 0.06)',

    boxShadow2:
      '0 2px 5px -2px rgba(30, 40, 50, 0.12), 0 6px 16px rgba(30, 40, 50, 0.09)',

    boxShadow3:
      '0 6px 16px -8px rgba(30, 40, 50, 0.16), 0 10px 28px rgba(30, 40, 50, 0.11)',
  },

  Button: {
    fontWeight: '600',

    borderRadiusTiny: '11px',
    borderRadiusSmall: '14px',
    borderRadiusMedium: '17px',
    borderRadiusLarge: '20px',

    textColorPrimary: '#ffffff',
    textColorHoverPrimary: '#ffffff',
    textColorPressedPrimary: '#ffffff',
    textColorFocusPrimary: '#ffffff',
  },

  Input: {
    borderRadius: '30px',
    heightMedium: '45px',

    color: '#f0f2f4',
    colorFocus: '#ffffff',

    border: '1px solid #9ca3aa',
    borderHover: '1px solid #737b83',
    borderFocus: `1px solid ${FOCUS_ACCENT}`,
    borderDisabled: '1px solid #c4c9ce',

    boxShadowFocus: `0 0 0 2px rgba(23, 120, 251, 0.16)`,

    caretColor: FOCUS_ACCENT,
  },

  Select: {
    peers: {
      InternalSelection: {
        heightMedium: '45px',
        borderRadius: '30px',

        border: '1px solid #9ca3aa',
        borderHover: '1px solid #737b83',
        borderFocus: `1px solid ${FOCUS_ACCENT}`,
      },

      InternalSelectMenu: {
        optionHeightMedium: '42px',
        optionFontSizeMedium: '16px',
        borderRadius: '14px',
      },
    },
  },

  Dropdown: {
    optionHeightMedium: '42px',
    fontSizeMedium: '16px',
    padding: '6px',
    borderRadius: '14px',
  },

  Switch: {
    railColor: '#777d83',
    railColorActive: '#205fdc66',
    buttonColor: '#ffffff',
  },

  Card: {
    borderRadius: '14px',
    color: '#ffffff',
  },

  Modal: {
    borderRadius: '14px',
    color: '#ffffff',
  },

  Popover: {
    borderRadius: '10px',
    color: '#ffffff',
  },

  Scrollbar: {
    color: 'rgba(90, 95, 100, 0.38)',
    colorHover: 'rgba(70, 75, 80, 0.58)',
  },
}

export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#0d4b85',
    primaryColorHover: '#136dc2',
    primaryColorPressed: '#083157',
    primaryColorSuppl: '#136dc2',

    infoColor: '#216994',
    infoColorHover: '#2c8dc6',
    infoColorPressed: '#153a52',
    infoColorSuppl: '#2c8dc6',

    successColor: '#075500',
    successColorHover: '#0d9c00',
    successColorPressed: '#043600',
    successColorSuppl: '#0d9c00',

    warningColor: '#d6820c',
    warningColorHover: '#f39c22',
    warningColorPressed: '#7d4c09',
    warningColorSuppl: '#f39c22',

    errorColor: '#a20202',
    errorColorHover: '#bb0b0b',
    errorColorPressed: '#7a0202',
    errorColorSuppl: '#bb0b0b',

    baseColor: '#ffffff',

    textColorBase: '#f2f2f2',
    textColor1: '#f2f2f2',
    textColor2: 'rgba(242, 242, 242, 0.84)',
    textColor3: '#9b9b9b',
    textColorDisabled: 'rgba(242, 242, 242, 0.40)',

    placeholderColor: '#929292',
    placeholderColorDisabled: 'rgba(242, 242, 242, 0.25)',

    iconColor: 'rgba(242, 242, 242, 0.50)',
    iconColorHover: 'rgba(242, 242, 242, 0.68)',
    iconColorPressed: 'rgba(242, 242, 242, 0.82)',
    iconColorDisabled: 'rgba(242, 242, 242, 0.25)',

    bodyColor: '#0e0e0e',

    cardColor: '#151619',
    modalColor: '#18191c',
    popoverColor: '#18191c',

    tableColor: '#111214',

    tableColorHover: 'rgba(19, 109, 194, 0.10)',
    hoverColor: 'rgba(19, 109, 194, 0.12)',

    tagColor: '#18191c',

    inputColor: '#1b1d20',
    inputColorDisabled: 'rgba(27, 29, 32, 0.65)',

    actionColor: '#151619',

    closeColorHover: 'rgba(255, 255, 255, 0.10)',
    closeColorPressed: 'rgba(255, 255, 255, 0.15)',

    buttonColor2: 'rgba(255, 255, 255, 0.08)',
    buttonColor2Hover: 'rgba(255, 255, 255, 0.13)',
    buttonColor2Pressed: 'rgba(255, 255, 255, 0.18)',

    borderColor: '#3a3c40',

    dividerColor: 'rgba(255, 255, 255, 0.12)',

    scrollbarColor: 'rgba(255, 255, 255, 0.24)',
    scrollbarColorHover: 'rgba(255, 255, 255, 0.40)',

    railColor: '#313033',

    borderRadius: '10px',
    borderRadiusSmall: '6px',

    fontWeightStrong: '600',

    boxShadow1:
      '0 1px 2px -1px rgba(0, 0, 0, 0.55), 0 3px 6px rgba(0, 0, 0, 0.40)',

    boxShadow2:
      '0 3px 6px -3px rgba(0, 0, 0, 0.60), 0 7px 17px rgba(0, 0, 0, 0.48)',

    boxShadow3:
      '0 6px 16px -8px rgba(0, 0, 0, 0.65), 0 10px 30px rgba(0, 0, 0, 0.52)',
  },

  Button: {
    fontWeight: '600',

    borderRadiusTiny: '11px',
    borderRadiusSmall: '14px',
    borderRadiusMedium: '17px',
    borderRadiusLarge: '20px',

    textColorPrimary: '#ffffff',
    textColorHoverPrimary: '#ffffff',
    textColorPressedPrimary: '#ffffff',
    textColorFocusPrimary: '#ffffff',
  },

  Input: {
    borderRadius: '30px',
    heightMedium: '45px',

    color: '#1b1d20',
    colorFocus: '#202328',

    border: '1px solid #3a3c40',
    borderHover: '1px solid #555960',
    borderFocus: `1px solid ${FOCUS_ACCENT}`,
    borderDisabled: '1px solid #2b2d31',

    boxShadowFocus: `0 0 0 2px rgba(23, 120, 251, 0.28)`,

    caretColor: FOCUS_ACCENT,
  },

  Select: {
    peers: {
      InternalSelection: {
        heightMedium: '45px',
        borderRadius: '30px',

        border: '1px solid #3a3c40',
        borderHover: '1px solid #555960',
        borderFocus: `1px solid ${FOCUS_ACCENT}`,
      },

      InternalSelectMenu: {
        optionHeightMedium: '42px',
        optionFontSizeMedium: '16px',
        borderRadius: '14px',
      },
    },
  },

  Dropdown: {
    optionHeightMedium: '42px',
    fontSizeMedium: '16px',
    padding: '6px',
    borderRadius: '14px',
  },

  Switch: {
    railColor: '#50545a',
    railColorActive: '#136dc288',
    buttonColor: '#e6e6e6',
  },

  Card: {
    borderRadius: '14px',
    color: '#151619',
  },

  Modal: {
    borderRadius: '14px',
    color: '#18191c',
  },

  Popover: {
    borderRadius: '10px',
    color: '#18191c',
  },

  Scrollbar: {
    color: 'rgba(255, 255, 255, 0.24)',
    colorHover: 'rgba(255, 255, 255, 0.40)',
  },
}
