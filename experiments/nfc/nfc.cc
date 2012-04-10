// node module for discovering nfc devices/services

// Threading and eventing support adapted from http://bravenewmethod.wordpress.com/tag/addon/

// for malloc, free and assert
#include <stdio.h>
#include <stdlib.h>
#include <assert.h>

// for C++ queue template
#include <queue>

// node headers
#include <v8.h>
#include <node.h>
#include <ev.h>
#include <pthread.h>
#include <unistd.h>
#include <string.h>

//#include <err.h>

#include <stddef.h>
#include <string.h>

// nfc headers
#include <nfc/nfc.h>
#include "nfc-print.h"

#define MAX_DEVICE_COUNT 16
#define MAX_TARGET_COUNT 16

static nfc_device_t *pnd;

using namespace node;
using namespace v8;

// handles required for callback messages
static pthread_t nfc_thread;
static ev_async eio_nfc_notifier;
Persistent<String> callback_symbol;
Persistent<Object> module_handle;

// message queue
std::queue<char *> cb_msg_queue = std::queue<char *>();
pthread_mutex_t queue_mutex = PTHREAD_MUTEX_INITIALIZER;

// The background thread
static void* TheThread(void *)
{
  const char *acLibnfcVersion;
  size_t  szDeviceFound;
  size_t  szTargetFound;
  size_t  i;
  bool verbose = false;
  nfc_device_desc_t *pnddDevices;
  nfc_modulation_t nm;

  flex_string_t *str = new_string();  // expanding string

  // get libnfc version string
  acLibnfcVersion = nfc_version();

  print_string(str, "libnfc version: ");
  print_string(str, acLibnfcVersion);
  print_string(str, "\n");

  if (!(pnddDevices = (nfc_device_desc_t *)malloc(MAX_DEVICE_COUNT * sizeof (*pnddDevices))))
  {
    // malloc() failed
    return NULL;
  }

  nfc_list_devices(pnddDevices, MAX_DEVICE_COUNT, &szDeviceFound);

  if (szDeviceFound == 0)
    print_string(str, "No NFC device found.\n");
  else
  {
    print_string(str, "Found ");
    print_integer(str, (int)szDeviceFound);
    print_string(str, " contactless reader(s)\n\n");
  }

  for (i = 0; i < szDeviceFound; i++) 
  {
    nfc_target_t ant[MAX_TARGET_COUNT];
    pnd = nfc_connect(&(pnddDevices[i]));

    if (pnd == NULL)
    {
      // Unable to connect to NFC device
      return NULL;
    }

    nfc_initiator_init(pnd);

    print_string(str, "Connected to NFC device: ");
    print_string(str, pnd->acName);
    print_string(str, "\n\n");

    // List ISO14443A targets

    nm.nmt = NMT_ISO14443A;
    nm.nbr = NBR_106;

    if (nfc_initiator_list_passive_targets (pnd, nm, ant, MAX_TARGET_COUNT, &szTargetFound))
    {
      size_t  n;

      if (szTargetFound > 0)
      {
        print_integer(str, (int) szTargetFound);
        print_string(str, " ISO14443A passive target(s) found");
        print_string(str, (char *) ((szTargetFound == 0) ? ".\n" : ":"));
        print_string(str, "\n");
      }

      for (n = 0; n < szTargetFound; n++)
      {
        print_nfc_iso14443a_info (str, ant[n].nti.nai, verbose);
        print_string(str, (char *)"\n");
      }
    }

    nfc_disconnect (pnd);
  }

  free (pnddDevices);

  pthread_mutex_lock(&queue_mutex);
  cb_msg_queue.push(dup_string(str));
  pthread_mutex_unlock(&queue_mutex);
  free_string(str);

  // wake up callback
  ev_async_send(EV_DEFAULT_UC_ &eio_nfc_notifier);

  return NULL;
}

// callback that runs the javascript in main thread
static void Callback(EV_P_ ev_async *watcher, int revents)
{
  HandleScope scope;

  assert(watcher == &eio_nfc_notifier);
  assert(revents == EV_ASYNC);

  // locate callback from the module context if defined by script
  // nfc = require('nfc')
  // nfc.callback = function( ... ) { ..
  Local<Value> callback_v = module_handle->Get(callback_symbol);

  if (!callback_v->IsFunction())
  {
    // callback not defined, ignore
    return;
  }
  Local<Function> callback = Local<Function>::Cast(callback_v);

  // dequeue callback message
  pthread_mutex_lock(&queue_mutex);
  char *nfc_data = cb_msg_queue.front();
  assert(nfc_data);
  cb_msg_queue.pop();
  pthread_mutex_unlock(&queue_mutex);

  TryCatch try_catch;

  // prepare arguments for the callback
  Local<Value> argv[1];
  argv[0] = Local<Value>::New(String::New(nfc_data));

  // free string data
  free(nfc_data);

  // call the callback and handle possible exception
  callback->Call(module_handle, 1, argv);

  if (try_catch.HasCaught())
  {
    FatalException(try_catch);
  }
}

// Start the background thread
Handle<Value> Start(const Arguments &args)
{
  HandleScope scope;

  // start background thread and event handler for callback
  ev_async_init(&eio_nfc_notifier, Callback);
  //ev_set_priority(&eio_nfc_notifier, EV_MAXPRI);
  ev_async_start(EV_DEFAULT_UC_ &eio_nfc_notifier);
  ev_unref(EV_DEFAULT_UC);
  pthread_create(&nfc_thread, NULL, TheThread, 0);

  return True();
}

void Initialize(Handle<Object> target)
{
  HandleScope scope;

  NODE_SET_METHOD(target, "start", Start);

  callback_symbol = NODE_PSYMBOL("callback");
  // store handle for callback context
  module_handle = Persistent<Object>::New(target);
}

extern "C" {
static void Init(Handle<Object> target)
{
  Initialize(target);
}

  NODE_MODULE(nfc, Init);
}

