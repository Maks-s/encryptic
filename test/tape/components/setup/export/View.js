/**
 * Test components/setup/export/View
 * @file
 */
import test from 'tape';

import '../../../../src/scripts/utils/underscore';
import View from '../../../../src/scripts/components/setup/export/View';

test('setup/export/View: serializeData()', t => {
    const opt  = {el: 'test'};
    View.prototype.options = {el: 'test'};

    t.deepEqual(View.prototype.serializeData(), opt);

    View.prototype.options = null;
    t.end();
});
