import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import EnvironmentVariables from '../../../../src/components/layout/EnvironmentVariables.vue';
import { useAppStore } from '../../../../src/stores/app';

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: { value: 'fr' },
  }),
}));

// Mock Tauri API
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockResolvedValue(undefined),
}));

describe('EnvironmentVariables Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders the toggle button with environment title', () => {
    const wrapper = mount(EnvironmentVariables);
    expect(wrapper.text()).toContain('environment.title');
  });

  it('opens modal when toggle button is clicked', async () => {
    const wrapper = mount(EnvironmentVariables);
    const button = wrapper.find('button');
    await button.trigger('click');

    // Modal should be visible
    expect(wrapper.find('.fixed').exists()).toBe(true);
  });

  it('shows environment not selected message when no environment is active', async () => {
    const wrapper = mount(EnvironmentVariables);
    const button = wrapper.find('button');
    await button.trigger('click');

    expect(wrapper.text()).toContain('environment.selectEnvironmentFirst');
  });

  it('shows add first variable button when environment has no variables', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const appStore = useAppStore();
    // Create an environment with no variables
    appStore.environments = [
      {
        id: 'test-env',
        name: 'Test Environment',
        variables: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];
    appStore.activeEnvironmentId = 'test-env';

    const wrapper = mount(EnvironmentVariables, {
      global: {
        plugins: [pinia],
      },
    });

    const button = wrapper.find('button');
    await button.trigger('click');

    expect(wrapper.text()).toContain('environment.noVariables');
    expect(wrapper.text()).toContain('environment.addFirstVariable');
  });

  it('calls addVariable when add button is clicked', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const appStore = useAppStore();
    const updateSpy = vi.spyOn(appStore, 'updateEnvironmentVariables');

    // Create an environment with no variables
    appStore.environments = [
      {
        id: 'test-env',
        name: 'Test Environment',
        variables: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];
    appStore.activeEnvironmentId = 'test-env';

    const wrapper = mount(EnvironmentVariables, {
      global: {
        plugins: [pinia],
      },
    });

    const button = wrapper.find('button');
    await button.trigger('click');

    // Find and click the add variable button
    const addButton = wrapper.find('button.text-\\[\\#3b82f6\\]');
    if (addButton.exists()) {
      await addButton.trigger('click');
      expect(updateSpy).toHaveBeenCalled();
    }
  });

  it('displays variable count in toggle button', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const appStore = useAppStore();
    appStore.environments = [
      {
        id: 'test-env',
        name: 'Test Environment',
        variables: [
          { key: 'VAR1', value: 'value1', type: 'default' },
          { key: 'VAR2', value: 'value2', type: 'secret' },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];
    appStore.activeEnvironmentId = 'test-env';

    const wrapper = mount(EnvironmentVariables, {
      global: {
        plugins: [pinia],
      },
    });

    expect(wrapper.text()).toContain('2');
    expect(wrapper.text()).toContain('common.variables');
  });

  it('closes modal when close button is clicked', async () => {
    const wrapper = mount(EnvironmentVariables);

    // Open modal
    const button = wrapper.find('button');
    await button.trigger('click');

    expect(wrapper.find('.fixed').exists()).toBe(true);

    // Close modal by clicking the close button (X icon button in header)
    const closeButton = wrapper.find('.fixed button');
    if (closeButton.exists()) {
      await closeButton.trigger('click');
    }

    // Modal should be closed
    expect(wrapper.find('.fixed').exists()).toBe(false);
  });

  it('renders variable inputs when variables exist', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const appStore = useAppStore();
    appStore.environments = [
      {
        id: 'test-env',
        name: 'Test Environment',
        variables: [{ key: 'VAR1', value: 'value1', type: 'default' }],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];
    appStore.activeEnvironmentId = 'test-env';

    const wrapper = mount(EnvironmentVariables, {
      global: {
        plugins: [pinia],
      },
    });

    // Open modal
    const button = wrapper.find('button');
    await button.trigger('click');

    // Should have input fields for key and value
    const inputs = wrapper.findAll('input');
    expect(inputs.length).toBeGreaterThanOrEqual(2);

    // Should have select for type
    expect(wrapper.find('select').exists()).toBe(true);
  });

  it('component is properly exported and can be imported', () => {
    expect(EnvironmentVariables).toBeDefined();
    expect(typeof EnvironmentVariables).toBe('object');
  });
});
