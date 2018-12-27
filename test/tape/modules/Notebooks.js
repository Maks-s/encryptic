/**
 * @file Test modules/Module
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import Module from '../../../src/scripts/modules/Notebooks';
import ModuleOrig from '../../../src/scripts/modules/Module';
import Notebooks from '../../../src/scripts/collections/Notebooks';

let sand;
test('modules/Notebooks: before()', t => {
    sand = sinon.createSandbox();
    t.end();
});

test('modules/Notebooks: Collection', t => {
    t.equal(Module.prototype.Collection, Notebooks,
        'uses notebooks collection');
    t.end();
});

test('modules/Notebooks: remove()', t => {
    const mod = new Module();

    sand.stub(mod, 'updateChildren').resolves();
    const remove = sand.stub(ModuleOrig.prototype, 'remove');
    const reply  = sand.stub();
    Radio.replyOnce('collections/Notes', 'changeNotebookId', reply);

    const opt = {model: {id: '1'}};
    const res = mod.remove(opt);
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(() => {
        t.equal(mod.updateChildren.calledWith(opt.model), true,
            'changes parentId of the child notebooks');

        t.equal(reply.calledAfter(mod.updateChildren), true,
            'request notebookId change after updating the child notebooks');
        t.equal(reply.calledWithMatch(opt), true,
            'removes notes attached to the notebook or changes their notebookId to 0');

        t.equal(remove.calledAfter(reply), true,
            'removes the notebook after all other operations');
        t.equal(remove.calledWith(opt), true, 'calls the parent method');

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    })
    .catch(() => {
        mod.channel.stopReplying();
        sand.restore();
        t.end('resolve promise');
    });
});

test('modules/Notebooks: updateChildren()', t => {
    const mod   = new Module();
    const model = new mod.Model({id: '1', parentId: 0}, {profileId: 'test'});
    const coll  = new Notebooks([{id: '1'}, {id: '2'}]);
    sand.stub(mod, 'getChildren').resolves(coll);
    sand.stub(mod, 'saveModel');

    const res = mod.updateChildren(model);
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(() => {
        t.equal(mod.getChildren.calledWith({parentId: '1', profileId: 'test'}), true,
            'finds child notebooks');
        t.equal(mod.saveModel.callCount, 2, 'saves all models');
        t.equal(mod.saveModel.calledWithMatch({data: {parentId: 0}}), true,
            'changes parentId of child notebooks');

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    })
    .catch(() => {
        mod.channel.stopReplying();
        sand.restore();
        t.end('resolve promise');
    });
});

test('modules/Notebooks: getChildren()', t => {
    const mod  = new Module();
    const stub = sand.stub(mod, 'find').resolves();

    mod.collection = new mod.Collection([
        {id: '1', parentId: '0'},
        {id: '2', parentId: '1'},
        {id: '3', parentId: '1'},
    ]);

    mod.getChildren({parentId: '1', profileId: 'test'})
    .then(collection => {
        t.equal(typeof collection, 'object', 'returns an object');
        t.equal(collection.length, 2, 'the collection is not empty');
        t.equal(stub.notCalled, true, 'filters an existing collection');

        mod.collection.reset([]);
        return mod.getChildren({parentId: '1', profileId: 'test'});
    })
    .then(() => {
        t.equal(stub.calledWith({profileId: 'test', conditions: {parentId: '1'}}), true,
            'fetches child notebooks from the database');

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    })
    .catch(() => {
        mod.channel.stopReplying();
        sand.restore();
        t.end('resolve promise');
    });
});

test('modules/Notebooks: find()', t => {
    const mod  = new Module();
    const coll = new mod.Collection();
    const find = sand.stub(ModuleOrig.prototype, 'find')
    .resolves(coll);
    sand.spy(coll, 'getTree');

    Radio.replyOnce('collections/Configs', 'findConfig', () => 'parentId');

    const opt = {profileId: 'test', conditions: '1'};
    mod.find(opt)
    .then(collection => {
        t.equal(typeof collection, 'object', 'returns an object');
        t.equal(collection, coll, 'returns a collection');
        t.equal(find.calledWith(Object.assign({sortField: 'parentId'}, opt)), true,
            'msg');
        t.equal(coll.getTree.calledAfter(find), true, 'builds a tree structure');

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    })
    .catch(() => {
        mod.channel.stopReplying();
        sand.restore();
        t.end('resolve promise');
    });
});
