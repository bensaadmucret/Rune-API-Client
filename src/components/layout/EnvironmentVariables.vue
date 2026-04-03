<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAppStore } from '../../stores/app';

const appStore = useAppStore();
const showVariables = ref(false);

const activeEnvVars = computed(() => {
  const env = appStore.activeEnvironment;
  return env?.variables || [];
});

function addVariable() {
  const env = appStore.activeEnvironment;
  if (env) {
    appStore.updateEnvironmentVariables(env.id, [
      ...env.variables,
      { key: '', value: '', type: 'default' }
    ]);
  }
}

function updateVariable(index: number, updates: Partial<{ key: string; value: string; type: 'default' | 'secret' }>) {
  const env = appStore.activeEnvironment;
  if (env) {
    const vars = [...env.variables];
    vars[index] = { ...vars[index], ...updates };
    appStore.updateEnvironmentVariables(env.id, vars);
  }
}

function removeVariable(index: number) {
  const env = appStore.activeEnvironment;
  if (env) {
    const vars = env.variables.filter((_, i) => i !== index);
    appStore.updateEnvironmentVariables(env.id, vars);
  }
}

function close() {
  showVariables.value = false;
}
</script>

<template>
  <div>
    <!-- Toggle Button -->
    <button
      class="flex items-center gap-2 px-3 py-2 text-xs text-[#6b7280] hover:text-[#374151] hover:bg-[#f3f4f6] rounded-lg transition-colors w-full"
      @click="showVariables = true"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
      <span v-if="activeEnvVars.length > 0">
        {{ activeEnvVars.length }} variable{{ activeEnvVars.length > 1 ? 's' : '' }}
      </span>
      <span v-else>Environment Variables</span>
    </button>

    <!-- Variables Panel Modal -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showVariables"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        @click.self="close"
      >
        <div class="bg-white rounded-lg shadow-xl w-[500px] max-w-[90vw] max-h-[80vh] flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-[#e5e7eb]">
            <div>
              <h2 class="text-lg font-semibold text-[#111827]">Environment Variables</h2>
              <p class="text-xs text-[#6b7280] mt-0.5">
                {{ appStore.activeEnvironment?.name || 'No environment selected' }}
              </p>
            </div>
            <button
              class="p-1.5 text-[#6b7280] hover:bg-[#f3f4f6] rounded-md transition-colors"
              @click="close"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-4">
            <div v-if="!appStore.activeEnvironment" class="text-center py-8 text-[#6b7280]">
              <svg class="w-12 h-12 mx-auto mb-3 text-[#d1d5db]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p class="text-sm">Select an environment first</p>
            </div>

            <div v-else-if="activeEnvVars.length === 0" class="text-center py-8 text-[#6b7280]">
              <p class="text-sm">No variables yet</p>
              <button
                class="mt-2 px-3 py-1.5 text-sm text-[#3b82f6] hover:bg-[#eff6ff] rounded-md transition-colors"
                @click="addVariable"
              >
                Add your first variable
              </button>
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="(variable, index) in activeEnvVars"
                :key="index"
                class="flex items-center gap-2"
              >
                <input
                  :value="variable.key"
                  type="text"
                  placeholder="VARIABLE_NAME"
                  class="flex-1 px-3 py-2 border border-[#e5e7eb] rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                  @input="updateVariable(index, { key: ($event.target as HTMLInputElement).value })"
                />
                <input
                  :value="variable.value"
                  :type="variable.type === 'secret' ? 'password' : 'text'"
                  placeholder="value"
                  class="flex-1 px-3 py-2 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                  @input="updateVariable(index, { value: ($event.target as HTMLInputElement).value })"
                />
                <select
                  :value="variable.type"
                  class="px-2 py-2 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                  @change="updateVariable(index, { type: ($event.target as HTMLSelectElement).value as 'default' | 'secret' })"
                >
                  <option value="default">Default</option>
                  <option value="secret">Secret</option>
                </select>
                <button
                  class="p-2 text-[#6b7280] hover:text-[#ef4444] hover:bg-[#fef2f2] rounded-md transition-colors"
                  @click="removeVariable(index)"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div v-if="appStore.activeEnvironment" class="flex items-center justify-between px-4 py-3 border-t border-[#e5e7eb] bg-[#f9fafb] rounded-b-lg">
            <span class="text-xs text-[#6b7280]">Use {'{{'} variable_name {'}}'} in URL, headers or body</span>
            <button
              class="flex items-center gap-1 px-3 py-1.5 text-sm text-[#3b82f6] hover:bg-[#eff6ff] rounded-md transition-colors"
              @click="addVariable"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Variable
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
