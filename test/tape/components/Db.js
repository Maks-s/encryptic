/**
 * Test components/Db.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import localforage from 'localforage';

import Db from '../../../src/scripts/components/Db';

let sand;
test('components/Db: before()', t => {
    sand = sinon.createSandbox();
    localStorage.clear();
    t.end();
});

test('components/Db: constructor()', t => {
    const db = new Db();
    t.equal(typeof db.dbs, 'object', 'creates dbs property');
    t.end();
});

test('components/Db: fileName()', t => {
    const db = new Db();
    t.equal(db.fileName, 'components/Db', 'returns relative path');
    t.end();
});

test('components/Db: getDb()', t => {
    const db  = new Db();
    const spy = sand.spy(localforage, 'createInstance');

    const res = db.getDb({profileId: 'test', storeName: 'tests'});
    t.equal(spy.calledWith({name: 'lav-test', storeName: 'tests'}), true,
        'creates a new localforage instance');
    t.equal(typeof res, 'object', 'returns localforage instance');

    t.equal(db.getDb({profileId: 'notes-db', storeName: 'test'}), db.dbs['notes-db/test'],
        'does not prefix notes-db');

    sand.restore();
    t.end();
});

test('components/Db: getDb() - old instance', t => {
    const db       = new Db();
    const spy      = sand.spy(localforage, 'createInstance');
    const instance = {test: 1};
    db.dbs['test/tests'] = instance;

    const res = db.getDb({profileId: 'test', storeName: 'tests'});
    t.equal(spy.notCalled, true, 'does not create a new instance');
    t.equal(res, instance, 'uses an existing instance');

    sand.restore();
    t.end();
});

test('components/Db: findItem()', t => {
    const db   = new Db();
    const stub = sand.stub().resolves();
    sand.stub(db, 'getDb').returns({getItem: stub});

    const opt = {storeName: 'findItem', profileId: 'test', id: 'test-id'};
    const res = db.findItem(opt);

    t.equal(db.getDb.calledWith(opt), true, 'gets a localforage instance first');
    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(stub.called, true, 'msg');

    sand.restore();
    t.end();
});

test('components/Db: find()', t => {
    const db  = new Db();
    const spy = sand.spy(db, 'getDb');
    const opt = {storeName: 'find', profileId: 'test', id: '1'};
    const res = db.find(opt);

    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(spy.calledWith(opt), true, 'gets a localforage instance');

    res.then(val => {
        t.equal(Array.isArray(val), true, 'resolves with an array');
        t.equal(val.length, 0, 'resolves with empty array');
        sand.restore();
        t.end();
    })
    .catch(() => {
        sand.restore();
        t.end('resolve promise');
    });
});

test('components/Db: save()', t => {
    const db  = new Db();
    const spy = sand.spy(db, 'getDb');
    const opt = {storeName: 'save', profileId: 'test', id: '1'};

    const res = db.save(Object.assign({data: {t: '1'}}, opt));

    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(spy.calledWithMatch(opt), true, 'gets a localforage instance');

    res.then(() => {
        sand.restore();
        t.end();
    })
    .catch(() => {
        sand.restore();
        t.end('resolve promise');
    });
});

test('components/Db: save() - generates ID if it is empty', t => {
    const db  = new Db();
    const opt = {storeName: 'save-generate-id', profileId: 'test'};

    db.save(Object.assign({data: {title: 'Test'}}, opt))
    .then(data => {
        t.equal(typeof data.id, 'string', 'ID is not empty');
        t.equal(data.id.length >= 32, true, 'contains at least 32 characters');
        t.end();
    })
    .catch(() => t.end('resolve promise'));
});

test('components/Db: findItem() - can find', t => {
    const db  = new Db();
    const opt = {storeName: 'findItem-can-find', profileId: 'test', id: '1'};

    db.save(Object.assign({data: {title: 'Test'}}, opt))
    .then(() => db.findItem(opt))
    .then(res => {
        t.comment(`res ${res}`);
        t.equal(typeof res, 'object', 'resolves with an object');
        t.equal(res.title, 'Test', 'has a title');
        t.equal(res.id, '1', 'has an ID');
        t.end();
    })
    .catch(() => t.end('resolve promise'));
});

test('components/Db: find() - can find', t => {
    const db  = new Db();
    const opt = {storeName: 'find-can-find', profileId: 'test'};

    Promise.all([
        db.save(Object.assign({data: {fav: 'no'}, id: '1'}, opt)),
        db.save(Object.assign({data: {fav: 'no'}, id: '2'}, opt)),
        db.save(Object.assign({data: {fav: 'no'}, id: '3'}, opt)),
    ])
    .then(() => db.find(opt))
    .then(res => {
        t.comment(`length is ${res.length}`);
        t.equal(Array.isArray(res), true, 'resolves with an array');
        t.equal(res.length, 3, 'the array is not empty');
        t.end();
    })
    .catch(() => t.end('resolve promise'));
});

test('components/Db: find() - filters the results', t => {
    const db  = new Db();
    const opt = {storeName: 'find-filters', profileId: 'test'};

    Promise.all([
        db.save(Object.assign({data: {isFav: true}, id: '1'}, opt)),
        db.save(Object.assign({data: {isFav: true}, id: '2'}, opt)),
        db.save(Object.assign({data: {title: 'yes'}, id: '3'}, opt)),
    ])
    .then(() => db.find(Object.assign({conditions: {isFav: true}}, opt)))
    .then(res => {
        t.equal(Array.isArray(res), true, 'resolves with an array');
        t.comment(`result length is: ${res.length}`);
        t.equal(res.length, 2, 'msg');

        t.equal(res[0].isFav, true, 'the first item has isFav === true');
        t.equal(res[1].isFav, true, 'the second item has isFav === true');

        t.end();
    })
    .catch(() => t.end('resolve promise'));
});

test('components/Db: removeItem()', t => {
    const db         = new Db();
    const opt        = {
        storeName   : 'find-filters',
        profileId   : 'test',
        idAttribute : 'username',
        data        : {username: 'bob'},
    };
    const removeItem = sand.stub();
    sand.stub(db, 'getDb').returns({removeItem});

    db.removeItem(opt);
    t.equal(db.getDb.calledWith(opt), true, 'calls "getDb" method');
    t.equal(removeItem.calledWith('bob'), true, 'removes the item');

    db.removeItem({data: {id: '1'}});
    t.equal(removeItem.calledWith('1'), true, 'uses "id" as idAttribute');

    sand.restore();
    t.end();
});

test('components/Db: after()', t => {
    localStorage.clear();
    sand.restore();
    t.end();
});