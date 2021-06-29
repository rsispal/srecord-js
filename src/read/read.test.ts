import { readS19 } from "./read";
import { FullSRecordMarker } from "../types";

describe('Read', () => {
    describe('Read :: readS19', () => {
        it ('Should parse inputString1', () => {
             const inputString1 = `S10C000001020304040507F004E5
            S10710F0FFCCFF78B6
            S9030000FC
            `;
            const response = readS19(inputString1, inputString1.length);

            expect(response.success).toBeTruthy();
            expect(response.payload.totalFullSRecords).toEqual(3);
            expect(response.payload.totalDataSize).toEqual(13);

            expect(response.payload.sRecords[0].sRecordType).toEqual(FullSRecordMarker.S1_RECORD_TYPE);
            expect(response.payload.sRecords[1].sRecordType).toEqual(FullSRecordMarker.S1_RECORD_TYPE);
            expect(response.payload.sRecords[2].sRecordType).toEqual(FullSRecordMarker.S9_RECORD_TYPE);

            expect(response.payload.sRecords[0].address).toEqual(0x00);
            expect(response.payload.sRecords[1].address).toEqual(0x10F0);
            expect(response.payload.sRecords[2].address).toEqual(0x00);

            expect(response.payload.sRecords[0].dataLength).toEqual(0x0C - 3);
            expect(response.payload.sRecords[1].dataLength).toEqual(0x07 - 3);
            expect(response.payload.sRecords[2].dataLength).toEqual(0x03 - 3);

            expect(response.payload.sRecords[0].data.equals(Buffer.from([0x01, 0x02, 0x03, 0x04, 0x04, 0x05, 0x07, 0xF0, 0x04]))).toBeTruthy()
            expect(response.payload.sRecords[1].data.equals(Buffer.from([ 0xFF, 0xCC, 0xFF, 0x78]))).toBeTruthy()
            expect(response.payload.sRecords[2].data.equals(Buffer.from([]))).toBeTruthy()

            expect(response.payload.sRecords[0].checksum).toEqual(0xE5);
            expect(response.payload.sRecords[1].checksum).toEqual(0xB6);
            expect(response.payload.sRecords[2].checksum).toEqual(0xFC);
        });

        it ('Should parse inputString2', () => {

            const inputString2 = `S00F000068656C6C6F202020202000003C
            S11F00007C0802A6900100049421FFF07C6C1B787C8C23783C6000003863000026
            S11F001C4BFFFFE5398000007D83637880010014382100107C0803A64E800020E9
            S111003848656C6C6F20776F726C642E0A0042
            S5030003F9
            S9030000FC`

            const response = readS19(inputString2, inputString2.length);
            expect(response.success).toBeTruthy();
            expect(response.payload.totalFullSRecords).toEqual(6);
            expect(response.payload.totalDataSize).toEqual(82);
      

            expect(response.payload.sRecords[0].sRecordType).toEqual(FullSRecordMarker.S0_RECORD_TYPE)
            expect(response.payload.sRecords[1].sRecordType).toEqual(FullSRecordMarker.S1_RECORD_TYPE)
            expect(response.payload.sRecords[2].sRecordType).toEqual(FullSRecordMarker.S1_RECORD_TYPE)
            expect(response.payload.sRecords[3].sRecordType).toEqual(FullSRecordMarker.S1_RECORD_TYPE)
            expect(response.payload.sRecords[4].sRecordType).toEqual(FullSRecordMarker.S5_RECORD_TYPE)
            expect(response.payload.sRecords[5].sRecordType).toEqual(FullSRecordMarker.S9_RECORD_TYPE)


            expect(response.payload.sRecords[0].address).toEqual(0x0000);
            expect(response.payload.sRecords[1].address).toEqual(0x0000);
            expect(response.payload.sRecords[2].address).toEqual(0x001C);
            expect(response.payload.sRecords[3].address).toEqual(0x0038);
            expect(response.payload.sRecords[4].address).toEqual(0x0003);
            expect(response.payload.sRecords[5].address).toEqual(0x0000);

            expect(response.payload.sRecords[0].dataLength).toEqual(0x0F - 3);
            expect(response.payload.sRecords[1].dataLength).toEqual(0x1F - 3);
            expect(response.payload.sRecords[2].dataLength).toEqual(0x1F - 3);
            expect(response.payload.sRecords[3].dataLength).toEqual(0x11 - 3);
            expect(response.payload.sRecords[4].dataLength).toEqual(0x03 - 3);
            expect(response.payload.sRecords[5].dataLength).toEqual(0x03 - 3);

            expect(response.payload.sRecords[0].data.equals(Buffer.from([0x68, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x20, 0x20, 0x20, 0x20, 0x00, 0x00]))).toBeTruthy()
            expect(response.payload.sRecords[1].data.equals(Buffer.from([0x7C, 0x08, 0x02, 0xA6, 0x90, 0x01, 0x00, 0x04, 0x94, 0x21, 0xFF, 0xF0, 0x7C, 0x6C, 0x1B, 0x78, 0x7C, 0x8C, 0x23, 0x78, 0x3C, 0x60, 0x00, 0x00, 0x38, 0x63, 0x00, 0x00]))).toBeTruthy()
            expect(response.payload.sRecords[2].data.equals(Buffer.from([0x4B, 0xFF, 0xFF, 0xE5, 0x39, 0x80, 0x00, 0x00, 0x7D, 0x83, 0x63, 0x78, 0x80, 0x01, 0x00, 0x14, 0x38, 0x21, 0x00, 0x10, 0x7C, 0x08, 0x03, 0xA6, 0x4E, 0x80, 0x00, 0x20]))).toBeTruthy()
            expect(response.payload.sRecords[4].data.equals(Buffer.from([]))).toBeTruthy()
            expect(response.payload.sRecords[5].data.equals(Buffer.from([]))).toBeTruthy()


            expect(response.payload.sRecords[0].checksum).toEqual(0x3C);
            expect(response.payload.sRecords[1].checksum).toEqual(0x26);
            expect(response.payload.sRecords[2].checksum).toEqual(0xE9);
            expect(response.payload.sRecords[3].checksum).toEqual(0x42);
            expect(response.payload.sRecords[4].checksum).toEqual(0xF9);
            expect(response.payload.sRecords[5].checksum).toEqual(0xFC);
        });

    });

})