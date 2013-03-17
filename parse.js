module.exports = parse

var through = require('through')
  , zlib = require('zlib')

var INITIAL_BYTES = 0
  , REST = 1

function parse() {
  var stream = through(write, end)
    , state = INITIAL_BYTES
    , accum = []
    , got = 0

  return stream

  function write(buf) {
    got += buf.length
    accum[accum.length] = buf
  } 

  function end() {
    var buf = Buffer.concat(accum, got)
      , first = buf.readUInt8(0)
      , second = buf.readUInt8(1)
      , w = (first << 8) + second
      , is_zlib = first === 0x78 && !(w % 31)

    if(is_zlib) {
      zlib.inflate(buf, done)
    } else {
      done(null, buf)
    }
  }

  function done(err, buf) {
    if(err) {
      return stream.emit('error', err)
    }
    stream.queue(buf)
    stream.queue(null)
  }
}
