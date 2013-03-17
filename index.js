module.exports = create_loose

var parse_loose = require('./parse')

create_loose.accept = accept

function create_loose(source, fs, find_oid, ready) {
  var prefix_str = /\/([0-9a-fA-F]{2})\//.exec(source)[1]
    , prefix = parseInt(prefix_str, 16)

  ready(null, {
      readable: true
    , writable: true
    , read: loose_read
    , write: loose_write
  })

  function loose_read(oid, ready) {
    if(oid[0] !== prefix) {
      return ready(null, undefined)
    }

    var rest = oid.slice(1).toString('hex')
      , path = path.join('objects', prefix_str, rest)

    fs.createReadStream(oid.slice(1).toString('hex'))
      .on('error', function(err) { ready(null, undefined) })
      .pipe(parse_loose())
      .on('error', function(err) { ready(err) })
      .on('data', function(obj) { ready(null, obj) })

  }

  function loose_write(oid, blob, ready) {
    // TODO: implement this
  }
}

function accept(path) {
  return /objects\/([0-9a-fA-F]{2})\//.test(path)
}

