const Meta  = imports.gi.Meta;
const Shell = imports.gi.Shell;
const Main  = imports.ui.main;

// =====================================================================
// @@@ KeybindingManager
//
// @settings: the extension settings object
// =====================================================================
var KeybindingManager = class {
    constructor (settings) {
        this.settings = settings;
        this.key_ids  = new Set();
    }

    add (id, callback) {
        this.key_ids.add(id);

        Main.wm.addKeybinding(
            id,
            this.settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.NORMAL | Shell.ActionMode.POPUP,
            callback
        );
    }

    clear () {
        for (let id of this.key_ids) Main.wm.removeKeybinding(id);
        this.key_ids.clear();
    }
};
