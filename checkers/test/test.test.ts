import { suite, test } from 'mocha-typescript';
// noinspection ES6UnusedImports
import { copySync } from 'fs-extra';
import { bootstrap } from './_support/bootstrap';


@suite
class TestTest {

    /** once before all tests */
    static before() {
        bootstrap();
    }

    /** every before each test */
    before() {

    }

    @test testPrepareArgumentVariations() {
        'asdf'.length.should.equal(4);
    }

    // @test testParseArgumentsSome() {
    //     let parsed = parseArguments([ 'foo', 'bar', 'laat', 'die' ], this.config.arguments);
    //     let a      = parsed.arguments
    //     a[ 'name' ].should.eq('foo');
    //     a[ 'projects' ].should.contain.ordered.members([ 'bar', 'laat', 'die' ])
    //
    //     a[ 'num' ].should.eq(123);
    //     a[ 'nums' ].should.contain.ordered.members([ 123, 321 ])
    //     a[ 'bool' ].should.eq(true)
    //     a[ 'bools' ].should.contain.ordered.members([ true, false, true ])
    // }
}
