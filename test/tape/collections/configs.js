/**
 * @file Test collections/Configs
 */
import test from 'tape';
import sinon from 'sinon';
import _ from '../../../src/scripts/utils/underscore';
import Configs from '../../../src/scripts/collections/Configs';
import {configNames} from '../../../src/scripts/collections/configNames';
import Config from '../../../src/scripts/models/Config';

let sand;
test('collections/Configs: before()', t => {
    sand = sinon.createSandbox();
    t.end();
});

test('collections/Configs: profileId', t => {
    t.equal(new Configs(null, {profileId: 'default'}).profileId, 'default');
    t.end();
});

test('collections/Configs: model', t => {
    const configs = new Configs();
    t.equal(configs.model, Config, 'uses config model');
    t.end();
});

test('collections/Configs: hasNewConfigs()', t => {
    const configs = new Configs();

    t.equal(configs.hasNewConfigs(), true, 'returns true if there are new configs');

    // Create the same amount of models
    Object.keys(configNames).forEach(name => configs.add({name}));
    t.equal(configs.hasNewConfigs(), false,
        'returns false if there are not any new configs');

    t.end();
});

test('collections/Configs: createDefault()', t => {
    const configs = new Configs();
    const req     = sand.stub(configs.model.prototype, 'save');
    configs.add({name: 'appVersion', value: '1.0'});

    const res = configs.createDefault();
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(() => {
        t.equal(req.called, true, 'saves new configs');
        sand.restore();
        t.end();
    })
    .catch(() => {
        sand.restore();
        t.end('resolve promise');
    });
});

test('collections/Configs: getExportData()', t => {
    const configs = new Configs([
        {name: 'dropboxKey'},
        {name: 'dropboxAccessToken'},
        {name: 'deviceId'},
    ]);
    const res     = configs.getExportData();

    t.equal(res.length, 1);
    t.equal(_.findWhere(res, {name: 'dropboxAccessToken'}), undefined,
        'does not contain Dropbox access token');
    t.equal(_.findWhere(res, {name: 'deviceId'}), undefined,
        'does not contain the device ID');

    t.end();
});

test('collections/Configs: getConfigs()', t => {
    const configs = new Configs();

    t.equal(typeof configs.getConfigs(), 'object', 'returns an object');

    configs.add({name: 'testKey', value: 'testValue'});
    t.equal(configs.getConfigs().testKey, 'testValue',
        'transforms into key=>value structure');

    configs.add({name: 'appProfiles', value: JSON.stringify(['default'])});
    t.equal(Array.isArray(configs.getConfigs().appProfiles), true,
        'parses appProfiles from JSON');

    t.end();
});

test('collections/Configs: getDefault()', t => {
    const configs = new Configs();
    const model   = configs.getDefault('pagination');

    t.equal(model.get('value'), configNames.pagination,
        'uses the default config values');

    t.end();
});

/**
 * configNames doesn't even have keybindings
 * this will probably be removed soon
 *

test('collections/Configs: keybindings()', t => {
    const configs = new Configs();
    const res     = configs.keybindings();
    console.log(configNames);

    t.equal(configs.length > 10, true, 'collection is not empty');
    t.equal(Array.isArray(res), true, 'returns an array');
    t.equal(res.length, Object.keys(configNames.keybindings).length,
        'returns only keybinding configs');

    t.end();
});

test('collections/Configs: appShortcuts()', t => {
    const configs = new Configs();
    const res     = configs.appShortcuts();

    t.equal(Array.isArray(res), true, 'returns an array');
    t.equal(res.length, 4);

    t.end();
});

 */

test('collections/Configs: filterByName()', t => {
    const configs = new Configs();
    configs.createDefault();
    const res     = configs.filterByName('actions');

    t.equal(Array.isArray(res), true, 'returns an array');
    t.equal(res.length, 4, 'finds all items that have a key word in their names');

    t.end();
});

test('collections/Configs: after()', t => {
    localStorage.clear();
    sand.restore();
    t.end();
});
