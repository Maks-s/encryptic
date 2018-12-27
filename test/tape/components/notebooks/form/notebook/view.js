/**
 * Test components/notebooks/form/notebooks/View
 * @file
 */
import test from 'tape';

import _ from '../../../../../../src/scripts/utils/underscore';
import Notebooks from '../../../../../../src/scripts/collections/Notebooks';
import View from '../../../../../../src/scripts/components/notebooks/form/notebook/View';
import ModalForm from '../../../../../../src/scripts/behaviors/ModalForm';

test('notebooks/form/notebook/View: className', t => {
    t.equal(View.prototype.className, 'modal fade');
    t.end();
});

test('notebooks/form/notebook/View: ui()', t => {
    const ui = View.prototype.ui();
    t.equal(typeof ui, 'object', 'returns an object');
    t.equal(ui.name, 'input[name="name"]');
    t.equal(ui.parentId, 'select[name="parentId"]');
    t.end();
});

test('notebooks/form/notebook/View: behaviors()', t => {
    const behaviors = View.prototype.behaviors();
    t.equal(Array.isArray(behaviors), true, 'returns an array');
    t.equal(behaviors.indexOf(ModalForm) !== -1, true, 'uses ModalForm behavior');

    t.end();
});

test('notebooks/form/notebook/View: serializeData()', t => {
    const view = new View({
        model     : new Notebooks.prototype.model({id : '1'}),
        notebooks : new Notebooks(),
    });
    const data = view.serializeData();

    t.equal(typeof data, 'object', 'returns an object');

    const modelKeys = _.keys(view.model.attributes);
    const dataKeys  = _.keys(data);
    modelKeys.forEach(name => {
        t.equal(dataKeys.indexOf(name) !== -1, true,
            `returns "${name}" model attribute`);
    });
    t.equal(Array.isArray(data.notebooks), true, 'notebooks attribute is an array');

    t.end();
});
