/**
 * @file Test modules/Profiles
 */
import test from 'tape';
import sinon from 'sinon';

import '../../../src/scripts/utils/underscore';
import Module from '../../../src/scripts/modules/Profiles';

import Profiles from '../../../src/scripts/collections/Profiles';
import Profile from '../../../src/scripts/models/Profile';

let sand;
test('modules/Profiles: before()', t => {
    sand = sinon.createSandbox();
    t.end();
});

test('modules/Profiles: Collection', t => {
    t.equal(new Module().Collection, Profiles);
    t.end();
});

test('modules/Profiles: constructor()', t => {
    const rep = sand.stub(Module.prototype.channel, 'reply');
    const mod = new Module();

    t.equal(rep.calledWith({
        createProfile    : mod.createProfile,
        findProfiles     : mod.findProfiles,
        setUser          : mod.setUser,
        getUser          : mod.getUser,
        getProfile       : mod.getProfile,
        changePassphrase : mod.changePassphrase,
        destroyProfile   : mod.destroyProfile,
    }), true, 'replies to requests');

    sand.restore();
    t.end();
});

test('modules/Profiles: createProfile()', t => {
    const mod  = new Module();
    const save = sand.stub(mod, 'saveModel')
    .callsFake(({model}) => Promise.resolve(model));

    mod.createProfile({username: 'bob', privateKey: 'priv', publicKey: 'pub'})
    .then(model => {
        t.equal(save.calledWith({model}), true, 'saves the model');
        t.equal(model.get('username'), 'bob');
        t.equal(model.get('privateKey'), 'priv');
        t.equal(model.get('publicKey'), 'pub');

        sand.restore();
        t.end();
    })
    .catch(() => {
        sand.restore();
        t.end('resolve promise');
    });
});

test('modules/Profiles: findProfiles()', t => {
    const mod      = new Module();
    mod.collection = new Profiles();

    t.equal(mod.findProfiles(), mod.collection);
    t.end();
});

test('modules/Profiles: setUser()', t => {
    const mod      = new Module();
    mod.collection = new Profiles([{username: 'alice'}]);

    t.notEqual(typeof mod.profile, 'object', 'profile property is not set');

    mod.setUser({username: 'alice'});
    t.equal(mod.profile, mod.collection.get({username: 'alice'}),
        'sets "profile" property');

    t.end();
});

test('modules/Profiles: getUser()', t => {
    const mod = new Module();

    t.equal(mod.getUser(), null, 'returns null');

    mod.profile = new Profile({username: 'bob'});
    t.equal(mod.getUser(), mod.profile, 'returns the profile model');

    t.end();
});

test('modules/Profiles: getProfile()', t => {
    const mod   = new Module();
    mod.profile = new Profile({username: 'alice'});

    t.equal(mod.getProfile(), 'alice', 'returns the username');
    t.end();
});

test('modules/Profiles: changePassphrase() - reject', t => {
    const mod    = new Module();
    const reject = sand.spy(Promise, 'reject');

    mod.changePassphrase({oldPassphrase: '1', newPassphrase: '1'}).catch(() => {});
    t.equal(reject.called, true,
        'rejects the promise if the old and new passphrase are the same');

    mod.changePassphrase({oldPassphrase: '', newPassphrase: '1'}).catch(() => {});
    t.equal(reject.called, true, 'rejects the promise if the old passphrase is empty');

    mod.changePassphrase({oldPassphrase: '1', newPassphrase: ''}).catch(() => {});
    t.equal(reject.called, true, 'rejects the promise if the new passphrase is empty');

    sand.restore();
    t.end();
});

test('modules/Profiles: changePassphrase() - success', async t => {
    const mod = new Module();
    const opt = {
        model         : new Profile({username: 'alice'}),
        oldPassphrase : '1',
        newPassphrase : '2',
    };

    const req = sand.stub(mod.encryptChannel, 'request').resolves('newKey');
    sand.stub(mod, 'saveModel');

    await mod.changePassphrase(opt);
    t.equal(req.calledWith('changePassphrase', opt),
        true, 'changes the passphrase');
    t.equal(mod.saveModel.calledWith({
        model : opt.model,
        data  : {privateKey: 'newKey'},
    }), true, 'saves the new private key');

    sand.restore();
    mod.channel.stopReplying();
    t.end();
});