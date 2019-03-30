/**
 * @module components/settings/show/encryption/Key
 */
import {View} from 'backbone.marionette';
import _ from 'underscore';
import Radio from 'backbone.radio';

/**
 * Show private/public key information.
 *
 * @class
 * @extends Marionette.View
 * @license MPL-2.0
 */
export default class Key extends View {

    get template() {
        const tmpl = require('./key.html');
        return _.template(tmpl);
    }

    get className() {
        return 'modal fade';
    }

    ui() {
        return {
            text: 'textarea',
        };
    }

    events() {
        return {
            'focus @ui.text'    : 'selectAll',
            'click .btn--cancel': 'destroy',
            'click .btn--close' : 'close',
        };
    }

    /**
     * Select everything in the textarea.
     */
    selectAll() {
        this.ui.text.select();
    }

    serializeData() {
        return this.options;
    }

    initialize() {
        this.user = Radio.request('collections/Profiles', 'getUser');
        this.key = Radio.request('components/Encryption', 'getUserKeys').privateKey;
    }


    templateContext() {
        return {
            key: this.key,

            /**
             * Show armored key.
             *
             * @returns {String}
             */
            getArmor() {
                const key = this.key.isPrivate() ? this.key.toPublic() : this.key;
                return key.armor();
            },

            /**
             * Return key fingerprint.
             *
             * @returns {String}
             */
            getFingerprint() {
                return _.splitBy4(this.key.getFingerprint());
            },
        };
    }

}
