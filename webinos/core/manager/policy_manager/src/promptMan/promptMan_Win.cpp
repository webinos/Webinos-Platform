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
*******************************************************************************/

// TODO: Do something with the provided choises

#include <v8.h>
#include <node.h>
#include <stdio.h>
#include <Windows.h>
#include <Winuser.h>

using namespace node;
using namespace v8;

// Extracts a C string from a V8 Utf8Value.
const char* ToCString(const v8::String::Utf8Value& value) {
  return *value ? *value : "<string conversion failed>";
}

v8::Handle<Value> _display(const Arguments& args)
{
    HandleScope scope;
    if (args.Length() == 2) {
		// Get the 1st argument string
		String::Utf8Value str(args[0]);
		const char* prompt = ToCString(str);
		// TODO: We will ignore the choises for the now
		// Initialize output to false
		Handle<Integer> result = Integer::New(1);		
		if (MessageBox(NULL, prompt, "Webinos Policy Manager", MB_YESNO) == IDYES){
			// button ok has been pressed
			result = Integer::New(0);		
		}
		return scope.Close(result);
    }
    else {
      return ThrowException(Exception::TypeError(String::New("Two arguments expected")));
    }
}

extern "C" {
  static void init(v8::Handle<Object> target)
  {
    NODE_SET_METHOD(target,"display",_display);
  }
  NODE_MODULE(promptMan,init);
}
