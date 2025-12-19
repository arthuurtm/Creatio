/**
 * @typedef {object} BaseButtonProps
 * @property {'button' | 'submit' | 'reset'} [type='button'] - O tipo nativo do botão.
 * @property {boolean} [disabled] - Desativa o botão.
 * @property {boolean} [loading] - Mostra o estado de carregamento.
 * @property {string} [icon] - Nome do Material Icon.
 * @property {object} [img] - Objeto para a tag <img>.
 * @property {string} [text] - Texto a ser exibido.
 * @property {string|string[]|object} [classes] - Classes customizadas.
 */

export const baseButtonProps = /**@type {import('vue').ComponentPropsOptions<BaseButtonProps>}*/ {
  type: { type: String, default: 'button' },
  disabled: Boolean,
  loading: Boolean,
  icon: String,
  img: Object,
  text: String,
  label: String,
  classes: [String, Array, Object],
}

/**
 * @typedef {object} BaseButtonEmits
 * @property {(e: 'click', event: MouseEvent) => void} click - Evento disparado no clique.
 * @property {(e: 'click', event: MouseEvent) => void} emitEvent - Evento dispadado ao terminar uma ação (legado)
 */

/** @type {BaseButtonEmits} */
export const baseButtonEmits = ['click', 'emitEvent']
