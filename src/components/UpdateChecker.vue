<template>
  <div class="update-checker">
    <div v-if="updateAvailable" class="update-notification">
      <div class="update-content">
        <span class="update-icon">🚀</span>
        <div class="update-text">
          <strong>{{ t('update.available') }}</strong>
          <span class="version">v{{ newVersion }}</span>
        </div>
        <div class="update-actions">
          <button class="btn-primary" :disabled="installing" @click="installUpdate">
            {{ installing ? t('update.installing') : t('update.install') }}
          </button>
          <button class="btn-secondary" @click="dismissUpdate">
            {{ t('update.later') }}
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="checking" class="update-status">
      <span class="spinner" />
      {{ t('update.checking') }}
    </div>

    <div v-else-if="lastChecked" class="update-status">
      <span class="check-icon">✓</span>
      {{ t('update.upToDate') }} - {{ formatLastChecked() }}
    </div>

    <button v-if="!updateAvailable" class="btn-check" :disabled="checking" @click="checkForUpdates">
      {{ t('update.checkButton') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { check } from '@tauri-apps/plugin-updater';

const { t } = useI18n();

const updateAvailable = ref(false);
const newVersion = ref('');
const checking = ref(false);
const installing = ref(false);
const lastChecked = ref<Date | null>(null);

// Check for updates on component mount
onMounted(async () => {
  const saved = localStorage.getItem('lastUpdateCheck');
  if (saved) {
    lastChecked.value = new Date(saved);
  }
});

async function checkForUpdates() {
  checking.value = true;

  try {
    const update = await check();

    if (update) {
      updateAvailable.value = true;
      newVersion.value = update.version;
    } else {
      updateAvailable.value = false;
      lastChecked.value = new Date();
      localStorage.setItem('lastUpdateCheck', lastChecked.value.toISOString());
    }
  } catch (error) {
    console.error('Failed to check for updates:', error);
  } finally {
    checking.value = false;
  }
}

async function installUpdate() {
  installing.value = true;

  try {
    const update = await check();
    if (update) {
      await update.downloadAndInstall();
    }
  } catch (error) {
    console.error('Failed to install update:', error);
    installing.value = false;
  }
}

function dismissUpdate() {
  updateAvailable.value = false;
}

function formatLastChecked(): string {
  if (!lastChecked.value) return '';

  const now = new Date();
  const diff = now.getTime() - lastChecked.value.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return t('update.justNow');
  if (minutes < 60) return t('update.minutesAgo', { count: minutes });
  if (hours < 24) return t('update.hoursAgo', { count: hours });
  return t('update.daysAgo', { count: days });
}
</script>

<style scoped>
.update-checker {
  padding: 16px;
}

.update-notification {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 16px;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.update-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.update-icon {
  font-size: 24px;
}

.update-text {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.update-text strong {
  font-size: 14px;
}

.version {
  font-size: 12px;
  opacity: 0.9;
}

.update-actions {
  display: flex;
  gap: 8px;
}

.btn-primary {
  background: white;
  color: #667eea;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.update-status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ddd;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.check-icon {
  color: #4caf50;
}

.btn-check {
  width: 100%;
  padding: 12px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-check:hover:not(:disabled) {
  background: #e8e8e8;
}

.btn-check:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
