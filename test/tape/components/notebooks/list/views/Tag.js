/**
 * Test components/notebooks/list/views/Tag
 * @file
 */
import test from 'tape';

import View from '../../../../../../src/scripts/components/notebooks/list/views/Tag';
// eslint-disable-next-line max-len
import ItemView from '../../../../../../src/scripts/components/notebooks/list/views/ItemView';

test('notebooks/list/views/Tag: extends from ItemView', t => {
    t.equal(View.prototype instanceof ItemView, true);
    t.end();
});
