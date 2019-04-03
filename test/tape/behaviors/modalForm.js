/**
 * Test behaviors/ModelForm.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import {View as MnView} from 'backbone.marionette';
import $ from 'jquery';

import ModalForm from '../../../src/scripts/behaviors/ModalForm';

class View extends MnView {
    behaviors() {
        return [ModalForm];
    }
}

let sand;
test('behaviors/ModalForm: before()', t => {
    sand = sinon.createSandbox();
    t.end();
});

test('behaviors/ModalForm: uiFocus', t => {
    const view               = new View();
    view.uiFocus             = null;
    ModalForm.prototype.view = view;

    t.equal(ModalForm.prototype.uiFocus, 'name');

    view.uiFocus = 'parentId';
    t.equal(ModalForm.prototype.uiFocus, 'parentId');

    delete ModalForm.prototype.view;
    t.end();
});

test('behaviors/ModalForm: triggers()', t => {
    t.equal(typeof ModalForm.prototype.triggers(), 'object', 'returns an object');
    t.end();
});

test('behaviors/ModalForm: modelEvents()', t => {
    t.equal(typeof ModalForm.prototype.modelEvents(), 'object', 'returns an object');
    t.end();
});

test('behaviors/ModalForm: closeOnEsc()', t => {
    const view = new View();
    sand.stub(view, 'trigger');

    ModalForm.prototype.view = view;

    ModalForm.prototype.closeOnEsc({which: 10});
    t.true(view.trigger.notCalled, 'does nothing if escape key is not pressed');

    ModalForm.prototype.closeOnEsc({which: 27});
    t.true(view.trigger.calledWith('cancel'),
        'triggers cancel event if escape is pressed');

    delete ModalForm.prototype.view;
    t.end();
});

test('behaviors/ModalForm: showErrors()', t => {
    const view   = new View();
    const form   = document.createElement('form');
    const input  = document.createElement('input');
    const oForm  = document.createElement('form');
    const oInput = document.createElement('input');
    form.appendChild(input);
    oForm.appendChild(oInput);

    view.ui = {
        input  : $(input),
        oInput : $(oInput),
    };
    ModalForm.prototype.view = view;

    ModalForm.prototype.showErrors({errors: ['input', 'oInput']});
    t.true(form.classList.contains('has-error'), 'adds "has-error" class');
    t.true(oForm.classList.contains('has-error'), 'adds all "has-error" class');

    delete ModalForm.prototype.view;
    t.end();
});
