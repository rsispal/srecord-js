import { readSubstringAndCastAsNumber,
readSubstring,
parseHexString,
decToHex} from './utilities'

describe('Utilities', () => {
      describe("Utilities :: readSubstringAndCastAsNumber", () => {
          it('Should read a 1 digit decimal number and return its corresponding decimal number (radix 10)', () => {
            const response = readSubstringAndCastAsNumber('1 01 11 111', 0, 1, 10);
            expect(response).toEqual(1)
          });

          it('Should read a 2 digit decimal number and return its corresponding decimal number (radix 10)', () => {
            const response = readSubstringAndCastAsNumber('1 01 11 111', 2, 2, 10);
            expect(response).toEqual(1)
          });

          it('Should read a 2 digit decimal number and return its corresponding decimal number (radix 10)', () => {
            const response = readSubstringAndCastAsNumber('1 01 11 111', 5, 2, 10);
            expect(response).toEqual(11)
          });

          it('Should read a 3 digit decimal number and return its corresponding decimal number (radix 10)', () => {
            const response = readSubstringAndCastAsNumber('1 01 11 111', 8, 3, 10);
            expect(response).toEqual(111)
          });

          it('Should read a 1 character hexadecimal string and return its corresponding decimal number (radix 16)', () => {
            const response = readSubstringAndCastAsNumber('A 0A 0xA 0x0A', 0, 1, 16);
            expect(response).toEqual(10)
          });

          it('Should read a 2 character hexadecimal string and return its corresponding decimal number (radix 16)', () => {
            const response = readSubstringAndCastAsNumber('A 0A 0xA 0x0A', 2, 2, 16);
            expect(response).toEqual(10)
          });

          it('Should read a 3 character hexadecimal string (including 0x) and return its corresponding decimal number (radix 16)', () => {
            const response = readSubstringAndCastAsNumber('A 0A 0xA 0x0A', 5, 3, 16);
            expect(response).toEqual(10)
          });

          it('Should read a 4 character hexadecimal string and return its corresponding decimal number (radix 16)', () => {
            const response = readSubstringAndCastAsNumber('A 0A 0xA 0x0A', 9, 4, 16);
            expect(response).toEqual(10)
          });
      });

      describe("Utilities :: readSubstring", () => {
          it('Should return a substring from position 2 with length 7 from input string `"Hello World" `', () => {
            const response = readSubstring("Hello World", 2, 7);
            expect(response).toEqual("llo Wor")
          })
      });

      describe("Utilities :: parseHexString", () => {
          it('Should parse a hex string into a buffer of decimal numbers', () => {
            const response = parseHexString('010203');
            expect(response.compare(Buffer.from([0,1,2,3]))).toBeTruthy();
          });

          it('Should parse a hex string containing spaces into a buffer of decimal numbers', () => {
            const response = parseHexString('01 02 03');
            expect(response.compare(Buffer.from([0,1,0,2,0,3]))).toBeTruthy();
          });

          it('Should parse a hex string containing commas into a buffer of decimal numbers', () => {
            const response = parseHexString('01,02,03');
            expect(response.compare(Buffer.from([0,1,44,2,44,3]))).toBeTruthy();
          });
      });

      describe("Utilities :: decToHex", () => {
          it('Should convert a 1 digit decimal number into a hex string', () => {
            const response = decToHex(1);
            expect(response).toEqual('01');
          });

          it('Should convert a 2 digit decimal number into a hex string', () => {
            const response = decToHex(10);
            expect(response).toEqual('0A');
          });

          it('Should convert a 3 digit decimal number into a hex string', () => {
            const response = decToHex(100);
            expect(response).toEqual('64');
          });

          it('Should convert a 5 digit decimal number into a hex string', () => {
            const response = decToHex(20261);
            expect(response).toEqual('4F25');
          });
      });
}) 




