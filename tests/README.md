# Test Infrastructure

## Structure

```
tests/
├── unit/
│   ├── components/
│   │   └── request/
│   │       ├── HeaderAutocomplete.test.ts      # UC-001: Header autocomplete
│   │       ├── HeaderValueAutocomplete.test.ts # UC-001: Value autocomplete
│   │       └── HeaderPresetManager.test.ts     # UC-002: Preset management UI
│   └── stores/
│       └── headerPresets.test.ts               # UC-002: Preset store logic
├── integration/                                 # (future) E2E tests
└── README.md                                    # This file
```

## Commands

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/unit/stores/headerPresets.test.ts
```

## Testing Guidelines

1. **Unit tests** for components should test:
   - Rendering with props
   - User interactions (clicks, inputs)
   - Emitted events
   - Conditional rendering

2. **Unit tests** for stores should test:
   - State initialization
   - Actions (load, create, update, delete)
   - Getters (computed properties)
   - Error handling

3. **Mock external dependencies**:
   - Tauri API (`@tauri-apps/api/core`)
   - vue-i18n for components

## Pinia Testing Best Practices

Based on our experience fixing the HeaderPresetManager tests:

1. **Use the same Pinia instance**: Create a helper function to get the store from the same Pinia instance used by the component:
   ```typescript
   const getStore = () => useHeaderPresetStore(pinia);
   ```

2. **Get store AFTER mounting**: In component tests, get the store after mounting to ensure the same reactive context:
   ```typescript
   const wrapper = mountComponent();
   const store = getStore();
   ```

3. **Avoid testing computed properties directly**: Pinia computed properties in component tests can be unreliable. Test the underlying data or the component behavior instead.

4. **Actions behavior**:
   - Load actions: should handle errors internally, update `error` state, NOT throw
   - Mutation actions: should update `error` state AND throw for caller handling

5. **No auto-load in stores**: Avoid auto-calling load actions at store initialization to keep tests predictable.

## UC Coverage

| UC | Test Files |
|----|-----------|
| UC-001 | `HeaderAutocomplete.test.ts`, `HeaderValueAutocomplete.test.ts` |
| UC-002 | `headerPresets.test.ts`, `HeaderPresetManager.test.ts` |
