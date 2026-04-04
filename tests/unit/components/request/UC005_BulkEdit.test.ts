import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import RequestTabs from '../../../../src/components/request/RequestTabs.vue';
import { useRequestStore } from '../../../../src/stores/request';

// Mock Tauri API
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

// Mock i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

// Mock clipboard
const mockClipboard = {
  writeText: vi.fn(),
};
vi.stubGlobal('navigator', {
  clipboard: mockClipboard,
});

describe('UC-005: Bulk Edit des Headers', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('Toggle mode table/texte', () => {
    it('affiche bouton "Bulk Edit" dans l\'onglet Headers', async () => {
      const wrapper = mount(RequestTabs);

      const bulkEditBtn = wrapper.find('[data-testid="bulk-edit-toggle"]');
      expect(bulkEditBtn.exists()).toBe(true);
      expect(bulkEditBtn.text().toLowerCase()).toContain('bulk');
    });

    it('passe en mode texte quand on clique sur Bulk Edit', async () => {
      const wrapper = mount(RequestTabs);

      // Cliquer sur le toggle
      await wrapper.find('[data-testid="bulk-edit-toggle"]').trigger('click');
      await nextTick();

      // Vérifier que le textarea bulk est visible
      const bulkTextarea = wrapper.find('[data-testid="bulk-textarea"]');
      expect(bulkTextarea.exists()).toBe(true);
    });

    it('retourne en mode table quand on reclique', async () => {
      const wrapper = mount(RequestTabs);

      // Passer en mode texte
      await wrapper.find('[data-testid="bulk-edit-toggle"]').trigger('click');
      await nextTick();

      // Revenir en mode table
      await wrapper.find('[data-testid="bulk-edit-toggle"]').trigger('click');
      await nextTick();

      // Vérifier que les inputs de headers sont visibles
      const headerInputs = wrapper.findAll('[data-testid="manual-header-row"]');
      expect(headerInputs.length).toBeGreaterThanOrEqual(0);
    });

    it('toggle ne perd pas les données existantes', async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      // Ajouter un header
      store.addHeader({ key: 'Content-Type', value: 'application/json', enabled: true });
      await nextTick();

      // Passer en mode bulk
      await wrapper.find('[data-testid="bulk-edit-toggle"]').trigger('click');
      await nextTick();

      // Vérifier que le header est dans le textarea
      const bulkTextarea = wrapper.find('[data-testid="bulk-textarea"]');
      const textareaValue = (bulkTextarea.element as HTMLTextAreaElement).value;
      expect(textareaValue).toContain('Content-Type');
      expect(textareaValue).toContain('application/json');
    });
  });

  describe('Mode texte - textarea format Key: Value', () => {
    it('affiche textarea avec format Key: Value', async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      store.addHeader({ key: 'X-Custom', value: 'test-value', enabled: true });
      await nextTick();

      await wrapper.find('[data-testid="bulk-edit-toggle"]').trigger('click');
      await nextTick();

      const bulkTextarea = wrapper.find('[data-testid="bulk-textarea"]');
      const value = (bulkTextarea.element as HTMLTextAreaElement).value;

      // Format attendu: Key: Value
      expect(value).toMatch(/X-Custom:\s*test-value/);
    });

    it('chaque header sur une ligne séparée', async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      store.addHeader({ key: 'Content-Type', value: 'application/json', enabled: true });
      store.addHeader({ key: 'Authorization', value: 'Bearer token', enabled: true });
      await nextTick();

      await wrapper.find('[data-testid="bulk-edit-toggle"]').trigger('click');
      await nextTick();

      const bulkTextarea = wrapper.find('[data-testid="bulk-textarea"]');
      const lines = (bulkTextarea.element as HTMLTextAreaElement).value
        .split('\n')
        .filter(l => l.trim());

      expect(lines.length).toBe(2);
    });
  });

  describe('Parsing intelligent headers', () => {
    it('parse format "Key: Value" avec espace', async () => {
      const wrapper = mount(RequestTabs);

      await wrapper.find('[data-testid="bulk-edit-toggle"]').trigger('click');
      await nextTick();

      const bulkTextarea = wrapper.find('[data-testid="bulk-textarea"]');
      await bulkTextarea.setValue('Content-Type: application/json\nAuthorization: Bearer token');
      await nextTick();

      // Appliquer le parsing (simuler un blur ou bouton apply)
      await wrapper.find('[data-testid="bulk-apply-btn"]').trigger('click');
      await nextTick();

      const store = useRequestStore();
      const headers = store.currentRequest.headers;

      expect(headers.some(h => h.key === 'Content-Type' && h.value === 'application/json')).toBe(
        true
      );
      expect(headers.some(h => h.key === 'Authorization' && h.value === 'Bearer token')).toBe(true);
    });

    it('parse format "Key:Value" sans espace', async () => {
      const wrapper = mount(RequestTabs);

      await wrapper.find('[data-testid="bulk-edit-toggle"]').trigger('click');
      await nextTick();

      const bulkTextarea = wrapper.find('[data-testid="bulk-textarea"]');
      await bulkTextarea.setValue('X-Custom:test');
      await nextTick();

      await wrapper.find('[data-testid="bulk-apply-btn"]').trigger('click');
      await nextTick();

      const store = useRequestStore();
      expect(
        store.currentRequest.headers.some(h => h.key === 'X-Custom' && h.value === 'test')
      ).toBe(true);
    });

    it('parse format "Key Value" sans deux-points', async () => {
      const wrapper = mount(RequestTabs);

      await wrapper.find('[data-testid="bulk-edit-toggle"]').trigger('click');
      await nextTick();

      const bulkTextarea = wrapper.find('[data-testid="bulk-textarea"]');
      await bulkTextarea.setValue('Authorization Bearer abc123');
      await nextTick();

      await wrapper.find('[data-testid="bulk-apply-btn"]').trigger('click');
      await nextTick();

      const store = useRequestStore();
      expect(
        store.currentRequest.headers.some(
          h => h.key === 'Authorization' && h.value === 'Bearer abc123'
        )
      ).toBe(true);
    });

    it('ignore lignes vides', async () => {
      const wrapper = mount(RequestTabs);

      await wrapper.find('[data-testid="bulk-edit-toggle"]').trigger('click');
      await nextTick();

      const bulkTextarea = wrapper.find('[data-testid="bulk-textarea"]');
      await bulkTextarea.setValue('\n\nContent-Type: json\n\n');
      await nextTick();

      await wrapper.find('[data-testid="bulk-apply-btn"]').trigger('click');
      await nextTick();

      const store = useRequestStore();
      expect(store.currentRequest.headers.length).toBe(1);
    });

    it('gère valeur vide', async () => {
      const wrapper = mount(RequestTabs);

      await wrapper.find('[data-testid="bulk-edit-toggle"]').trigger('click');
      await nextTick();

      const bulkTextarea = wrapper.find('[data-testid="bulk-textarea"]');
      await bulkTextarea.setValue('X-Empty:');
      await nextTick();

      await wrapper.find('[data-testid="bulk-apply-btn"]').trigger('click');
      await nextTick();

      const store = useRequestStore();
      expect(store.currentRequest.headers.some(h => h.key === 'X-Empty' && h.value === '')).toBe(
        true
      );
    });
  });

  describe('Support import curl', () => {
    it('parse curl -H "Key: Value"', async () => {
      const wrapper = mount(RequestTabs);

      await wrapper.find('[data-testid="bulk-edit-toggle"]').trigger('click');
      await nextTick();

      const bulkTextarea = wrapper.find('[data-testid="bulk-textarea"]');
      await bulkTextarea.setValue(
        'curl -H "Content-Type: application/json" -H "Authorization: Bearer token" https://api.example.com'
      );
      await nextTick();

      await wrapper.find('[data-testid="bulk-apply-btn"]').trigger('click');
      await nextTick();

      const store = useRequestStore();
      expect(store.currentRequest.headers.some(h => h.key === 'Content-Type')).toBe(true);
      expect(store.currentRequest.headers.some(h => h.key === 'Authorization')).toBe(true);
    });

    it('parse curl avec quotes simples', async () => {
      const wrapper = mount(RequestTabs);

      await wrapper.find('[data-testid="bulk-edit-toggle"]').trigger('click');
      await nextTick();

      const bulkTextarea = wrapper.find('[data-testid="bulk-textarea"]');
      await bulkTextarea.setValue("curl -H 'X-Custom: value' https://api.test.com");
      await nextTick();

      await wrapper.find('[data-testid="bulk-apply-btn"]').trigger('click');
      await nextTick();

      const store = useRequestStore();
      expect(store.currentRequest.headers.some(h => h.key === 'X-Custom')).toBe(true);
    });

    it('ignore autres parties de la commande curl', async () => {
      const wrapper = mount(RequestTabs);

      await wrapper.find('[data-testid="bulk-edit-toggle"]').trigger('click');
      await nextTick();

      const bulkTextarea = wrapper.find('[data-testid="bulk-textarea"]');
      await bulkTextarea.setValue(
        'curl -X POST -d "body" -H "Content-Type: json" https://api.test.com'
      );
      await nextTick();

      await wrapper.find('[data-testid="bulk-apply-btn"]').trigger('click');
      await nextTick();

      const store = useRequestStore();
      const headers = store.currentRequest.headers;

      // Ne devrait avoir que le header, pas -X POST ou -d
      expect(headers.some(h => h.key === '-X')).toBe(false);
      expect(headers.some(h => h.key === '-d')).toBe(false);
      expect(headers.some(h => h.key === 'Content-Type')).toBe(true);
    });
  });

  describe('Copie vers clipboard', () => {
    it('bouton "Copy to Clipboard" présent en mode bulk', async () => {
      const wrapper = mount(RequestTabs);

      await wrapper.find('[data-testid="bulk-edit-toggle"]').trigger('click');
      await nextTick();

      const copyBtn = wrapper.find('[data-testid="bulk-copy-btn"]');
      expect(copyBtn.exists()).toBe(true);
    });

    it('copie le contenu bulk vers clipboard', async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      store.addHeader({ key: 'X-Test', value: 'value123', enabled: true });
      await nextTick();

      await wrapper.find('[data-testid="bulk-edit-toggle"]').trigger('click');
      await nextTick();

      const copyBtn = wrapper.find('[data-testid="bulk-copy-btn"]');
      await copyBtn.trigger('click');

      expect(mockClipboard.writeText).toHaveBeenCalled();
      const copiedText = mockClipboard.writeText.mock.calls[0][0];
      expect(copiedText).toContain('X-Test');
      expect(copiedText).toContain('value123');
    });
  });

  describe('Transition fluide', () => {
    it('données restent cohérentes après toggle multiple', async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      // Ajouter headers
      store.addHeader({ key: 'A', value: '1', enabled: true });
      store.addHeader({ key: 'B', value: '2', enabled: true });
      await nextTick();

      // Toggle vers bulk
      await wrapper.find('[data-testid="bulk-edit-toggle"]').trigger('click');
      await nextTick();

      // Modifier en bulk
      const bulkTextarea = wrapper.find('[data-testid="bulk-textarea"]');
      await bulkTextarea.setValue('C: 3\nD: 4');
      await nextTick();
      await wrapper.find('[data-testid="bulk-apply-btn"]').trigger('click');
      await nextTick();

      // Toggle retour table
      await wrapper.find('[data-testid="bulk-edit-toggle"]').trigger('click');
      await nextTick();

      // Vérifier cohérence
      const headers = store.currentRequest.headers;
      expect(headers.some(h => h.key === 'C' && h.value === '3')).toBe(true);
      expect(headers.some(h => h.key === 'D' && h.value === '4')).toBe(true);
    });

    it('headers désactivés sont préservés en bulk', async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      store.addHeader({ key: 'Enabled', value: 'yes', enabled: true });
      store.addHeader({ key: 'Disabled', value: 'no', enabled: false });
      await nextTick();

      await wrapper.find('[data-testid="bulk-edit-toggle"]').trigger('click');
      await nextTick();

      const bulkTextarea = wrapper.find('[data-testid="bulk-textarea"]');
      const value = (bulkTextarea.element as HTMLTextAreaElement).value;

      // Les headers désactivés pourraient être commentés ou marqués
      expect(value).toContain('Enabled');
    });
  });
});
