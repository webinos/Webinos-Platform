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
    * Copyright 2012 Christian Fuhrhop, Fraunhofer FOKUS
    * 
    ******************************************************************************/   
    /**
 
    This is all non-relevant code to set up a subscriber in the sandbox.
    To use the GSMA sandbox payment API a subscriber needs to exist,
    so there needs to be some code to create a subscriber and add
    some (virtual) funds.

    The code in this file is the one that does this, so it needs to be
    called once before doing anything with the sandbox, but once the
    subscriber is set up, it's never needed again.

  **/

   var calldone=0;
   var CID="";
   var SID="";
   
   ProvisionSandbox = function (customerID, shopID) {
      // CID="tel:"+customerID;  // GSMA sandbox does not really like the tel prefix
      CID=""+customerID;
      SID=""+shopID;
      calldone=0;
      /* Display sandbox groups */
      sandboxGET(null, null, null);
      }
    
    ProvisionCallback = function (){
      // need to serialize calls - always kind of annoying in JavaScript
      calldone++;
      /* Create payment subscriber */
      if(calldone==1)sandboxPOST("Payment_Sandbox", CID, null);
      /* Put some virtual money on subscriber account */
      if(calldone==2) sandboxPOST("Payment_Sandbox", CID, "1000");
        /*Display the subscribers in the group*/
      if(calldone==3) sandboxGET("Payment_Sandbox", null , null);
      /*Display the subscriber data*/      
      if(calldone==4)sandboxGET("Payment_Sandbox", CID, null);      
    }
   
   sandboxGET = function ( sandbox, subscriber, param) {

     if(sandbox==null)urlPath="/SandboxDataService/rest/";
     else {
      urlPath="/SandboxDataService/rest/"+sandbox; 
      if(subscriber!=null)urlPath=urlPath+"/"+encodeURIComponent(subscriber);
     }
          
     credentials = SID+ ":" + GSMA_Get_Credentials(SID);
     authHeaderValue = base64enc(credentials);
     

      headers_list = {
        'Accept': 'application/xml',
        'Host': 'oneapi.aepona.com:443',
        'Authorization': 'Basic '+authHeaderValue        
        };
         
     options = {
       host: 'oneapi.aepona.com',
       port:'443',
       path: urlPath ,      
       method: 'GET',
       headers: headers_list
     };
     console.log("sandboxGET TEST ");

    var request = https.request(options, function (response) {
     response.on("data", function (chunk) {
       console.log("sandboxGET DATA: " + chunk);    
     });
    response.on("close", function (err) {
      console.log("sandboxGET CLOSE " + err);
    });
    response.addListener("end", function () {
       console.log("sandboxGET END " );
       ProvisionCallback();
  });
  });
  request.on('error', function(e) {
    console.log("sandboxGET ERROR CALLBACK$ " + e );
    ProvisionCallback();
  });
  
   request.write("");
   request.end();
            
   }
   
   sandboxPOST = function ( sandbox, subscriber, param) {

     if(sandbox==null)urlPath="/SandboxDataService/rest/";
     else {
      urlPath="/SandboxDataService/rest/"+sandbox; 
      if(subscriber!=null)urlPath=urlPath+"/"+encodeURIComponent(subscriber);
     }
     
     
     credentials = SID+ ":" + GSMA_Get_Credentials(SID);
     authHeaderValue = base64enc(credentials);
     contentString="";
     if(param!=null) contentString="balance="+param;

      headers_list = {
        'Accept': 'application/xml',
        'Host': 'oneapi.aepona.com:443',
        'Authorization': 'Basic '+authHeaderValue,
        'Content-Length': ""+contentString.length,
        'Content-Type': "application/x-www-form-urlencoded"
        };
         
     options = {
       host: 'oneapi.aepona.com',
       port:'443',
       path: urlPath ,      
       method: 'POST',
       headers: headers_list
     };
    console.log("sandboxPOST URL: " + urlPath);    

    var request = https.request(options, function (response) {
     response.on("data", function (chunk) {
       console.log("sandboxPOST DATA: " + chunk);    
     });
    response.on("close", function (err) {
      console.log("sandboxPOST CLOSE " + err);
    });
    response.addListener("end", function () {
       console.log("sandboxPOST END " );
       ProvisionCallback();  
       });
  });
  request.on('error', function(e) {
    console.log("sandboxPOST ERROR CALLBACK$ " + e );
    ProvisionCallback();
      });
  
   request.write(contentString);
   request.end();
            
   }
   


   
   
         base64enc =  function (input) {
                var output = "";
                var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                var i = 0;
                keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";      
        
      
                input = utf8_encode(input);
 
                while (i < input.length) {
 
                        chr1 = input.charCodeAt(i++);
                        chr2 = input.charCodeAt(i++);
                        chr3 = input.charCodeAt(i++);
 
                        enc1 = chr1 >> 2;
                        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                        enc4 = chr3 & 63;
 
                        if (isNaN(chr2)) {
                                enc3 = enc4 = 64;
                        } else if (isNaN(chr3)) {
                                enc4 = 64;
                        }
 
                        output = output +
                        keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                        keyStr.charAt(enc3) + keyStr.charAt(enc4);
 
                }
 
                return output;
        };
        
                utf8_encode = function (string) {
                string = string.replace(/\r\n/g,"\n");
                var utftext = "";
 
                for (var n = 0; n < string.length; n++) {
 
                        var c = string.charCodeAt(n);
 
                        if (c < 128) {
                                utftext += String.fromCharCode(c);
                        }
                        else if((c > 127) && (c < 2048)) {
                                utftext += String.fromCharCode((c >> 6) | 192);
                                utftext += String.fromCharCode((c & 63) | 128);
                        }
                        else {
                                utftext += String.fromCharCode((c >> 12) | 224);
                                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                                utftext += String.fromCharCode((c & 63) | 128);
                        }
 
                }
 
                return utftext;
        }
 
