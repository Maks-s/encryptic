/**
 * Test components/settings/show/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

import View from '../../../../../src/scripts/components/settings/show/View';
import Content from '../../../../../src/scripts/behaviors/Content';

let sand;
test('settings/show/View: before()', t => {
    sand = sinon.createSandbox();
    t.end();
});

test('settings/show/View: behaviors', t => {
    const behaviors = View.prototype.behaviors;
    t.equal(Array.isArray(behaviors), true, 'is an array');
    t.equal(behaviors.indexOf(Content) !== -1, true, 'uses content behavior');
    t.end();
});

test('settings/show/View: regions()', t => {
    const regions = View.prototype.regions();
    t.equal(typeof regions, 'object');
    t.equal(regions.content, '.settings--content');
    t.end();
});

test('settings/show/View: ui()', t => {
    const ui = View.prototype.ui();
    t.equal(typeof ui, 'object');
    t.equal(ui.save, '.settings--save');
    t.end();
});

test('settings/show/View: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object');
    t.equal(events['click @ui.save'], 'save', 'changes if "save" button is clicked');
    t.end();
});

test('settings/show/View: triggers()', t => {
    const triggers = View.prototype.triggers();
    t.equal(typeof triggers, 'object');
    t.equal(triggers['click .settings--close'], 'close',
        'triggers close event when the buttons is clicked');
    t.end();
});

test('settings/show/View: onRender()', t => {
    const TabView = sand.stub().returns({el: 'test'});
    const view    = new View({TabView});
    sand.stub(view, 'showChildView');

    view.onRender();
    t.equal(TabView.calledWith(view.options), true, 'instantiates the tab view');
    t.equal(view.showChildView.calledWith('content', view.tabView), true,
        'renders the tab view');

    sand.restore();
    t.end();
});

test('settings/show/View: save()', t => {
    const view  = new View();
    const child = {ui: {password: {trigger: sand.stub()}}};
    view.ui     = {save: {attr: sand.stub()}};
    sand.stub(view, 'trigger');
    sand.stub(view, 'getChildView').returns(child);

    const preventDefault = sand.stub();
    view.save({preventDefault});

    t.equal(preventDefault.called, true, 'prevents the default behavior');
    t.equal(child.ui.password.trigger.calledWith('change'), true,
        'triggers "change" event if it is a password input');
    t.equal(view.ui.save.attr.calledWith('disabled', true), true,
        'disables "save" button');
    t.equal(view.trigger.calledWith('save'), true, 'triggers "save" event');

    sand.restore();
    t.end();
});

test('settings/show/View: onSaved()', t => {
    const view = new View();
    view.ui    = {save: {removeAttr: sand.stub()}};

    view.onSaved();
    t.equal(view.ui.save.removeAttr.calledWith('disabled'), true,
        'enables "save" button');

    sand.restore();
    t.end();
});

test('settings/show/View: serializeData()', t => {
    const view = new View({tab: 'test'});
    t.equal(view.serializeData(), view.options, 'returns options');
    t.end();
});
