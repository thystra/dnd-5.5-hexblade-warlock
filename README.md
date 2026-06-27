# Hexblade Patron Playtest

A local Foundry VTT module for Foundry v14 / dnd5e 5.3.3 containing a homebrew 2024-style Warlock subclass: **Hexblade Patron**.

## Contents

- One Item compendium: **Hexblade Patron Playtest: Items**
- Subclass item: **Hexblade Patron**
- Feature items for levels 3, 6, 10, and 14
- A level-14 Item Choice advancement for **Greater Hex**
- `CLEAN_COPY.md` with the full readable subclass text
- `source/hexblade-items.json` with editable JSON source for the pack contents

## Install

Use this link to install via Foundry web interface:
https://github.com/thystra/dnd-5-5-hexblade-warlock/releases/latest/download/module.json

Alternatively, download and extract the desired version and copy the `dnd-5-5-hexblade-warlock` folder into:

```text
{Foundry User Data}/Data/modules/
```

Then restart Foundry, enable **Hexblade Patron Playtest** in your world, and open the Compendium sidebar.

## Notes

This module uses a NetDB-style `.db` compendium pack for portability. Foundry v11+ migrates legacy `.db` packs into LevelDB format on load. If your server refuses to migrate the pack, the full item source is included at `source/hexblade-items.json` and can be imported manually into an Item compendium.

The patron spell list is included as a feature item, but spell grants are not automated because some listed spells may live in official/premium content modules or may not be present in the free SRD 5.2 compendium.

The subclass is intentionally playtest-first. Some features, especially Hex Aura targeting, Hex Charges, and Hexbound Specter behavior, are written as clean rules text rather than fully automated effects.

## Git workflow

For private/local development, make this module folder itself a git repository and keep it cloned directly under Foundry's user data modules directory:

```bash
cd /path/to/FoundryVTT/Data/modules/dnd-5-5-hexblade-warlock
git init
git add .
git commit -m "Initial Hexblade Patron module"
```

After changes, commit them, restart Foundry, and re-open the world. If Foundry has already migrated the legacy `.db` pack to a LevelDB folder, remove the generated `packs/hexblade-items/` folder before testing a freshly updated `.db` pack.



