var fs = require('fs'),
  path = require('path'),
  assert = require('assert'),
  jpeg = require('..'),
  zlib = require("zlib");

function fixture(name) {
  return fs.readFileSync(path.join(__dirname, 'fixtures', name));
}

it('should be able to decode a JPEG', function () {
  const jpegData = fixture('partial.jpeg');
  const { mcuData } = jpeg.parse(jpegData);
  console.log('mcuData: ', mcuData);

  const lengthsArr = new Int16Array(mcuData.numMcus);
  mcuData.bitOffsets.forEach((offset, index, arr)=>lengthsArr[index] = arr[index+1] - arr[index]);
  console.log({lengthsArr}, zlib.gzipSync(lengthsArr).length);
  const gzBitOffsets = zlib.gzipSync(mcuData.bitOffsets);
  const gzPredsArray = mcuData.preds.map(preds => zlib.gzipSync(preds));

  console.log('gzipped McuData sizes: ', gzBitOffsets.length, gzPredsArray.map(gzPreds => gzPreds.length));

  const decBitOffsetsBuf = zlib.gunzipSync(gzBitOffsets).buffer;
  const decPredsBufArray = gzPredsArray.map(gzPreds => zlib.gunzipSync(gzPreds).buffer);
  const decMcuData = {
    numMcus: mcuData.numMcus,
    numComponents: mcuData.numComponents,
    scanLength: mcuData.scanLength,
    bitOffsets: new Uint32Array(decBitOffsetsBuf, decBitOffsetsBuf.length / 4),
    preds: decPredsBufArray.map(decPredsBuf => new Int16Array(decPredsBuf, decPredsBuf.length / 2))
  }
  console.log('decMcuData: ', decMcuData);

  const opts = {
    cropOptions: {
      mcuData: decMcuData,
      fromScanline: 1440,
      toScanline: 3063
    }
  };
  var rawImageData = jpeg.decode(jpegData, opts);
  var encodedData = jpeg.encode(rawImageData, 92);
  fs.writeFileSync(path.join(__dirname, 'fixtures', 'partial-output.jpeg'), encodedData.data);
});