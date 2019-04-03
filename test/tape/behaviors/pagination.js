/**
 * Test behaviors/Pagination.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import {View as MnView} from 'backbone.marionette';

import Pagination from '../../../src/scripts/behaviors/Pagination';
import Notes from '../../../src/scripts/collections/Notes';

class View extends MnView {
    behaviors() {
        return [Pagination];
    }
}

let sand;
test('behaviors/Pagination: before()', t => {
    sand = sinon.createSandbox();
    t.end();
});

test('Pagination: ui()', t => {
    t.equal(typeof Pagination.prototype.ui(), 'object', 'returns an object');
    t.end();
});

test('Pagination: events()', t => {
    t.equal(typeof Pagination.prototype.events(), 'object', 'returns an object');
    t.end();
});

test('Pagination: collectionEvents()', t => {
    t.equal(typeof Pagination.prototype.collectionEvents(), 'object',
        'returns an object');

    t.end();
});

test('Pagination: initialize()', t => {
    const listenTo = sand.stub(Pagination.prototype, 'listenTo');
    const view = new View({collection: new Notes()});

    const page = listenTo.firstCall.thisValue;

    t.deepEqual(page.options, view.options, 'uses options from the view');
    t.deepEqual(page.collection, view.options.collection,
        'uses collection from the view');

    t.true(listenTo.calledWith(view.collection.channel, 'page:next'),
        'listens to page:next event on collection channel');

    t.true(listenTo.calledWith(view.collection.channel, 'page:previous'),
        'listens to page:previous event on collection channel');

    sand.restore();
    t.end();
});

test('Pagination: updatePaginationButtons()', t => {
    let prevPage            = false,
        nextPage            = false;
    const oldUi             = Pagination.prototype.ui;
    Pagination.prototype.ui = {
        pageNav  : {toggleClass : sinon.stub()},
        prevPage : {toggleClass : sinon.stub()},
        nextPage : {toggleClass : sinon.stub()},
    };
    Pagination.prototype.collection = {
        hasPreviousPage : () => prevPage,
        hasNextPage     : () => nextPage,
        pagination      : {
            total: 0,
        },
    };

    Pagination.prototype.updatePaginationButtons();

    t.true(Pagination.prototype.ui.pageNav.toggleClass.calledWith('hidden', true),
        'enable "hidden" class on the pagination button group if there\'s 0 page');
    t.true(Pagination.prototype.ui.prevPage.toggleClass.calledWith('disabled', true),
        'enable "disabled" class on the "previous" button if there\'s no previous page');
    t.true(Pagination.prototype.ui.nextPage.toggleClass.calledWith('disabled', true),
        'enable "disabled" class on the "next" button if there\'s no next page');

    sand.reset();

    Pagination.prototype.collection.pagination.total = 10;
    prevPage                                         = true;
    nextPage                                         = true;

    Pagination.prototype.updatePaginationButtons();

    t.true(Pagination.prototype.ui.pageNav.toggleClass.calledWith('hidden', false),
        'disable "hidden" class of the pagination button group if there\'s >0 page');
    t.true(Pagination.prototype.ui.prevPage.toggleClass.calledWith('disabled', false),
        'disable "disabled" class of the "previous" button if there\'s a previous page');
    t.true(Pagination.prototype.ui.nextPage.toggleClass.calledWith('disabled', false),
        'disable "disabled" class of the "next" button if there\'s a next page');

    delete Pagination.prototype.collection;
    Pagination.prototype.ui = oldUi;
    sand.restore();
    t.end();
});

test('Pagination: getNextPage()', t => {
    const collection = new Notes();
    sand.stub(collection, 'hasNextPage').returns(false);
    sand.stub(Pagination.prototype, 'navigatePage');
    sand.stub(collection, 'getNextPage');

    const view = new View({collection});

    view.collection.channel.trigger('page:next');

    t.true(Pagination.prototype.navigatePage.notCalled,
        'does nothing if the collection does not have any next pages left');
    t.true(collection.getNextPage.notCalled,
        'does nothing if the collection does not have any next pages left');

    sand.reset();

    collection.hasNextPage.returns(true);
    view.collection.channel.trigger('page:next');
    t.true(Pagination.prototype.navigatePage.calledWith(1), 'calls navigatePage method');
    t.true(collection.getNextPage.called,
        'calls getNextPage method');

    sand.restore();
    t.end();
});

test('Pagination: getPreviousPage()', t => {
    const collection = new Notes();
    sand.stub(collection, 'hasPreviousPage').returns(false);
    sand.stub(Pagination.prototype, 'navigatePage');
    sand.stub(collection, 'getPreviousPage');

    const view = new View({collection});

    view.collection.channel.trigger('page:previous');

    t.true(Pagination.prototype.navigatePage.notCalled,
        'does nothing if the collection does not have any previous pages left');
    t.true(collection.getPreviousPage.notCalled,
        'does nothing if the collection does not have any previous pages left');

    sand.reset();

    collection.hasPreviousPage.returns(true);
    view.collection.channel.trigger('page:previous');
    t.true(Pagination.prototype.navigatePage.calledWith(-1), 'calls navigatePage method');
    t.true(collection.getPreviousPage.called,
        'calls getPreviousPage method');

    sand.restore();
    t.end();
});

test('Pagination: navigatePage()', t => {
    const request = sand.stub(Radio, 'request');

    Pagination.prototype.options                       = {filterArgs: {page: 10}};
    Pagination.prototype.collection                    = new Notes();
    Pagination.prototype.collection.pagination.current = 8;

    Pagination.prototype.navigatePage(1);
    t.true(request.calledWithMatch('utils/Url', 'navigate', {
        trigger    : false,
        filterArgs : {page: 9},
    }), 'makes a navigate request');
    t.equal(Pagination.prototype.options.filterArgs.page, 9,
        'changes filterArgs.page to next page');

    sand.reset();

    Pagination.prototype.navigatePage(-1);
    t.true(request.calledWithMatch('utils/Url', 'navigate', {
        trigger    : false,
        filterArgs : {page: 7},
    }), 'makes a navigate request');
    t.equal(Pagination.prototype.options.filterArgs.page, 7,
        'changes filterArgs.page to previous page');

    delete Pagination.prototype.options;
    delete Pagination.prototype.collection;
    sand.restore();
    t.end();
});
