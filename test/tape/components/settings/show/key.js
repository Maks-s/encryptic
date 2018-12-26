/**
 * Test components/settings/show/encryption/Key
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

/* eslint-disable */
import _ from '../../../../../src/scripts/utils/underscore';
import View from '../../../../../src/scripts/components/settings/show/encryption/Key';
import Configs from '../../../../../src/scripts/collections/Configs';
/* eslint-enable */

let sand;
test('settings/show/encryption/Key: before()', t => {
    sand = sinon.createSandbox();
    t.end();
});

test('settings/show/encryption/Key: className', t => {
    t.equal(View.prototype.className, 'modal fade');
    t.end();
});

test('settings/show/encryption/Key: ui()', t => {
    const ui = View.prototype.ui();
    t.equal(typeof ui, 'object');
    t.equal(ui.text, 'textarea');

    t.end();
});

test('settings/show/encryption/Key: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object');

    t.equal(events['focus @ui.text'], 'selectAll',
        'selects everything in textarea');
    t.equal(events['click .btn--cancel'], 'destroy',
        'destroyes itself if cancel button is clicked');

    t.end();
});

test('settings/show/encryption/Key: selectAll()', t => {
    sand.stub(Radio, 'request')
    .withArgs('components/Encryption', 'getUserKeys')
    .returns({privateKey: ''});

    const view = new View();
    view.ui    = {text: {select: sand.stub()}};

    view.selectAll();
    t.equal(view.ui.text.select.called, true, 'selects everything in the textarea');

    sand.restore();
    t.end();
});

test('settings/show/encryption/Key: serializeData()', t => {
    sand.stub(Radio, 'request')
    .withArgs('components/Encryption', 'getUserKeys')
    .returns({privateKey: ''});

    const view   = new View();
    view.options = {model: {id: '1'}, key: 'pub'};

    t.equal(view.serializeData(), view.options, 'returns options');

    sand.restore();
    t.end();
});

test('settings/show/encryption/Key: templateContext()', t => {
    sand.stub(Radio, 'request')
    .withArgs('components/Encryption', 'getUserKeys')
    .returns({privateKey: ''});

    const context     = new View().templateContext();
    const armor       = sand.stub().returns('pub');
    let isPrivate     = true;
    context.key       = {
        toPublic       : () => {
            return {armor};
        },
        isPrivate      : () => {
            return isPrivate;
        },
        getFingerprint : () => {
            return '123412341234';
        },
        armor          : sand.stub(),
    };

    t.equal(context.getArmor(), 'pub', 'returns armored public key');
    t.equal(armor.called, true, 'converts the private key to public key');
    t.equal(context.getFingerprint(), '1234 1234 1234');

    isPrivate = false;
    context.getArmor();
    t.equal(context.key.armor.called, true, 'calls key.armor()');

    sand.restore();
    t.end();
});
