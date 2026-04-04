<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHeaderPresetStore, type HttpHeader } from '../../stores/headerPresets';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'apply', headers: HttpHeader[]): void;
}>();

const { t } = useI18n();
const presetStore = useHeaderPresetStore();

const showModal = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

// Form state
const isEditing = ref(false);
const editingPresetId = ref<string | null>(null);
const presetName = ref('');
const presetDescription = ref('');
const presetHeaders = ref<HttpHeader[]>([{ key: '', value: '', enabled: true }]);

// Reset form
function resetForm() {
  isEditing.value = false;
  editingPresetId.value = null;
  presetName.value = '';
  presetDescription.value = '';
  presetHeaders.value = [{ key: '', value: '', enabled: true }];
}

// Close modal
function closeModal() {
  showModal.value = false;
  resetForm();
}

// Start creating new preset
function startCreate() {
  resetForm();
  isEditing.value = true;
}

// Start editing existing preset
function startEdit(preset: { id: string; name: string; description?: string; headers: HttpHeader[] }) {
  isEditing.value = true;
  editingPresetId.value = preset.id;
  presetName.value = preset.name;
  presetDescription.value = preset.description || '';
  presetHeaders.value = preset.headers.map(h => ({ ...h }));
}

// Cancel editing
function cancelEdit() {
  resetForm();
}

// Save preset
async function savePreset() {
  const validHeaders = presetHeaders.value.filter(h => h.key.trim() !== '');
  
  if (!presetName.value.trim()) {
    alert(t('headerPresetManager.nameRequired') || 'Name is required');
    return;
  }

  const req = {
    name: presetName.value.trim(),
    description: presetDescription.value.trim() || undefined,
    headers: validHeaders,
  };

  try {
    if (editingPresetId.value) {
      await presetStore.updatePreset(editingPresetId.value, req);
    } else {
      await presetStore.createPreset(req);
    }
    resetForm();
  } catch (e) {
    console.error('Failed to save preset:', e);
  }
}

// Delete preset
async function deletePreset(id: string) {
  if (!confirm(t('headerPresetManager.confirmDelete') || 'Are you sure you want to delete this preset?')) {
    return;
  }

  try {
    await presetStore.deletePreset(id);
  } catch (e) {
    console.error('Failed to delete preset:', e);
  }
}

// Apply preset
function applyPreset(headers: HttpHeader[]) {
  emit('apply', headers.map(h => ({ ...h, enabled: true })));
  closeModal();
}

// Add header row
function addHeaderRow() {
  presetHeaders.value.push({ key: '', value: '', enabled: true });
}

// Remove header row
function removeHeaderRow(index: number) {
  presetHeaders.value.splice(index, 1);
  if (presetHeaders.value.length === 0) {
    addHeaderRow();
  }
}

// Toggle header enabled
function toggleHeader(index: number) {
  const header = presetHeaders.value[index];
  if (header) {
    header.enabled = !header.enabled;
  }
}
</script>

<template>
  <div
    v-if="showModal"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col m-4">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
        <h2 class="text-lg font-semibold text-[#111827]">
          {{ t('headerPresetManager.title') || 'Manage Header Presets' }}
        </h2>
        <button
          class="p-2 text-[#6b7280] hover:text-[#374151] hover:bg-[#f3f4f6] rounded-md transition-colors"
          @click="closeModal"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- Edit Form -->
        <div v-if="isEditing" class="space-y-4 mb-6">
          <div class="flex items-center justify-between">
            <h3 class="font-medium text-[#374151]">
              {{ editingPresetId ? (t('headerPresetManager.editPreset') || 'Edit Preset') : (t('headerPresetManager.newPreset') || 'New Preset') }}
            </h3>
            <button
              class="text-sm text-[#6b7280] hover:text-[#374151]"
              @click="cancelEdit"
            >
              {{ t('common.cancel') || 'Cancel' }}
            </button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-[#374151] mb-1">
                {{ t('headerPresetManager.presetName') || 'Preset Name' }}
              </label>
              <input
                v-model="presetName"
                type="text"
                :placeholder="t('headerPresetManager.namePlaceholder') || 'e.g., JSON API Headers'"
                class="w-full px-3 py-2 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-[#374151] mb-1">
                {{ t('headerPresetManager.description') || 'Description (optional)' }}
              </label>
              <input
                v-model="presetDescription"
                type="text"
                :placeholder="t('headerPresetManager.descriptionPlaceholder') || 'Brief description of this preset'"
                class="w-full px-3 py-2 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-[#374151] mb-2">
                {{ t('headerPresetManager.headers') || 'Headers' }}
              </label>
              <div class="space-y-2">
                <div
                  v-for="(header, index) in presetHeaders"
                  :key="index"
                  class="flex items-center gap-2"
                >
                  <button
                    :class="[
                      'w-5 h-5 rounded border flex items-center justify-center transition-colors',
                      header.enabled
                        ? 'bg-[#3b82f6] border-[#3b82f6]'
                        : 'bg-white border-[#d1d5db]'
                    ]"
                    @click="toggleHeader(index)"
                  >
                    <svg v-if="header.enabled" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <input
                    v-model="header.key"
                    type="text"
                    :placeholder="t('headerPresetManager.headerKey') || 'Key'"
                    class="flex-1 px-3 py-1.5 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                  />
                  <input
                    v-model="header.value"
                    type="text"
                    :placeholder="t('headerPresetManager.headerValue') || 'Value'"
                    class="flex-1 px-3 py-1.5 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                  />
                  <button
                    class="p-1.5 text-[#6b7280] hover:text-[#ef4444] hover:bg-[#fef2f2] rounded-md transition-colors"
                    data-testid="remove-header-row-button"
                    @click="removeHeaderRow(index)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <button
                  class="flex items-center gap-2 px-3 py-1.5 text-sm text-[#3b82f6] hover:bg-[#eff6ff] rounded-md transition-colors"
                  @click="addHeaderRow"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  {{ t('headerPresetManager.addHeader') || 'Add Header' }}
                </button>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <button
              class="px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f3f4f6] rounded-md transition-colors"
              @click="cancelEdit"
            >
              {{ t('common.cancel') || 'Cancel' }}
            </button>
            <button
              class="px-4 py-2 text-sm font-medium bg-[#3b82f6] text-white hover:bg-[#2563eb] rounded-md transition-colors"
              @click="savePreset"
            >
              {{ editingPresetId ? (t('common.save') || 'Save') : (t('common.create') || 'Create') }}
            </button>
          </div>
        </div>

        <!-- Presets List -->
        <div v-else>
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-medium text-[#374151]">{{ t('headerPresetManager.yourPresets') || 'Your Presets' }}</h3>
            <button
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#3b82f6] text-white hover:bg-[#2563eb] rounded-md transition-colors"
              @click="startCreate"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ t('headerPresetManager.newPreset') || 'New Preset' }}
            </button>
          </div>

          <!-- Built-in Presets -->
          <div v-if="presetStore.builtinPresets.length > 0" class="mb-4">
            <h4 class="text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">
              {{ t('headerPresetManager.builtIn') || 'Built-in' }}
            </h4>
            <div class="space-y-2">
              <div
                v-for="preset in presetStore.builtinPresets"
                :key="preset.id"
                class="flex items-center justify-between p-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-md"
              >
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-sm text-[#111827]">{{ preset.name }}</div>
                  <div v-if="preset.description" class="text-xs text-[#6b7280] mt-0.5 truncate">
                    {{ preset.description }}
                  </div>
                  <div class="text-xs text-[#9ca3af] mt-1">
                    {{ preset.headers.length }} {{ preset.headers.length === 1 ? 'header' : 'headers' }}
                  </div>
                </div>
                <button
                  class="px-3 py-1.5 text-sm font-medium text-[#3b82f6] hover:bg-[#eff6ff] rounded-md transition-colors ml-2"
                  @click="applyPreset(preset.headers)"
                >
                  {{ t('headerPresetManager.apply') || 'Apply' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Custom Presets -->
          <div v-if="presetStore.customPresets.length > 0">
            <h4 class="text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">
              {{ t('headerPresetManager.custom') || 'Custom' }}
            </h4>
            <div class="space-y-2">
              <div
                v-for="preset in presetStore.customPresets"
                :key="preset.id"
                class="flex items-center justify-between p-3 bg-white border border-[#e5e7eb] rounded-md hover:border-[#3b82f6] transition-colors"
              >
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-sm text-[#111827]">{{ preset.name }}</div>
                  <div v-if="preset.description" class="text-xs text-[#6b7280] mt-0.5 truncate">
                    {{ preset.description }}
                  </div>
                  <div class="text-xs text-[#9ca3af] mt-1">
                    {{ preset.headers.length }} {{ preset.headers.length === 1 ? 'header' : 'headers' }}
                  </div>
                </div>
                <div class="flex items-center gap-1 ml-2">
                  <button
                    class="p-1.5 text-[#6b7280] hover:text-[#3b82f6] hover:bg-[#eff6ff] rounded-md transition-colors"
                    :title="t('headerPresetManager.edit') || 'Edit'"
                    data-testid="edit-preset-button"
                    @click="startEdit(preset)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    class="p-1.5 text-[#6b7280] hover:text-[#ef4444] hover:bg-[#fef2f2] rounded-md transition-colors"
                    :title="t('headerPresetManager.delete') || 'Delete'"
                    data-testid="delete-preset-button"
                    @click="deletePreset(preset.id)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button
                    class="px-3 py-1.5 text-sm font-medium text-[#3b82f6] hover:bg-[#eff6ff] rounded-md transition-colors ml-1"
                    @click="applyPreset(preset.headers)"
                  >
                    {{ t('headerPresetManager.apply') || 'Apply' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="presetStore.builtinPresets.length === 0" class="text-center py-8">
            <svg class="w-12 h-12 mx-auto text-[#d1d5db] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-sm text-[#6b7280]">{{ t('headerPresetManager.noPresets') || 'No presets yet' }}</p>
            <p class="text-xs text-[#9ca3af] mt-1">{{ t('headerPresetManager.createFirst') || 'Create your first preset' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
