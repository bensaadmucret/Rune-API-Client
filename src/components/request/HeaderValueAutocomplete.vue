<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';

interface ValueSuggestion {
  value: string;
  description?: string;
}

const props = defineProps<{
  modelValue: string;
  headerKey: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

// Common values by header key
const commonValuesByHeader: Record<string, ValueSuggestion[]> = {
  'accept': [
    { value: 'application/json', description: 'JSON format' },
    { value: 'application/xml', description: 'XML format' },
    { value: 'text/html', description: 'HTML document' },
    { value: 'text/plain', description: 'Plain text' },
    { value: 'application/octet-stream', description: 'Binary data' },
    { value: 'multipart/form-data', description: 'Form data with files' },
    { value: 'application/x-www-form-urlencoded', description: 'URL encoded form' },
    { value: '*/*', description: 'Any format' },
  ],
  'content-type': [
    { value: 'application/json', description: 'JSON payload' },
    { value: 'application/xml', description: 'XML payload' },
    { value: 'text/html', description: 'HTML content' },
    { value: 'text/plain', description: 'Plain text' },
    { value: 'application/octet-stream', description: 'Binary data' },
    { value: 'multipart/form-data', description: 'Form with files' },
    { value: 'application/x-www-form-urlencoded', description: 'URL encoded form' },
    { value: 'text/css', description: 'CSS stylesheet' },
    { value: 'text/javascript', description: 'JavaScript' },
    { value: 'image/jpeg', description: 'JPEG image' },
    { value: 'image/png', description: 'PNG image' },
    { value: 'image/gif', description: 'GIF image' },
    { value: 'application/pdf', description: 'PDF document' },
  ],
  'authorization': [
    { value: 'Bearer {{token}}', description: 'Bearer token auth' },
    { value: 'Basic {{credentials}}', description: 'Basic HTTP auth' },
    { value: 'Token {{token}}', description: 'Simple token auth' },
    { value: 'ApiKey {{key}}', description: 'API key auth' },
  ],
  'cache-control': [
    { value: 'no-cache', description: 'Force revalidation' },
    { value: 'no-store', description: 'Never cache' },
    { value: 'max-age=0', description: 'Must revalidate' },
    { value: 'max-age=3600', description: 'Cache 1 hour' },
    { value: 'max-age=86400', description: 'Cache 1 day' },
    { value: 'must-revalidate', description: 'Strict revalidation' },
    { value: 'private', description: 'Private cache only' },
    { value: 'public', description: 'Public cache allowed' },
  ],
  'connection': [
    { value: 'keep-alive', description: 'Reuse connection' },
    { value: 'close', description: 'Close after response' },
  ],
  'accept-encoding': [
    { value: 'gzip', description: 'Gzip compression' },
    { value: 'deflate', description: 'Deflate compression' },
    { value: 'br', description: 'Brotli compression' },
    { value: 'identity', description: 'No compression' },
    { value: '*', description: 'Any encoding' },
  ],
  'accept-language': [
    { value: 'en-US,en;q=0.9', description: 'English (US)' },
    { value: 'en-GB,en;q=0.9', description: 'English (UK)' },
    { value: 'fr-FR,fr;q=0.9', description: 'French' },
    { value: 'de-DE,de;q=0.9', description: 'German' },
    { value: 'es-ES,es;q=0.9', description: 'Spanish' },
    { value: 'zh-CN,zh;q=0.9', description: 'Chinese' },
    { value: 'ja-JP,ja;q=0.9', description: 'Japanese' },
  ],
  'accept-charset': [
    { value: 'utf-8', description: 'UTF-8 encoding' },
    { value: 'iso-8859-1', description: 'Latin-1 encoding' },
    { value: '*', description: 'Any charset' },
  ],
  'expect': [
    { value: '100-continue', description: 'Wait for 100 response' },
  ],
  'transfer-encoding': [
    { value: 'chunked', description: 'Chunked transfer' },
    { value: 'compress', description: 'LZW compression' },
    { value: 'deflate', description: 'Zlib compression' },
    { value: 'gzip', description: 'Gzip compression' },
    { value: 'identity', description: 'No encoding' },
  ],
  'pragma': [
    { value: 'no-cache', description: 'No cache (HTTP/1.0)' },
  ],
  'x-api-key': [
    { value: '{{apiKey}}', description: 'Template variable' },
  ],
  'x-auth-token': [
    { value: '{{authToken}}', description: 'Template variable' },
  ],
  'x-csrf-token': [
    { value: '{{csrfToken}}', description: 'Template variable' },
  ],
};

const inputRef = ref<HTMLInputElement | null>(null);
const showDropdown = ref(false);
const selectedIndex = ref(0);
const inputValue = ref(props.modelValue);

// Get suggestions based on header key
const suggestions = computed(() => {
  const key = props.headerKey?.toLowerCase() || '';
  return commonValuesByHeader[key] || [];
});

// Filter suggestions based on input
const filteredSuggestions = computed(() => {
  if (!inputValue.value.trim()) {
    return suggestions.value;
  }
  
  const query = inputValue.value.toLowerCase();
  return suggestions.value.filter(s => 
    s.value.toLowerCase().includes(query) ||
    (s.description?.toLowerCase().includes(query) ?? false)
  );
});

// Show dropdown only if we have suggestions
const hasSuggestions = computed(() => suggestions.value.length > 0);

// Watch for external changes
watch(() => props.modelValue, (newVal) => {
  inputValue.value = newVal;
});

// Watch for header key changes to reset dropdown
watch(() => props.headerKey, () => {
  showDropdown.value = false;
  selectedIndex.value = 0;
});

// Update value and emit
function updateValue(value: string) {
  inputValue.value = value;
  emit('update:modelValue', value);
}

// Show dropdown on focus
function onFocus() {
  if (hasSuggestions.value) {
    showDropdown.value = true;
    selectedIndex.value = 0;
  }
}

// Handle input
function onInput() {
  if (hasSuggestions.value) {
    showDropdown.value = true;
    selectedIndex.value = 0;
  }
  updateValue(inputValue.value);
}

// Handle keyboard navigation
function onKeyDown(event: KeyboardEvent) {
  if (!showDropdown.value || filteredSuggestions.value.length === 0) {
    return;
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      selectedIndex.value = (selectedIndex.value + 1) % filteredSuggestions.value.length;
      scrollToSelected();
      break;
    case 'ArrowUp':
      event.preventDefault();
      selectedIndex.value = (selectedIndex.value - 1 + filteredSuggestions.value.length) % filteredSuggestions.value.length;
      scrollToSelected();
      break;
    case 'Tab':
    case 'Enter':
      if (showDropdown.value && filteredSuggestions.value[selectedIndex.value]) {
        event.preventDefault();
        selectSuggestion(filteredSuggestions.value[selectedIndex.value]);
      }
      break;
    case 'Escape':
      showDropdown.value = false;
      break;
  }
}

// Select a suggestion
function selectSuggestion(suggestion: ValueSuggestion) {
  updateValue(suggestion.value);
  showDropdown.value = false;
  inputRef.value?.blur();
}

// Scroll selected item into view
function scrollToSelected() {
  nextTick(() => {
    const selectedEl = document.querySelector('.value-suggestion.selected');
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  });
}

// Close dropdown when clicking outside
function onClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.header-value-autocomplete')) {
    showDropdown.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside);
});
</script>

<template>
  <div class="header-value-autocomplete relative flex-1">
    <input
      ref="inputRef"
      v-model="inputValue"
      type="text"
      :placeholder="placeholder || 'Value'"
      class="w-full px-3 py-1.5 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
      @focus="onFocus"
      @input="onInput"
      @keydown="onKeyDown"
    />
    
    <!-- Dropdown -->
    <div
      v-if="showDropdown && filteredSuggestions.length > 0"
      class="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e7eb] rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
    >
      <div
        v-for="(suggestion, index) in filteredSuggestions"
        :key="suggestion.value"
        :class="[
          'value-suggestion px-3 py-2 cursor-pointer text-sm',
          index === selectedIndex ? 'selected bg-[#eff6ff] text-[#3b82f6]' : 'hover:bg-[#f9fafb]'
        ]"
        @click="selectSuggestion(suggestion)"
        @mouseenter="selectedIndex = index"
      >
        <div class="font-medium">{{ suggestion.value }}</div>
        <div v-if="suggestion.description" class="text-xs text-[#6b7280] mt-0.5">
          {{ suggestion.description }}
        </div>
      </div>
    </div>
  </div>
</template>
