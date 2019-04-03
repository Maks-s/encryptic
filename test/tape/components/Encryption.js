/**
 * Test components/Encryption
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import * as openpgp from 'openpgp';
import sjcl from 'sjcl';
import Radio from 'backbone.radio';

import Encryption from '../../../src/scripts/components/Encryption';
import Users from '../../../src/scripts/collections/Users';
import User  from '../../../src/scripts/models/User';
import Profile  from '../../../src/scripts/models/Profile';
import Notes from '../../../src/scripts/collections/Notes';

let sand;
const user = new Profile({username: 'bob', privateKey: 'private', publicKey: 'public'});
test('components/Encryption: before()', t => {
    sand = sinon.createSandbox();
    Radio.reply('collections/Profiles', 'getUser', user);
    localStorage.clear();
    t.end();
});

test('components/Encryption: channel', t => {
    t.equal(Encryption.prototype.channel.channelName, 'components/Encryption');
    t.end();
});

test('components/Encryption: configs', t => {
    Radio.replyOnce('collections/Configs', 'findConfigs', {});
    t.equal(typeof Encryption.prototype.configs, 'object');
    t.end();
});

test('components/Encryption: user', t => {
    t.equal(Encryption.prototype.user, user.attributes);
    t.end();
});

test('components/Encryption: constructor()', t => {
    const reply      = sand.stub(Encryption.prototype.channel, 'reply');
    const enc        = new Encryption({privateKey: 'key'});

    t.equal(enc.openpgp, openpgp, 'creates "openpgp" property');
    t.equal(enc.openpgp.config.compression, 0, 'disables compression in OpenPGP');
    t.equal(enc.openpgp.config.use_native, false, 'disables native crypto');
    t.deepEqual(enc.options, {privateKey: 'key'}, 'creates "options" property');

    t.equal(reply.calledWith({
        // Core methods
        sha256            : enc.sha256,
        random            : enc.random,
        readKeys          : enc.readKeys,
        readUserKey       : enc.readUserKey,
        generateKeys      : enc.generateKeys,
        changePassphrase  : enc.changePassphrase,
        sign              : enc.sign,
        verify            : enc.verify,
        encrypt           : enc.encrypt,
        decrypt           : enc.decrypt,
        // Backbone related methods
        encryptModel      : enc.encryptModel,
        decryptModel      : enc.decryptModel,
        encryptCollection : enc.encryptCollection,
        decryptCollection : enc.decryptCollection,
        saveKeys          : enc.saveKeys,
        getUserKeys       : enc.getUserKeys,
    }, enc), true, 'starts replying to requests');

    sand.restore();
    t.end();
});

test('components/Encryption: sha256()', t => {
    const enc = new Encryption();
    const spy = sand.spy(sjcl.hash.sha256, 'hash');

    enc.sha256({text: 'test'})
    .then(res => {
        t.equal(Array.isArray(res), true, 'resolves with an array');
        t.equal(spy.calledWith('test'), true, 'calls hash method');

        sand.restore();
        t.end();
    })
    .catch(() => {
        sand.restore();
        t.end('resolve promise');
    });
});

test('components/Encryption: random()', t => {
    const enc = new Encryption();

    enc.random()
    .then(str => {
        t.equal(typeof str, 'string', 'returns "string"');
        t.equal(str.length, 32, 'returns 4 random "words" for default');
        t.notEqual(str.search(/^(?=.*[a-zA-Z])(?=.*[0-9])/), -1,
            'contains both numbers and letters');
        return enc.random({number: 8});
    })
    .then(str => {
        t.equal(str.length, 64, 'returns 8 random "words"');
        t.end();
    })
    .catch(() => t.end('resolve promise'));
});

test('components/Encryption: readKeys() - reject', t => {
    const enc  = new Encryption({privateKey: 'key'});
    const read = sand.stub(openpgp.key, 'readArmored');
    read.returns({keys: [{decrypt: () => false}]});

    enc.readKeys()
    .catch(err => {
        t.equal(err, 'Cannot decrypt the private key',
            'rejects the promise if it failed to decrypt the private key');

        sand.restore();
        t.end();
    });
});

test('components/Encryption: readKeys() - resolve', t => {
    const enc        = new Encryption();
    const read       = sand.stub(openpgp.key, 'readArmored');
    const privateKey = {decrypt: () => true, toPublic: () => 'pub'};
    read.returns({keys: [privateKey]});
    sand.stub(enc, 'readPublicKeys').resolves(['pub']);

    enc.readKeys({privateKey: 'priv', publicKey: 'pub'})
    .then(res => {
        const keys = {
            privateKey,
            privateKeys: [privateKey],
            publicKeys : {bob: 'pub'},
        };
        t.deepEqual(res, keys, 'resolves with private and public keys');
        t.deepEqual(enc.keys, keys, 'creates "keys" property');

        sand.restore();
        t.end();
    })
    .catch(() => {
        sand.restore();
        t.end('resolve promise');
    });
});

test('components/Encryption: readPublicKeys()', t => {
    const enc   = new Encryption();
    const users = new Users([{pendingAccept: true}, {pendingAccept: false}]);
    const req   = sand.stub(Radio, 'request').resolves(users);
    sand.stub(enc, 'readUserKey');

    enc.readPublicKeys()
    .then(() => {
        t.equal(req.calledWith('collections/Users', 'find'), true,
            'requests users');
        t.equal(enc.readUserKey.callCount, 1, 'reads users public keys');
        t.equal(enc.readUserKey.calledWith({model: users.at(1)}), true,
            'reads the keys of users who are trusted');

        sand.restore();
        t.end();
    })
    .catch(() => {
        sand.restore();
        t.end('resolve promise');
    });
});

test('components/Encryption: readUserKey()', t => {
    const enc   = new Encryption();
    const read  = sand.stub(openpgp.key, 'readArmored');
    const model = new User({username: 'alice', publicKey: 'armored'});
    read.resolves({keys: ['pubKey']});

    enc.keys  = {publicKeys: {}};
    const res = enc.readUserKey({model});
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(key => {
        t.deepEqual(key, 'pubKey', 'resolves with the key');
        t.equal(enc.keys.publicKeys.alice, 'pubKey',
            'saves the key in this.keys.publicKeys');

        sand.restore();
        t.end();
    })
    .catch(e => {
        sand.restore();
        t.end(e);
    });
});

test('components/Encryption: generateKeys()', t => {
    const enc   = new Encryption({privateKey: 'key'});
    const key   = {privateKeyArmored: 'priv', publicKeyArmored: 'pub'};
    enc.openpgp = {generateKey: sand.stub().resolves(key)};

    enc.generateKeys({userIds: [{name: 'me'}], passphrase: 'test'})
    .then(res => {
        t.equal(enc.openpgp.generateKey.calledWith({
            numBits    : 2048,
            userIds    : [{name: 'me'}],
            passphrase : 'test',
        }), true, 'generates the keys');

        t.deepEqual(res, {
            privateKey: 'priv',
            publicKey : 'pub',
        }, 'resolves with the key');

        sand.restore();
        t.end();
    })
    .catch(() => {
        sand.restore();
        t.end('resolve promise');
    });
});

test('components/Encryption: changePassphrase()', t => {
    const enc     = new Encryption();
    const encrypt = sand.stub();
    const key     = {
        decrypt : sand.stub().returns(true),
        armor   : sand.stub().returns('newPrivateKey'),
        getAllKeyPackets: sand.stub().returns([{encrypt}, {encrypt}]),
    };
    sand.stub(openpgp.key, 'readArmored').returns({keys: [key]});
    enc.options.privateKey = 'privateKey';

    enc.changePassphrase({newPassphrase: '1', oldPassphrase: '2'})
    .then(res => {
        t.equal(encrypt.callCount, 2, 'encrypts all key packets');
        t.equal(res, 'newPrivateKey', 'resolves with the new armored key');

        key.armor.throws();
        return enc.changePassphrase({newPassphrase: '1', oldPassphrase: '2'});
    })
    .catch(err => {
        t.equal(err, 'Setting new passphrase failed');

        key.decrypt.returns(false);
        return enc.changePassphrase({newPassphrase: '1', oldPassphrase: '2'});
    })
    .then(() => t.end('reject promise when key.decrypt return false'))
    .catch(err => {
        t.equal(err, 'Wrong old passphrase');
        sand.restore();
        t.end();
    });
});

test('components/Encryption: sign()', t => {
    const enc   = new Encryption();
    enc.keys    = {privateKey: 'privateKey'};
    enc.openpgp = {
        sign    : sand.stub().resolves({data: 'signature'}),
        message : {
            fromText: data => {
                return data;
            },
        },
    };
    // enc.openpgp.sign.resolves({data: 'signature'});

    enc.sign({data: 'text'})
    .then(signature => {
        t.equal(signature, 'signature', 'returns the signature');
        t.equal(enc.openpgp.sign.calledWith({
            message     : 'text',
            privateKeys : enc.keys.privateKey,
        }), true, 'calls "openpgp.sign" method');

        sand.restore();
        t.end();
    })
    .catch(() => {
        sand.restore();
        t.end('resolve promise');
    });
});

test('components/Encryption: verify()', t => {
    const enc   = new Encryption();
    enc.openpgp = {verify: sand.stub()};
    enc.openpgp.verify.resolves(true);

    enc.openpgp.cleartext = {readArmored: sand.stub().returns('message')};
    sand.stub(enc, 'getUserKeys').returns({publicKeys: ['pubKey']});

    enc.verify({message: 'armored', publicKeys: ['pubKey']})
    .then(() => {
        t.equal(enc.getUserKeys.notCalled, true, 'use "publicKeys" parameter');
        return enc.verify({message: 'armored'});
    })
    .then(res => {
        t.equal(enc.getUserKeys.called, true, 'calls getUserKeys() method');
        t.equal(res, true, 'returns the result');
        t.equal(enc.openpgp.verify.calledWith({
            message    : 'message',
            publicKeys : ['pubKey'],
        }), true, 'calls "openpgp.verify" method');

        sand.restore();
        t.end();
    })
    .catch(() => {
        sand.restore();
        t.end('resolve promise');
    });
});

test('components/Encryption: getUserKeys()', t => {
    const enc = new Encryption();
    enc.keys  = {
        privateKey  : 'privateKey',
        privateKeys : ['privateKey'],
        publicKeys  : {bob: 'pubKey', alice: 'pubKey', peer: 'pubKey'},
    };

    t.deepEqual(enc.getUserKeys('bob'), {
        publicKeys  : [enc.keys.publicKeys.bob],
        privateKey  : enc.keys.privateKey,
        privateKeys : enc.keys.privateKeys,
    }, 'returns the users keys');

    t.deepEqual(enc.getUserKeys('alice'), {
        publicKeys  : [enc.keys.publicKeys.bob, enc.keys.publicKeys.alice],
        privateKey  : enc.keys.privateKey,
        privateKeys : enc.keys.privateKeys,
    }, 'contains another users public key');

    t.end();
});

test('components/Encryption: encrypt()', t => {
    const enc     = new Encryption();
    const encrypt = sand.stub().resolves({data: 'encrypted'});
    enc.openpgp   = {
        encrypt,
        message: {
            fromText: data => {
                return data;
            },
        },
    };

    sand.stub(enc, 'getUserKeys').returns({
        privateKey  : 'priv',
        privateKeys : 'priv',
        publicKeys  : ['pub'],
    });

    enc.encrypt({data: 'clear text', username: 'bob'})
    .then(res => {
        t.equal(enc.getUserKeys.calledWith('bob'), true, 'gets bobs public keys');
        t.equal(encrypt.calledWithMatch({
            privateKeys : 'priv',
            publicKeys  : ['pub'],
            data        : 'clear text',
            message     : 'clear text',
            username    : 'bob',

        }), true, 'encrypts data');

        t.equal(res, 'encrypted', 'resolves with encrypted string');

        sand.restore();
        t.end();
    })
    .catch(() => {
        sand.restore();
        t.end('resolve promise');
    });
});

test('components/Encryption: decrypt()', t => {
    const enc   = new Encryption();
    enc.openpgp = {
        decrypt: sand.stub().resolves({data: 'decrypted'}),
        message: {readArmored: () => 'unarmed'},
    };
    sand.stub(enc, 'getUserKeys').returns({privateKey: 'priv', publicKeys: ['pub']});

    enc.decrypt({message: 'encrypted', username: 'bob'})
    .then(res => {
        t.equal(enc.getUserKeys.calledWith('bob'), true, 'gets bobs public keys');
        t.equal(enc.openpgp.decrypt.calledWithMatch({
            privateKey : 'priv',
            publicKeys : ['pub'],
            message    : 'unarmed',
        }), true, 'encrypts data');

        t.equal(res, 'decrypted', 'resolves with decrypted string');

        sand.restore();
        t.end();
    })
    .catch(e => {
        sand.restore();
        t.end(e);
    });
});

test('components/Encryption: encryptModel()', t => {
    const enc  = new Encryption();
    const conf = {encrypt: 0};
    Object.defineProperty(enc, 'configs', {get: () => conf});
    sand.stub(enc, 'encrypt').resolves('encrypted string');

    const model = {
        attributes  : {id: '1', title: 'Hello', content: 'World'},
        encryptKeys : ['title', 'content'],
        set         : sand.stub(),
    };

    enc.encryptModel({model, username: 'bob'})
    .then(() => {
        t.equal(enc.encrypt.notCalled, true, 'does nothing if encryption is disabled');

        conf.encrypt = 1;
        return enc.encryptModel({model, username: 'bob'});
    })
    .then(res => {
        t.equal(enc.encrypt.calledWithMatch({
            username : 'bob',
            data     : JSON.stringify({title: 'Hello', content: 'World'}),
        }), true, 'encrypts model attributes');

        t.equal(model.set.calledWith({encryptedData: 'encrypted string'}), true,
            'saves the result in a new attribute - "encryptedData"');

        t.equal(res, model, 'returns the model');

        sand.restore();
        t.end();
    })
    .catch(() => {
        sand.restore();
        t.end('resolve promise');
    });
});

test('components/Encryption: decryptModel()', t => {
    const enc       = new Encryption();
    const decrypted = JSON.stringify({title: 'Test'});
    sand.stub(enc, 'decrypt').resolves(decrypted);

    const model = {
        attributes  : {encryptedData: ''},
        set         : sand.stub(),
    };

    enc.decryptModel({model})
    .then(res => {
        t.equal(res, model, 'resolves with the model');
        t.equal(enc.decrypt.notCalled, true,
            'does nothing if encryptedData attribute is empty');

        model.attributes.encryptedData = 'encrypted data';
        return enc.decryptModel({model, username: 'bob'});
    })
    .then(res => {
        t.equal(enc.decrypt.calledWith({
            username : 'bob',
            message  : 'encrypted data',
        }), true, 'decrypts "encryptedData" attribute');
        t.equal(model.set.calledWith({title: 'Test'}), true,
            'sets new attributes');
        t.equal(res, model, 'returns the model');

        sand.restore();
        t.end();
    })
    .catch(() => {
        sand.restore();
        t.end('resolve promise');
    });
});

test('components/Encryption: encryptCollection()', t => {
    const enc  = new Encryption();
    const conf = {encrypt: 0};
    Object.defineProperty(enc, 'configs', {get: () => conf});
    sand.stub(enc, 'encryptModel').resolves();
    const collection = new Notes();

    enc.encryptCollection({collection})
    .then(() => {
        t.equal(enc.encryptModel.notCalled, true,
            'does nothing if encryption is disabled');

        conf.encrypt = 1;
        return enc.encryptCollection({collection});
    })
    .then(res => {
        t.equal(res, collection, 'returns the collection');
        t.equal(enc.encryptModel.notCalled, true,
            'does nothing if the collection is empty');

        collection.add([{id: '1'}, {id: '2'}]);
        return enc.encryptCollection({collection, username: 'bob'});
    })
    .then(() => {
        t.equal(enc.encryptModel.callCount, 2, 'encrypts every model in a collection');
        t.equal(enc.encryptModel.calledWith({
            username : 'bob',
            model    : collection.at(0),
        }), true, 'encrypts the first model');
        t.equal(enc.encryptModel.calledWith({
            username : 'bob',
            model    : collection.at(1),
        }), true, 'encrypts the second model');

        sand.restore();
        t.end();
    })
    .catch(() => {
        sand.restore();
        t.end('resolve promise');
    });
});

test('components/Encryption: decryptCollection()', t => {
    const enc = new Encryption();
    sand.stub(enc, 'decryptModel').resolves();
    const collection = new Notes();

    enc.decryptCollection({collection})
    .then(res => {
        t.equal(res, collection, 'returns the collection');
        t.equal(enc.decryptModel.notCalled, true,
            'does nothing if the collection is empty');

        collection.add([{id: '1'}, {id: '2'}]);
        return enc.decryptCollection({collection, username: 'bob'});
    })
    .then(() => {
        t.equal(enc.decryptModel.callCount, 2, 'decrypts every model in a collection');
        t.equal(enc.decryptModel.calledWith({
            username : 'bob',
            model    : collection.at(0),
        }), true, 'decrypts the first model');
        t.equal(enc.decryptModel.calledWith({
            username : 'bob',
            model    : collection.at(1),
        }), true, 'decrypts the second model');

        sand.restore();
        t.end();
    })
    .catch(() => {
        sand.restore();
        t.end('resolve promise');
    });
});