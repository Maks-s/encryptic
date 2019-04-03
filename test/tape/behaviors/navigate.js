/**
 * Test behaviors/Navigate.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import {View as MnView} from 'backbone.marionette';
import Mousetrap from 'mousetrap';
import $ from 'jquery';

import Navigate from '../../../src/scripts/behaviors/Navigate';
import Notes from '../../../src/scripts/collections/Notes';
import Note from '../../../src/scripts/models/Note';

class View extends MnView {
    behaviors() {
        return [Navigate];
    }
}

let sand;
test('behaviors/Navigate: before()', t => {
    sand = sinon.createSandbox();
    t.end();
});

test('behaviors/Navigate: initialize()', t => {
    const bind   = sand.stub(Navigate.prototype, 'bindKeys');
    const listen = sand.stub(Navigate.prototype, 'listenTo');

    const view = new View({collection: new Notes()});

    t.true(bind.notCalled, 'doesn\'t listen to keybinding events');

    t.true(listen.calledWith(view.collection.channel, 'model:navigate'),
        'listens to model:navigate event on collection channel');
    t.true(listen.neverCalledWith(sinon.match.any, 'model:active'),
        'doesn\'t listen to model:active event');
    t.ok(listen.calledWith(view, 'childview:scroll:top'),
        'listens to childview:scroll:top event');
    t.true(listen.calledWith(view, 'navigate:next'),
        'listens to navigate:next event');

    t.true(listen.calledWith(view, 'navigate:previous'),
        'listens to navigate:previous event');

    View.prototype.channel                = 'testChannel';
    View.prototype.useNavigateKeybindings = true;
    sand.reset();

    new View({collection: new Notes()});
    t.true(bind.called, 'listens to keybinding events');
    t.true(
        listen.calledWith(View.prototype.channel, 'model:active'),
        'listens to model:active event');

    delete View.prototype.useNavigateKeybindings;
    delete View.prototype.channel;
    sand.restore();
    t.end();
});

test('behaviors/Navigate: bindKeys()', t => {
    const next = sand.stub(Navigate.prototype, 'navigateNextModel');
    const prev = sand.stub(Navigate.prototype, 'navigatePreviousModel');

    View.prototype.useNavigateKeybindings = true;
    new View({
        collection : new Notes(),
        configs    : {navigateBottom: 'j', navigateTop: 'k'},
    });

    Mousetrap.trigger('j');
    t.true(next.called, 'calls navigateNextModel method');

    Mousetrap.trigger('k');
    t.true(prev.called, 'calls navigatePreviousModel method');

    delete View.prototype.useNavigateKeybindings;
    Mousetrap.unbind(['j', 'k']);
    sand.restore();
    t.end();
});

test('behaviors/Navigate: onDestroy()', t => {
    const unbind     = sand.stub(Mousetrap, 'unbind');

    let view = new View({
        collection : new Notes(),
        configs    : {navigateBottom: 'j', navigateTop: 'k'},
    });
    view.destroy();

    t.true(unbind.notCalled, 'doesn\'t unbind keybindings');

    View.prototype.useNavigateKeybindings = true;
    view = new View({
        collection : new Notes(),
        configs    : {navigateBottom: 'j', navigateTop: 'k'},
    });
    view.destroy();

    t.true(unbind.calledWith(sinon.match.array.contains(['j', 'k'])),
        'unbinds navigate keybindings');

    delete View.prototype.useNavigateKeybindings;
    sand.restore();
    t.end();
});

test('behaviors/Navigate: onScrollTop()', t => {
    Navigate.prototype.$scroll = $('body');
    const scrollTop = sand.stub(Navigate.prototype.$scroll, 'scrollTop');

    Navigate.prototype.onScrollTop({offset: 1});
    t.true(scrollTop.called, 'changes scroll position');

    delete Navigate.prototype.$scroll;
    sand.restore();
    t.end();
});

test('behaviors/Navigate: navigateNextModel() + navigatePreviousModel()', t => {
    const collection = new Notes();
    const next = sand.stub(collection, 'navigateNextModel');
    const prev = sand.stub(collection, 'navigatePreviousModel');

    const view = new View({
        collection,
        filterArgs: {
            id: '1',
        },
    });

    view.trigger('navigate:next');

    t.true(next.calledWith('1'), 'calls this.collection.navigateNextModel');
    t.true(prev.notCalled, 'doesn\'t call this.collection.navigatePreviousModel');

    sand.reset();

    view.trigger('navigate:previous');

    t.true(next.notCalled, 'doesn\'t call this.collection.navigateNextModel');
    t.true(prev.calledWith('1'), 'calls this.collection.navigatePreviousModel');

    sand.restore();
    t.end();
});

test('behaviors/Navigate: onModelNavigate()', t => {
    const model = new Note({id: '2'});
    sand.stub(model, 'trigger');

    Navigate.prototype.view       = {options: {filterArgs: {}}};
    Navigate.prototype.collection = new Notes([model]);

    Navigate.prototype.onModelNavigate({model});
    t.true(model.trigger.calledWith('focus'), 'triggers "focus" event on the model');
    t.equal(Navigate.prototype.view.options.filterArgs.id, '2',
        'updates filter parameters');

    delete Navigate.prototype.view;
    delete Navigate.prototype.collection;
    sand.restore();
    t.end();
});
