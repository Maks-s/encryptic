/* global describe, before, after, it */
'use strict';
const exec = require('child_process').exec;

/**
 * Remove reStore's files.
 */
try {
    exec('rm -rf /tmp/reStore/rs.sync');
}
catch (e) {
    console.log('Unable to remove reStore files', e);
}

describe('RemoteStorage: client 1', () => {
    let data = {};

    before((client, done) => {
        data = {
            note     : {title: 'Note from client 1'},
            notebook : {name: 'Notebook from client 1'},
            tag      : {name: 'Tag from client 1'},
        };

        done();
    });

    after((client, done) => {
        client.end(() => {
            done();
        });
    });

    it('wait', client => {
        client
        .urlHash('notes')
        .expect.element('.list').to.be.present.before(50000);
    });

    it('creates new data', client => {
        client
        .addNote(data.note)
        .pause(500)
        .addNotebook(data.notebook)
        .pause(500)
        .addTag(data.tag);

        client.pause(1000);
        setTimeout(() => {
            console.log('start client 2');
        }, 500);
    });

    // Try to login to a RemoteStorage first
    require('./auth.js');

    it('fetches notes from Remotestorage', client => {
        client.urlHash('notes');
        client.expect.element('#header--add').to.be.present.before(50000);

        client.expect
        .element('#sidebar--content').to.have.text.that.contains('Note from client 2')
        .before(50000);
    });

    it('fetches notebooks & tags from Remotestorage', client => {
        client.urlHash('notebooks');

        client.expect
        .element('#notebooks').text.to.contain('Notebook from client 2')
        .before(50000);

        client.expect
        .element('#tags').text.to.contain('Tag from client 2')
        .that.contains('Tag from client 1')
        .before(50000);
    });

});
