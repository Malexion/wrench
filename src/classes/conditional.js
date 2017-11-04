
class Conditional {
    constructor(func) {
        var res = x => { this.state = true; this.content = x; },
            rej = x => { this.state = false; this.content = x; };

        func(res, rej);
    }

    then(func) {
        if(this.state)
            func(this.content);
        return this;
    }

    else(func) {
        if(!this.state)
            func(this.content);
        return this;
    }
}

module.exports = Conditional;
