/**
 * Test components/Sync
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import {default as BModel} from '../../../src/scripts/models/BaseModel';
import Sync from '../../../src/scripts/components/Sync';
import Db from '../../../src/scripts/components/Db';

class Model extends BModel {
    constructor() {
        super();
        this.profileId = 'test';
        this.storeName = 'test-storeName';
    }
}

let sand;
test('components/Sync: before()', t => {
    sand = sinon.createSandbox();
    t.end();
});

test('components/Sync: db()', t => {
    const sync = new Sync();
    t.equal(sync.db instanceof Db, true, 'creates an instance of components/Db');
    t.end();
});

test('components/Sync: use()', t => {
    t.equal(typeof Sync.use(), 'function', 'returns a function');
    t.end();
});

test('components/Sync: sync()', t => {
    const sync  = new Sync();
    const stub  = sand.stub(sync, 'read');
    const model = new Model({id: '1', title: 'Test'});

    sync.sync('read', model, {conditions: 1});
    const called = stub.calledWithMatch(model, {
        idAttribute : 'id',
        conditions  : 1,
        profileId   : model.profileId,
        storeName   : model.storeName,
    });
    t.equal(called, true, 'proxies methods');

    sand.restore();
    t.end();
});

test('components/Sync: sync() - collection', t => {
    const sync  = new Sync();
    const stub  = sand.stub(sync, 'read');

    sync.sync('read', {profileId: 'test', storeName: 'sync'});
    const called = stub.calledWithMatch({}, {
        profileId : 'test',
        storeName : 'sync',
    });
    t.equal(called, true, 'can handle collections');

    sand.restore();
    t.end();
});

test('components/Sync: read()', t => {
    const sync  = new Sync();

    sand.stub(sync, 'findItem');
    sync.read({idAttribute: 'id'}, {test: 1});
    t.equal(sync.findItem.calledWith({idAttribute: 'id'}, {test: 1}), true,
        'will try to find a model by Id');

    sand.stub(sync, 'find');
    sync.read({model: '1'}, {test: 1});
    t.equal(sync.find.calledWith({model: '1'}, {test: 1}), true,
        'will find all models if the first argument is a collection');

    sand.restore();
    t.end();
});

test('components/Sync: findItem() - not found', t => {
    const sync  = new Sync();
    const model = new Model({id: '1', title: 'Test'});

    const res = sync.findItem(model, {id: '1'});
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.catch(err => {
        t.equal(err, 'not found', 'returns "not found" error');
        sand.restore();
        t.end();
    });
});

test('components/Sync: find()', t => {
    const sync = new Sync();
    const coll = {model: Model};

    const res = sync.find(coll, {profileId: 'test', storeName: 'sync-find'});
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(res => {
        t.equal(res, coll, 'returns collection');
        t.end();
    })
    .catch(() => t.end('resolve promise'));
});

test('components/Sync: create() + update()', t => {
    const sync = new Sync();
    const stub = sand.stub(sync, 'save');

    sync.create('1', '2');
    t.equal(stub.calledWith('1', '2'), true, 'executes save method');

    sync.update('1', '2');
    t.equal(stub.calledWith('1', '2'), true, 'executes save method');

    sand.restore();
    t.end();
});

test('components/Sync: save()', t => {
    const sync  = new Sync();
    const model = new Model({id: '1'});
    const opt   = {profileId: 'test', storeName: 'sync-save'};

    model.set('title', 'Test');
    sand.spy(model, 'set');
    sand.stub(model, 'getData').returns({title: 'Test'});

    t.comment(`sync model: ${model.attributes.title}`);
    const res = sync.save(model, opt);
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(() => {
        t.equal(model.set.calledWithMatch({title: 'Test'}), true,
            'sets new attributes');
        sand.restore();
        t.end();
    })
    .catch(() => {
        sand.restore();
        t.end('resolve promise');
    });
});

test('components/Sync: find()', t => {
    const sync = new Sync();
    const opt  = {profileId: 'test', storeName: 'sync-save'};
    const coll = {model: Model};
    coll.add   = sand.stub();

    sync.find(coll, opt)
    .then(() => {
        t.equal(coll.add.called, true, 'adds found models to the collection');
        sand.restore();
        t.end();
    })
    .catch(() => {
        sand.restore();
        t.end('resolve promise');
    });
});

test('components/Sync: delete()', t => {
    const sync  = new Sync();
    const opt   = {profileId: 'test', storeName: 'sync-save'};
    const model = new Model({id: '1'});
    sand.stub(model, 'getData').returns({id: '1'});

    const stub  = sand.stub();
    Object.defineProperty(sync, 'db', {
        get: () => {
            return {processRequest: stub};
        },
    });

    sync.delete(model, opt);
    t.equal(stub.calledWithMatch('removeItem', [{
        profileId : 'test',
        storeName : 'sync-save',
        data      : {id: '1'},
    }]), true, 'removes the model');

    sand.restore();
    t.end();
});
