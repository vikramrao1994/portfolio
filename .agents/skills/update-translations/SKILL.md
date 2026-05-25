---
name: update-translations
description: Use when modifying, renaming, or removing existing translation keys in en.json or de.json.
---

# Update Translations

## Steps
1. Find the key in `messages/en.json`
2. Apply the same change to `messages/de.json`
3. Search for all usages: `useTranslations('Namespace')` + `t('key')` calls
4. Update component call sites if the key was renamed or removed

## Rename pattern
```bash
# Find all usages of a translation key
grep -r "t('oldKey')" src/
grep -r '"oldKey"' messages/
```

## Constraints
- Always update both language files together — never one without the other
- After renaming a key, update every component that calls `t('oldKey')`
- After removing a key, verify no component still references it
- Namespace changes require updating all `useTranslations('OldNamespace')` calls

## Files
- `messages/en.json`
- `messages/de.json`
- Any component using the changed key

## Anti-Patterns
- Updating only one language file
- Leaving orphaned `t('key')` calls after removing a key
- Duplicating keys across namespaces instead of sharing
