<script setup lang="ts">
import Sidebar from './components/layout/Sidebar.vue';
import DetailsPanel from './components/layout/DetailsPanel.vue';
import RequestBuilder from './components/request/RequestBuilder.vue';
import RequestTabs from './components/request/RequestTabs.vue';
import ResponseViewer from './components/request/ResponseViewer.vue';
</script>

<template>
  <div class="h-screen flex bg-[#f5f5f5] overflow-hidden">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Request Builder -->
      <RequestBuilder />

      <!-- Split Panel -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Request Configuration -->
        <div class="flex-1 border-r border-[#e5e7eb] bg-white">
          <RequestTabs />
        </div>

        <!-- Response Viewer -->
        <div class="flex-1 bg-white overflow-auto min-w-0">
          <ResponseViewer />
        </div>
      </div>
    </div>

    <!-- Details Panel (Slide-in) -->
    <DetailsPanel />
  </div>
</template>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}
</style>