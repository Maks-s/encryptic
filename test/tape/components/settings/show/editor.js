/**
 * Test components/settings/show/editor/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

import View from '../../../../../src/scripts/components/settings/show/editor/View';
import Behavior from '../../../../../src/scripts/components/settings/show/Behavior';
import Configs from '../../../../../src/scripts/collections/Configs';

let sand;
test('settings/show/editor/View: before()', t => {
    sand = sinon.createSandbox();
    t.end();
});

test('settings/show/editor/View: behaviors()', t => {
    const behaviors = View.prototype.behaviors;
    t.equal(Array.isArray(behaviors), true, 'returns an array');
    t.equal(behaviors.indexOf(Behavior) !== -1, true, 'uses the behavior');

    t.end();
});

test('settings/show/editor/View: ui()', t => {
    const ui = View.prototype.ui();
    t.equal(typeof ui, 'object');
    t.equal(ui.indentUnit, '#indentUnit');
    t.equal(ui.indentWarning, '#indentUnit-low-warning');

    t.end();
});

test('settings/show/editor/View: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object');
    t.equal(events['change @ui.indentUnit'], 'checkIndentUnit',
        'checks if indentation\'s value is lower than 3');

    t.end();
});

test('settings/show/editor/View: checkIndentUnit()', t => {
    const view = new View();
    view.ui    = {
        indentUnit    : {val: sand.stub().returns('1')},
        indentWarning : {toggleClass : sand.stub()},
    };

    view.checkIndentUnit();
    t.equal(view.ui.indentWarning.toggleClass.calledWith('hidden', false), true,
        'shows the warning if the indentation value is lower than 3');

    view.ui.indentUnit.val.returns('3');
    view.checkIndentUnit();
    t.equal(view.ui.indentWarning.toggleClass.calledWith('hidden', true), true,
        'hides the warning if the indentation value is not lower than 3');

    t.end();
});

test('settings/show/editor/View: serializeData()', t => {
    const view = new View({collection: new Configs()});
    t.equal(typeof view.serializeData(), 'object');
    t.end();
});
