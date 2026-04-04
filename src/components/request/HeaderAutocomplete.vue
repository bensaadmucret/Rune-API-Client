<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';

interface HeaderSuggestion {
  name: string;
  description?: string;
  commonValues?: string[];
}

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'select', header: HeaderSuggestion): void;
}>();

// Extended list of HTTP headers with descriptions and common values
const httpHeaders: HeaderSuggestion[] = [
  { name: 'Accept', description: 'Media types that are acceptable', commonValues: ['application/json', 'application/xml', 'text/html', 'text/plain', '*/*'] },
  { name: 'Accept-Charset', description: 'Character sets that are acceptable', commonValues: ['utf-8', 'iso-8859-1'] },
  { name: 'Accept-Encoding', description: 'Acceptable encodings', commonValues: ['gzip', 'deflate', 'br', 'identity', '*'] },
  { name: 'Accept-Language', description: 'Acceptable languages', commonValues: ['en-US', 'en', 'fr', 'de', 'es'] },
  { name: 'Authorization', description: 'Authentication credentials', commonValues: ['Bearer {{token}}', 'Basic {{credentials}}'] },
  { name: 'Cache-Control', description: 'Caching directives', commonValues: ['no-cache', 'no-store', 'max-age=0', 'must-revalidate'] },
  { name: 'Connection', description: 'Connection options', commonValues: ['keep-alive', 'close'] },
  { name: 'Content-Disposition', description: 'How to process response payload', commonValues: ['attachment', 'inline'] },
  { name: 'Content-Encoding', description: 'Encoding of the content', commonValues: ['gzip', 'deflate', 'br', 'identity'] },
  { name: 'Content-Language', description: 'Language of the content', commonValues: ['en', 'fr', 'de', 'es'] },
  { name: 'Content-Length', description: 'Length of the content in bytes' },
  { name: 'Content-Location', description: 'Alternative location for the returned data' },
  { name: 'Content-Range', description: 'Where in the full body this partial message belongs' },
  { name: 'Content-Type', description: 'Media type of the body', commonValues: ['application/json', 'application/xml', 'application/x-www-form-urlencoded', 'multipart/form-data', 'text/html', 'text/plain', 'application/octet-stream'] },
  { name: 'Cookie', description: 'HTTP cookies sent previously by the server' },
  { name: 'Date', description: 'Date and time the message was sent' },
  { name: 'ETag', description: 'Identifier for a specific version of a resource' },
  { name: 'Expect', description: 'Expectations that need to be fulfilled', commonValues: ['100-continue'] },
  { name: 'Expires', description: 'Expiration date of the response' },
  { name: 'From', description: 'Email address of the user making the request' },
  { name: 'Host', description: 'Domain name of the server and port number' },
  { name: 'If-Match', description: 'Only perform action if client-supplied entity matches' },
  { name: 'If-Modified-Since', description: 'Allow conditional GET if content not changed' },
  { name: 'If-None-Match', description: 'Allow conditional GET if ETag does not match' },
  { name: 'If-Range', description: 'Request only part of an entity if unchanged' },
  { name: 'If-Unmodified-Since', description: 'Only send response if entity not modified' },
  { name: 'Last-Modified', description: 'Last modified date of the resource' },
  { name: 'Link', description: 'Relationships between resources' },
  { name: 'Location', description: 'Redirect target' },
  { name: 'Origin', description: 'Origin of the request' },
  { name: 'Pragma', description: 'Implementation-specific fields', commonValues: ['no-cache'] },
  { name: 'Proxy-Authorization', description: 'Authorization credentials for proxy' },
  { name: 'Range', description: 'Request only part of an entity', commonValues: ['bytes=0-1023'] },
  { name: 'Referer', description: 'Address of the previous web page' },
  { name: 'Retry-After', description: 'How long to wait before making a follow-up request' },
  { name: 'Server', description: 'Information about the server software' },
  { name: 'Set-Cookie', description: 'Cookie set by the server' },
  { name: 'TE', description: 'Transfer encodings the user agent is willing to accept', commonValues: ['trailers', 'deflate'] },
  { name: 'Trailer', description: 'Fields present in the trailer of chunked transfer' },
  { name: 'Transfer-Encoding', description: 'Form of encoding used to transfer the entity', commonValues: ['chunked', 'compress', 'deflate', 'gzip', 'identity'] },
  { name: 'Upgrade', description: 'Ask server to upgrade to another protocol', commonValues: ['HTTP/2.0', 'SHTTP/1.3'] },
  { name: 'User-Agent', description: 'User agent string of the client' },
  { name: 'Vary', description: 'Request headers used to determine response' },
  { name: 'Via', description: 'Proxies through which the request was sent' },
  { name: 'Warning', description: 'General warning about possible problems' },
  { name: 'WWW-Authenticate', description: 'Authentication method that should be used' },
  { name: 'X-API-Key', description: 'API key for authentication' },
  { name: 'X-Auth-Token', description: 'Authentication token' },
  { name: 'X-CSRF-Token', description: 'CSRF protection token' },
  { name: 'X-Forwarded-For', description: 'Original client IP when behind proxy' },
  { name: 'X-Forwarded-Host', description: 'Original host when behind proxy' },
  { name: 'X-Forwarded-Proto', description: 'Original protocol when behind proxy' },
  { name: 'X-Request-ID', description: 'Unique identifier for the request' },
];

const inputRef = ref<HTMLInputElement | null>(null);
const showDropdown = ref(false);
const selectedIndex = ref(0);
const inputValue = ref(props.modelValue);

// Filter suggestions based on input
const filteredSuggestions = computed(() => {
  if (!inputValue.value.trim()) {
    return httpHeaders.slice(0, 10); // Show top 10 if empty
  }
  
  const query = inputValue.value.toLowerCase();
  return httpHeaders.filter(h => 
    h.name.toLowerCase().includes(query)
  ).slice(0, 10); // Limit to 10 results
});

// Watch for external changes
watch(() => props.modelValue, (newVal) => {
  inputValue.value = newVal;
});

// Update value and emit
function updateValue(value: string) {
  inputValue.value = value;
  emit('update:modelValue', value);
}

// Show dropdown on focus
function onFocus() {
  showDropdown.value = true;
  selectedIndex.value = 0;
}

// Handle input
function onInput() {
  showDropdown.value = true;
  selectedIndex.value = 0;
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
function selectSuggestion(suggestion: HeaderSuggestion) {
  updateValue(suggestion.name);
  showDropdown.value = false;
  emit('select', suggestion);
  inputRef.value?.blur();
}

// Scroll selected item into view
function scrollToSelected() {
  nextTick(() => {
    const selectedEl = document.querySelector('.header-suggestion.selected');
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  });
}

// Close dropdown when clicking outside
function onClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.header-autocomplete')) {
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
  <div class="header-autocomplete relative flex-1">
    <input
      ref="inputRef"
      v-model="inputValue"
      type="text"
      :placeholder="placeholder || 'Header'"
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
        :key="suggestion.name"
        :class="[
          'header-suggestion px-3 py-2 cursor-pointer text-sm',
          index === selectedIndex ? 'selected bg-[#eff6ff] text-[#3b82f6]' : 'hover:bg-[#f9fafb]'
        ]"
        @click="selectSuggestion(suggestion)"
        @mouseenter="selectedIndex = index"
      >
        <div class="font-medium">{{ suggestion.name }}</div>
        <div v-if="suggestion.description" class="text-xs text-[#6b7280] mt-0.5">
          {{ suggestion.description }}
        </div>
      </div>
    </div>
  </div>
</template>
