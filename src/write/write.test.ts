import { writeS19 } from "./write";
import { readS19 } from "../read/read";
import { FullSRecordMarker, LogLevel } from "../types";

describe("Write", () => {
  describe("Write :: writeS19", () => {
    const inputContent = "Hello, this is a test of the writeS19 method. This buffer will be converted into an S19 file";
    const inputDataBuffer = Buffer.alloc(128);
    inputDataBuffer.write(inputContent, "utf8");

    const expectedOutput = `S0030000FC\r\nS133000048656C6C6F2C207468697320697320612074657374206F6620746865207772697465533139206D6574686F642E2054686E\r\nS13300306973206275666665722077696C6C20626520636F6E76657274656420696E746F20616E205331392066696C650000000017\r\nS9030000FC`;

    it("Should convert the inputDataBuffer to an S19 string", () => {
      const response = writeS19(inputDataBuffer, inputDataBuffer.length, 48, false);

      expect(response.success).toBeTruthy();
      expect(response.payload).toEqual(expectedOutput);
    });

    it("Should convert the inputDataBuffer to an S19 string and then I expect to be able to parse it back to this string", () => {
      const response = writeS19(inputDataBuffer, inputDataBuffer.length, 48, false);

      expect(response.success).toBeTruthy();
      expect(response.payload).toEqual(expectedOutput);

      const readResponse = readS19(response.payload, response.payload.length, LogLevel.NONE);

      expect(readResponse.success).toBeTruthy();
      expect(readResponse.payload.totalFullSRecords).toEqual(4);
      expect(readResponse.payload.totalDataSize).toEqual(96);

      expect(readResponse.payload.sRecords[0].sRecordType).toEqual(FullSRecordMarker.S0_RECORD_TYPE);
      expect(readResponse.payload.sRecords[1].sRecordType).toEqual(FullSRecordMarker.S1_RECORD_TYPE);
      expect(readResponse.payload.sRecords[2].sRecordType).toEqual(FullSRecordMarker.S1_RECORD_TYPE);
      expect(readResponse.payload.sRecords[3].sRecordType).toEqual(FullSRecordMarker.S9_RECORD_TYPE);

      expect(readResponse.payload.sRecords[0].address).toEqual(0x00);
      expect(readResponse.payload.sRecords[1].address).toEqual(0x0000);
      expect(readResponse.payload.sRecords[2].address).toEqual(0x0030);
      expect(readResponse.payload.sRecords[3].address).toEqual(0x0000);

      expect(readResponse.payload.sRecords[0].dataLength).toEqual(0x03 - 3);
      expect(readResponse.payload.sRecords[1].dataLength).toEqual(0x33 - 3);
      expect(readResponse.payload.sRecords[2].dataLength).toEqual(0x33 - 3);
      expect(readResponse.payload.sRecords[3].dataLength).toEqual(0x03 - 3);

      expect(readResponse.payload.sRecords[0].data.equals(Buffer.from([]))).toBeTruthy();
      expect(
        readResponse.payload.sRecords[1].data.equals(
          Buffer.from([
            0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c, 0x20, 0x74, 0x68, 0x69, 0x73, 0x20, 0x69, 0x73, 0x20, 0x61, 0x20, 0x74, 0x65,
            0x73, 0x74, 0x20, 0x6f, 0x66, 0x20, 0x74, 0x68, 0x65, 0x20, 0x77, 0x72, 0x69, 0x74, 0x65, 0x53, 0x31, 0x39, 0x20,
            0x6d, 0x65, 0x74, 0x68, 0x6f, 0x64, 0x2e, 0x20, 0x54, 0x68,
          ])
        )
      ).toBeTruthy();
      expect(
        readResponse.payload.sRecords[2].data.equals(
          Buffer.from([
            0x69, 0x73, 0x20, 0x62, 0x75, 0x66, 0x66, 0x65, 0x72, 0x20, 0x77, 0x69, 0x6c, 0x6c, 0x20, 0x62, 0x65, 0x20, 0x63,
            0x6f, 0x6e, 0x76, 0x65, 0x72, 0x74, 0x65, 0x64, 0x20, 0x69, 0x6e, 0x74, 0x6f, 0x20, 0x61, 0x6e, 0x20, 0x53, 0x31,
            0x39, 0x20, 0x66, 0x69, 0x6c, 0x65, 0x00, 0x00, 0x00, 0x00,
          ])
        )
      ).toBeTruthy();
      expect(readResponse.payload.sRecords[3].data.equals(Buffer.from([]))).toBeTruthy();

      expect(readResponse.payload.sRecords[0].checksum).toEqual(0xfc);
      expect(readResponse.payload.sRecords[1].checksum).toEqual(0x6e);
      expect(readResponse.payload.sRecords[2].checksum).toEqual(0x17);
      expect(readResponse.payload.sRecords[3].checksum).toEqual(0xfc);

      let unpackedString = "";
      readResponse.payload.sRecords.forEach(
        (srecord) =>
          srecord.sRecordType > FullSRecordMarker.S0_RECORD_TYPE &&
          srecord.sRecordType < FullSRecordMarker.S9_RECORD_TYPE &&
          (unpackedString += srecord.data.toString())
      );

      expect(unpackedString).toContain(inputContent);
    });
  });
});
