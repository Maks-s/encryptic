'use strict';

exports.command = function(item) {
    this
    .urlHash('notebooks/add')
    .expect.element('#modal input[name="name"]').to.be.present.before(5000);

    this.expect.element('#modal input[name="name"]').to.be.visible.before(5000);
    // this.expect.element('#modal .form-group').to.be.visible.before(5000);

    this.setValue('#modal input[name="name"]', item.name);

    this.perform((client, done) => {
        client.execute(filter => {
            const ops = document.querySelectorAll('#modal select[name="parentId"] option');
            for (let i = 0, len = ops.length; i < len; i++) {
                if (filter && ops[i].text.indexOf(filter) > -1) {
                    document
                    .querySelector('#modal select[name="parentId"]')
                    .selectedIndex = ops[i].index;
                }
            }
        }, [item.parentId], () => {
            done();
        });
    });

    this.keys(this.Keys.ENTER);
    this.expect.element('#modal input[name="name"]').to.be.not.present.before(5000);

    return this;
};
