const Clutter = imports.gi.Clutter;


// =====================================================================
// @@@ Signal Manager
// =====================================================================
var SignalManager = class {
    constructor () {
        this.signals = [];
    }

    clear () {
        this.disconnect_all();
        this.signals = [];
    }

    clear_obj (obj) {
        this.disconnect_obj(obj);

        for (let i = 0, len = this.signals.length; i < len; i++) {
            if (this.signals[i].obj === obj) {
                this.signals.slice(i, 1);
                len--; i--;
            }
        }
    }

    // @obj                     : object (we connect on)
    // @button                  : event button (e.g., Clutter.BUTTON_PRIMARY)
    // @do_connect_on_key_press : bool
    // @callback                : function
    //
    // The 'clicked' signal allows one to connect on mouse and keyboard clicks
    // but only on release.
    // The purpose of this function is to replicate the 'clicked' sig but for
    // press, not release.
    connect_press (obj, button, do_connect_on_key_press, callback) {
        let block_on_release = true;

        this.connect(obj, 'button-press-event', (_, event) => {
            if (event.get_button() === button) {
                block_on_release = false;
                callback();
            }
        });

        // We listen on the release event too in order to allow the user to
        // click the panel item to open the menu, hold the mouse presed and
        // release over the icon they want to open.
        this.connect(obj, 'button-release-event', (_, event) => {
            if (event.get_button() === button) {
                if (block_on_release) callback();
                else                  block_on_release = true;
            }
        });

        if (do_connect_on_key_press) {
            this.connect(obj, 'key-press-event', (_, event) => {
                if (event.get_key_symbol() === Clutter.Return) callback();
            });
        }

        obj.connect('destroy', () => this.clear_obj(obj));
    }

    connect (obj, sig_name, callback) {
        let id = obj.connect(sig_name, callback);

        this.signals.push({
            obj      : obj,
            sig_name : sig_name,
            callback : callback,
            id       : id,
        });

        return id;
    }

    disconnect_obj (obj) {
        for (let it of this.signals) {
            if (it.obj === obj && it.id > 0) {
                it.obj.disconnect(it.id);
                it.id = 0;
            }
        }
    }

    disconnect (id) {
        for (let it of this.signals) {
            if (it.id === id) {
                it.obj.disconnect(id);
                it.id = 0;
                break;
            }
        }
    }

    connect_all () {
        for (let it of this.signals) {
            if (it.id === 0) {
                it.id = it.obj.connect(it.sig_name, it.callback);
            }
        }
    }

    disconnect_all () {
        for (let it of this.signals) {
            if (it.id > 0) {
                it.obj.disconnect(it.id);
                it.id = 0;
            }
        }
    }
};
