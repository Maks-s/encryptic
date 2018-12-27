/**
 * Test components/notebooks/list/views/Notebook
 * @file
 */
import test from 'tape';

import View from '../../../../../src/scripts/components/notebooks/list/views/Notebook';
// eslint-disable-next-line max-len
import ItemView from '../../../../../src/scripts/components/notebooks/list/views/ItemView';

test('notebooks/list/views/Tag: extends from ItemView', t => {
    t.equal(View.prototype instanceof ItemView, true);
    t.end();
});

test('Notebook: modelEvents()', t => {
    const modelEvents = View.prototype.modelEvents();
    t.equal(typeof modelEvents, 'object', 'returns an object');
    t.equal(modelEvents.change, 'render', 're-renders itself if the model has changed');
    t.end();
});

test('notebooks/list/views/Notebook: templateContext()', t => {
    const context = View.prototype.templateContext();

    context.level = 1;
    t.equal(context.getPadding(), '', 'returns empty string if level is equal to 1');

    context.level = 2;
    t.equal(context.getPadding(), 'padding-left:40px',
        'padding-left should be equal to level*20 px');

    t.end();
});
