/**
 * Test components/share/users/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

import View from '../../../../src/scripts/components/share/users/View';

let sand;
test('share/users/View: before()', t => {
    sand = sinon.createSandbox();
    t.end();
});

test('share/users/View: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object');
    t.equal(events['click .share--toggle'], 'share',
        'share the document if the button is clicked');

    t.end();
});

test('share/users/View: modelEvents()', t => {
    const modelEvents = View.prototype.modelEvents();
    t.equal(typeof modelEvents, 'object');
    t.equal(modelEvents['change:sharedWith'], 'render',
        're-renders the view after "sharedWith" attribute is changed');

    t.end();
});

test('share/users/View: collectionEvents()', t => {
    const colEvents = View.prototype.collectionEvents();
    t.equal(typeof colEvents, 'object');
    t.equal(colEvents['add change update'], 'render',
        're-renders the view after the collection is changed');

    t.end();
});

test('share/users/Users: share()', t => {
    const view = new View();
    sand.stub(view, '$').returns({attr: () => 'test'});
    sand.stub(view, 'triggerMethod');

    view.share({currentTarget: '#test'});
    t.equal(view.$.calledWith('#test'), true);
    t.equal(view.triggerMethod.calledWith('share', {username: 'test'}), true,
        'triggers "share" event');

    sand.restore();
    t.end();
});

test('share/users/Users: serializeData()', t => {
    const view = new View({test: '1'});
    t.equal(view.serializeData(), view.options);
    t.end();
});
