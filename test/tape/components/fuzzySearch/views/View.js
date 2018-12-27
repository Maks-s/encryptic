/**
 * Test components/fuzzySearch/views/View
 * @file
 */
import test from 'tape';
import '../../../../src/scripts/utils/underscore';

import View from '../../../../src/scripts/components/fuzzySearch/views/View';
import Child from '../../../../src/scripts/components/fuzzySearch/views/Child';

test('View: className', t => {
    t.equal(View.prototype.className, 'main notes-list');
    t.end();
});

test('View: childView', t => {
    t.equal(View.prototype.childView, Child, 'uses the child view');
    t.end();
});
