// print routines for NFC devices - printing to an expanding string

#include "nfc-print.h"

extern "C" {

// string support

flex_string_t *new_string()
{
  flex_string_t *s = ( flex_string_t *)malloc(sizeof( flex_string_t));
  assert(s);
  memset(s, 0, sizeof( flex_string_t));
  s = resize_string(s, 128);
  return s;
}

void free_string( flex_string_t *s)
{
  if (s)
  {
    if (s->buf)
      free(s->buf);

    free(s);
  }
}

flex_string_t *resize_string( flex_string_t *s, size_t len)
{
  assert(s);

  if (s->length && s->length - s->size >= len)
    return s;

  len += s->length;

  if (s->length == 0)
    s->length = 1024;

  while (s->length < len)
    s->length <<= 1;

  s->buf = (char *)realloc(s->buf, len);
  assert(s->buf);
  s->length = len;
  return s;
}

// create freeable copy of the string's buffer
char *dup_string( flex_string_t *s)
{
  assert(s);
  char *p = (char *)malloc(s->size + 1);
  assert(p);

  memcpy(p, s->buf, s->size);
  p[s->size] = '\0';
  return p;
}

void print_string( flex_string_t *s, const char *p)
{
  assert(s);
  size_t len = strlen(p);
  s = resize_string(s, len);
  memcpy(s->buf+s->size, p, len);
  s->size += len;
}

void print_integer( flex_string_t *s, int n)
{
  char buf[128];
  sprintf(buf, "%d", n);
  size_t len = strlen(buf);
  s = resize_string(s, len);
  memcpy(s->buf+s->size, buf, len);
  s->size += len;
}

void print_double( flex_string_t *s, double x)
{
  char buf[128];
  sprintf(buf, "%0.4g", x);
  size_t len = strlen(buf);
  s = resize_string(s, len);
  memcpy(s->buf+s->size, buf, len);
  s->size += len;
}

void print_hex( flex_string_t *s, const byte_t *pbtData, const size_t szBytes)
{
  char buf[4];
  size_t  szPos;

  s = resize_string(s, 1 + szBytes<<1);


  for (szPos = 0; szPos < szBytes; szPos++)
  {
    sprintf(buf, "%02x  ", pbtData[szPos]);
    memcpy(s->buf + s->size, buf, 2);
    s->size += 2;
  }

  s->buf[s->size++] = '\n';
}


// print routines for NFC devices - printing to an expanding string

#define SAK_UID_NOT_COMPLETE     0x04
#define SAK_ISO14443_4_COMPLIANT 0x20
#define SAK_ISO18092_COMPLIANT   0x40

void
print_nfc_iso14443a_info (flex_string_t *s, const nfc_iso14443a_info_t nai, bool verbose)
{
  print_string (s, "    ATQA (SENS_RES): ");
  print_hex (s, nai.abtAtqa, 2);
  if (verbose) {
    print_string (s, "* UID size: ");
    switch ((nai.abtAtqa[1] & 0xc0)>>6) {
      case 0:
        print_string (s, "single\n");
      break;
      case 1:
        print_string (s, "double\n");
      break;
      case 2:
        print_string (s, "triple\n");
      break;
      case 3:
        print_string (s, "RFU\n");
      break;
    }
    print_string (s, "* bit frame anticollision ");
    switch (nai.abtAtqa[1] & 0x1f) {
      case 0x01:
      case 0x02:
      case 0x04:
      case 0x08:
      case 0x10:
        print_string (s, "supported\n");
      break;
      default:
        print_string (s, "not supported\n");
      break;
    }
  }

  if (nai.abtUid[0] == 0x08)
    print_string (s, "       UID (NFCID3): ");
  else
    print_string (s, "       UID (NFCID1): ");

  print_hex (s, nai.abtUid, nai.szUidLen);
  if (verbose) {
    if (nai.abtUid[0] == 0x08) {
      print_string (s, "* Random UID\n");
    }
  }
  print_string (s, "      SAK (SEL_RES): ");
  print_hex (s, &nai.btSak, 1);
  if (verbose) {
    if (nai.btSak & SAK_UID_NOT_COMPLETE) {
      print_string (s, "* Warning! Cascade bit set: UID not complete\n");
    }
    if (nai.btSak & SAK_ISO14443_4_COMPLIANT) {
      print_string (s, "* Compliant with ISO/IEC 14443-4\n");
    } else {
      print_string (s, "* Not compliant with ISO/IEC 14443-4\n");
    }
    if (nai.btSak & SAK_ISO18092_COMPLIANT) {
      print_string (s, "* Compliant with ISO/IEC 18092\n");
    } else {
      print_string (s, "* Not compliant with ISO/IEC 18092\n");
    }
  }
  if (nai.szAtsLen) {
    print_string (s, "                ATS: ");
    print_hex (s, nai.abtAts, nai.szAtsLen);
  }
  if (nai.szAtsLen && verbose) {
    // Decode ATS according to ISO/IEC 14443-4 (5.2 Answer to select)
    const int iMaxFrameSizes[] = { 16, 24, 32, 40, 48, 64, 96, 128, 256 };

    print_string (s, "* Max Frame Size accepted by PICC: 0x");
    print_integer(s, iMaxFrameSizes[nai.abtAts[0] & 0x0F]);
    print_string (s, " bytes\n");

    size_t offset = 1;
    if (nai.abtAts[0] & 0x10) { // TA(1) present
      byte_t TA = nai.abtAts[offset];
      offset++;
      print_string (s, "* Bit Rate Capability:\n");
      if (TA == 0) {
        print_string (s, "  * PICC supports only 106 kbits/s in both directions\n");
      }
      if (TA & 1<<7) {
        print_string (s, "  * Same bitrate in both directions mandatory\n");
      }
      if (TA & 1<<4) {
        print_string (s, "  * PICC to PCD, DS=2, bitrate 212 kbits/s supported\n");
      }
      if (TA & 1<<5) {
        print_string (s, "  * PICC to PCD, DS=4, bitrate 424 kbits/s supported\n");
      }
      if (TA & 1<<6) {
        print_string (s, "  * PICC to PCD, DS=8, bitrate 847 kbits/s supported\n");
      }
      if (TA & 1<<0) {
        print_string (s, "  * PCD to PICC, DR=2, bitrate 212 kbits/s supported\n");
      }
      if (TA & 1<<1) {
        print_string (s, "  * PCD to PICC, DR=4, bitrate 424 kbits/s supported\n");
      }
      if (TA & 1<<2) {
        print_string (s, "  * PCD to PICC, DR=8, bitrate 847 kbits/s supported\n");
      }
      if (TA & 1<<3) {
        print_string (s, "  * ERROR unknown value\n");
      }// print routines for NFC devices - printing to an expanding string

    }
    if (nai.abtAts[0] & 0x20) { // TB(1) present
      byte_t TB= nai.abtAts[offset];
      offset++;
      print_string (s, "* Frame Waiting Time: ");
      print_double (s, 256.0*16.0*(1<<((TB & 0xf0) >> 4))/13560.0);
      print_string (s, "ms\n");

      if ((TB & 0x0f) == 0) {
        print_string (s, "* No Start-up Frame Guard Time required\n");
      } else {
        print_string (s, "* Start-up Frame Guard Time: ");
        print_double (s, 256.0*16.0*(1<<(TB & 0x0f))/13560.0);
        print_string (s, "ms\n");
      }
    }
    if (nai.abtAts[0] & 0x40) { // TC(1) present
      byte_t TC = nai.abtAts[offset];
      offset++;
      if (TC & 0x1) {
        print_string (s, "* Node ADdress supported\n");
      } else {
        print_string (s, "* Node ADdress not supported\n");
      }
      if (TC & 0x2) {
        print_string (s, "* Card IDentifier supported\n");
      } else {
        print_string (s, "* Card IDentifier not supported\n");
      }
    }
    if (nai.szAtsLen > offset) {
      print_string (s, "* Historical bytes Tk: " );
      print_hex (s, nai.abtAts + offset, (nai.szAtsLen - offset));
      byte_t CIB = nai.abtAts[offset];
      offset++;
      if (CIB != 0x00 && CIB != 0x10 && (CIB & 0xf0) != 0x80) {
        print_string (s, "  * Proprietary format\n");
        if (CIB == 0xc1) {
          print_string (s, "    * Tag byte: Mifare or virtual cards of various types\n");
          byte_t L = nai.abtAts[offset];
          offset++;
          if (L != (nai.szAtsLen - offset)) {
            print_string (s, "    * Warning: Type Identification Coding length (");
            print_integer (s, L);
            print_string (s, ")");
            print_string (s, " not matching Tk length (");
            print_integer (s, (nai.szAtsLen - offset));
            print_string (s, ")\n");
          }
          if ((nai.szAtsLen - offset - 2) > 0) { // Omit 2 CRC bytes
            byte_t CTC = nai.abtAts[offset];// print routines for NFC devices - printing to an expanding string

            offset++;
            print_string (s, "    * Chip Type: ");
            switch (CTC & 0xf0) {
              case 0x00:
                print_string (s, "(Multiple) Virtual Cards\n");
              break;
              case 0x10:
                print_string (s, "Mifare DESFire\n");
              break;
              case 0x20:
                print_string (s, "Mifare Plus\n");
              break;
              default:
                print_string (s, "RFU\n");
              break;
            }
            print_string (s, "    * Memory size: ");
            switch (CTC & 0x0f) {
              case 0x00:
                print_string (s, "<1 kbyte\n");
              break;
              case 0x01:
                print_string (s, "1 kbyte\n");
              break;
              case 0x02:
                print_string (s, "2 kbyte\n");
              break;
              case 0x03:
                print_string (s, "4 kbyte\n");
              break;
              case 0x04:
                print_string (s, "8 kbyte\n");
              break;
              case 0x0f:
                print_string (s, "Unspecified\n");
              break;
              default:
                print_string (s, "RFU\n");
              break;
            }
          }
          if ((nai.szAtsLen - offset) > 0) { // Omit 2 CRC bytes// print routines for NFC devices - printing to an expanding string

            byte_t CVC = nai.abtAts[offset];
            offset++;
            print_string (s, "    * Chip Status: ");
            switch (CVC & 0xf0) {
              case 0x00:
                print_string (s, "Engineering sample\n");
              break;
              case 0x20:
                print_string (s, "Released\n");
              break;
              default:
                print_string (s, "RFU\n");
              break;
            }
            print_string (s, "    * Chip Generation: ");
            switch (CVC & 0x0f) {
              case 0x00:
                print_string (s, "Generation 1\n");
              break;
              case 0x01:
                print_string (s, "Generation 2\n");
              break;
              case 0x02:
                print_string (s, "Generation 3\n");
              break;
              case 0x0f:
                print_string (s, "Unspecified\n");
              break;
              default:
                print_string (s, "RFU\n");
              break;
            }
          }
          if ((nai.szAtsLen - offset) > 0) { // Omit 2 CRC bytes
            byte_t VCS = nai.abtAts[offset];
            offset++;
            print_string (s, "    * Specifics (Virtual Card Selection):\n");
            if ((VCS & 0x09) == 0x00) {
              print_string (s, "      * Only VCSL supported\n");
            } else if ((VCS & 0x09) == 0x01) {
              print_string (s, "      * VCS, VCSL and SVC supported\n");
            }// print routines for NFC devices - printing to an expanding string

            if ((VCS & 0x0e) == 0x00) {
              print_string (s, "      * SL1, SL2(?), SL3 supported\n");
            } else if ((VCS & 0x0e) == 0x02) {
              print_string (s, "      * SL3 only card\n");
            } else if ((VCS & 0x0f) == 0x0e) {
              print_string (s, "      * No VCS command supported\n");
            } else if ((VCS & 0x0f) == 0x0f) {
              print_string (s, "      * Unspecified\n");
            } else {
              print_string (s, "      * RFU\n");
            }
          }
        }
      } else {
        if (CIB == 0x00) {
          print_string (s, "  * Tk after 0x00 consist of optional consecutive COMPACT-TLV data objects\n");
          print_string (s, "    followed by a mandatory status indicator (the last three bytes, not in TLV)\n");
          print_string (s, "    See ISO/IEC 7816-4 8.1.1.3 for more info\n");
        }
        if (CIB == 0x10) {
          int n = nai.abtAts[offset];
          print_string (s, "  * DIR data reference: ");
          print_hex (s, (const byte_t *)&n, 1);
          print_string (s, "\n");
        }
        if (CIB == 0x80) {
          if (nai.szAtsLen == offset) {
            print_string (s, "  * No COMPACT-TLV objects found, no status found\n");
          } else {
            print_string (s, "  * Tk after 0x80 consist of optional consecutive COMPACT-TLV data objects;\n");
            print_string (s, "    the last data object may carry a status indicator of one, two or three bytes.\n");
            print_string (s, "    See ISO/IEC 7816-4 8.1.1.3 for more info\n");
          }
        }
      }
    }
  }
  if (verbose) {
    print_string (s, "Fingerprinting based on ATQA & SAK values:\n");
    uint32_t atqasak = 0;
    atqasak += (((uint32_t)nai.abtAtqa[0] & 0xff)<<16);
    atqasak += (((uint32_t)nai.abtAtqa[1] & 0xff)<<8);
    atqasak += ((uint32_t)nai.btSak & 0xff);
    bool found_possible_match = false;
    switch (atqasak) {
      case 0x000218:
        print_string (s, "* Mifare Classic 4K\n");
        found_possible_match = true;
      break;
      case 0x000408:
        print_string (s, "* Mifare Classic 1K\n");
        print_string (s, "* Mifare Plus (4-byte UID) 2K SL1\n");// print routines for NFC devices - printing to an expanding string

        found_possible_match = true;
      break;
      case 0x000409:
        print_string (s, "* Mifare MINI\n");
        found_possible_match = true;
      break;
      case 0x000410:
        print_string (s, "* Mifare Plus (4-byte UID) 2K SL2\n");
        found_possible_match = true;
      break;
      case 0x000411:
        print_string (s, "* Mifare Plus (4-byte UID) 4K SL2\n");
        found_possible_match = true;
      break;
      case 0x000418:
        print_string (s, "* Mifare Plus (4-byte UID) 4K SL1\n");
        found_possible_match = true;
      break;
      case 0x000420:
        print_string (s, "* Mifare Plus (4-byte UID) 2K/4K SL3\n");
        found_possible_match = true;
      break;
      case 0x004400:
        print_string (s, "* Mifare Ultralight\n");
        print_string (s, "* Mifare UltralightC\n");
        found_possible_match = true;
      break;
      case 0x004208:
      case 0x004408:
        print_string (s, "* Mifare Plus (7-byte UID) 2K SL1\n");
        found_possible_match = true;
      break;
      case 0x004218:
      case 0x004418:
        print_string (s, "* Mifare Plus (7-byte UID) 4K SL1\n");
        found_possible_match = true;
      break;
      case 0x004210:
      case 0x004410:
        print_string (s, "* Mifare Plus (7-byte UID) 2K SL2\n");
        found_possible_match = true;
      break;
      case 0x004211:// print routines for NFC devices - printing to an expanding string

      case 0x004411:
        print_string (s, "* Mifare Plus (7-byte UID) 4K SL2\n");
        found_possible_match = true;
      break;
      case 0x004220:
      case 0x004420:
        print_string (s, "* Mifare Plus (7-byte UID) 2K/4K SL3\n");
        found_possible_match = true;
      break;
      case 0x034420:
        print_string (s, "* Mifare DESFire / Desfire EV1\n");
        found_possible_match = true;
      break;
    }

    // Other matches not described in
    // AN MIFARE Type Identification Procedure
    // but seen in the field:
    switch (atqasak) {
      case 0x000488:
        print_string (s, "* Mifare Classic 1K Infineon\n");
        found_possible_match = true;
      break;
      case 0x000298:
        print_string (s, "* Gemplus MPCOS\n");
        found_possible_match = true;
      break;
      case 0x030428:
        print_string (s, "* JCOP31\n");
        found_possible_match = true;
      break;
      case 0x004820:
        print_string (s, "* JCOP31 v2.4.1\n");
        print_string (s, "* JCOP31 v2.2\n");
        found_possible_match = true;
      break;
      case 0x000428:
        print_string (s, "* JCOP31 v2.3.1\n");
        found_possible_match = true;
      break;
      case 0x000453:
        print_string (s, "* Fudan FM1208SH01\n");// print routines for NFC devices - printing to an expanding string

        found_possible_match = true;
      break;
      case 0x000820:
        print_string (s, "* Fudan FM1208\n");
        found_possible_match = true;
      break;
      case 0x000238:
        print_string (s, "* MFC 4K emulated by Nokia 6212 Classic\n");
        found_possible_match = true;
      break;
      case 0x000838:
        print_string (s, "* MFC 4K emulated by Nokia 6131 NFC\n");
        found_possible_match = true;
      break;
    }
    if ((nai.abtAtqa[0] & 0xf0) == 0) {
      switch (nai.abtAtqa[1]) {
        case 0x02:
          print_string (s, "* SmartMX with Mifare 4K emulation\n");
          found_possible_match = true;
        break;
        case 0x04:
          print_string (s, "* SmartMX with Mifare 1K emulation\n");
          found_possible_match = true;
        break;
        case 0x48:
          print_string (s, "* SmartMX with 7-byte UID\n");
          found_possible_match = true;
        break;
      }
    }
    if (! found_possible_match) {
      print_string (s, "* Unknown card, sorry\n");
    }
  }
}

void
print_nfc_felica_info (flex_string_t *s, const nfc_felica_info_t nfi, bool verbose)
{
  (void) verbose;
  print_string (s, "        ID (NFCID2): ");
  print_hex (s, nfi.abtId, 8);
  print_string (s, "    Parameter (PAD): ");
  print_hex (s, nfi.abtPad, 8);
}

void
print_nfc_jewel_info (flex_string_t *s, const nfc_jewel_info_t nji, bool verbose)// print routines for NFC devices - printing to an expanding string

{
  (void) verbose;
  print_string (s, "    ATQA (SENS_RES): ");
  print_hex (s, nji.btSensRes, 2);
  print_string (s, "      4-LSB JEWELID: ");
  print_hex (s, nji.btId, 4);
}

#define PI_ISO14443_4_SUPPORTED 0x01
#define PI_NAD_SUPPORTED        0x01
#define PI_CID_SUPPORTED        0x02
void
print_nfc_iso14443b_info (flex_string_t *s, const nfc_iso14443b_info_t nbi, bool verbose)
{
  const int iMaxFrameSizes[] = { 16, 24, 32, 40, 48, 64, 96, 128, 256 };
  print_string (s, "               PUPI: ");
  print_hex (s, nbi.abtPupi, 4);
  print_string (s, "   Application Data: ");
  print_hex (s, nbi.abtApplicationData, 4);
  print_string (s, "      Protocol Info: ");
  print_hex (s, nbi.abtProtocolInfo, 3);
  if (verbose) {
    print_string (s, "* Bit Rate Capability:\n");
    if (nbi.abtProtocolInfo[0] == 0) {
      print_string (s, " * PICC supports only 106 kbits/s in both directions\n");
    }
    if (nbi.abtProtocolInfo[0] & 1<<7) {
      print_string (s, " * Same bitrate in both directions mandatory\n");
    }
    if (nbi.abtProtocolInfo[0] & 1<<4) {
      print_string (s, " * PICC to PCD, 1etu=64/fc, bitrate 212 kbits/s supported\n");
    }
    if (nbi.abtProtocolInfo[0] & 1<<5) {
      print_string (s, " * PICC to PCD, 1etu=32/fc, bitrate 424 kbits/s supported\n");
    }
    if (nbi.abtProtocolInfo[0] & 1<<6) {// print routines for NFC devices - printing to an expanding string

      print_string (s, " * PICC to PCD, 1etu=16/fc, bitrate 847 kbits/s supported\n");
    }
    if (nbi.abtProtocolInfo[0] & 1<<0) {
      print_string (s, " * PCD to PICC, 1etu=64/fc, bitrate 212 kbits/s supported\n");
    }
    if (nbi.abtProtocolInfo[0] & 1<<1) {
      print_string (s, " * PCD to PICC, 1etu=32/fc, bitrate 424 kbits/s supported\n");
    }
    if (nbi.abtProtocolInfo[0] & 1<<2) {
      print_string (s, " * PCD to PICC, 1etu=16/fc, bitrate 847 kbits/s supported\n");
    }
    if (nbi.abtProtocolInfo[0] & 1<<3) {
      print_string (s, " * ERROR unknown value\n");
    }
    if( (nbi.abtProtocolInfo[1] & 0xf0) <= 0x80 ) {
      print_string (s, "* Maximum frame sizes: ");
      print_integer (s, iMaxFrameSizes[((nbi.abtProtocolInfo[1] & 0xf0) >> 4)]);
      print_string (s, " bytes\n");
    }
    if((nbi.abtProtocolInfo[1] & 0x0f) == PI_ISO14443_4_SUPPORTED) {
      print_string (s, "* Protocol types supported: ISO/IEC 14443-4\n");
    }
    print_string (s, "* Frame Waiting Time: ");
    print_double (s, 256.0*16.0*(1<<((nbi.abtProtocolInfo[2] & 0xf0) >> 4))/13560.0);
    print_string (s, " ms\n");

    if((nbi.abtProtocolInfo[2] & (PI_NAD_SUPPORTED|PI_CID_SUPPORTED)) != 0) {
      print_string (s, "* Frame options supported: ");
      if ((nbi.abtProtocolInfo[2] & PI_NAD_SUPPORTED) != 0) print_string (s, "NAD ");
      if ((nbi.abtProtocolInfo[2] & PI_CID_SUPPORTED) != 0) print_string (s, "CID ");
      print_string (s, "\n");
    }
  }
}

void
print_nfc_dep_info (flex_string_t *s, const nfc_dep_info_t ndi, bool verbose)
{
  (void) verbose;
  int n;
  print_string (s, "       NFCID3: ");
  print_hex (s, ndi.abtNFCID3, 10);

  print_string (s, "           BS: ");
  print_hex (s, (const byte_t *)&n, ndi.btBS);
  print_string (s, "\n");

  print_string (s, "           BR: ");
  print_hex (s, (const byte_t *)&n, ndi.btBR);
  print_string (s, "\n");

  print_string (s, "           TO: ");
  print_hex (s, (const byte_t *)&n, ndi.btTO);
  print_string (s, "\n");

  print_string (s, "           PP: ");
  print_hex (s, (const byte_t *)&n, ndi.btPP);
  print_string (s, "\n");

  if (ndi.szGB) {
    print_string (s, "General Bytes: ");
    print_hex (s, ndi.abtGB, ndi.szGB);
  }
}

const char *
str_nfc_baud_rate (const nfc_baud_rate_t nbr)
{
  switch(nbr) {
    case NBR_UNDEFINED:
      return "undefined baud rate";
    break;
    case NBR_106:
      return "106 kbps";
    break;// print routines for NFC devices - printing to an expanding string

    case NBR_212:
      return "212 kbps";
    break;
    case NBR_424:
      return "424 kbps";
    break;
    case NBR_847:
      return "847 kbps";
    break;
  }
  return "";
}

void
print_nfc_target (flex_string_t *s, const nfc_target_t nt, bool verbose)
{
  switch(nt.nm.nmt) {
    case NMT_ISO14443A:
      print_string (s, "ISO/IEC 14443A (");
      print_string (s, str_nfc_baud_rate(nt.nm.nbr));
      print_string (s, ") target:\n");
      print_nfc_iso14443a_info (s, nt.nti.nai, verbose);
    break;
    case NMT_JEWEL:
      print_string (s, "Innovision Jewel (");
      print_string (s, str_nfc_baud_rate(nt.nm.nbr));
      print_string (s, ") target:\n");
      print_nfc_jewel_info (s, nt.nti.nji, verbose);
    break;
    case NMT_FELICA:
      print_string (s, "FeliCa (");
      print_string (s, str_nfc_baud_rate(nt.nm.nbr));
      print_string (s, ") target:\n");
      print_nfc_felica_info (s, nt.nti.nfi, verbose);
    break;
    case NMT_ISO14443B:
      print_string (s, "ISO/IEC 14443-4B (");
      print_string (s, str_nfc_baud_rate(nt.nm.nbr));
      print_string (s, ") target:\n");
      print_nfc_iso14443b_info (s, nt.nti.nbi, verbose);
    break;
    case NMT_DEP:
      print_string (s, "D.E.P. (");
      print_string (s, str_nfc_baud_rate(nt.nm.nbr));
      print_string (s, ") target:\n");
      print_nfc_dep_info (s, nt.nti.ndi, verbose);
    break;
  }
}


}  // extern "C"

