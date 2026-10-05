// Minimal, correct FlexBuffers decoder.
//
// icechunk-js getSnapshotMetadata() uses the `flatbuffers` JS flexbuffers
// reader, whose get() reads a trailing per-element type byte BEFORE checking
// for typed vectors. Typed vectors (VECTOR_KEY/VECTOR_STRING/...) have no
// trailing type table, so that read runs off the buffer and throws
// "Offset is outside the bounds of the DataView" for ~half of basal's
// entries. This decoder handles typed/fixed vectors correctly.

const NULL = 0,
  INT = 1,
  UINT = 2,
  FLOAT = 3,
  KEY = 4,
  STRING = 5,
  INDIRECT_INT = 6,
  INDIRECT_UINT = 7,
  INDIRECT_FLOAT = 8,
  MAP = 9,
  VECTOR = 10,
  VECTOR_INT = 11,
  VECTOR_STRING_DEPRECATED = 15,
  VECTOR_INT2 = 16,
  VECTOR_FLOAT4 = 24,
  BLOB = 25,
  BOOL = 26,
  VECTOR_BOOL = 36;

const dec = new TextDecoder();

const ru = (dv: DataView, o: number, bw: number): number =>
  bw === 1
    ? dv.getUint8(o)
    : bw === 2
      ? dv.getUint16(o, true)
      : bw === 4
        ? dv.getUint32(o, true)
        : Number(dv.getBigUint64(o, true));
const ri = (dv: DataView, o: number, bw: number): number =>
  bw === 1
    ? dv.getInt8(o)
    : bw === 2
      ? dv.getInt16(o, true)
      : bw === 4
        ? dv.getInt32(o, true)
        : Number(dv.getBigInt64(o, true));
const rf = (dv: DataView, o: number, bw: number): number =>
  bw === 4 ? dv.getFloat32(o, true) : dv.getFloat64(o, true);
const indir = (dv: DataView, o: number, bw: number): number => o - ru(dv, o, bw);
const log2 = (bw: number): number => (bw === 1 ? 0 : bw === 2 ? 1 : bw === 4 ? 2 : 3);

const isTypedVec = (t: number) =>
  t === VECTOR_BOOL || (t >= VECTOR_INT && t <= VECTOR_STRING_DEPRECATED);
const isFixedVec = (t: number) => t >= VECTOR_INT2 && t <= VECTOR_FLOAT4;
const typedElem = (t: number) => (t === VECTOR_BOOL ? BOOL : t - VECTOR_INT + INT);
const fixedElem = (t: number) => ((t - VECTOR_INT2) % 3) + INT;
const fixedLen = (t: number) => (((t - VECTOR_INT2) / 3) | 0) + 2;

function cstr(dv: DataView, start: number): string {
  let e = start;
  while (dv.getUint8(e) !== 0) e++;
  return dec.decode(new Uint8Array(dv.buffer, dv.byteOffset + start, e - start));
}

function decode(dv: DataView, off: number, parentBW: number, packed: number): unknown {
  const bw = 1 << (packed & 3);
  const t = packed >> 2;
  switch (t) {
    case NULL:
      return null;
    case INT:
      return ri(dv, off, parentBW);
    case UINT:
      return ru(dv, off, parentBW);
    case FLOAT:
      return rf(dv, off, parentBW);
    case BOOL:
      return ru(dv, off, parentBW) !== 0;
    case INDIRECT_INT:
      return ri(dv, indir(dv, off, parentBW), bw);
    case INDIRECT_UINT:
      return ru(dv, indir(dv, off, parentBW), bw);
    case INDIRECT_FLOAT:
      return rf(dv, indir(dv, off, parentBW), bw);
    case KEY:
      return cstr(dv, indir(dv, off, parentBW));
    case STRING: {
      const i = indir(dv, off, parentBW);
      const len = ru(dv, i - bw, bw);
      return dec.decode(new Uint8Array(dv.buffer, dv.byteOffset + i, len));
    }
    case BLOB: {
      const i = indir(dv, off, parentBW);
      const len = ru(dv, i - bw, bw);
      return new Uint8Array(dv.buffer.slice(dv.byteOffset + i, dv.byteOffset + i + len));
    }
    case MAP: {
      const i = indir(dv, off, parentBW);
      const len = ru(dv, i - bw, bw);
      const kvo = i - bw * 3;
      const kInd = kvo - ru(dv, kvo, bw);
      const kBW = ru(dv, kvo + bw, bw);
      const obj: Record<string, unknown> = {};
      for (let j = 0; j < len; j++) {
        const kOff = kInd + j * kBW;
        const key = cstr(dv, kOff - ru(dv, kOff, kBW));
        const vPacked = dv.getUint8(i + len * bw + j);
        obj[key] = decode(dv, i + j * bw, bw, vPacked);
      }
      return obj;
    }
    case VECTOR: {
      const i = indir(dv, off, parentBW);
      const len = ru(dv, i - bw, bw);
      const arr: unknown[] = [];
      for (let j = 0; j < len; j++) {
        arr.push(decode(dv, i + j * bw, bw, dv.getUint8(i + len * bw + j)));
      }
      return arr;
    }
    default: {
      if (isTypedVec(t)) {
        const et = typedElem(t);
        const i = indir(dv, off, parentBW);
        const len = ru(dv, i - bw, bw);
        const lb = log2(bw);
        const arr: unknown[] = [];
        for (let j = 0; j < len; j++) arr.push(decode(dv, i + j * bw, bw, (et << 2) | lb));
        return arr;
      }
      if (isFixedVec(t)) {
        const et = fixedElem(t);
        const len = fixedLen(t);
        const i = indir(dv, off, parentBW);
        const lb = log2(bw);
        const arr: unknown[] = [];
        for (let j = 0; j < len; j++) arr.push(decode(dv, i + j * bw, bw, (et << 2) | lb));
        return arr;
      }
      return null;
    }
  }
}

export function decodeFlexBuffer(bytes: Uint8Array): unknown {
  const u8 = bytes.slice();
  const dv = new DataView(u8.buffer);
  const n = u8.byteLength;
  if (n < 3) return null;
  const rootBW = dv.getUint8(n - 1);
  const rootPacked = dv.getUint8(n - 2);
  return decode(dv, n - 2 - rootBW, rootBW, rootPacked);
}
