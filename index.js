var encode = require('./lib/encoder'),
    {decode, parse} = require('./lib/decoder');

module.exports = {
  encode: encode,
  decode: decode,
  parse: parse
};
