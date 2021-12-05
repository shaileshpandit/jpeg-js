var fs = require('fs'),
  path = require('path'),
  assert = require('assert'),
  jpeg = require('..'),
  zlib = require("zlib");

function fixture(name) {
  return fs.readFileSync(path.join(__dirname, 'fixtures', name));
}

it('should be able to decode a JPEG', function () {
  const jpegData = fixture('partial-test.jpg');
  const { mcuData } = jpeg.parse(jpegData);
  console.log('mcuData: ', mcuData);

  const gzBitLengths = zlib.gzipSync(mcuData.bitLengths);
  const gzPredsArray = mcuData.preds.map(preds => zlib.gzipSync(preds));

  console.log('gzipped McuData sizes: ', gzBitLengths.length, gzPredsArray.map(gzPreds => gzPreds.length));

  const decBitLengthsBuf = zlib.gunzipSync(gzBitLengths);
  const decPredsBufArray = gzPredsArray.map(gzPreds => zlib.gunzipSync(gzPreds));
  const decMcuData = {
    numMcus: mcuData.numMcus,
    numComponents: mcuData.numComponents,
    scanLength: mcuData.scanLength,
    firstMcuBitOffset: mcuData.firstMcuBitOffset,
    bitLengths: new Uint32Array(decBitLengthsBuf.buffer, 0, decBitLengthsBuf.length / 4),
    preds: decPredsBufArray.map(decPredsBuf => new Int16Array(decPredsBuf.buffer, 0, decPredsBuf.length / 2))
  }
  console.log('decMcuData: ', decMcuData);

  const opts = {
    cropOptions: {
      mcuData: decMcuData,
      fromScanline: 16,
      toScanline: 63
    }
  };
  var rawImageData = jpeg.decode(jpegData, opts);
  var encodedData = jpeg.encode(rawImageData, 92);
  fs.writeFileSync(path.join(__dirname, 'fixtures', 'partial-output.jpeg'), encodedData.data);
});