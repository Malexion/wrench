
var w = require('./index.js');

var wrap = w({
    some: [1, 2, 3],
    hello: 'world',
    deeper: {
        fish: '123',
        foo: ['bar']
    }
});

var array = w([1, 22, 33, 55, 44, 2]);

// array.do(x => console.log(x.value()))
//     .branch()
//     .sort({ dir: 'asc' })
//     .filter(x => x != 2)
//     .first({ take: 3 })
//     .do(x => console.log(x.value()))
//     .merge();

// array.do(x => console.log(x.value()));

// wrap.if(x => x.prop('some').isArray())
//     .then(x => x.branch().prop('some').each(v => console.log(v)));

// wrap.branch()
//     .prop('deeper.foo')
//     .do(x => console.log(x.content));

// console.log('Base Functions:');
// console.log();
// console.log(w.map(w, (x, y) => y).join(', '));

// console.log('Wrapper Functions:');
// console.log();
// console.log(w.map(wrap, (x, y) => y).join(', '));
