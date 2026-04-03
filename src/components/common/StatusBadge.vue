<script setup lang="ts">
const props = defineProps<{
  status: number;
}>();

const isSuccess = props.status >= 200 && props.status < 300;
const isError = props.status >= 400;
const isWarning = props.status >= 300 && props.status < 400;

const statusClass = isSuccess
  ? 'bg-[#22c55e]'
  : isError
  ? 'bg-[#ef4444]'
  : isWarning
  ? 'bg-[#f59e0b]'
  : 'bg-[#6b7280]';
</script>

<template>
  <span
    :class="[
      statusClass,
      'px-2 py-1 rounded-md text-white text-xs font-medium inline-flex items-center gap-1'
    ]"
  >
    <svg
      v-if="isSuccess"
      class="w-3 h-3"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M5 13l4 4L19 7"
      />
    </svg>
    <svg
      v-else-if="isError"
      class="w-3 h-3"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
    {{ status }}
    <span v-if="isSuccess">OK</span>
  </span>
</template>
