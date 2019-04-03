/**
 * @file Test modules/Notes
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

import Module from '../../../src/scripts/modules/Notes';
import ModuleOrig from '../../../src/scripts/modules/Module';
import Notes from '../../../src/scripts/collections/Notes';

let sand;
test('modules/Notes: before()', t => {
    sand = sinon.createSandbox();
    t.end();
});

test('modules/Notes: Collection', t => {
    t.equal(Module.prototype.Collection, Notes,
        'uses notes collection');
    t.end();
});

test('modules/Notes: constructor()', t => {
    const reply = sand.stub(Module.prototype.channel, 'reply');
    const mod   = new Module();

    const replies = {restore: mod.restore, changeNotebookId: mod.changeNotebookId};
    t.equal(reply.calledWith(replies), true,
        'replies to restore and changeNotebookId request');

    sand.restore();
    t.end();
});

test('modules/Notes: saveModel()', t => {
    const mod   = new Module();
    const model = new mod.Model(
        {id: 'test-save1', tags: ['1', '2']},
        {profileId: 'test'}
    );
    const save  = sand.stub(ModuleOrig.prototype, 'saveModel');
    const reply = sand.stub().resolves();
    Radio.replyOnce('collections/Tags', 'addTags', reply);

    mod.saveModel({model});
    t.equal(save.calledWith({model}), true, 'saves the model');
    t.equal(reply.notCalled, true, 'does not create tags if saveTags is undefined');

    return mod.saveModel({model, saveTags: true})
    .then(() => {
        t.equal(reply.calledWith({tags: model.attributes.tags, profileId: 'test'}), true,
            'creates new tags if saveTags is equal to true');
        t.equal(save.calledWith({model}), true, 'saves the model');

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

test('modules/Notes: remove()', t => {
    const mod    = new Module();
    const model  = new mod.Model({id: '1', trash: 1});
    const remove = sand.stub(ModuleOrig.prototype, 'remove');
    const save   = sand.stub(mod, 'saveModel').resolves();
    sand.stub(mod.channel, 'trigger');

    mod.remove({model})
    .then(() => {
        t.equal(remove.calledWith({model}), true,
            'removes the model if it is already in trash');

        model.set({trash: 0});
        return mod.remove({model});
    })
    .then(() => {
        t.equal(save.calledWith({model, data: {trash: 1}}), true,
            'changes a models trash status');
        t.equal(mod.channel.trigger.calledWith('destroy:model', {model}), true,
            'triggers "destroy:model" event');

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

test('modules/Notes: findOrFetch()', t => {
    const mod  = new Module();
    const find = sand.stub(mod, 'findModel').resolves();

    mod.findOrFetch({model: {id: '1'}})
    .then(model => {
        t.deepEqual(model, {id: '1'}, 'returns the model');
        t.equal(find.notCalled, true, 'does not fetch if model exists in the options');

        return mod.findOrFetch({id: '1'});
    })
    .then(() => {
        t.equal(find.calledWith({id: '1'}), true, 'fetches the model from database');

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

test('modules/Notes: restore()', t => {
    const mod   = new Module();
    const model = new mod.Model({id: '1', trash: 2});
    const save  = sand.stub(mod, 'saveModel').resolves();
    sand.stub(mod.channel, 'trigger');

    mod.restore({model})
    .then(() => {
        t.equal(save.calledWith({model, data: {trash: 0}}), true,
            'changes trash status of the model and saves it');
        t.equal(mod.channel.trigger.calledWith('restore:model', {model}), true,
            'triggers "restore:model" event');

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

test('modules/Notes: changeNotebookId()', t => {
    const mod        = new Module();
    const model      = new mod.Model({id: '1'}, {profileId: 'test'});
    const collection = new mod.Collection([{id: '1'}, {id: '2'}]);
    sand.stub(mod, 'find').resolves(collection);
    sand.stub(mod, 'save');

    mod.changeNotebookId({model})
    .then(() => {
        const opt = {profileId: 'test', conditions: {notebookId: '1'}};
        t.equal(mod.find.calledWith(opt), true,
            'fetches notes associated with the notebook');
        t.equal(mod.save.calledWith({collection, data: {notebookId: 0}}), true,
            'changes notebookId to 0');

        return mod.changeNotebookId({model, removeNotes: true});
    })
    .then(() => {
        t.equal(mod.save.calledWith({collection, data: {notebookId: 0, trash: 1}}), true,
            'changes notebookId to 0 and trash status to 1');

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

test('modules/Notes: find()', t => {
    const mod        = new Module();
    const collection = new mod.Collection([{id: '1'}, {id: '2'}]);
    const find       = sand.stub(ModuleOrig.prototype, 'find');
    find.resolves(collection);
    Radio.replyOnce('collections/Configs', 'findConfig', () => 'id');

    const opt = {profileId: 'test', filter: 'yes'};
    return mod.find(opt)
    .then(() => {
        t.equal(find.calledWithMatch({profileId: 'test', sortField: 'id'}), true,
            'uses sortField config when fetching models');

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

test('modules/Notes: findModel()', t => {
    const mod   = new Module();
    const model = new mod.Model({id: '1'});
    const find  = sand.stub(ModuleOrig.prototype, 'findModel')
    .resolves(model);

    sand.stub(mod, 'findAttachments');

    return mod.findModel({id: '1', profileId: 'test'})
    .then(() => {
        t.equal(find.calledWith({id: '1', profileId: 'test'}), true,
            'fetches the model');
        t.equal(mod.findAttachments.notCalled, true,
            'does not fetch attachments if findAttachments is false');

        return mod.findModel({id: '1', profileId: 'test', findAttachments: true});
    })
    .then(() => {
        t.equal(mod.findAttachments.calledWith({model}), true,
            'fetches attachments too if findAttachments is equal to true');

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

test('modules/Notes: findAttachments()', t => {
    const mod   = new Module();
    const model = new mod.Model(
        {id: '1', files: ['1', '2'], notebookId: '12'},
        {profileId: 'test'}
    );
    const req = sand.stub(Radio, 'request').resolves('html');
    sand.stub(mod, 'findNotebook');
    sand.stub(mod, 'findFiles');

    mod.findAttachments({model})
    .then(() => {
        t.equal(req.calledWith('components/markdown', 'render', model.attributes), true,
            'converts markdown to HTML');
        t.equal(mod.findNotebook.calledWith(model), true,
            'fetches the attached notebook');
        t.equal(mod.findFiles.calledWith(model), true,
            'fetches the attached file models');

        sand.restore();
        mod.channel.stopReplying();
        t.end();
    })
    .catch(() => {
        sand.restore();
        mod.channel.stopReplying();
        t.end('resolve promise');
    });
});

test('modules/Notes: findAttachments() - do not make requests', t => {
    const mod   = new Module();
    const model = new mod.Model({id: '1'}, {profileId: 'test'});
    const req   = sand.stub(Radio, 'request').resolves('');
    sand.stub(mod, 'findNotebook');
    sand.stub(mod, 'findFiles');

    mod.findAttachments({model})
    .then(() => {
        t.equal(req.calledWith('components/markdown', 'render', model.attributes), true,
            'converts content from Markdown to HTML');
        t.equal(model.htmlContent, '', 'creates htmlContent property');

        t.equal(mod.findNotebook.notCalled, true,
            'does not try to fetch a notebook if the note does not have notebookId');
        t.equal(mod.findFiles.notCalled, true,
            'does not try to fetch file models if the note does not have any files');

        sand.restore();
        mod.channel.stopReplying();
        t.end();
    })
    .catch(() => {
        sand.restore();
        mod.channel.stopReplying();
        t.end('resolve promise');
    });
});

test('modules/Notes: findNotebook()', t => {
    const mod   = new Module();
    const model = new mod.Model({notebookId: '1'}, {profileId: 'test'});
    const req   = sand.stub(Radio, 'request').resolves({});
    sand.spy(model, 'set');

    mod.findNotebook(model)
    .then(() => {
        t.equal(req.calledWith('collections/Notebooks', 'findModel', {
            profileId : 'test',
            id        : '1',
        }), true, 'fetches the notebook');

        t.equal(model.set.calledWith('notebook'), true, 'sets notebook attrubute');
        t.equal(typeof model.attributes.notebook, 'object',
            'creates notebook property');

        sand.restore();
        mod.channel.stopReplying();
        t.end();
    })
    .catch(() => {
        sand.restore();
        mod.channel.stopReplying();
        t.end('resolve promise');
    });
});

test('modules/Notes: findFiles()', t => {
    const mod   = new Module();
    const model = new mod.Model({files: ['1', '2']}, {profileId: 'test'});
    const req   = sand.stub(Radio, 'request').resolves([]);
    sand.spy(model, 'set');

    mod.findFiles(model)
    .then(() => {
        t.equal(req.calledWithMatch('collections/Files', 'findFiles', {
            profileId : 'test',
            ids       : model.get('files'),
        }), true, 'fetches files');

        t.equal(model.set.calledWith('fileModels'), true, 'sets fileModels attrubute');
        t.equal(Array.isArray(model.attributes.fileModels), true,
            'creates fileModels property');

        sand.restore();
        mod.channel.stopReplying();
        t.end();
    })
    .catch(() => {
        sand.restore();
        mod.channel.stopReplying();
        t.end('resolve promise');
    });
});