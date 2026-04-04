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

describe('UC-003: Auto-generated Headers', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('Section repliable des headers auto-générés', () => {
    it('affiche un bouton pour toggle la section auto-generated headers', async () => {
      const wrapper = mount(RequestTabs);

      const toggleBtn = wrapper.find('[data-testid="auto-headers-toggle"]');
      expect(toggleBtn.exists()).toBe(true);
    });

    it('masque par défaut les headers auto-générés', async () => {
      const wrapper = mount(RequestTabs);

      const autoHeadersSection = wrapper.find('[data-testid="auto-headers-section"]');
      expect(autoHeadersSection.exists()).toBe(false);
    });

    it('affiche les headers auto-générés après clic sur le toggle', async () => {
      const wrapper = mount(RequestTabs);

      const toggleBtn = wrapper.find('[data-testid="auto-headers-toggle"]');
      await toggleBtn.trigger('click');
      await nextTick();

      const autoHeadersSection = wrapper.find('[data-testid="auto-headers-section"]');
      expect(autoHeadersSection.exists()).toBe(true);
    });
  });

  describe('Calcul dynamique du Content-Length', () => {
    it('calcule Content-Length à partir du body', async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      // Simuler un body avec du contenu
      store.setBodyType('raw');
      store.setBody('{"test": "value"}');
      await nextTick();

      // Activer l'affichage des headers auto
      await wrapper.find('[data-testid="auto-headers-toggle"]').trigger('click');
      await nextTick();

      // Vérifier que Content-Length est présent dans le DOM
      const autoHeadersSection = wrapper.find('[data-testid="auto-headers-section"]');
      expect(autoHeadersSection.exists()).toBe(true);

      const inputs = wrapper.findAll('[data-testid="auto-header-input"]');
      const contentLengthInput = inputs.find(
        i => (i.element as HTMLInputElement).value === 'Content-Length'
      );
      expect(contentLengthInput).toBeDefined();
    });

    it('affiche Content-Length: 0 si bodyType est raw mais pas de body', async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      store.setBodyType('raw');
      store.setBody('');
      await nextTick();

      await wrapper.find('[data-testid="auto-headers-toggle"]').trigger('click');
      await nextTick();

      const autoHeadersSection = wrapper.find('[data-testid="auto-headers-section"]');
      expect(autoHeadersSection.exists()).toBe(true);

      const inputs = wrapper.findAll('[data-testid="auto-header-input"]');
      const contentLengthInput = inputs.find(
        i => (i.element as HTMLInputElement).value === 'Content-Length'
      );
      expect(contentLengthInput).toBeDefined();
    });
  });

  describe('Déduction du Content-Type depuis le body type', () => {
    it('déduit Content-Type: application/json pour bodyType=raw + rawContentType=application/json', async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      store.setBodyType('raw');
      store.setRawContentType('application/json');
      await nextTick();

      await wrapper.find('[data-testid="auto-headers-toggle"]').trigger('click');
      await nextTick();

      // Chercher l'input avec la valeur Content-Type
      const inputs = wrapper.findAll('[data-testid="auto-header-input"]');
      const contentTypeInput = inputs.find(
        i => (i.element as HTMLInputElement).value === 'Content-Type'
      );
      expect(contentTypeInput).toBeDefined();

      // Vérifier que l'input suivant (la valeur) contient application/json
      const contentTypeIndex = inputs.findIndex(
        i => (i.element as HTMLInputElement).value === 'Content-Type'
      );
      const valueInput = inputs[contentTypeIndex + 1];
      expect((valueInput.element as HTMLInputElement).value).toContain('application/json');
    });

    it('déduit Content-Type: multipart/form-data pour bodyType=formData', async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      store.setBodyType('formData');
      await nextTick();

      await wrapper.find('[data-testid="auto-headers-toggle"]').trigger('click');
      await nextTick();

      const inputs = wrapper.findAll('[data-testid="auto-header-input"]');
      const contentTypeInput = inputs.find(
        i => (i.element as HTMLInputElement).value === 'Content-Type'
      );
      expect(contentTypeInput).toBeDefined();

      const contentTypeIndex = inputs.findIndex(
        i => (i.element as HTMLInputElement).value === 'Content-Type'
      );
      const valueInput = inputs[contentTypeIndex + 1];
      expect((valueInput.element as HTMLInputElement).value).toContain('multipart/form-data');
    });

    it('déduit Content-Type: application/x-www-form-urlencoded pour bodyType=urlEncoded', async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      store.setBodyType('urlEncoded');
      await nextTick();

      await wrapper.find('[data-testid="auto-headers-toggle"]').trigger('click');
      await nextTick();

      const inputs = wrapper.findAll('[data-testid="auto-header-input"]');
      const contentTypeInput = inputs.find(
        i => (i.element as HTMLInputElement).value === 'Content-Type'
      );
      expect(contentTypeInput).toBeDefined();

      const contentTypeIndex = inputs.findIndex(
        i => (i.element as HTMLInputElement).value === 'Content-Type'
      );
      const valueInput = inputs[contentTypeIndex + 1];
      expect((valueInput.element as HTMLInputElement).value).toContain(
        'application/x-www-form-urlencoded'
      );
    });

    it('ne génère pas Content-Type pour bodyType=none', async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      store.setBodyType('none');
      await nextTick();

      await wrapper.find('[data-testid="auto-headers-toggle"]').trigger('click');
      await nextTick();

      const inputs = wrapper.findAll('[data-testid="auto-header-input"]');
      const contentTypeInput = inputs.find(
        i => (i.element as HTMLInputElement).value === 'Content-Type'
      );
      expect(contentTypeInput).toBeUndefined();
    });
  });

  describe('Headers auto grisés/désactivés visuellement', () => {
    it('affiche les headers auto avec classe opacity réduite', async () => {
      const wrapper = mount(RequestTabs);

      await wrapper.find('[data-testid="auto-headers-toggle"]').trigger('click');
      await nextTick();

      const autoHeaderRow = wrapper.find('[data-testid="auto-header-row"]');
      expect(autoHeaderRow.exists()).toBe(true);
      expect(autoHeaderRow.classes()).toContain('opacity-60');
    });

    it('rend les inputs des headers auto en readonly', async () => {
      const wrapper = mount(RequestTabs);

      await wrapper.find('[data-testid="auto-headers-toggle"]').trigger('click');
      await nextTick();

      const autoInputs = wrapper.findAll('[data-testid="auto-header-input"]');
      expect(autoInputs.length).toBeGreaterThan(0);
      autoInputs.forEach(input => {
        expect(input.attributes('readonly')).toBeDefined();
      });
    });
  });

  describe('Indication de source des headers auto', () => {
    it('affiche "from Body" pour Content-Type', async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      store.setBodyType('raw');
      store.setRawContentType('application/json');
      await nextTick();

      await wrapper.find('[data-testid="auto-headers-toggle"]').trigger('click');
      await nextTick();

      const autoHeadersSection = wrapper.find('[data-testid="auto-headers-section"]');
      expect(autoHeadersSection.text()).toContain('from Body');
    });

    it('affiche "from System" pour les headers système', async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      store.setBodyType('none');
      await nextTick();

      await wrapper.find('[data-testid="auto-headers-toggle"]').trigger('click');
      await nextTick();

      const autoHeadersSection = wrapper.find('[data-testid="auto-headers-section"]');
      expect(autoHeadersSection.text()).toContain('from System');
    });
  });

  describe('Désactivation individuelle des headers auto', () => {
    it('affiche une checkbox cliquable pour chaque header auto', async () => {
      const wrapper = mount(RequestTabs);

      await wrapper.find('[data-testid="auto-headers-toggle"]').trigger('click');
      await nextTick();

      const checkboxes = wrapper.findAll('[data-testid="auto-header-checkbox"]');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('désactive un header auto quand on clique sur sa checkbox', async () => {
      const wrapper = mount(RequestTabs);
      const store = useRequestStore();

      store.setBodyType('raw');
      store.setRawContentType('application/json');
      await nextTick();

      await wrapper.find('[data-testid="auto-headers-toggle"]').trigger('click');
      await nextTick();

      // Trouver la checkbox du premier header auto
      const checkbox = wrapper.find('[data-testid="auto-header-checkbox"]');
      expect(checkbox.exists()).toBe(true);

      // Cliquer pour désactiver
      await checkbox.trigger('click');
      await nextTick();

      // Vérifier que la checkbox n'est plus cochée (plus de bg bleu)
      expect(checkbox.classes()).not.toContain('bg-[#3b82f6]');
    });

    it('réactive un header auto désactivé quand on reclique', async () => {
      const wrapper = mount(RequestTabs);

      await wrapper.find('[data-testid="auto-headers-toggle"]').trigger('click');
      await nextTick();

      const checkbox = wrapper.find('[data-testid="auto-header-checkbox"]');

      // Désactiver puis réactiver
      await checkbox.trigger('click');
      await nextTick();
      await checkbox.trigger('click');
      await nextTick();

      // Vérifier que la checkbox est cochée
      expect(checkbox.classes()).toContain('bg-[#3b82f6]');
    });
  });
});
