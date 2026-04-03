<script setup lang="ts">
defineProps<{
  label: string;
  href?: string;
}>();
</script>

<template>
  <a
    v-if="href"
    :href="href"
    class="text-[#3b82f6] underline font-mono text-sm hover:text-[#2563eb]"
    target="_blank"
    rel="noopener noreferrer"
  >
    {{ label }}
  </a>
  <span
    v-else
    class="text-[#3b82f6] underline font-mono text-sm cursor-pointer hover:text-[#2563eb]"
  >
    {{ label }}
  </span>
</template>
