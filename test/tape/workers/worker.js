/**
 * Test workers/worker.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

// Create fake worker environment
const listeners = {};
global.self     = {
    addEventListener: (key, func) => {
        listeners[key] = func;
    },

    postMessage: () => {},
};

// if we use import, it breaks
const {delegator, onMessage} = require('../../../src/scripts/workers/worker');

let sand;
test('worker: before()', t => {
    sand = sinon.createSandbox();
    t.end();
});

test('Worker: removes self.addEventListener', t => {
    t.equal(global.self.addEventListener, undefined,
        'removes self.addEventListener to prevent Prismjs from using our messages');
    t.end();
});

test('Worker: events', t => {
    t.equal(typeof listeners.message, 'function',
        'listens to "message" event');

    t.equal(typeof listeners.error, 'function',
        'listens to "error" event');

    t.end();
});

test('Worker: delegator', t => {
    t.equal(typeof delegator, 'object');
    t.end();
});

test('Worker: delegator.modules', t => {
    t.equal(typeof delegator.modules, 'object');
    t.end();
});

test('Worker: delegator.postResponse()', t => {
    const data = {data: {}, promiseId: 'test-id', action: 'resolve'};
    sand.stub(global.self, 'postMessage');

    delegator.postResponse(data.promiseId, data.data, data.action);
    t.equal(global.self.postMessage.called, true,
        'posts a message');
    t.equal(global.self.postMessage.calledWith(data), true,
        'posts data');

    sand.restore();
    t.end();
});

test('Worker: delegator.execute() - resolve', t => {
    const save = sand.stub(delegator.modules['components/Db'], 'save');
    save.resolves('data');
    const postr = sand.stub(delegator, 'postResponse');

    const data = {file: 'components/Db', method: 'save', args: ['yes']};
    const res  = delegator.execute('test-id', data);

    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(save.calledWith(data.args[0]), true, 'executes a method');

    res.then(() => {
        t.equal(postr.calledWith('test-id', 'data', 'resolve'), true,
            'posts a resolve response');
        sand.restore();
        t.end();
    })
    .catch(() => {
        sand.restore();
        t.end('resolve promise');
    });
});

test('Worker: delegator.execute() - reject', t => {
    const save = sand.stub(delegator.modules['components/Db'], 'save');
    save.returns(Promise.reject('err'));
    const postr = sand.stub(delegator, 'postResponse');

    const data = {file: 'components/Db', method: 'save', args: ['yes']};
    delegator.execute('test-id', data)
    .then(() => {
        t.equal(postr.calledWith('test-id', 'err', 'reject'), true,
            'posts a reject response');

        sand.restore();
        t.end();
    })
    .catch(() => {
        sand.restore();
        t.end('resolve promise');
    });
});

test('Worker: delegator.execute() - class does not exist', t => {
    const postr = sand.stub(delegator, 'postResponse');

    delegator.execute('test-id', {file: '404'});
    t.equal(postr.calledWith('test-id', 'Class does not exist', 'reject'), true,
        'posts a reject response if class does not exist');

    sand.restore();
    t.end();
});

test('Worker: delegator.execute() - method does not exist', t => {
    const postr = sand.stub(delegator, 'postResponse');

    delegator.execute('test-id', {file: 'components/Db', method: 's404'});
    t.equal(postr.calledWith('test-id', 'Method does not exist', 'reject'), true,
        'posts a reject response if a method does not exist');

    sand.restore();
    t.end();
});

test('Worker: onMessage()', t => {
    const stub = sand.stub(delegator, 'execute');
    const data = {action: 'execute', promiseId: 'test', data: {}};

    onMessage({data});
    t.equal(stub.calledWith(data.promiseId, data.data), true,
        'handles "execute" message');

    sand.restore();
    t.end();
});

test('Worker: onMessage() - unhandled message', t => {
    const stub = sand.stub(delegator, 'execute');

    onMessage({data: {data: {}}});
    t.equal(stub.notCalled, true, 'does nothing if action is undefined');

    sand.restore();
    t.end();
});

test('Worker: message listener', t => {
    const stub = sand.stub(delegator, 'execute');

    listeners.message({data: {action: 'execute', data: {}}});
    t.equal(stub.called, true, 'handles "message" events');

    sand.restore();
    t.end();
});

test('Worker: error listener', t => {
    t.equal(listeners.error('error'), undefined);
    t.end();
});

test('Worker: after()', t => {
    global.self = null;
    sand.restore();
    t.end();
});
