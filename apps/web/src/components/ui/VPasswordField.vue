<script lang="ts">
export default {
	inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { computed } from "vue";
import { LockOpenOutline } from "@vicons/ionicons5";

const props = defineProps<{
	modelValue?: string;
	label?: string;
	error?: boolean;
	errorMessages?: string | string[];
}>();

const emit = defineEmits<{
	"update:modelValue": [value: string];
}>();

const errorMessage = computed(() => {
	if (!props.errorMessages) return undefined;
	if (Array.isArray(props.errorMessages)) {
		return props.errorMessages[0];
	}
	return props.errorMessages;
});
</script>

<template>
  <n-form-item
    :label="label"
    :validation-status="error ? 'error' : undefined"
    :feedback="errorMessage"
    :show-feedback="!!errorMessage"
    style="margin-bottom: 20px;"
  >
    <n-input
      type="password"
      show-password-on="click"
      :value="modelValue"
      @update:value="emit('update:modelValue', $event)"
      v-bind="$attrs"
      size="large"
    >
      <template #prefix>
        <n-icon size="18" style="opacity: 0.5; margin-right: 6px;"><LockOpenOutline /></n-icon>
      </template>
    </n-input>
  </n-form-item>
</template>