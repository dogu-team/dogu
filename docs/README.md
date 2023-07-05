## Init this project

1. Global install yarn
2. Enter `yarn newbie`
3. Enter `yarn dev`

### About multi language

- https://github.com/facebook/docusaurus/issues/7377

### How to translate sidebar(`_category_.json`)?

Before localization, at lease one page should exist in that sidebar.

1. Create `_category_.json` in default language(en) docs
2. Enter label(ex. `Browser`)
3. Add `_category_.json` in i18n(ko) docs(copy and paste from english docs)
4. `yarn write-translations`
5. Edit **i18n** docs `_category_.json` label to auto-generated translation key with modified message.
