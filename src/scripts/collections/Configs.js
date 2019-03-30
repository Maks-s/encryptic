/**
 * @module collections/Configs
 */
import _ from 'underscore';
import BaseCollection from './BaseCollection';
import Config from '../models/Config';
import {configNames} from './configNames';

/**
 * Config collection.
 *
 * @class
 * @extends module:collections/BaseCollection
 * @license MPL-2.0
 */

export default class Configs extends BaseCollection {

    /**
     * Config model.
     *
     * @returns {Object}
     */
    get model() {
        return Config;
    }

    /**
     * If current length of models is not equal to the length of
     * keys in configs property, there are new configs.
     *
     * @returns {Boolean} true if there are new configs
     */
    hasNewConfigs() {
        return (_.keys(configNames).length !== this.length);
    }

    /**
     * Create default set of configs.
     *
     * @returns {Promise} - fulfilled after all new configs are saved
     */
    createDefault() {
        const promises = [];

        // flaten keybindings
        _.each(configNames.keybindings, (value, name) => {
            const model = new this.model({name, value}, {profileId: this.profileId});
            this.add(model);
            promises.push(model.save());
        });

        _.each(configNames, (value, name) => {
            // If a model exists, do not override it with default values
            if (typeof this.get(name) !== 'undefined') {
                return;
            }

            if (name === 'keybindings') {
                return;
            }

            // Create a new config and save it
            const model = new this.model({name, value}, {profileId: this.profileId});
            this.add(model);
            promises.push(model.save());
        });

        return Promise.all(promises);
    }

    /**
     * Return an array of configs which are allowed to be exported.
     *
     * @returns {Array}
     */
    getExportData() {
        const excludeNames = ['dropboxAccessToken', 'deviceId'];
        let coll           = this.models;
        _.each(excludeNames, name => coll = _.without(coll, this.findWhere({name})));

        return coll;
    }

    /**
     * Transform models to key=value structure.
     *
     * @returns {Object}
     */
    getConfigs() {
        const data = {};

        _.each(this.models, model => {
            data[model.get('name')] = model.get('value');
        });

        if (typeof data.appProfiles === 'string') {
            data.appProfiles = JSON.parse(data.appProfiles);
        }

        return data;
    }

    /**
     * Return a model with the default values.
     *
     * @param {String} name
     * @returns {Object} Backbone.model
     */
    getDefault(name) {
        const value = configNames[name];
        return new this.model({name, value});
    }

    /**
     * Filter the collection to have only keybinding related models.
     *
     * @returns {Array} - an array of keybinding related models
     */
    keybindings() {
        const names = _.keys(configNames.keybindings);
        return this.filter(model => _.indexOf(names, model.get('name')) > -1);
    }

    /**
     * Filter to have only keybindings that are available globally.
     *
     * @returns {Array}
     */
    appShortcuts() {
        const names = _.filter(_.keys(configNames.keybindings), name => {
            return /^app/.test(name);
        });

        return this.filter(model => _.contains(names, model.get('name')));
    }

    /**
     * Filter to have only configs that contain in their names `str`.
     *
     * @param {String} str - key word
     * @returns {Array}
     */
    filterByName(str) {
        return this.filter(model => model.get('name').search(str) > -1);
    }

}
