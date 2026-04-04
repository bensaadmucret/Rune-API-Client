import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import HeaderAutocomplete from '../../../../src/components/request/HeaderAutocomplete.vue';

// Mock Tauri API
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

describe('UC-001: Header Autocomplete', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('Dropdown avec suggestions', () => {
    it('affiche le dropdown quand on tape dans le champ Key', async () => {
      const wrapper = mount(HeaderAutocomplete, {
        props: { modelValue: '' },
      });

      const input = wrapper.find('input');
      await input.setValue('cont');
      await input.trigger('input');
      await nextTick();

      const dropdown = wrapper.find('.absolute');
      expect(dropdown.exists()).toBe(true);
      expect(dropdown.isVisible()).toBe(true);
    });

    it('affiche le dropdown au focus', async () => {
      const wrapper = mount(HeaderAutocomplete, {
        props: { modelValue: '' },
      });

      const input = wrapper.find('input');
      await input.trigger('focus');
      await nextTick();

      const dropdown = wrapper.find('.absolute');
      expect(dropdown.exists()).toBe(true);
      expect(dropdown.isVisible()).toBe(true);
    });
  });

  describe('Liste prédéfinie de headers HTTP', () => {
    it('contient Content-Type dans les suggestions (avec filtre)', async () => {
      const wrapper = mount(HeaderAutocomplete, {
        props: { modelValue: '' },
      });

      const input = wrapper.find('input');
      await input.setValue('content-type');
      await input.trigger('input');
      await nextTick();

      const suggestions = wrapper.findAll('.header-suggestion');
      const suggestionTexts = suggestions.map(s => s.text());

      expect(suggestionTexts.some(t => t.includes('Content-Type'))).toBe(true);
    });

    it('contient Authorization dans les suggestions', async () => {
      const wrapper = mount(HeaderAutocomplete, {
        props: { modelValue: '' },
      });

      const input = wrapper.find('input');
      await input.trigger('focus');
      await nextTick();

      const suggestions = wrapper.findAll('.header-suggestion');
      const suggestionTexts = suggestions.map(s => s.text());

      expect(suggestionTexts.some(t => t.includes('Authorization'))).toBe(true);
    });

    it('contient Accept dans les suggestions', async () => {
      const wrapper = mount(HeaderAutocomplete, {
        props: { modelValue: '' },
      });

      const input = wrapper.find('input');
      await input.trigger('focus');
      await nextTick();

      const suggestions = wrapper.findAll('.header-suggestion');
      const suggestionTexts = suggestions.map(s => s.text());

      expect(suggestionTexts.some(t => t.includes('Accept'))).toBe(true);
    });

    it('contient User-Agent dans les suggestions (avec filtre)', async () => {
      const wrapper = mount(HeaderAutocomplete, {
        props: { modelValue: '' },
      });

      const input = wrapper.find('input');
      await input.setValue('user-agent');
      await input.trigger('input');
      await nextTick();

      const suggestions = wrapper.findAll('.header-suggestion');
      const suggestionTexts = suggestions.map(s => s.text());

      expect(suggestionTexts.some(t => t.includes('User-Agent'))).toBe(true);
    });
  });

  describe('Filtre intelligent des suggestions', () => {
    it('filtre les suggestions quand on tape "cont"', async () => {
      const wrapper = mount(HeaderAutocomplete, {
        props: { modelValue: '' },
      });

      const input = wrapper.find('input');
      await input.setValue('cont');
      await input.trigger('input');
      await nextTick();

      const suggestions = wrapper.findAll('.header-suggestion');
      const suggestionTexts = suggestions.map(s => s.text().toLowerCase());

      // Devrait suggérer Content-Type, Content-Length
      expect(suggestionTexts.some(t => t.includes('content-type'))).toBe(true);
      expect(suggestionTexts.some(t => t.includes('content-length'))).toBe(true);
    });

    it('filtre insensible à la casse', async () => {
      const wrapper = mount(HeaderAutocomplete, {
        props: { modelValue: '' },
      });

      const input = wrapper.find('input');
      await input.setValue('CONTENT');
      await input.trigger('input');
      await nextTick();

      const suggestions = wrapper.findAll('.header-suggestion');
      const suggestionTexts = suggestions.map(s => s.text().toLowerCase());

      expect(suggestionTexts.some(t => t.includes('content'))).toBe(true);
    });

    it('limite les résultats à 10 suggestions maximum', async () => {
      const wrapper = mount(HeaderAutocomplete, {
        props: { modelValue: '' },
      });

      const input = wrapper.find('input');
      await input.trigger('focus');
      await nextTick();

      const suggestions = wrapper.findAll('.header-suggestion');
      expect(suggestions.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Navigation clavier et Tab pour autocompléter', () => {
    it('sélectionne la suggestion avec Tab', async () => {
      const wrapper = mount(HeaderAutocomplete, {
        props: { modelValue: '' },
      });

      const input = wrapper.find('input');
      await input.trigger('focus');
      await nextTick();

      // Press Tab to select first suggestion
      await input.trigger('keydown', { key: 'Tab' });
      await nextTick();

      // Should emit update:modelValue with selected header
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    });

    it('navigue avec les flèches haut/bas', async () => {
      const wrapper = mount(HeaderAutocomplete, {
        props: { modelValue: '' },
      });

      const input = wrapper.find('input');
      await input.trigger('focus');
      await nextTick();

      // Press ArrowDown
      await input.trigger('keydown', { key: 'ArrowDown' });
      await nextTick();

      const selectedItem = wrapper.find('.header-suggestion.selected');
      expect(selectedItem.exists()).toBe(true);
    });

    it('sélectionne avec Enter', async () => {
      const wrapper = mount(HeaderAutocomplete, {
        props: { modelValue: '' },
      });

      const input = wrapper.find('input');
      await input.trigger('focus');
      await nextTick();

      await input.trigger('keydown', { key: 'Enter' });
      await nextTick();

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('select')).toBeTruthy();
    });

    it('ferme le dropdown avec Escape', async () => {
      const wrapper = mount(HeaderAutocomplete, {
        props: { modelValue: '' },
      });

      const input = wrapper.find('input');
      await input.trigger('focus');
      await nextTick();

      expect(wrapper.find('.absolute').exists()).toBe(true);

      await input.trigger('keydown', { key: 'Escape' });
      await nextTick();

      expect(wrapper.find('.absolute').exists()).toBe(false);
    });
  });

  describe('Descriptions des headers', () => {
    it('affiche la description du header Content-Type', async () => {
      const wrapper = mount(HeaderAutocomplete, {
        props: { modelValue: '' },
      });

      const input = wrapper.find('input');
      await input.setValue('Content-Type');
      await input.trigger('input');
      await nextTick();

      const suggestions = wrapper.findAll('.header-suggestion');
      const contentTypeSuggestion = suggestions.find(s => s.text().includes('Content-Type'));

      expect(contentTypeSuggestion).toBeDefined();
      expect(contentTypeSuggestion!.text()).toContain('Media type');
    });
  });
});
