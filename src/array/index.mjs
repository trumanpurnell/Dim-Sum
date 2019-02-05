import { add, multiply, subtract, divide, min, range, max, noop, axisSuite, pairSuite, round, fill } from '../ops/element'
import { matMultSuite, invSuite, crossProduct, identity } from '../ops/linalg'
import { randint } from '../ops/probability'

import { getFullySpecifiedIndex } from './utils.mjs'
import { shape, stringify } from '../array/utils'
import util from 'util' // node's
import Header from './header'


export default class MultiDimArray {

    constructor(args) {
        this.header = args.header
        this.type = args.type
        this.data = args.data || new this.type(this.header.size)
    }

    static array(args) {
        return fill({
            values: args.from,
            result: new MultiDimArray({
                type: args.type || Float64Array,
                header: new Header({ shape: shape(args.from) }),
            })
        })
    }

    static zeros(args) {
        return fill({
            values: 0,
            result: args.result || new MultiDimArray({
                type: args.type || Float64Array,
                header: new Header({ shape: args.shape }),
            })
        })
    }

    static ones(args) {
        return fill({
            values: 1,
            result: args.result || new MultiDimArray({
                type: args.type || Float64Array,
                header: new Header({ shape: args.shape }),
            })
        })
    }

    static arange(args) {
        const start = args.start || 0
        const step = args.step || 1
        const stop = args.stop

        return range({
            start, step, stop,
            result: args.result || new MultiDimArray({
                type: args.type || Float64Array,
                header: new Header({ shape: [Math.ceil((stop - start) / step)] })
            })
        })
    }

    static randint(args) {
        return fill({
            values: function () { return randint(args.low, args.high) },
            result: args.result || new MultiDimArray({
                type: args.type || Int32Array,
                header: new Header({ shape })
            })
        })
    }

    static dot(args) {
        return matMultSuite.call({
            of: args.of,
            with: args.with,
            result: args.result || new MultiDimArray({
                type: args.type || Float64Array,
                header: new Header({
                    shape: [args.of.header.shape[0], args.with.header.shape[1]]
                })
            })
        })
    }

    static cross(args) {
        return crossProduct({
            of: args.of,
            with: args.with,
            result: args.result || new MultiDimArray({
                type: args.type || Float64Array,
                header: new Header({ shape: [3] })
            })
        })
    }

    static inv(args) {
        return invSuite.call({
            of: args.of,
            result: args.result || this.eye({ shape: args.of.header.shape })
        })
    }

    static eye(args) {
        return identity({
            result: args.result || new MultiDimArray({
                type: args.type || Float64Array,
                header: new Header({ shape: args.shape })
            })
        })
    }

    copy() {
        return new MultiDimArray({
            type: this.type,
            header: this.header,
            data: this.data.slice()
        })
    }

    round(args) {
        return axisSuite.call({
            of: this,
            reducer: noop,
            mapper: round.bind(null, args.precision),
            axes: [[], this.header.indices],
            result: args.result || new MultiDimArray({
                type: args.type || this.type,
                header: this.header
            })
        })
    }

    max(args) {
        return axisSuite.call({
            of: this,
            reducer: max,
            mapper: noop,
            axes: args.axes,
            result: args.result || new MultiDimArray({
                type: args.type || this.type,
                header: this.header.axisSlice(args.axes)
            })
        })
    }

    min(args) {
        return axisSuite.call({
            of: this,
            reducer: min,
            mapper: noop,
            axes: args.axes,
            result: args.result || new MultiDimArray({
                type: args.type || this.type,
                header: this.header.axisSlice(args.axes)
            })
        })
    }

    add(args) {
        return pairSuite.call({
            of: this,
            with: args.with,
            reducer: add,
            result: args.result || new MultiDimArray({
                type: args.type || this.type,
                header: new Header({ shape: this.header.shape })
            })
        })
    }

    subtract(args) {
        return pairSuite.call({
            of: this,
            with: args.with,
            reducer: subtract,
            result: args.result || new MultiDimArray({
                type: args.type || this.type,
                header: new Header({ shape: this.header.shape })
            })
        })
    }

    multiply(args) {
        return pairSuite.call({
            of: this,
            with: args.with,
            reducer: multiply,
            result: args.result || new MultiDimArray({
                type: args.type || this.type,
                header: new Header({ shape: this.header.shape })
            })
        })
    }

    divide(args) {
        return pairSuite.call({
            of: this,
            with: args.with,
            reducer: divide,
            result: args.result || new MultiDimArray({
                type: args.type || this.type,
                header: new Header({ shape: this.header.shape })
            })
        })
    }

    dot(args) {
        return MultiDimArray.dot({
            of: this,
            with: args.with,
            type: args.type,
            result: args.result
        })
    }

    cross(args) {
        return MultiDimArray.cross({
            of: this,
            with: args.with,
            type: args.type,
            result: args.result
        })
    }

    inv(args) {
        return MultiDimArray.inv({
            of: this,
            type: args.type,
            result: args.result
        })
    }

    slice(args) {
        return new MultiDimArray({
            data: this.data,
            type: this.type,
            header: this.header.slice(args.indices),
        })
    }

    T() {
        return new MultiDimArray({
            data: this.data,
            type: this.type,
            header: this.header.transpose()
        })
    }

    reshape(args) {
        /**  if the array is not contigous, a reshape means data copy */
        if (!this.header.contig)
            return axisSuite.call({
                of: this,
                reducer: noop,
                mapper: noop,
                axes: [[], this.header.indices],
                result: new MultiDimArray({
                    type: args.type || this.type,
                    header: new Header({ shape: args.shape })
                })
            })

        return new MultiDimArray({
            data: this.data,
            type: this.type,
            header: this.header.reshape(args.shape),
        })
    }

    set(args) {
        return axisSuite.call({
            of: this,
            reducer: noop,
            mapper: function (i) { console.log(i) },
            axes: [[], this.header.indices],
            result: this
        })
    }

    toString() { return stringify.call(this, this.header.offset) }
    [util.inspect.custom]() { return this.toString() }
}
