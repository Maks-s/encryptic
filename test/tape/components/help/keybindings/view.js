/**
 * Test components/help/keybindings/View
 * @file
 */
import test from 'tape';

import View from '../../../../../src/scripts/components/help/keybindings/View';

test('help/keybindings/View: className', t => {
    t.equal(View.prototype.className, 'modal fade');
    t.end();
});
