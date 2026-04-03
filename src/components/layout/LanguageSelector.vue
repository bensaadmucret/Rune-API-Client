<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

function setLanguage(code: string) {
  locale.value = code;
  localStorage.setItem('postman-clone-lang', code);
}
</script>

<template>
  <div class="flex items-center gap-2">
    <svg class="w-4 h-4 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
    </svg>
    <select
      :value="locale"
      class="flex-1 px-2 py-1.5 bg-[#f3f4f6] border border-transparent rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#3b82f6] cursor-pointer"
      @change="setLanguage(($event.target as HTMLSelectElement).value)"
    >
      <option
        v-for="lang in languages"
        :key="lang.code"
        :value="lang.code"
      >
        {{ lang.flag }} {{ lang.label }}
      </option>
    </select>
  </div>
</template>
