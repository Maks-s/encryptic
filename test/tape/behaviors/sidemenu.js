/**
 * Test behaviors/Sidemenu.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import Mn from 'backbone.marionette';
import Mousetrap from 'mousetrap';

import Sidemenu from '../../../src/scripts/behaviors/Sidemenu';

class View extends Mn.View {

    get channel() {
        return Radio.channel('test/view');
    }

    get behaviors() {
        return [Sidemenu];
    }

}

let sand;
test('behaviors/Sidemenu: before()', t => {
    sand = sinon.createSandbox();
    t.end();
});

test('behaviors/Sidemenu: ui()', t => {
    t.equal(typeof Sidemenu.prototype.ui(), 'object');
    t.end();
});

test('behaviors/Sidemenu: events()', t => {
    t.equal(typeof Sidemenu.prototype.events(), 'object');
    t.end();
});

test('behaviors/Sidemenu: initialize()', t => {
    const listen = sand.stub(Sidemenu.prototype, 'listenTo');
    View.prototype.smenuHammerEvents = {
        swiperight: '1',
        swipeleft : '2',
    };
    const view   = new View();

    t.true(listen.calledWith(view.channel, 'show:sidemenu'),
        'shows the menu on show:sidemenu event triggered on the view radio channel');

    t.true(listen.calledWith(Radio.channel('utils/Keybindings'), 'appShowSidemenu'),
        'shows the menu on appShowSidemenu event triggered on utils/Keybindings channel');

    t.deepEqual(listen.firstCall.thisValue.hammerEvents, {
        swiperight: '1',
        swipeleft : '2',
    }, 'views\' smenuHammerEvents overwrites hammerEvents');

    sand.reset();

    delete View.prototype.smenuHammerEvents;
    new View();
    t.equal(typeof listen.firstCall.thisValue.hammerEvents, 'object',
        'uses default hammerEvents if no smenuHammerEvents is provided');

    sand.restore();
    t.end();
});

test('behaviors/Sidemenu: onDestroy()', t => {
    Sidemenu.prototype.hammer  = {destroy: sand.stub()};
    Sidemenu.prototype.hammer2 = {destroy: sand.stub()};
    const view                 = new View();

    view.destroy();
    t.true(Sidemenu.prototype.hammer.destroy.called,
        'stops listening to hammer events');
    t.true(Sidemenu.prototype.hammer2.destroy.called,
        'stops listening to hammer events');

    sand.restore();
    delete Sidemenu.prototype.hammer;
    delete Sidemenu.prototype.hammer2;
    t.end();
});

test('behaviors/Sidemenu: onRender()', t => {
    const stub = sand.stub(Sidemenu.prototype, 'listenToHammer');
    const view = new View();

    view.trigger('render');
    t.true(stub.called, 'starts listening to Hammer events');
    t.equal(typeof stub.firstCall.thisValue.$backdrop, 'object',
        'creates $backdrop property');

    sand.restore();
    t.end();
});

test('behaviors/Sidemenu: showMenu()', t => {
    Sidemenu.prototype.$backdrop = {addClass: sand.stub(), on: sand.stub()};
    const oldUi                  = Sidemenu.prototype.ui;
    Sidemenu.prototype.ui        = {
        sidemenu: {
            addClass: sand.stub(),
            scrollTop: sand.stub(),
        },
    };
    sand.spy(Mousetrap, 'bind');

    t.equal(Sidemenu.prototype.showMenu(), false, 'returns false');

    t.true(Sidemenu.prototype.ui.sidemenu.addClass.calledWith('-show'), 'shows the menu');
    t.true(Sidemenu.prototype.$backdrop.addClass.calledWith('-show'),
        'shows the backdrop');
    t.true(Sidemenu.prototype.ui.sidemenu.scrollTop.calledWith(0),
        'resets the scroll position');
    t.true(Sidemenu.prototype.$backdrop.on.calledWith('click'),
        'hides the menu if the backdrop is clicked');

    sand.stub(Sidemenu.prototype, 'hideMenu');

    Mousetrap.trigger('esc');
    t.true(Sidemenu.prototype.hideMenu.called, 'hides the menu on Escape');

    delete Sidemenu.prototype.$backdrop;
    Sidemenu.prototype.ui = oldUi;
    sand.restore();
    t.end();
});

test('behaviors/Sidemenu: onBackdropClick()', t => {
    sand.stub(Sidemenu.prototype, 'hideMenu');
    Sidemenu.prototype.$backdrop = {off: sand.stub()};

    Sidemenu.prototype.onBackdropClick();

    t.true(Sidemenu.prototype.hideMenu.called, 'hides the menu');
    t.true(Sidemenu.prototype.$backdrop.off.calledWith('click'),
        'stops listening to click event');

    delete Sidemenu.prototype.$backdrop;
    sand.restore();
    t.end();
});

test('behaviors/Sidemenu: hideMenu()', t => {
    const oldUi                  = Sidemenu.prototype.ui;
    Sidemenu.prototype.ui        = {sidemenu: {removeClass: sand.stub()}};
    Sidemenu.prototype.$backdrop = {removeClass: sand.stub()};

    Sidemenu.prototype.hideMenu();

    t.true(Sidemenu.prototype.ui.sidemenu.removeClass.calledWith('-show'),
        'removes -show class from the menu');
    t.true(Sidemenu.prototype.$backdrop.removeClass.calledWith('-show'),
        'removes -show class from the backdrop');

    const e = {
        preventDefault : sand.stub(),
        currentTarget  : {hasClass: () => true},
    };
    Sidemenu.prototype.hideMenu(e);
    t.true(e.preventDefault.called,
        'prevents the default behavior the current target is not a link');

    Sidemenu.prototype.ui = oldUi;
    delete Sidemenu.prototype.$backdrop;
    sand.restore();
    t.end();
});
