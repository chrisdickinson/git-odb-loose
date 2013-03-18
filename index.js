module.exports = create_loose

var parse_loose = require('./parse')
  , path = require('path')
  , TYPE_MAP

TYPE_MAP = { 
    'commit': 1 
  , 'tree': 2 
  , 'blob': 3 
  , 'tag': 4 
}

create_loose.accept = accept

function create_loose(entry, fs, find_oid, ready) {
  var source = entry.path
    , prefix_str = /\/([0-9a-fA-F]{2})/.exec(source)[1]
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
      , dir = path.join(source, rest)

    fs.createReadStream(dir)
      .on('error', function(err) { ready(null, undefined) })
      .pipe(parse_loose())
      .on('error', function(err) { ready(err) })
      .on('data', function(obj) { ready(null, parse(obj)) })

  }

  function loose_write(oid, blob, ready) {
    // TODO: implement this
  }
}

function accept(path) {
  return /objects\/([0-9a-fA-F]{2})$/.test(path)
}

function parse(buf) {
  for(var i = 0, len = buf.length; i < len; ++i) {
    if(buf.readUInt8(i) === 32) {
      break
    }
  } 

  var stridx = i
    , strtype = buf.slice(0, stridx).toString('utf8')

  for(i += 1; i < len; ++i) {
    if(buf.readUInt8(i) === 0) {
      break
    }
  }

  return {type: TYPE_MAP[strtype], data: buf.slice(i + 1)}
}
