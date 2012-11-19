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
     * The Payment connector to BlueVia Payment API: https://bluevia.com/en/knowledge/APIs.API-Guides.Payment
     *
     */

     /**
        IMPORTANT: This doesn't to anything yet, it's just an incomplete experimental stub!
    **/
                
     BlueVia_Host = 'api.bluevia.com';
     BlueVia_Port = '443';
     BlueVia_RequestPath = '/services/REST/Oauth/getRequestToken';



    BlueViaConnect = function (customerID, shopID) {
      /* retrieving request token  from BlueVia Payment API */
      // built 
      sha1= require('./sha1');
      http= require('http');
      https= require('https');
           
      now = new Date();

      // collect parameters needed for oauth signature      
      var oauthParameters= {
       "oauth_callback": "oob",
       "oauth_consumer_key": "kn12011684494805",
       "oauth_nonce": BlueVia_nonce(32),
       "oauth_signature_method": "HMAC-SHA1",
       "oauth_timestamp": ""+Math.floor(now.getTime()/1000),
       "xoauth_apiName": "Payment_Sandbox"
      };
      
      //collect parameters for payment body 
      var bodyParameters= {
       "paymentInfo.amount": "1",
       "paymentInfo.currency": "EUR",
       "serviceInfo.name":  "webinosPaymentTest1item",
       "serviceInfo.serviceID": "cc9171216b9854493e488191b988c3f0"
      };
    
      // form initial signature base
      signatureBase="POST&"+BlueVia_percentEncode("https://"+BlueVia_Host+BlueVia_RequestPath)+"&";

      var oauthParameters_fullset = new Array();
      
      // copy all parameters from oauthParameters header set
      for(var key in oauthParameters) 
         oauthParameters_fullset[key]=oauthParameters[key];

      // copy all parameters from bodyParameters  set
      for(var key in bodyParameters) 
         oauthParameters_fullset[key]=bodyParameters[key];
         
      // create payment body string
      var paymentBody="";
      for(var key in bodyParameters){
        if( paymentBody!="")paymentBody=paymentBody+"&";
         paymentBody=paymentBody+key+"="+bodyParameters[key];
         }
      
      // sort oauth parameters for signature base
      paramkeyarray = new Array();
      ind=0;
      for(var key in oauthParameters_fullset ) paramkeyarray[ind++]=key;
       paramkeyarray.sort();
       
      // add oauth parameters to signature base
      for(var i=0; i<paramkeyarray.length;i++) {
             var value= oauthParameters_fullset[paramkeyarray[i]];             
          console.log("Signature base line is " + paramkeyarray[i] + " : "+value);
             signatureBase=signatureBase+ BlueVia_percentEncode(paramkeyarray[i]+"="+value);
             
             if(i!=paramkeyarray.length-1) signatureBase=signatureBase+ BlueVia_percentEncode("&");
          }

       console.log("Signature base is now:" + signatureBase);
             
       var signature = BlueVia_createSignature("vZHl24249102"+"&",signatureBase);

       oauthParameters["oauth_signature"]=signature;

       console.log("Signature is" + signature);
      // console.log("Payment Body" + paymentBody);

      var headers = {
        'Authorization' : BlueVia_makeOAuth (oauthParameters),
        'Host': BlueVia_Host+BlueVia_Port,
        'Content-Type': 'application/x-www-form-urlencoded'
     };
         
        var options = {
                host: BlueVia_Host,
                port: BlueVia_Port,
                path: BlueVia_RequestPath,
                method: 'POST',
                headers: headers
          };

       var request = https.request(options, function (response) {
    response.on("data", function (chunk) {
       console.log("DATA: " + chunk);
     
    });
    response.on("close", function (err) {
      if( allowEarlyClose ) {
      console.log("EARLY CLOSE " + err);
        //passBackControl( response, result );
      }
    });
    response.addListener("end", function () {
       console.log("EARLY END " + response);
      //passBackControl( response, result );
    });
  });
  request.on('error', function(e) {
    console.log("ERROR CALLBACK$ " + e );
  });
  
   request.write(paymentBody);
   request.end();
  };
    
     BlueVia_nonce = function(nsize) {
      var result_nonce = "";
      nonce_chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < nsize; i++) {
          char_pos= Math.floor(Math.random() * 62);
          result_nonce=result_nonce+nonce_chars.charAt(char_pos);
       }      
       return result_nonce;
    }
    

     BlueVia_makeOAuth = function(OAparms) {
      var resultOA ="";
      
      // create key array for sorting
      keyarray = new Array();
      ind=0;
      for(var key in OAparms ) keyarray[ind++]=key;
       keyarray.sort();
       
         for(var i=0;i<keyarray.length;i++ ) {
         
            if(resultOA=="")resultOA ="OAuth ";
            else resultOA=resultOA+",";
            
             var value= OAparms[keyarray[i]];
             resultOA= resultOA+ keyarray[i]+"=\""+value+"\"";                   
          }
          console.log('OAuth header vars are: '+resultOA); 
      return resultOA;
    }


    BlueVia_percentEncode = function(instring){
         if( instring == null || instring == "" ) return "";

    var result= encodeURIComponent(instring);
    return result.replace(/\!/g, "%21")
                 .replace(/\'/g, "%27")
                 .replace(/\(/g, "%28")
                 .replace(/\)/g, "%29")
                 .replace(/\*/g, "%2A");
 }

     BlueVia_createSignature = function(key, instring){
       return  "not done yet"; // sha1.HMACSHA1(key, instring);  
     }
