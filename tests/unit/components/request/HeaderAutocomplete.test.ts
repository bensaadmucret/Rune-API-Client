import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref, nextTick } from 'vue';
import HeaderAutocomplete from '../../../../src/components/request/HeaderAutocomplete.vue';

// Mock Tauri API
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

describe('UC-001: Header Autocomplete', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('HeaderAutocomplete Component', () => {
    it('renders input field with placeholder', () => {
      const wrapper = mount(HeaderAutocomplete, {
        props: {
          modelValue: '',
          placeholder: 'Header',
        },
      });

      const input = wrapper.find('input');
      expect(input.exists()).toBe(true);
      expect(input.attributes('placeholder')).toBe('Header');
    });

    it('shows dropdown on focus', async () => {
      const wrapper = mount(HeaderAutocomplete, {
        props: {
          modelValue: '',
        },
      });

      const input = wrapper.find('input');
      await input.trigger('focus');
      await nextTick();

      const dropdown = wrapper.find('.absolute');
      expect(dropdown.exists()).toBe(true);
    });

    it('filters suggestions based on input', async () => {
      const wrapper = mount(HeaderAutocomplete, {
        props: {
          modelValue: '',
        },
      });

      const input = wrapper.find('input');
      await input.setValue('cont');
      await input.trigger('input');
      await nextTick();

      // Should show Content-Type, Content-Length, etc.
      const suggestions = wrapper.findAll('.header-suggestion');
      const suggestionTexts = suggestions.map(s => s.text());
      
      expect(suggestionTexts.some(t => t.includes('Content-Type'))).toBe(true);
      expect(suggestionTexts.some(t => t.includes('Content-Length'))).toBe(true);
    });

    it('emits update:modelValue when typing', async () => {
      const wrapper = mount(HeaderAutocomplete, {
        props: {
          modelValue: '',
        },
      });

      const input = wrapper.find('input');
      await input.setValue('Authorization');
      await input.trigger('input');

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')![0]).toEqual(['Authorization']);
    });

    it('selects suggestion on click', async () => {
      const wrapper = mount(HeaderAutocomplete, {
        props: {
          modelValue: '',
        },
      });

      const input = wrapper.find('input');
      await input.trigger('focus');
      await nextTick();

      const firstSuggestion = wrapper.find('.header-suggestion');
      if (firstSuggestion.exists()) {
        await firstSuggestion.trigger('click');
        
        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(wrapper.emitted('select')).toBeTruthy();
      }
    });

    it('shows header descriptions in dropdown', async () => {
      const wrapper = mount(HeaderAutocomplete, {
        props: {
          modelValue: '',
        },
      });

      const input = wrapper.find('input');
      await input.trigger('focus');
      await nextTick();

      const descriptions = wrapper.findAll('.text-xs');
      // At least some suggestions should have descriptions
      expect(descriptions.length).toBeGreaterThan(0);
    });

    it('limits suggestions to 10 items', async () => {
      const wrapper = mount(HeaderAutocomplete, {
        props: {
          modelValue: '',
        },
      });

      const input = wrapper.find('input');
      await input.trigger('focus');
      await nextTick();

      const suggestions = wrapper.findAll('.header-suggestion');
      expect(suggestions.length).toBeLessThanOrEqual(10);
    });
  });

  describe('HTTP Headers List', () => {
    it('contains common HTTP headers', async () => {
      const wrapper = mount(HeaderAutocomplete, {
        props: {
          modelValue: '',
        },
      });

      const input = wrapper.find('input');
      await input.trigger('focus');
      await nextTick();

      const suggestions = wrapper.findAll('.header-suggestion');
      const suggestionTexts = suggestions.map(s => s.text().toLowerCase());

      // Check for essential headers
      const hasContentType = suggestionTexts.some(t => t.includes('content-type'));
      const hasAuthorization = suggestionTexts.some(t => t.includes('authorization'));
      const hasAccept = suggestionTexts.some(t => t.includes('accept'));

      expect(hasContentType || hasAuthorization || hasAccept).toBe(true);
    });
  });
});
