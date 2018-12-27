/**
 * Test components/linkDialog/views/Item
 * @file
 */
import test from 'tape';
import '../../../../src/scripts/utils/underscore';

import View from '../../../../src/scripts/components/linkDialog/views/Item';

test('linkDialog/views/Item: tagName()', t => {
    t.equal(View.prototype.tagName, 'li');
    t.end();
});
