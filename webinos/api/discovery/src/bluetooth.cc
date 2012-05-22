/*******************************************************************************
*  Code contributed to the webinos project
* 
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*  
*     http://www.apache.org/licenses/LICENSE-2.0
*  
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
* 
* Copyright 2012 Samsung Electronics(UK) Ltd
*
******************************************************************************/
#include <v8.h>
#include <node.h>
#include <csignal>
#include <string>

extern "C"{
#include <stdio.h>
#include <errno.h>
#include <fcntl.h>
#include <unistd.h>
#include <stdlib.h>
#include <signal.h>
#include <termios.h>
#include <sys/poll.h>
#include <sys/ioctl.h>
#include <sys/socket.h>
#include <assert.h>


#include <bluetooth/bluetooth.h>
#include <bluetooth/hci.h>
#include <bluetooth/hci_lib.h>
#include <bluetooth/sdp.h>
#include <bluetooth/sdp_lib.h>
#include <bluetooth/rfcomm.h>

#include <obexftp/obexftp.h>
#include <obexftp/client.h>
#include <obexftp/uuid.h>
}

using namespace node;
using namespace v8;
using namespace std;

#define MAXPATHLEN 248

::sig_atomic_t io_canceled_=0;
obexftp_client_t *cli = NULL;

typedef struct {
  int dev_id;
  int sock;
  int ctl; //RFCOMM socket
  int channel; // RFCOMM channel
}BTDevice;


typedef struct {
  char *address;
  char *name;
} BlueToothData;

class BTDiscovery: ObjectWrap
{
  private:

	//Persistent< Value > myval;

  public:

	static void sig_hup(int sig)
	{
		return;
	}

	static void sig_term(int sig)
	{
		io_canceled_ = 1;
	}

  static Persistent<FunctionTemplate> s_ct;

  static void Init(Handle<Object> target)
  {
    HandleScope scope;

    Local<FunctionTemplate> t = FunctionTemplate::New(New);

    s_ct = Persistent<FunctionTemplate>::New(t);
    s_ct->InstanceTemplate()->SetInternalFieldCount(1);
    s_ct->SetClassName(String::NewSymbol("BT"));

    NODE_SET_PROTOTYPE_METHOD(s_ct, "scan_device", Scan_device);

    NODE_SET_PROTOTYPE_METHOD(s_ct, "file_transfer", File_transfer);
    
    target->Set(String::NewSymbol("bluetooth"), s_ct->GetFunction());
  }

  BTDiscovery()
  {
  }

  ~BTDiscovery()
  {
  }

  static Handle<Value> New(const Arguments& args)
  {
    HandleScope scope;
    BTDiscovery* bd = new BTDiscovery();
    bd->Wrap(args.This());
    return args.This();
  }

  static Handle<Value> Scan_device(const Arguments& args)
  {
    HandleScope scope;
    Local<Object> result =  Object::New();

    // Convert first argument to V8 String
    v8::String::Utf8Value v8str(args[0]);

    v8::Handle<v8::Array> result1 = v8::Array::New(12);

    BTDevice bt_dev;
    int num_rsp;
    inquiry_info *ii;

    char dev_addr[19] = { 0 };  // device address as string
    char dev_name[248] = { 0 }; // device name
    char dev_name_tmp[248] = { 0 }; // device name

    uuid_t svc_uuid;
    int err;
    bdaddr_t target;
    bdaddr_t source;
    sdp_list_t *response_list = NULL, *search_list, *attrid_list;
    sdp_session_t *session = 0;
    uint32_t serv_class = 0;
    int i;

   //scan_device

    bt_dev.dev_id = hci_get_route(NULL);
    bt_dev.sock = hci_open_dev( bt_dev.dev_id );

    if (bt_dev.dev_id < 0 || bt_dev.sock < 0)
    {
      perror("opening bluetooth socket");
      printf("bluetooth: releasing object\n");
    }

    int len  = 4;  // search time is len * 1.28 seconds
    int max_rsp = 255; // max number of devices to report
    int flags = IREQ_CACHE_FLUSH;

    ii = (inquiry_info*)malloc(max_rsp * sizeof(inquiry_info));
    assert(ii);

    // okay fire up the bluetooth scan for len * 1.28 seconds
    // or 255 devices, whichever happens soonest
    num_rsp = hci_inquiry(bt_dev.dev_id, len, max_rsp, NULL, &ii, flags);

    printf("found %d bluetooth devices\n", num_rsp);

    // end - scan_device

    int j = 0;

    for (i = 0; i < num_rsp; i++)
    {
      target = (ii+i)->bdaddr;
      str2ba("0:0:0:0:0:0", &source);

      if (!strncasecmp(*v8str, "0x", 2))
      {
    	int num;
	    /* This is a UUID16, just convert to int */
	    sscanf(*v8str + 2, "%X", &num);
	    serv_class = num;
      }

      if (serv_class)
      {
    	if (serv_class & 0xffff0000)
	    {
	      sdp_uuid32_create(&svc_uuid, serv_class);
		  printf("Creating a 32 bit uuid\n");
	    }
	    else
	    {
		  uint16_t class16 = serv_class & 0xffff;
		  sdp_uuid16_create(&svc_uuid, class16);
	    }
      }
      else
      {
        printf("service class is not correct\n");
        return args.This();
      }
    // connect to the SDP server running on the remote machine

      // connect to the SDP server running on the remote machine
      session = sdp_connect( &source, &target, SDP_RETRY_IF_BUSY );
      if (session == (sdp_session_t *)NULL)
      {
        printf("session for device to connect is not available, go to next device\n");
      }
      else
      {
        search_list = sdp_list_append( NULL, &svc_uuid );

        // specify that we want a list of all the matching applications' attributes
        uint32_t range = 0x0000ffff;
        attrid_list = sdp_list_append( NULL, &range );

        // get a list of service records that have the specified UUID, e.g. 0x1106
        err = sdp_service_search_attr_req( session, search_list, \
        SDP_ATTR_REQ_RANGE, attrid_list, &response_list);

        sdp_list_t *r = response_list;

        // go through each of the service records

      for (; r; r = r->next )
      {
    	ba2str(&(ii+i)->bdaddr, dev_addr);
	    strcpy(dev_name, "[unknown]");

        if(hci_read_remote_name(bt_dev.sock, &(ii+i)->bdaddr,
		 sizeof(dev_name)-1, dev_name, 0) < 0);

        printf("bluetooth device name: %s\n", dev_name);
        printf("bluetooth device address: %s\n", dev_addr);

        if(strcmp(dev_name, dev_name_tmp))
        {
          result1->Set(v8::Number::New(j), v8::String::New(dev_name));
          result1->Set(v8::Number::New(++j), v8::String::New(dev_addr));
          result1->Set(v8::Number::New(++j), v8::String::New("\n"));
          j++;
        }

        strcpy(dev_name_tmp, dev_name);

        sdp_record_t *rec = (sdp_record_t*) r->data;
        sdp_record_print(rec);
        //printf("Service RecHandle: 0x%x\n", rec->handle);

        sdp_list_t *proto_list;

	    // get a list of the protocol sequences
	    if( sdp_get_access_protos( rec, &proto_list ) == 0 )
	    {
          sdp_list_t *p = proto_list;

          // go through each protocol sequence
          for( ; p ; p = p->next )
          {
            sdp_list_t *pds = (sdp_list_t*)p->data;

            // go through each protocol list of the protocol sequence
            for( ; pds ; pds = pds->next )
            {
              // check the protocol attributes
              sdp_data_t *d = (sdp_data_t*)pds->data;
              int proto = 0;
              for( ; d; d = d->next )
              {
                switch( d->dtd )
                {
                  case SDP_UUID16:
                  case SDP_UUID32:
                  case SDP_UUID128:
                    proto = sdp_uuid_to_proto( &d->val.uuid );
                  break;
                  case SDP_UINT8:
                    if( proto == RFCOMM_UUID )
                      //printf("rfcomm channel: %d\n",d->val.int8);
                      bt_dev.channel = d->val.int8;
                  break;
                }
              }
            }
            sdp_list_free( (sdp_list_t*)p->data, 0 );
          }
          sdp_list_free( proto_list, 0 );
        }

        sdp_record_free( rec );

      }
     }
      sdp_close(session);
    }

  free( ii );
  close(bt_dev.sock);

  return result1;

  }

  static Handle<Value> File_transfer(const Arguments& args)
  {
    HandleScope scope;
    Local<Object> result =  Object::New();
    
    v8::String::Utf8Value v8arg0(args[0]);
    v8::String::Utf8Value v8arg1(args[1]);
    v8::Handle<v8::Array> result1 = v8::Array::New(12);
    
    //static obexftp_client_t *cli = NULL;
    static const char *src_dev = NULL;
    static int transport = OBEX_TRANS_BLUETOOTH;
    char *device = *v8arg0;
    static int channel = 4;

    static const char *use_uuid = (const char *)UUID_FBS;
    static int use_uuid_len = sizeof(UUID_FBS);
    
    transport = OBEX_TRANS_BLUETOOTH;

  	   
    if(cli == NULL)
    {
	int ret, retry;
	cli = obexftp_open (transport, NULL, NULL, NULL);

	if(cli == NULL)
	{
		fprintf(stderr, "Error opening obexftp-client\n");
	        return args.This();
	}
    	
    	for (retry = 0; retry < 3; retry++)
   	{
		ret = obexftp_connect_src(cli, src_dev, device, channel, (const uint8_t *)use_uuid, use_uuid_len);
		if (ret >= 0)
		{
			printf("connect successful\n");
		      	//goto listfolder;
			char *cmd = *v8arg1;
			if(strcmp(cmd, "folder")== 0)
			{
				stat_entry_t *ent;
				void *dir;
				dir = obexftp_opendir(cli, "/");

				int j;
				j = 0;

				while ((ent = obexftp_readdir(dir)) != NULL) 
				{
					stat_entry_t *st;
					st = obexftp_stat(cli, ent->name);
					if (!st) continue;
					printf("%d %s%s\n", st->size, ent->name,
					ent->mode&S_IFDIR?"/":"");
					result1->Set(v8::Number::New(j), v8::String::New(ent->name));
				 	j++;
				}
				obexftp_closedir(dir);
			}
			if(strcmp(cmd, "file")== 0)
			{
				v8::String::Utf8Value v8arg2(args[2]);
				int ret = obexftp_list(cli, NULL, *v8arg2);
		
				if (ret < 0) {
				fprintf(stderr, "Error getting a folder listing\n");
				} 
				else 
				{
			  		if(cli->buf_data)
			  		{
						printf("come to file list\n");
						result1->Set(v8::Number::New(0), v8::String::New((char*)cli->buf_data));
				        }
					//list folder
			  		else
			  		{
						printf("comes to nested folder\n");
						stat_entry_t *ent;
						void *dir = obexftp_opendir(cli, *v8arg2);

						int j = 0;
						while ((ent = obexftp_readdir(dir)) != NULL) 
						{
							printf("nested folder 1\n");
							stat_entry_t *st;
							st = obexftp_stat(cli, ent->name);
							if (!st) continue;
							char* name = strcat(*v8arg1, ent->name);
							printf("name is: %s\n", name);
							result1->Set(v8::Number::New(j), v8::String::New(name));
							j++;
						}
						obexftp_closedir(dir);
					}
				}	 
			}
			if(strcmp(cmd, "transfer")== 0)
			{
				//goto transfer;
				v8::String::Utf8Value v8arg2(args[2]);
				v8::String::Utf8Value v8arg3(args[3]);
    				printf("v8arg2 = %s\n", *v8arg2);
			    	printf("v8arg3 = %s\n", *v8arg3);
    	
			    	int ret = obexftp_get(cli, *v8arg3, *v8arg2);  

				if (ret < 0) {
					fprintf(stderr, "Error getting a file\n");
				} 
				else 
				{
					printf("get file successful!");
				} 
				result1->Set(v8::Number::New(0), v8::Integer::New(ret));
			}
		}
	}	
   	
    }
  


 	obexftp_close(cli);
	cli = NULL;
    return result1;
  }
};
Persistent<FunctionTemplate> BTDiscovery::s_ct;

extern "C" {
  static void init (Handle<Object> target)
  {
	  BTDiscovery::Init(target);
  }

  NODE_MODULE(bluetooth, init);
}
