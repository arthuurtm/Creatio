/**
 * @typedef {object} BaseInputProps
 * @property {object} modelValue - O objeto (v-model) que o input irá atualizar.
 * @property {string} model - A chave (key) dentro do modelValue que este input controla.
 * @property {'text' | 'password' | 'email' | 'number' | 'textarea'} [type='text'] - O tipo de input.
 * @property {string} [label] - Texto para o <label> flutuante.
 * @property {string} [placeholder] - Texto de placeholder (usado se não houver label).
 * @property {boolean} [disabled] - Desativa o input.
 * @property {boolean} [loading] - Mostra o estado de carregamento.
 * @property {object} [anchor] - Objeto de props para o CLink (ex: { text: 'Esqueci a senha' }).
 * @property {string|string[]|object} [classes] - Classes customizadas.
 */

export const baseInputProps = /**@type {import('vue').ComponentPropsOptions<BaseInputProps>}*/ {
  modelValue: [Object, String],
  type: { type: String, default: 'text' },
  label: String,
  placeholder: String,
  disabled: Boolean,
  loading: Boolean,
  anchor: Object,
  icon: String,
  classes: [String, Array, Object],
  id: String,
}

/**
 * @typedef {object} BaseInputEmits
 * @property {(e: 'update:modelValue', value: object) => void} updateModelValue - Evento para o v-model.
 * @property {(e: 'emitEvent', event: MouseEvent) => void} emitEvent - Evento disparado pelo CLink.
 */

/** @type {BaseInputEmits} */
export const baseInputEmits = ['update:modelValue', 'emitEvent']
