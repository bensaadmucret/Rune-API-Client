<script setup lang="ts">
import type { HttpMethod } from '../../types';

defineProps<{
  method: HttpMethod;
}>();

const methodClasses: Record<HttpMethod, string> = {
  GET: 'bg-[#3b82f6]',
  POST: 'bg-[#22c55e]',
  PUT: 'bg-[#f59e0b]',
  DELETE: 'bg-[#ef4444]',
  PATCH: 'bg-[#a855f7]',
  HEAD: 'bg-[#6366f1]',
  OPTIONS: 'bg-[#8b5cf6]',
};
</script>

<template>
  <span
    :class="[
      methodClasses[method],
      'px-2 py-1 rounded-md text-white text-xs font-medium uppercase tracking-wide'
    ]"
  >
    {{ method }}
  </span>
</template>
