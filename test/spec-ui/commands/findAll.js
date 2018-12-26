exports.command = function(selector, attr, callback) {
    this.execute((selector, attr) => {
        const els = document.querySelectorAll(selector),
            param = [];

        for (let i = 0, len = els.length; i < len; i++) {
            if (attr) {
                param.push(els[i].getAttribute(attr));
            }
            else {
                param.push(els[i]);
            }
        }

        return param;
    }, [selector, attr], res => {
        callback(res.value);
    });

    return this;
};
