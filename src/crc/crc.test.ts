import { LogLevel } from "../types";
import { calculateChecksum } from "./crc";

describe("CRC", () => {
  describe("CRC :: calculateChecksum", () => {
    it('Should calculate a known checksum from a known buffer', () => {
        const buffer = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0xFF])
        const response = calculateChecksum(buffer, LogLevel.NONE);
        expect(response).toEqual(136) // 136 XOR 255 & 255
    });

     it('Should return 255 when an empty buffer is provided', () => {
        const buffer = Buffer.from([])
        const response = calculateChecksum(buffer, LogLevel.NONE);
        expect(response).toEqual(255) // 0 XOR 255 & 255
    });

    it('Should return 0 when an buffer with single valule of 0xff is provided', () => {
        const buffer = Buffer.from([0xff])
        const response = calculateChecksum(buffer, LogLevel.NONE);
        expect(response).toEqual(0) // 0 XOR 255 & 255
    });});
});