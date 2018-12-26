/**
 * Test components/fuzzySearch/main
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import '../../../../src/scripts/utils/underscore';

import main from '../../../../src/scripts/components/fuzzySearch/main';
import regionClass from '../../../../src/scripts/components/fuzzySearch/views/Region';

let sand;
test('fuzzySearch/main: before()', t => {
    sand = sinon.createSandbox();
    t.end();
});

test('fuzzySearch/main: initialize()', t => {
    const on = sand.stub();
    sand.stub(Radio, 'channel').withArgs('components/navbar')
    .returns({on});
    sand.stub(main, 'createRegion');

    main.initialize();
    t.equal(main.createRegion.called, true, 'creates fuzzySearch region');
    t.equal(on.calledWith('shown:search'), true, 'listens to shown:search event');

    sand.restore();
    t.end();
});

test('fuzzySearch/main: createRegion()', t => {
    const req = sand.stub(Radio, 'request');

    main.createRegion();
    t.equal(req.calledWith('Layout', 'add', {
        region        : 'fuzzySearch',
        regionOptions : {regionClass, el: '#sidebar--fuzzy'},
    }), true, 'creates fuzzySearch region');

    sand.restore();
    t.end();
});
