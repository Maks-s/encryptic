/**
 * Test components/importExport/main
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import '../../../../src/scripts/utils/underscore';

import main from '../../../../src/scripts/components/importExport/main';
import Import from '../../../../src/scripts/components/importExport/Import';
import Export from '../../../../src/scripts/components/importExport/Export';

let sand;
test('importExport/Main: before()', t => {
    sand = sinon.createSandbox();
    main();
    t.end();
});

test('importExport/Main: responds to "import" request', t => {
    const init = sand.stub(Import.prototype, 'init');

    Radio.request('components/importExport', 'import');
    t.equal(init.called, true);

    sand.restore();
    t.end();
});

test('importExport/Main: responds to "export" request', t => {
    const init = sand.stub(Export.prototype, 'init');

    Radio.request('components/importExport', 'export');
    t.equal(init.called, true);

    sand.restore();
    t.end();
});

test('importExport/Main: adds "App:checks" initializer', t => {
    const req = sand.stub(Radio, 'request');

    main();
    t.equal(req.calledWithMatch('utils/Initializer', 'add', {
        name: 'App:last',
    }), true, 'msg');

    sand.restore();
    t.end();
});
