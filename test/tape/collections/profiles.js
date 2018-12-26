/**
 * @file Test collections/Profiles
 */
import test from 'tape';
import '../../../src/scripts/utils/underscore';
import Profiles from '../../../src/scripts/collections/Profiles';
import Profile from '../../../src/scripts/models/Profile';

test('collections/Profiles: model', t => {
    t.equal(Profiles.prototype.model, Profile);
    t.end();
});

test('collections/Profiles: constructor()', t => {
    const prof = new Profiles();
    t.equal(prof.profileId, 'default', 'profileId is always equal to "default"');
    t.end();
});
