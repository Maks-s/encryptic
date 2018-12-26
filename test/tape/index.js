import {JSDOM} from 'jsdom';
import {mkdirSync} from 'fs';
import glob from 'glob';
import {LocalStorage} from 'node-localstorage';
import overrideTemplate from './overrideTemplate';
import raf from 'raf';
import _ from 'underscore';

try {
    mkdirSync(`${__dirname}/../../_dev`);
    mkdirSync(`${__dirname}/../../_dev/scratch`);
}
// eslint-disable-next-line
catch (e) {
}

global.localStorage     = new LocalStorage(`${__dirname}/../../_dev/scratch`);
global.overrideTemplate = overrideTemplate;
global.requestAnimationFrame = raf;

/**
 * Create DOM environment.
 */
JSDOM.fromFile(`${__dirname}/../../src/index.html`, {
    url         : 'http://localhost/#',
    contentType : 'text/html',
})
.then(doc => {
    global.window            = doc.window;
    global.document          = doc.window.document;
    global.navigator         = doc.window.navigator;
    global.location          = doc.window.location;
    global.HTMLElement       = doc.window.HTMLElement;
    global.HTMLAnchorElement = doc.window.HTMLAnchorElement;
    global.performance       = doc.window.performance;

    global.window._localStorage = global.localStorage;
    global.window.setTimeout    = setTimeout;
    global.window.clearTimeout  = clearTimeout;

    // Automatically require all test files
    glob.sync(`${__dirname}/**/*.js`)
    .filter(file => file !== __filename.replace('\\', '/'))
    .forEach(file => require(file));
});
