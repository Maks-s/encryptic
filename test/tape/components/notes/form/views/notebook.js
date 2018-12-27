/**
 * Test: components/notes/form/views/Notebook
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

import '../../../../../../src/scripts/utils/underscore';

import View from '../../../../../../src/scripts/components/notes/form/views/Notebook';
import Notebook from '../../../../../../src/scripts/models/Notebook';

test('notes/form/Notebook: tagName', t => {
    t.equal(View.prototype.tagName, 'option');
    t.end();
});

test('notes/form/Notebook: onRender()', t => {
    const view = new View({model: new Notebook({id: '1'})});
    view.$el   = {attr: sinon.stub()};

    view.onRender();
    t.equal(view.$el.attr.calledWith('value', '1'), true,
        'changes the "value" attribute');

    t.end();
});
