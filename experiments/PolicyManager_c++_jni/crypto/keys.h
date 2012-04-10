/*******************************************************************************
 * Copyright 2010 Telecom Italia SpA
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
 ******************************************************************************/

#ifndef KEYS_H_
#define KEYS_H_

string signaturesuffix = "sign";

const char * privatekey = "-----BEGIN RSA PRIVATE KEY-----\x0a"
		"MIICXAIBAAKBgQDWImEfb6YG5PYdzAlA4PCx5rq19nnVmhDvYcrQ+IuYujObS/7C\x0a"
		"YefSd4ShyfxN1YPnQW0duN6RIpwbRI9BeahucogCLqi4kLI/O1igZOHjPGZzgVux\x0a"
		"HM/ncfs7/ur1jh0cK2XKh267F2Rz+jYQrYPj72iYVhz1NhQgGq6qx3c//QIDAQAB\x0a"
		"AoGATXQH/0/qFMpSf3qiyjXSufaECHdLoEhm4b9UlfugurB3JC/7ySGSsZ0Le13N\x0a"
		"BfY6DLasmjiZQJPtNSu6SWuQ0SDVJ948mDLUcIIMXdC9rrJidQ/UlPJ0e3SO2crY\x0a"
		"LXZ5yBrA+Ni/HmQ7BfR8JYZvXgpaHWY0+ygqf5MHYc/J5V0CQQDz9il2Oj1rU9ws\x0a"
		"qHqz+hc9xVClr2/8MON6IVFGo1BfWUjMqzu7/JpPLIx+swZYKREYyf/QvWS9JbV+\x0a"
		"1Qe7VvBzAkEA4LNs10UJ/DSL37ZFn6zORcj7LY7Oi5hwi4Tg6A6I3tB0Z7EBL2JI\x0a"
		"qRnN5KdhWUlz9/SjKm1nvwi0e1rt3SQhzwJAIJcq9MtU9yiNyj17nt1zC2J3opqs\x0a"
		"OCGD0gXvaKNaklJIImdhpHxbVOZbonViDJb33LrnfMhAU/BcraPh04oKtwJATmYL\x0a"
		"6agK7dYfn3RnImkWpz6SdLjI0+fiDKvWFOFNXAB7PNqDQVcXZvi737WOv6pjLfZL\x0a"
		"H7iAZCTTY96781Zx/QJBAJjIvQLMEVbBGQ2X1VInlPUgR9nZ0lbAJTBsOzz5mBpS\x0a"
		"Yl1z/P5HoC06DxTlbuXAuFH/f+NoPqRV8VTzD9b9sMI=\x0a"
		"-----END RSA PRIVATE KEY-----\x0a";
int privatekey_len = 887;

const char * publickey = "-----BEGIN PUBLIC KEY-----\x0a"
		"MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDWImEfb6YG5PYdzAlA4PCx5rq1\x0a"
		"9nnVmhDvYcrQ+IuYujObS/7CYefSd4ShyfxN1YPnQW0duN6RIpwbRI9BeahucogC\x0a"
		"Lqi4kLI/O1igZOHjPGZzgVuxHM/ncfs7/ur1jh0cK2XKh267F2Rz+jYQrYPj72iY\x0a"
		"Vhz1NhQgGq6qx3c//QIDAQAB\x0a"
		"-----END PUBLIC KEY-----\x0a";

int publickey_len = 272;

#endif /* KEYS_H_ */
