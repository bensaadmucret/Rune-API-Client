<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAppStore } from '../../stores/app';
import type { EnvironmentVariable } from '../../types';

const { t } = useI18n();
const appStore = useAppStore();

defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const name = ref('');
const variables = ref<EnvironmentVariable[]>([]);
const error = ref('');

function close() {
  name.value = '';
  variables.value = [];
  error.value = '';
  emit('close');
}

function addVariable() {
  variables.value = [...variables.value, { key: '', value: '', type: 'default' }];
}

function removeVariable(index: number) {
  variables.value = variables.value.filter((_, i) => i !== index);
}

async function createEnvironment() {
  if (!name.value.trim()) {
    error.value = t('modal.environmentNameRequired');
    return;
  }

  try {
    error.value = '';
    const env = {
      name: name.value.trim(),
      isGlobal: false,
    };

    const newEnv = await appStore.addEnvironment(env);

    const validVariables = variables.value.filter(v => v.key.trim());
    if (validVariables.length > 0 && newEnv) {
      await appStore.updateEnvironmentVariables(newEnv.id, validVariables);
    }

    close();
  } catch (e) {
    error.value = e instanceof Error ? e.message : t('common.error');
  }
}
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      @click.self="close"
    >
      <div class="bg-white rounded-lg shadow-xl w-[600px] max-w-[90vw] max-h-[80vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
          <h2 class="text-lg font-semibold text-[#111827]">
            {{ t('modal.newEnvironment') }}
          </h2>
          <button
            class="p-1.5 text-[#6b7280] hover:bg-[#f3f4f6] rounded-md transition-colors"
            @click="close"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Form -->
        <div class="p-6 overflow-y-auto flex-1">
          <div class="mb-4">
            <label class="block text-sm font-medium text-[#374151] mb-1">
              {{ t('common.name') }} <span class="text-[#ef4444]">*</span>
            </label>
            <input
              v-model="name"
              type="text"
              :placeholder="t('modal.environmentNamePlaceholder')"
              class="w-full px-3 py-2 border border-[#e5e7eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
            />
            <p v-if="error" class="mt-1 text-sm text-[#ef4444]">
              {{ error }}
            </p>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-[#374151]">{{
                t('common.variables')
              }}</label>
              <button
                class="flex items-center gap-1 px-2 py-1 text-sm text-[#3b82f6] hover:bg-[#eff6ff] rounded-md transition-colors"
                @click="addVariable"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                {{ t('common.addVariable') }}
              </button>
            </div>

            <div class="space-y-2">
              <div
                v-for="(variable, index) in variables"
                :key="index"
                class="flex items-center gap-2"
              >
                <input
                  v-model="variable.key"
                  type="text"
                  :placeholder="t('modal.variableNamePlaceholder')"
                  class="flex-1 px-3 py-2 border border-[#e5e7eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent text-sm"
                />
                <input
                  v-model="variable.value"
                  type="text"
                  :placeholder="t('common.value')"
                  class="flex-1 px-3 py-2 border border-[#e5e7eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent text-sm"
                />
                <select
                  v-model="variable.type"
                  class="px-2 py-2 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                >
                  <option value="default">
                    {{ t('common.default') }}
                  </option>
                  <option value="secret">
                    {{ t('common.secret') }}
                  </option>
                </select>
                <button
                  class="p-2 text-[#6b7280] hover:text-[#ef4444] hover:bg-[#fef2f2] rounded-md transition-colors"
                  @click="removeVariable(index)"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <p v-if="variables.length === 0" class="text-sm text-[#6b7280] italic">
                {{ t('modal.noVariablesYet') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#e5e7eb] bg-[#f9fafb] rounded-b-lg"
        >
          <button
            class="px-4 py-2 text-sm font-medium text-[#6b7280] hover:text-[#374151] hover:bg-[#f3f4f6] rounded-md transition-colors"
            @click="close"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            class="px-4 py-2 text-sm font-medium text-white bg-[#3b82f6] hover:bg-[#2563eb] rounded-md transition-colors"
            @click="createEnvironment"
          >
            {{ t('modal.createEnvironment') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
