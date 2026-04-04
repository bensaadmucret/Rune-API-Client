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

describe('UC-006: Description/Commentaire par Header', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('Champ Description optionnel', () => {
    it('affiche champ description collapsible sous chaque header', async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      store.addHeader({ key: 'Content-Type', value: 'application/json', enabled: true });
      await nextTick();

      // Vérifier présence du toggle pour expand/collapse description
      const descToggle = wrapper.find('[data-testid="description-toggle"]');
      expect(descToggle.exists()).toBe(true);
    });

    it('expand description quand on clique sur le toggle', async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      store.addHeader({ key: 'X-Custom', value: 'test', enabled: true });
      await nextTick();

      const descToggle = wrapper.find('[data-testid="description-toggle"]');
      await descToggle.trigger('click');
      await nextTick();

      const descInput = wrapper.find('[data-testid="description-input"]');
      expect(descInput.exists()).toBe(true);
    });

    it('collapse description quand on reclique', async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      store.addHeader({ key: 'X-Custom', value: 'test', enabled: true });
      await nextTick();

      // Expand
      await wrapper.find('[data-testid="description-toggle"]').trigger('click');
      await nextTick();

      // Collapse
      await wrapper.find('[data-testid="description-toggle"]').trigger('click');
      await nextTick();

      const descInput = wrapper.find('[data-testid="description-input"]');
      expect(descInput.exists()).toBe(false);
    });

    it('saisie description est persistée dans le header', async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      store.addHeader({
        key: 'Authorization',
        value: 'Bearer token',
        enabled: true,
        description: '',
      });
      await nextTick();

      // Expand description
      await wrapper.find('[data-testid="description-toggle"]').trigger('click');
      await nextTick();

      // Saisir description
      const descInput = wrapper.find('[data-testid="description-input"]');
      await descInput.setValue('Token pour authentification API');
      await nextTick();

      // Vérifier persistance
      const header = store.currentRequest.headers[0];
      expect(header.description).toBe('Token pour authentification API');
    });
  });

  describe('Icône ℹ️ indiquant description', () => {
    it('affiche icône info quand header a une description', async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      store.addHeader({
        key: 'X-API-Key',
        value: 'secret123',
        enabled: true,
        description: 'Clé API production',
      });
      await nextTick();

      const infoIcon = wrapper.find('[data-testid="description-icon"]');
      expect(infoIcon.exists()).toBe(true);
    });

    it("n'affiche pas icône quand header sans description", async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      store.addHeader({ key: 'X-No-Desc', value: 'test', enabled: true });
      await nextTick();

      const infoIcon = wrapper.find('[data-testid="description-icon"]');
      expect(infoIcon.exists()).toBe(false);
    });

    it('icône visible même quand description collapsée', async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      store.addHeader({
        key: 'X-Custom',
        value: 'val',
        enabled: true,
        description: 'Description présente',
      });
      await nextTick();

      // Description collapsed by default
      const infoIcon = wrapper.find('[data-testid="description-icon"]');
      expect(infoIcon.exists()).toBe(true);
    });
  });

  describe('Tooltip au hover', () => {
    it('affiche tooltip avec description au hover sur header row', async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      store.addHeader({
        key: 'Content-Type',
        value: 'application/json',
        enabled: true,
        description: 'Type de contenu JSON',
      });
      await nextTick();

      // Vérifier présence de l'attribut title ou data-tooltip
      const headerRow = wrapper.find('[data-testid="manual-header-row"]');
      expect(
        headerRow.attributes('title') || headerRow.find('[data-testid="header-tooltip"]').exists()
      ).toBeTruthy();
    });

    it('tooltip contient le texte de la description', async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      const descText = "Description importante pour l'API";
      store.addHeader({
        key: 'X-Important',
        value: 'value',
        enabled: true,
        description: descText,
      });
      await nextTick();

      const headerRow = wrapper.find('[data-testid="manual-header-row"]');
      const titleAttr = headerRow.attributes('title');

      if (titleAttr) {
        expect(titleAttr).toContain(descText);
      }
    });

    it('pas de tooltip quand pas de description', async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      store.addHeader({ key: 'X-No-Tooltip', value: 'test', enabled: true });
      await nextTick();

      const headerRow = wrapper.find('[data-testid="manual-header-row"]');
      const titleAttr = headerRow.attributes('title');

      // Soit pas de title, soit title ne contient pas "Description"
      if (titleAttr) {
        expect(titleAttr).not.toContain('Description');
      }
    });
  });

  describe('Persistance dans la sauvegarde', () => {
    it('description incluse dans les headers du store', async () => {
      const store = useRequestStore();

      store.addHeader({
        key: 'X-Test',
        value: 'value',
        enabled: true,
        description: 'Description test',
      });

      const header = store.currentRequest.headers[0];
      expect(header).toHaveProperty('description');
      expect(header.description).toBe('Description test');
    });

    it('description survie après modification autre champ', async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      store.addHeader({
        key: 'X-Test',
        value: 'initial',
        enabled: true,
        description: 'Ma description',
      });
      await nextTick();

      // Modifier la valeur
      const headerRows = wrapper.findAll('[data-testid="manual-header-row"]');
      const valueInput = headerRows[0].find('input[placeholder="Value"]');
      await valueInput.setValue('nouvelle valeur');
      await nextTick();

      // Vérifier description intacte
      const header = store.currentRequest.headers[0];
      expect(header.description).toBe('Ma description');
    });

    it('description null/undefined quand non définie', async () => {
      const store = useRequestStore();

      store.addHeader({ key: 'X-No-Desc', value: 'test', enabled: true });

      const header = store.currentRequest.headers[0];
      expect(header.description).toBeFalsy();
    });
  });

  describe('Integration avec autres fonctionnalités', () => {
    it('description préservée en mode bulk edit', async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      store.addHeader({
        key: 'X-Custom',
        value: 'val',
        enabled: true,
        description: 'Description à préserver',
      });
      await nextTick();

      // Toggle vers bulk
      await wrapper.find('[data-testid="bulk-edit-toggle"]').trigger('click');
      await nextTick();

      // Toggle retour table
      await wrapper.find('[data-testid="bulk-edit-toggle"]').trigger('click');
      await nextTick();

      // Vérifier description intacte
      const header = store.currentRequest.headers[0];
      expect(header.description).toBe('Description à préserver');
    });

    it('description affichée avec badge override', async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      store.setBodyType('raw');
      store.setRawContentType('application/json');
      await nextTick();

      store.addHeader({
        key: 'Content-Type',
        value: 'text/html',
        enabled: true,
        description: 'Override pour HTML',
      });
      await nextTick();

      // Vérifier que les deux éléments sont présents
      const headerRow = wrapper.find('[data-testid="manual-header-row"]');
      expect(headerRow.find('[data-testid="override-badge"]').exists()).toBe(true);
      expect(headerRow.find('[data-testid="description-icon"]').exists()).toBe(true);
    });
  });
});
