/**
 * Test: components/notes/form/views/NotebooksCollection.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

import _ from '../../../../../../src/scripts/utils/underscore';

/* eslint-disable max-len */
import View from '../../../../../../src/scripts/components/notes/form/views/NotebooksCollection';
import NotebookView from '../../../../../../src/scripts/components/notes/form/views/Notebook';
/* eslint-enable */

test('notes/form/views/NotebooksCollection: tagName', t => {
    t.equal(View.prototype.tagName, 'optgroup');
    t.end();
});

test('notes/form/views/NotebooksCollection: tagName', t => {
    t.equal(View.prototype.className, 'editor--notebooks--select');
    t.end();
});

test('notes/form/views/NotebooksCollection: childView()', t => {
    const childView = View.prototype.childView();
    t.equal(childView, NotebookView, 'uses Notebook view as the child view');

    t.end();
});

test('notes/form/views/NotebooksCollection: onRender()', t => {
    const view = View.prototype;
    view.$el   = {attr: sinon.stub()};
    sinon.stub(_, 'i18n').callsFake(str => str);

    view.onRender();
    t.equal(view.$el.attr.calledWith('label', 'Notebooks'), true,
        'changes view element\'s label');

    _.i18n.restore();
    t.end();
});
