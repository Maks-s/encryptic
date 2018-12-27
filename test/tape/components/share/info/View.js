/**
 * Test components/share/info/View
 * @file
 */
import test from 'tape';

import View from '../../../../../src/scripts/components/share/info/View';


test('share/info/View: triggers()', t => {
    const triggers = View.prototype.triggers();
    t.equal(typeof triggers, 'object');
    t.equal(triggers['click .share--trust'], 'add:trust',
        'triggers "add:trust" event');

    t.end();
});

test('share/info/Users: serializeData()', t => {
    const view = new View({test: '1'});
    t.equal(view.serializeData(), view.options);
    t.end();
});
