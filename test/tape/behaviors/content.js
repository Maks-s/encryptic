/**
 * Test behaviors/Content
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

import Content from '../../../src/scripts/behaviors/Content';

let sand;
test('behaviors/Content: before()', t => {
    sand = sinon.createSandbox();
    t.end();
});

test('behaviors/Content: events()', t => {
    t.equal(typeof Content.prototype.events(), 'object', 'is an object');
    t.end();
});

test('behaviors/Content: onDestroy()', t => {
    const content   = new Content();
    content.$active = {off: sand.stub()};
    content.hammer  = {destroy: sand.stub()};
    sand.stub(content, 'showSidebar');

    content.onDestroy();
    t.true(content.$active.off.calledWith('click'), 'msg');
    t.true(content.hammer.destroy.called, 'destroyes the hammer instance');
    t.true(content.showSidebar.called, 'shows the sidebar');

    delete content.$active;
    delete content.hammer;
    sand.reset();

    content.onDestroy();
    t.true(content.showSidebar.called, 'always shows the sidebar');

    sand.restore();
    t.end();
});

test('behaviors/Content: listenActive()', t => {
    const content = new Content();

    t.false(content.$active);
    content.listenActive();
    t.true(content.$active);

    t.end();
});

test('behaviors/Content: showSidebar() + showContent()', t => {
    const con = new Content();
    const req = sand.stub(Radio, 'request');

    con.showSidebar();
    t.equal(req.calledWith('Layout', 'toggleContent', {
        visible: false,
    }), true, 'hides content and show the sidebar');

    con.showContent();
    t.equal(req.calledWith('Layout', 'toggleContent', {
        visible: true,
    }), true, 'hides sidebar and show content');

    sand.restore();
    t.end();
});
