export interface RawImageData<T> {
  width: number;
  height: number;
  data: T;
}

type BufferRet = RawImageData<Buffer>;
type UintArrRet = RawImageData<Uint8Array>;

type ImageData = BufferRet | UintArrRet;
type BufferLike = Buffer | Uint8Array | ArrayLike<number> | Iterable<number> | ArrayBuffer;

export declare function encode(imgData: RawImageData<BufferLike> & {comments?: string[]}, quality?: number): BufferRet

// Stores data for all Mcus required to decode only selective Mcus
// can be used to decode cropped jpg
export interface McuData {
  numMcus: number,
  numComponents: number,
  scanLength: number,
  
  // bit offset of Mcus in file
  // currently supports images with scan size upto 2^29, 3 bits for bit offset
  // bit offset is required as Mcus can start at random bit position and not always
  // on byte boundries in file
  // this can be stored using huffman encoded bit length of each mcu
  bitOffsets: Uint32Array
  
  // component predictions at start of each Mcu for each component
  // this can be stored using original huffman coded dc coefficients from original file
  preds: Array<Int16Array>
}

export interface CropOptions {
  mcuData: McuData,
  fromScanline: number,
  toScanline: number
}

export declare function decode(
  jpegData: BufferLike,
  opts: {
    useTArray: true;
    colorTransform?: boolean;
    formatAsRGBA?: boolean;
    tolerantDecoding?: boolean;
    maxResolutionInMP?: number;
    maxMemoryUsageInMB?: number;
    cropOptions?: CropOptions;
  },
): UintArrRet & {comments?: string[]};
export declare function decode(
  jpegData: BufferLike,
  opts?: {
    useTArray?: false;
    colorTransform?: boolean;
    formatAsRGBA?: boolean;
    tolerantDecoding?: boolean;
    maxResolutionInMP?: number;
    maxMemoryUsageInMB?: number;
    cropOptions?: CropOptions;
  },
): BufferRet & {comments?: string[]};
