/* Libraries */

/* CRC */
import { calculateChecksum } from "../crc/crc";

/* Utilities */

/* Types */
import {
  LogLevel,
  WriteS19Response,
  ResponseCodes,
  AddressSpaceBoundaries,
  FullSRecordSizes,
  FullS0ByteLengths,
  FullS1ByteLengths,
  FullS2ByteLengths,
  FullS3ByteLengths,
  FullS5ByteLengths,
  FullS9ByteLengths,
} from "../types";

/**
 *
 * @param dataBuffer - the input data buffer
 * @param dataBufferLength - the input data buffer length
 * @param sRecordDataLength - Length (1-250) of the data to be packed into each S-Record. Data in the dataBuffer will be chunked accordingly
 * @param includeS5Record - set to 'true' if you want a S5 summary record (sum of S1+2+3 records)
 * @param headerData - string value to be included with the S0 record as the data (used by select vendors)
 * @param logLevel - LogLevel value (0=NONE)
 */
export const writeS19 = (
  dataBuffer: Buffer,
  dataBufferLength: number,
  sRecordDataLength: number,
  includeS5Record: boolean,
  headerData: string = "",
  logLevel: LogLevel = LogLevel.NONE
): WriteS19Response => {
  if (sRecordDataLength < 1 || sRecordDataLength > 250) {
    throw new Error("Illegal S-Record Data Length parameter. Must be between 1-250");
  }

  if (dataBufferLength < sRecordDataLength) {
    throw new Error("Data buffer cannot be smaller than S-Record Data Length ");
  }
  const DATA_LENGTH = sRecordDataLength;

  let s19 = "";
  let i = 0;

  logLevel > LogLevel.NONE && console.log("Started...");
  logLevel > LogLevel.NONE && console.log("Buffer Length", dataBuffer.length);
  logLevel > LogLevel.NONE && console.log("Buffer Length Parameter", dataBufferLength);
  logLevel > LogLevel.NONE && console.log("Intended S-Record Data Length", DATA_LENGTH);

  let data = Buffer.alloc(dataBufferLength);

  let nS0 = 0;
  let nS1 = 0;
  let nS2 = 0;
  let nS3 = 0;
  let nS5 = 0;
  let nS9 = 0;

  data.fill(0);
  dataBuffer.copy(data, 0, i, i + 6);

  s19 += produceS0Record(0, Buffer.from(headerData), headerData.length);
  s19 += "\r\n";
  nS0++;

  while (i < dataBuffer.length - DATA_LENGTH) {
    data.fill(0);

    dataBuffer.copy(data, 0, i, i + DATA_LENGTH);

    if (i < AddressSpaceBoundaries._16_BIT) {
      logLevel > LogLevel.NONE && console.log(`[${i}] :: Producing S1 record`);
      s19 += produceS1Record(i, data, DATA_LENGTH, logLevel);
      s19 += "\r\n";
      nS1++;
    } else if (i < AddressSpaceBoundaries._24_BIT) {
      logLevel > LogLevel.NONE && console.log(`[${i}] :: Producing S2 record`);
      s19 += produceS2Record(i, data, DATA_LENGTH, logLevel);
      s19 += "\r\n";
      nS2++;
    } else if (i < AddressSpaceBoundaries._32_BIT) {
      logLevel > LogLevel.NONE && console.log(`[${i}] :: Producing S3 record`);
      s19 += produceS3Record(i, data, DATA_LENGTH, logLevel);
      s19 += "\r\n";
      nS3++;
    } else {
      throw new Error("Cannot write S19 payload. Illegal address space");
    }
    i += DATA_LENGTH;
  }

  data.fill(0);
  if (includeS5Record) {
    logLevel > LogLevel.NONE && console.log(`[${i}] :: Producing S5 record - total S1+2+3 = ${nS1 + nS2 + nS3}`);

    s19 += produceS5Record(nS1 + nS2 + nS3, data, 0, logLevel);
    s19 += "\r\n";
    nS5++;
  }

  s19 += produceS9Record(0, data, 0, logLevel);
  nS9++;

  logLevel > LogLevel.NONE &&
    console.log(
      `\nWrite S19 Summary:
      - S0 Records: ${nS0}
      - S1 Records: ${nS1}
      - S2 Records: ${nS2}
      - S3 Records: ${nS3}
      - S5 Records: ${nS5}
      - S9 Records: ${nS9}
    `
    );

  return {
    success: true,
    responseCode: ResponseCodes.SUCCESS,
    errors: [],
    message: "Data buffer converted into S19 payload",
    payload: s19,
  };
};

const produceS0Record = (address: number, data: Buffer, dataLength: number, logLevel: LogLevel = LogLevel.NONE) => {
  let srecord = "";

  const fullRecordLength =
    FullS0ByteLengths.START_OF_RECORD_L +
    FullS0ByteLengths.RECORD_TYPE_L +
    FullS0ByteLengths.DATA_LENGTH_L +
    FullS0ByteLengths.ADDRESS_L +
    (dataLength - FullS0ByteLengths.CHECKSUM_L - FullS0ByteLengths.ADDRESS_L) +
    FullS0ByteLengths.CHECKSUM_L;
  let record = Buffer.alloc(fullRecordLength);
  let ptr = 0;

  /* S-Record Marker */
  srecord += "S";
  /* Record Type */
  srecord += "0";

  /* Data Length */
  record.writeUInt8(dataLength + 2 + 1, ptr); // Data length + 2 address bytes + 1 checksum byte = L+3
  ptr++;

  /* Address */
  record.writeUInt16BE(address, ptr);
  ptr += 2;

  /* Data */
  data.copy(record, ptr, 0, dataLength);
  ptr += dataLength;

  /* Checksum */
  record[ptr] = calculateChecksum(record.slice(0, ptr), logLevel);

  /* Final Assembly */
  srecord += record
    .slice(0, ptr + 1)
    .toString("hex")
    .toUpperCase();

  logLevel > LogLevel.NONE && console.log(srecord);
  return srecord;
};
const produceS1Record = (address: number, data: Buffer, dataLength: number, logLevel: LogLevel = LogLevel.NONE) => {
  let srecord = "";

  const fullRecordLength =
    FullS1ByteLengths.START_OF_RECORD_L +
    FullS1ByteLengths.RECORD_TYPE_L +
    FullS1ByteLengths.DATA_LENGTH_L +
    FullS1ByteLengths.ADDRESS_L +
    (dataLength - FullS1ByteLengths.CHECKSUM_L - FullS1ByteLengths.ADDRESS_L) +
    FullS1ByteLengths.CHECKSUM_L;
  let record = Buffer.alloc(fullRecordLength);
  let ptr = 0;

  /* S-Record Marker */
  srecord += "S";
  /* Record Type */
  srecord += "1";

  /* Data Length */
  record.writeUInt8(dataLength + 2 + 1, ptr); // Data length + 2 address bytes + 1 checksum byte = L+3
  ptr++;

  /* Address */
  record.writeUInt16BE(address, ptr);
  ptr += 2;

  /* Data */
  data.copy(record, ptr, 0, dataLength);
  ptr += dataLength;

  /* Checksum */
  record[ptr] = calculateChecksum(record.slice(0, ptr));

  /* Final Assembly */
  srecord += record
    .slice(0, ptr + 1)
    .toString("hex")
    .toUpperCase();

  logLevel > LogLevel.NONE && console.log(srecord);
  return srecord;
};
const produceS2Record = (address: number, data: Buffer, dataLength: number, logLevel: LogLevel = LogLevel.NONE) => {
  let srecord = "";

  const fullRecordLength =
    FullS2ByteLengths.START_OF_RECORD_L +
    FullS2ByteLengths.RECORD_TYPE_L +
    FullS2ByteLengths.DATA_LENGTH_L +
    FullS2ByteLengths.ADDRESS_L +
    (dataLength - FullS2ByteLengths.CHECKSUM_L - FullS2ByteLengths.ADDRESS_L) +
    FullS2ByteLengths.CHECKSUM_L;
  let record = Buffer.alloc(fullRecordLength);
  let ptr = 0;

  /* S-Record Marker */
  srecord += "S";
  /* Record Type */
  srecord += "2";

  /* Data Length */
  record.writeUInt8(dataLength + 3 + 1, ptr); // Data length + 3 address bytes + 1 checksum byte = L+3
  ptr++;

  /* Address */
  record.writeIntBE(address, ptr, 3);
  ptr += 3;

  /* Data */
  data.copy(record, ptr, 0, dataLength);
  ptr += dataLength;

  /* Checksum */
  record[ptr] = calculateChecksum(record.slice(0, ptr));

  /* Final Assembly */
  srecord += record
    .slice(0, ptr + 1)
    .toString("hex")
    .toUpperCase();

  logLevel > LogLevel.NONE && console.log(srecord);
  return srecord;
};
const produceS3Record = (address: number, data: Buffer, dataLength: number, logLevel: LogLevel = LogLevel.NONE) => {
  let srecord = "";

  const fullRecordLength =
    FullS3ByteLengths.START_OF_RECORD_L +
    FullS3ByteLengths.RECORD_TYPE_L +
    FullS3ByteLengths.DATA_LENGTH_L +
    FullS3ByteLengths.ADDRESS_L +
    (dataLength - FullS3ByteLengths.CHECKSUM_L - FullS3ByteLengths.ADDRESS_L) +
    FullS3ByteLengths.CHECKSUM_L;
  let record = Buffer.alloc(fullRecordLength);
  let ptr = 0;

  /* S-Record Marker */
  srecord += "S";
  /* Record Type */
  srecord += "3";

  /* Data Length */
  record.writeUInt8(dataLength + 4 + 1, ptr); // Data length + 2 address bytes + 1 checksum byte = L+3
  ptr++;

  /* Address */
  record.writeUInt32BE(address, ptr);
  ptr += 4;

  /* Data */
  data.copy(record, ptr, 0, dataLength);
  ptr += dataLength;

  /* Checksum */
  record[ptr] = calculateChecksum(record.slice(0, ptr));

  /* Final Assembly */
  srecord += record
    .slice(0, ptr + 1)
    .toString("hex")
    .toUpperCase();

  logLevel > LogLevel.NONE && console.log(srecord);
  return srecord;
};

const produceS5Record = (address: number, data: Buffer, dataLength: number, logLevel: LogLevel = LogLevel.NONE) => {
  let srecord = "";

  const fullRecordLength =
    FullS5ByteLengths.START_OF_RECORD_L +
    FullS5ByteLengths.RECORD_TYPE_L +
    FullS5ByteLengths.DATA_LENGTH_L +
    FullS5ByteLengths.ADDRESS_L +
    (dataLength - FullS5ByteLengths.CHECKSUM_L - FullS5ByteLengths.ADDRESS_L) +
    FullS5ByteLengths.CHECKSUM_L;
  let record = Buffer.alloc(fullRecordLength);
  let ptr = 0;

  /* S-Record Marker */
  srecord += "S";
  /* Record Type */
  srecord += "5";

  /* Data Length */
  record.writeUInt8(dataLength + 2 + 1, ptr); // Data length + 2 address bytes + 1 checksum byte = L+3
  ptr++;

  /* Address - FOR S5 RECORDS THIS IS THE TOTAL OF S1+2+3 RECORDS */
  record.writeUInt16BE(address, ptr);
  ptr += 2;

  /* Data */
  data.copy(record, ptr, 0, dataLength);
  ptr += dataLength;

  /* Checksum */
  record[ptr] = calculateChecksum(record.slice(0, ptr));

  /* Final Assembly */
  srecord += record
    .slice(0, ptr + 1)
    .toString("hex")
    .toUpperCase();

  logLevel > LogLevel.NONE && console.log(srecord);
  return srecord;
};

const produceS7Record = (address: number, data: Buffer, dataLength: number, logLevel: LogLevel = LogLevel.NONE) => {
  let srecord = "";

  const fullRecordLength = FullSRecordSizes.S7_RECORD_SIZE;
  let record = Buffer.alloc(fullRecordLength);
  let ptr = 0;

  /* S-Record Marker */
  srecord += "S";
  /* Record Type */
  srecord += "7";

  /* Data Length */
  record.writeUInt8(dataLength + 2 + 1, ptr); // Data length + 2 address bytes + 1 checksum byte = L+3
  ptr++;

  /* Address */
  record.writeUInt16BE(address, ptr);
  ptr += 2;

  /* Data */
  data.copy(record, ptr, 0, dataLength);
  ptr += dataLength;

  /* Checksum */
  record[ptr] = calculateChecksum(record.slice(0, ptr));

  /* Final Assembly */
  srecord += record
    .slice(0, ptr + 1)
    .toString("hex")
    .toUpperCase();

  logLevel > LogLevel.NONE && console.log(srecord);
  return srecord;
};

const produceS9Record = (address: number, data: Buffer, dataLength: number, logLevel: LogLevel = LogLevel.NONE) => {
  let srecord = "";

  const fullRecordLength =
    FullS9ByteLengths.START_OF_RECORD_L +
    FullS9ByteLengths.RECORD_TYPE_L +
    FullS9ByteLengths.DATA_LENGTH_L +
    FullS9ByteLengths.ADDRESS_L +
    (dataLength - FullS9ByteLengths.CHECKSUM_L - FullS9ByteLengths.ADDRESS_L) +
    FullS9ByteLengths.CHECKSUM_L;
  let record = Buffer.alloc(fullRecordLength);
  let ptr = 0;

  /* S-Record Marker */
  srecord += "S";
  /* Record Type */
  srecord += "9";

  /* Data Length */
  record.writeUInt8(dataLength + 2 + 1, ptr); // Data length + 2 address bytes + 1 checksum byte = L+3
  ptr++;

  /* Address */
  record.writeUInt16BE(address, ptr);
  ptr += 2;

  /* Data */
  data.copy(record, ptr, 0, dataLength);
  ptr += dataLength;

  /* Checksum */
  record[ptr] = calculateChecksum(record.slice(0, ptr));

  /* Final Assembly */
  srecord += record
    .slice(0, ptr + 1)
    .toString("hex")
    .toUpperCase();

  logLevel > LogLevel.NONE && console.log(srecord);
  return srecord;
};
