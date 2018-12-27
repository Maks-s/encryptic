/**
 * Test components/settings/show/keybindings/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

import View from '../../../../../src/scripts/components/settings/show/keybindings/View';
import Behavior from '../../../../../src/scripts/components/settings/show/Behavior';
import Configs from '../../../../../src/scripts/collections/Configs';

let sand;
test('settings/show/keybindings/View: before()', t => {
    sand = sinon.createSandbox();
    t.end();
});

test('settings/show/keybindings/View: behaviors()', t => {
    const behaviors = View.prototype.behaviors;
    t.equal(Array.isArray(behaviors), true, 'returns an array');
    t.equal(behaviors.indexOf(Behavior) !== -1, true, 'uses the behavior');

    t.end();
});

test('settings/show/keybindings/View: serializeData()', t => {
    const view = new View({id: 'test'});
    t.equal(view.serializeData(), view.options, 'returns options');
    t.end();
});

test('settings/show/keybindings/View: templateContext()', t => {
    const context      = new View().templateContext();
    context.collection = new Configs();
    const filterByName = sand.stub(context.collection, 'filterByName').returns([1, 2]);

    context.filter('test');
    t.equal(filterByName.calledWith('test'), true, 'calls filterByName method');

    const appShortcuts = sand.stub(context.collection, 'appShortcuts');
    context.appShortcuts();
    t.equal(appShortcuts.called, true, 'calls appShortcuts method');

    sand.restore();
    t.end();
});
