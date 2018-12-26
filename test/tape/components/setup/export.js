/**
 * Test components/setup/export/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

import '../../../../src/scripts/utils/underscore';
import View from '../../../../src/scripts/components/setup/export/View';

let sand;
test('setup/export/View: before()', t => {
    sand = sinon.createSandbox();
    t.end();
});

test('setup/export/View: serializeData()', t => {
    const opt  = {el: 'test'};
    View.prototype.options = {el: 'test'};

    t.deepEqual(View.prototype.serializeData(), opt);

    View.prototype.options = null;
    t.end();
});
