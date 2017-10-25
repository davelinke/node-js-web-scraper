const should = require('chai').should();
const helpers = require('../helpers.js');

const test = ()=>{return 'and it works'};

describe('#mocha',()=>{
    it('is installed',()=>{
        test().should.equal('and it works');
    });
});
