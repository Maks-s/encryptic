/**
 * Test behaviors/Sidebar
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

import Sidebar from '../../../src/scripts/behaviors/Sidebar';

let sand;
test('behaviors/Sidebar: before()', t => {
    sand = sinon.createSandbox();
    t.end();
});

test('behaviors/Sidebar: onDestroy()', t => {
    const side  = new Sidebar();
    side.hammer = {destroy: sand.stub()};

    side.onDestroy();
    t.true(side.hammer.destroy.called, 'destroyes the hammer instance');

    sand.restore();
    t.end();
});

test('behaviors/Sidebar: onSwipeRight()', t => {
    const side = new Sidebar();
    const trig = sand.stub(Radio, 'trigger');

    side.onSwipeRight();
    t.true(trig.calledWith('components/navbar', 'show:sidemenu'),
        'shows the sidebar menu');

    sand.restore();
    t.end();
});

test('behaviors/Sidebar: onSwipeLeft()', t => {
    const side = new Sidebar();
    side.view  = {noSwipeLeft: true};
    const req  = sand.stub(Radio, 'request');

    side.onSwipeLeft();
    t.true(req.notCalled, 'does nothing if the noSwipeRight property is equal to true');

    side.view.noSwipeLeft = false;
    side.onSwipeLeft();
    t.true(req.calledWith('Layout', 'toggleContent', {visible: true}),
        'shows content region and hides the sidebar');

    sand.restore();
    t.end();
});
