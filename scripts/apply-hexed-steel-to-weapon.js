// Apply Hexed Steel to Pact Weapon
// Version: 0.1.9
//
// Select the Soul Blade token or assign the Soul Blade actor as your user character.
// This duplicates one weapon attack activity and adds the correct Hexed Steel damage die.

const actor = canvas.tokens?.controlled?.[0]?.actor ?? game.user.character;
if (!actor) {
  ui.notifications.warn("Select a Soul Blade token or assign a character to your user.");
  return;
}

const warlockClass = actor.items.find(i => i.type === "class" && (i.system?.identifier === "warlock" || i.name.toLowerCase() === "warlock"));
const warlockLevel = Number(warlockClass?.system?.levels ?? actor.system?.classes?.warlock?.levels ?? 0);

if (warlockLevel < 6) {
  ui.notifications.warn("Hexed Steel is available at Warlock level 6.");
  return;
}

const die = warlockLevel >= 14 ? "d12" : warlockLevel >= 10 ? "d8" : "d6";
const dieNumber = die === "d12" ? 12 : die === "d8" ? 8 : 6;

const weapons = actor.items.filter(i => i.type === "weapon");
if (!weapons.length) {
  ui.notifications.warn(`${actor.name} has no weapon items.`);
  return;
}

const preferred = weapons.find(w => /pact|longsword|long sword/i.test(w.name)) ?? weapons[0];
const options = weapons.map(w => {
  const selected = w.id === preferred.id ? "selected" : "";
  return `<option value="${w.id}" ${selected}>${w.name}</option>`;
}).join("");

const content = `
<form>
  <div class="form-group">
    <label>Pact Weapon</label>
    <select name="weaponId">${options}</select>
  </div>
  <p>This adds a duplicate attack activity to the selected weapon with <strong>+1${die} Necrotic</strong> Hexed Steel damage.</p>
  <p>Older Hexed Steel duplicate attacks on the selected weapon are removed before the new one is added.</p>
</form>`;

async function removeHexedSteelActivities(weapon) {
  const data = weapon.toObject();
  const activities = foundry.utils.deepClone(data.system?.activities ?? {});
  let removed = 0;

  for (const [id, activity] of Object.entries(activities)) {
    const name = String(activity.name ?? "");
    const flavor = String(activity.description?.chatFlavor ?? "");
    if (name.includes("Hexed Steel") || flavor.includes("Hexed Steel")) {
      delete activities[id];
      removed++;
    }
  }

  if (removed) await weapon.update({ "system.activities": activities });
  return removed;
}

async function applyHexedSteel(weapon) {
  const data = weapon.toObject();
  const activities = foundry.utils.deepClone(data.system?.activities ?? {});
  const attackEntries = Object.entries(activities).filter(([id, activity]) => activity?.type === "attack" && !String(activity.name ?? "").includes("Hexed Steel"));

  if (!attackEntries.length) {
    ui.notifications.warn(`${weapon.name} has no attack activities to duplicate.`);
    return;
  }

  for (const [id, activity] of Object.entries(activities)) {
    const name = String(activity.name ?? "");
    const flavor = String(activity.description?.chatFlavor ?? "");
    if (name.includes("Hexed Steel") || flavor.includes("Hexed Steel")) delete activities[id];
  }

  const [baseId, baseActivity] = attackEntries[0];
  const clone = foundry.utils.deepClone(baseActivity);
  const newId = foundry.utils.randomID(16);

  clone._id = newId;
  clone.name = `${baseActivity.name || weapon.name} + Hexed Steel (1${die})`;
  clone.sort = Number(baseActivity.sort ?? 0) + 1;
  clone.description ??= {};
  clone.description.chatFlavor = `${baseActivity.description?.chatFlavor ?? ""} Hexed Steel: once per turn, add 1${die} Necrotic damage on a qualifying melee weapon hit while the target is inside your Hex Aura.`.trim();

  clone.damage ??= {};
  clone.damage.parts ??= [];
  clone.damage.parts.push({
    number: 1,
    denomination: dieNumber,
    bonus: "",
    types: ["necrotic"],
    custom: { enabled: false, formula: "" },
    scaling: { mode: "", number: null, formula: "" }
  });

  activities[newId] = clone;
  await weapon.update({ "system.activities": activities });

  ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<h2>Hexed Steel Applied</h2>
<p><strong>Actor:</strong> ${actor.name}</p>
<p><strong>Weapon:</strong> ${weapon.name}</p>
<p><strong>Added attack:</strong> ${clone.name}</p>
<p>The player can now choose either the normal attack or the Hexed Steel attack from the weapon item.</p>`
  });

  ui.notifications.info(`Added Hexed Steel attack to ${weapon.name}.`);
}

new Dialog({
  title: "Apply Hexed Steel to Pact Weapon",
  content,
  buttons: {
    apply: {
      label: "Apply",
      icon: '<i class="fas fa-wand-magic-sparkles"></i>',
      callback: async html => {
        const weaponId = html.find('[name="weaponId"]').val();
        const weapon = actor.items.get(weaponId);
        if (!weapon) return ui.notifications.warn("Could not find selected weapon.");
        await applyHexedSteel(weapon);
      }
    },
    remove: {
      label: "Remove Existing",
      icon: '<i class="fas fa-trash"></i>',
      callback: async html => {
        const weaponId = html.find('[name="weaponId"]').val();
        const weapon = actor.items.get(weaponId);
        if (!weapon) return ui.notifications.warn("Could not find selected weapon.");
        const removed = await removeHexedSteelActivities(weapon);
        ui.notifications.info(`Removed ${removed} Hexed Steel attack(s) from ${weapon.name}.`);
      }
    },
    cancel: { label: "Cancel" }
  },
  default: "apply"
}).render(true);
