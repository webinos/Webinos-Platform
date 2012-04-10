// print routines for NFC devices - printing to an expanding string

#ifndef _NFC_PRINT_H
#define _NFC_PRINT_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <nfc/nfc.h>

typedef struct {
  size_t length;
  size_t size;
  char *buf;
} flex_string_t;

typedef unsigned char byte_t;

extern "C" {

// string support
flex_string_t *new_string();
void free_string(flex_string_t *s);
char *dup_string(flex_string_t *s);
flex_string_t *resize_string( flex_string_t *s, size_t len);
void print_string(flex_string_t *s, const char *p);
void print_integer( flex_string_t *s, int n);
void print_double( flex_string_t *s, double x);
void print_hex(flex_string_t *s, const byte_t *pbtData, const size_t szBytes);

// nfc print support

void print_nfc_iso14443a_info (flex_string_t *s, const nfc_iso14443a_info_t nai, bool verbose);
void print_nfc_iso14443b_info (flex_string_t *s, const nfc_iso14443b_info_t nbi, bool verbose);
void print_nfc_felica_info (flex_string_t *s, const nfc_felica_info_t nfi, bool verbose);
void print_nfc_jewel_info (flex_string_t *s, const nfc_jewel_info_t nji, bool verbose);
void print_nfc_dep_info (flex_string_t *s, const nfc_dep_info_t ndi, bool verbose);

void print_nfc_target (flex_string_t *s, const nfc_target_t nt, bool verbose);


}

#endif

