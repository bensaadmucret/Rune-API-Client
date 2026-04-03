import { createApp } from "vue";
import { createPinia } from "pinia";
import i18n from "./i18n";
import App from "./App.vue";
import "./assets/styles.css";
import { useAppStore } from "./stores/app";
import { useHistoryStore } from "./stores/history";

const app = createApp(App);

app.use(createPinia());
app.use(i18n);

// Initialize data from SQLite on app mount
const appStore = useAppStore();
const historyStore = useHistoryStore();

Promise.all([
  appStore.initialize(),
  historyStore.loadHistory(100),
]).then(() => {
  console.log('Database initialized successfully');
}).catch((error) => {
  console.error('Failed to initialize database:', error);
});

app.mount("#app");
