
module.exports = {
    obj: {},
    array: [],
    function: function() {},
    string: 'ABC',
    integer: 1,
    bool: true,
    date: new Date(),
    args: arguments,
    null: null,
    undefined: undefined,
    nan: NaN,
    regex: /xyz/,
    setConditions: function (object) {
        return object != null && object != undefined && object != NaN;
    },
    defaultConditions: function (object) {
        return Boolean(object);
    }
};
