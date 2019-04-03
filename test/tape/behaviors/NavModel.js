/**
 * Test behaviors/NavModel.js
 * @file
 */

import test from 'tape';
import sinon from 'sinon';
import {View as MnView} from 'backbone.marionette';
import $ from 'jquery';

import Notes from '../../../src/scripts/collections/Notes';
import NavModel from '../../../src/scripts/behaviors/NavModel';

class View extends MnView {
    behaviors() {
        return [NavModel];
    }
}

let sand;
test('behaviors/NavModel: before()', t => {
    sand = sinon.createSandbox();
    t.end();
});

test('behaviors/NavModel: ui() + modelEvents()', t => {
    const focus = sand.stub(NavModel.prototype, 'onFocus');
    const view = new View({collection: new Notes()});

    t.equal(typeof NavModel.prototype.ui(), 'object', 'returns an object');
    t.equal(typeof NavModel.prototype.modelEvents(), 'object', 'returns an object');

    view.trigger('focus');
    t.true(focus.called, 'calls onFocus when triggering focus');

    sand.restore();
    t.end();
});

test('behaviors/NavModel: onFocus()', t => {
    const ui     = NavModel.prototype.ui;

    NavModel.prototype.ui = {listGroup: $()};
    NavModel.prototype.view = new View({collection: new Notes()});
    const trigger = sand.stub(NavModel.prototype.view, 'trigger');

    NavModel.prototype.onFocus();
    t.true(trigger.calledWith('scroll:top'), 'scrolls to group item');

    NavModel.prototype.ui = ui;
    delete NavModel.prototype.view;
    sand.restore();
    t.end();
});