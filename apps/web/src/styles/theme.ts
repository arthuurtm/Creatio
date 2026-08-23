/**
 * Naive UI theme — portado do tema CSS custom (base.css / e-buttons / e-inputs / e-toast).
 *
 * Escopo: apenas a variante "sólida" do tema original. Os tokens de
 * `:root[data-modifier='glass']` (gradientes translúcidos, blur, saturate)
 * foram ignorados de propósito — se um tema glass for necessário no futuro,
 * ele deve viver em um arquivo separado (ex.: `theme.glass.ts`), já que o
 * GlobalThemeOverrides do Naive UI trabalha com cores sólidas, não com
 * backdrop-filter.
 *
 * Mapeamento de origem:
 *  --primary / --primary-hover / --primary-back  -> common.primaryColor*
 *  --accent                                       -> common.successColor*
 *  --danger / --danger-hover                      -> common.errorColor*
 *  toast info / toast warning                      -> common.infoColor* / warningColor*
 *  --text-color / --secondary                     -> common.textColor*
 *  --background-color / --background-alt          -> common.bodyColor / cardColor / modalColor / popoverColor
 *  --border-color                                  -> common.borderColor / dividerColor
 *  --form-field-text-hover (#1778fb, fixo nos dois temas) -> borderFocus / caretColor do Input
 *  --primary-shadow                                -> common.boxShadow1/2/3
 *  raio 24px (botões) / 30px (inputs, pill)        -> borderRadius por tamanho, em Button/Input
 *
 * Onde o CSS original não define um equivalente direto (dividerColor,
 * estados de ícone, disabled etc.) foram usados valores neutros derivados
 * dos tokens existentes (--text-color / --border-color com alpha), seguindo
 * a mesma convenção que o próprio Naive UI usa internamente.
 *
 * Uso:
 *   import { NConfigProvider, darkTheme } from 'naive-ui'
 *   import { lightThemeOverrides, darkThemeOverrides } from './theme'
 *
 *   <n-config-provider
 *     :theme="isDark ? darkTheme : null"
 *     :theme-overrides="isDark ? darkThemeOverrides : lightThemeOverrides"
 *   >
 */

import type { GlobalThemeOverrides } from 'naive-ui'

// Azul fixo usado em foco/links em ambos os temas (--form-field-text-hover)
const FOCUS_ACCENT = '#1778fb'

// ---------- Tema claro ----------
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
    textColorBase: '#000000',
    textColor1: '#000000',
    textColor2: 'rgba(0, 0, 0, 0.82)',
    textColor3: '#7e7e7e',
    textColorDisabled: 'rgba(0, 0, 0, 0.38)',
    placeholderColor: '#7e7e7e',
    placeholderColorDisabled: 'rgba(0, 0, 0, 0.24)',
    iconColor: 'rgba(0, 0, 0, 0.4)',
    iconColorHover: 'rgba(0, 0, 0, 0.55)',
    iconColorPressed: 'rgba(0, 0, 0, 0.7)',
    iconColorDisabled: 'rgba(0, 0, 0, 0.2)',

    bodyColor: '#ffffff',
    cardColor: '#fafafa',
    modalColor: '#fafafa',
    popoverColor: '#fafafa',
    tableColor: '#ffffff',
    tableColorHover: 'rgba(11, 106, 144, 0.05)',
    hoverColor: 'rgba(11, 106, 144, 0.07)',
    tagColor: '#fafafa',
    inputColor: '#e9ecef',
    inputColorDisabled: 'rgba(233, 236, 239, 0.5)',
    actionColor: '#fafafa',
    closeColorHover: 'rgba(0, 0, 0, 0.09)',
    closeColorPressed: 'rgba(0, 0, 0, 0.13)',

    buttonColor2: 'rgba(126, 126, 126, 0.12)',
    buttonColor2Hover: 'rgba(117, 117, 117, 0.18)',
    buttonColor2Pressed: 'rgba(117, 117, 117, 0.24)',

    borderColor: '#a8a8a8',
    dividerColor: 'rgba(168, 168, 168, 0.35)',

    scrollbarColor: 'rgba(168, 168, 168, 0.4)',
    scrollbarColorHover: 'rgba(168, 168, 168, 0.65)',

    railColor: '#313033',

    borderRadius: '10px',
    borderRadiusSmall: '6px',

    fontWeightStrong: '600',

    boxShadow1:
      '0 1px 2px -1px rgba(213, 220, 227, 0.35), 0 3px 6px 0 rgba(213, 220, 227, 0.25)',
    boxShadow2:
      '0 3px 6px -3px rgba(213, 220, 227, 0.4), 0 6px 16px 0 rgba(213, 220, 227, 0.28)',
    boxShadow3:
      '0 6px 16px -8px rgba(213, 220, 227, 0.45), 0 9px 28px 0 rgba(213, 220, 227, 0.3)',
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
    borderRadius: '30px', // <-- Aumentado para 30px (Pill round)
    heightMedium: '45px',
    color: 'transparent',
    colorFocus: 'transparent',
    border: '1px solid #a8a8a8',
    borderHover: '1px solid #a8a8a8',
    borderFocus: `1px solid ${FOCUS_ACCENT}`,
    borderDisabled: '1px solid #a8a8a8',
    boxShadowFocus: `0 0 0 2px rgba(23, 120, 251, 0.15)`,
    caretColor: FOCUS_ACCENT,
  },

  Select: {
    peers: {
      InternalSelection: {
        heightMedium: '45px',
        borderRadius: '30px', // Acompanha o Input padrão
      },
      InternalSelectMenu: {
        optionHeightMedium: '42px', // Opções mais altas
        optionFontSizeMedium: '16px', // Fonte maior
        borderRadius: '14px', // Borda da caixa do menu
      },
    },
  },

  Dropdown: {
    optionHeightMedium: '42px', // Aumenta a área de clique
    fontSizeMedium: '16px', // Aumenta a fonte
    padding: '6px', // Espaçamento interno do dropdown
    borderRadius: '14px',
  },

  Switch: {
    railColor: '#313033',
    railColorActive: '#205fdc44',
    buttonColor: '#aeaaae',
  },

  Card: {
    borderRadius: '14px',
    color: '#fafafa',
  },

  Modal: {
    borderRadius: '14px',
    color: '#fafafa',
  },

  Popover: {
    borderRadius: '10px',
    color: '#fafafa',
  },

  Scrollbar: {
    color: 'rgba(168, 168, 168, 0.4)',
    colorHover: 'rgba(168, 168, 168, 0.65)',
  },
}

// ---------- Tema escuro ----------
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
    textColor2: 'rgba(242, 242, 242, 0.82)',
    textColor3: '#7e7e7e',
    textColorDisabled: 'rgba(242, 242, 242, 0.38)',
    placeholderColor: '#7e7e7e',
    placeholderColorDisabled: 'rgba(242, 242, 242, 0.24)',
    iconColor: 'rgba(242, 242, 242, 0.45)',
    iconColorHover: 'rgba(242, 242, 242, 0.6)',
    iconColorPressed: 'rgba(242, 242, 242, 0.75)',
    iconColorDisabled: 'rgba(242, 242, 242, 0.22)',

    bodyColor: '#0e0e0e',
    cardColor: '#0d0d0d',
    modalColor: '#0d0d0d',
    popoverColor: '#0d0d0d',
    tableColor: '#0e0e0e',
    tableColorHover: 'rgba(19, 109, 194, 0.08)',
    hoverColor: 'rgba(19, 109, 194, 0.1)',
    tagColor: '#0d0d0d',
    inputColor: '#3a3a3a',
    inputColorDisabled: 'rgba(58, 58, 58, 0.5)',
    actionColor: '#0d0d0d',
    closeColorHover: 'rgba(255, 255, 255, 0.09)',
    closeColorPressed: 'rgba(255, 255, 255, 0.13)',

    buttonColor2: 'rgba(126, 126, 126, 0.16)',
    buttonColor2Hover: 'rgba(153, 153, 153, 0.22)',
    buttonColor2Pressed: 'rgba(153, 153, 153, 0.28)',

    borderColor: '#272727',
    dividerColor: 'rgba(255, 255, 255, 0.08)',

    scrollbarColor: 'rgba(255, 255, 255, 0.2)',
    scrollbarColorHover: 'rgba(255, 255, 255, 0.35)',

    railColor: '#313033',

    borderRadius: '10px',
    borderRadiusSmall: '6px',

    fontWeightStrong: '600',

    boxShadow1: '0 1px 2px -1px rgba(0, 0, 0, 0.45), 0 3px 6px 0 rgba(0, 0, 0, 0.35)',
    boxShadow2: '0 3px 6px -3px rgba(0, 0, 0, 0.5), 0 6px 16px 0 rgba(0, 0, 0, 0.38)',
    boxShadow3: '0 6px 16px -8px rgba(0, 0, 0, 0.55), 0 9px 28px 0 rgba(0, 0, 0, 0.4)',
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
    borderRadius: '30px', // <-- Aumentado para 30px (Pill round)
    heightMedium: '45px',
    color: 'transparent',
    colorFocus: 'transparent',
    border: '1px solid #121212',
    borderHover: '1px solid #121212',
    borderFocus: `1px solid ${FOCUS_ACCENT}`,
    borderDisabled: '1px solid #121212',
    boxShadowFocus: `0 0 0 2px rgba(23, 120, 251, 0.25)`,
    caretColor: FOCUS_ACCENT,
  },

  Select: {
    peers: {
      InternalSelection: {
        heightMedium: '45px',
        borderRadius: '30px', // Acompanha o Input padrão
      },
      InternalSelectMenu: {
        optionHeightMedium: '42px', // Opções mais altas
        optionFontSizeMedium: '16px', // Fonte maior
        borderRadius: '14px', // Borda da caixa do menu
      },
    },
  },

  Dropdown: {
    optionHeightMedium: '42px', // Aumenta a área de clique
    fontSizeMedium: '16px', // Aumenta a fonte
    padding: '6px', // Espaçamento interno do dropdown
    borderRadius: '14px',
  },

  Card: {
    borderRadius: '14px',
    color: '#0d0d0d',
  },

  Modal: {
    borderRadius: '14px',
    color: '#0d0d0d',
  },

  Popover: {
    borderRadius: '10px',
    color: '#0d0d0d',
  },

  Scrollbar: {
    color: 'rgba(255, 255, 255, 0.2)',
    colorHover: 'rgba(255, 255, 255, 0.35)',
  },
}
