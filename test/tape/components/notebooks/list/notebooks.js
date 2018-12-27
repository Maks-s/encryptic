/**
 * Test components/notebooks/list/views/Notebooks
 * @file
 */
import test from 'tape';

import _ from '../../../../../src/scripts/utils/underscore';
import View from '../../../../../src/scripts/components/notebooks/list/views/Notebooks';
// eslint-disable-next-line max-len
import Notebook from '../../../../../src/scripts/components/notebooks/list/views/Notebook';
import Navigate from '../../../../../src/scripts/behaviors/Navigate';

test('notebooks/list/views/Notebooks: className', t => {
    t.equal(View.prototype.className, 'list--notebooks');
    t.end();
});

test('notebooks/list/views/Notebooks: behaviors()', t => {
    const behaviors = View.prototype.behaviors();
    t.equal(Array.isArray(behaviors), true, 'returns an array');
    t.equal(behaviors.indexOf(Navigate) !== -1, true, 'uses navigate behavior');
    t.end();
});

test('notebooks/list/views/Notebooks: childView()', t => {
    t.equal(View.prototype.childView(), Notebook, 'uses notebook item view');
    t.end();
});

test('notebooks/list/views/Notebooks: childViewOptions()', t => {
    const view = new View({profileId: 'test', collection: 'test'});
    t.deepEqual(view.childViewOptions(), {profileId: 'test', filterArgs: {}}, 'msg');
    t.end();
});

test('notebooks/list/views/Notebooks: initialize()', t => {
    const view = new View({collection: 'test'});
    t.equal(_.isEmpty(view.options.filterArgs), true,
        'creates options.filterArgs property');
    t.end();
});
