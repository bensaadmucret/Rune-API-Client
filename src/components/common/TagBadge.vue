<script setup lang="ts">
defineProps<{
  label: string;
}>();
</script>

<template>
  <span
    class="px-2 py-1 bg-[#f3f4f6] border border-[#e5e7eb] rounded-md text-[#374151] text-xs"
  >
    {{ label }}
  </span>
</template>
