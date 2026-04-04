import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import HeaderValueAutocomplete from '../../../../src/components/request/HeaderValueAutocomplete.vue';

// Mock Tauri API
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

describe('UC-001: Header Value Autocomplete', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('HeaderValueAutocomplete Component', () => {
    it('renders input field with placeholder', () => {
      const wrapper = mount(HeaderValueAutocomplete, {
        props: {
          modelValue: '',
          headerKey: '',
          placeholder: 'Value',
        },
      });

      const input = wrapper.find('input');
      expect(input.exists()).toBe(true);
      expect(input.attributes('placeholder')).toBe('Value');
    });

    it('shows dropdown with common values for Content-Type header', async () => {
      const wrapper = mount(HeaderValueAutocomplete, {
        props: {
          modelValue: '',
          headerKey: 'Content-Type',
        },
      });

      const input = wrapper.find('input');
      await input.trigger('focus');
      await nextTick();

      const dropdown = wrapper.find('.absolute');
      expect(dropdown.exists()).toBe(true);

      const suggestions = wrapper.findAll('.value-suggestion');
      const suggestionTexts = suggestions.map(s => s.text());

      // Check for common Content-Type values
      expect(suggestionTexts.some(t => t.includes('application/json'))).toBe(true);
      expect(suggestionTexts.some(t => t.includes('application/xml'))).toBe(true);
      expect(suggestionTexts.some(t => t.includes('text/html'))).toBe(true);
    });

    it('shows dropdown with common values for Authorization header', async () => {
      const wrapper = mount(HeaderValueAutocomplete, {
        props: {
          modelValue: '',
          headerKey: 'Authorization',
        },
      });

      const input = wrapper.find('input');
      await input.trigger('focus');
      await nextTick();

      const suggestions = wrapper.findAll('.value-suggestion');
      const suggestionTexts = suggestions.map(s => s.text());

      // Check for common Authorization values
      expect(suggestionTexts.some(t => t.includes('Bearer'))).toBe(true);
      expect(suggestionTexts.some(t => t.includes('Basic'))).toBe(true);
    });

    it('does not show dropdown for unknown headers', async () => {
      const wrapper = mount(HeaderValueAutocomplete, {
        props: {
          modelValue: '',
          headerKey: 'X-Custom-Header',
        },
      });

      const input = wrapper.find('input');
      await input.trigger('focus');
      await nextTick();

      const dropdown = wrapper.find('.absolute');
      expect(dropdown.exists()).toBe(false);
    });

    it('filters values based on input', async () => {
      const wrapper = mount(HeaderValueAutocomplete, {
        props: {
          modelValue: '',
          headerKey: 'Content-Type',
        },
      });

      const input = wrapper.find('input');
      await input.setValue('json');
      await input.trigger('input');
      await nextTick();

      const suggestions = wrapper.findAll('.value-suggestion');
      const hasJson = suggestions.some(s => s.text().includes('json'));
      expect(hasJson).toBe(true);
    });

    it('emits update:modelValue when value is selected', async () => {
      const wrapper = mount(HeaderValueAutocomplete, {
        props: {
          modelValue: '',
          headerKey: 'Content-Type',
        },
      });

      const input = wrapper.find('input');
      await input.trigger('focus');
      await nextTick();

      const firstSuggestion = wrapper.find('.value-suggestion');
      if (firstSuggestion.exists()) {
        await firstSuggestion.trigger('click');
        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      }
    });

    it('handles case-insensitive header key matching', async () => {
      const wrapper = mount(HeaderValueAutocomplete, {
        props: {
          modelValue: '',
          headerKey: 'content-type', // lowercase
        },
      });

      const input = wrapper.find('input');
      await input.trigger('focus');
      await nextTick();

      const dropdown = wrapper.find('.absolute');
      expect(dropdown.exists()).toBe(true);
    });

    it('shows value descriptions', async () => {
      const wrapper = mount(HeaderValueAutocomplete, {
        props: {
          modelValue: '',
          headerKey: 'Content-Type',
        },
      });

      const input = wrapper.find('input');
      await input.trigger('focus');
      await nextTick();

      const descriptions = wrapper.findAll('.text-xs');
      // Should have descriptions for values
      expect(descriptions.length).toBeGreaterThan(0);
    });
  });
});
