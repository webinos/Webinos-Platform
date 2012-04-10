// node module for discovering bluetooth devices/services

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

// bluetooth headers
#include <bluetooth/bluetooth.h>
#include <bluetooth/hci.h>
#include <bluetooth/hci_lib.h>

using namespace node;
using namespace v8;

typedef struct {
  char *address;
  char *name;
  unsigned char dev_class0;
  unsigned char dev_class1;
  unsigned char dev_class2;
} BlueToothData;

// handles required for callback messages
static pthread_t bluetooth_thread;
static ev_async eio_bluetooth_notifier;
Persistent<String> callback_symbol;
Persistent<Object> module_handle;

// message queue
std::queue<BlueToothData> cb_msg_queue = std::queue<BlueToothData>();
pthread_mutex_t queue_mutex = PTHREAD_MUTEX_INITIALIZER;

// The background thread
static void* TheThread(void *)
{
  BlueToothData sdata;
  char dev_addr[19] = { 0 };  // device address as string
  char dev_name[248] = { 0 }; // device name

  int dev_id = hci_get_route(NULL);
  int sock = hci_open_dev( dev_id );

  if (dev_id < 0 || sock < 0)
  {
    //perror("opening bluetooth socket");
    return NULL;
  }

  int len  = 4;  // search time is len * 1.28 seconds
  int max_rsp = 255; // max number of devices to report
  int flags = IREQ_CACHE_FLUSH;

  inquiry_info *ii = (inquiry_info*)malloc(max_rsp * sizeof(inquiry_info));
  assert(ii);

  // okay fire up the bluetooth scan for len * 1.28 seconds
  // or 255 devices, whichever happens soonest
  int num_rsp = hci_inquiry(dev_id, len, max_rsp, NULL, &ii, flags);
  int i;

  //printf("found %d bluetooth devices\n", num_rsp);

  for (i = 0; i < num_rsp; i++)
  {
    ba2str(&(ii+i)->bdaddr, dev_addr);

    strcpy(dev_name, "[unknown]");

    if (hci_read_remote_name(sock, &(ii+i)->bdaddr,
             sizeof(dev_name)-1, dev_name, 0) < 0);

    sdata.address = strdup(dev_addr);
    assert(sdata.address);

    sdata.name = strdup(dev_name);
    assert(sdata.name);

    sdata.dev_class0 = (ii+i)->dev_class[0];
    sdata.dev_class1 = (ii+i)->dev_class[1];
    sdata.dev_class2 = (ii+i)->dev_class[2];

    pthread_mutex_lock(&queue_mutex);
    cb_msg_queue.push(sdata);
    pthread_mutex_unlock(&queue_mutex);

    // wake up callback
    ev_async_send(EV_DEFAULT_UC_ &eio_bluetooth_notifier);
  }

  free(ii);
  close(sock);
  return NULL;
}

// callback that runs the javascript in main thread
static void Callback(EV_P_ ev_async *watcher, int revents)
{
    HandleScope scope;

    assert(watcher == &eio_bluetooth_notifier);
    assert(revents == EV_ASYNC);

    // locate callback from the module context if defined by script
    // bluetooth = require('bluetooth')
    // bluetooth.callback = function( ... ) { ..
    Local<Value> callback_v = module_handle->Get(callback_symbol);
    if (!callback_v->IsFunction()) {
         // callback not defined, ignore
         return;
    }
    Local<Function> callback = Local<Function>::Cast(callback_v);

    // dequeue callback message
    pthread_mutex_lock(&queue_mutex);
    BlueToothData sdata = cb_msg_queue.front();
    cb_msg_queue.pop();
    pthread_mutex_unlock(&queue_mutex);

    TryCatch try_catch;

    // prepare arguments for the callback
    Local<Value> argv[5];
    argv[0] = Local<Value>::New(String::New(sdata.address));
    argv[1] = Local<Value>::New(String::New(sdata.name));
    argv[2] = Local<Value>::New(Integer::New(sdata.dev_class0));
    argv[3] = Local<Value>::New(Integer::New(sdata.dev_class1));
    argv[4] = Local<Value>::New(Integer::New(sdata.dev_class2));

    // free string data
    free(sdata.address);
    free(sdata.name);
    sdata.address = sdata.name = (char *)NULL;

    // call the callback and handle possible exception
    callback->Call(module_handle, 5, argv);

    if (try_catch.HasCaught()) {
        FatalException(try_catch);
    }
}

// Start the background thread
Handle<Value> Start(const Arguments &args)
{
    HandleScope scope;

    // start background thread and event handler for callback
    ev_async_init(&eio_bluetooth_notifier, Callback);
    //ev_set_priority(&eio_bluetooth_notifier, EV_MAXPRI);
    ev_async_start(EV_DEFAULT_UC_ &eio_bluetooth_notifier);
    ev_unref(EV_DEFAULT_UC);
    pthread_create(&bluetooth_thread, NULL, TheThread, 0);

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

    NODE_MODULE(bluetooth, Init);
}

