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
     * The Payment connector to GSMA Payment API
     *
     */
    require('./gsma_provison_payment.js');

    /* path definitions for GSMA (currently sandbox) */
    GSMA_Payment_Server="oneapi.aepona.com";
    GSMA_Data_Service_Path="/SandboxDataService/rest/Payment_Sandbox/";
    GSMA_Data_Reserve_Path="/PaymentService/ReserveAmountCharging_OneAPI_REST_v1_0/sandbox/1/payment/{customerRef}/transactions/amountReservation";

    var GSMA_Reservation_counter = 1;
    var GSMA_Reservation_code = "";
    var GSMA_Request_location = "";
    
    GSMA_Shopping_Basket = function (setEmptyShoppingBasket, successCallback, errorCallback, customerID, shopID) {
      /*
       GSMA does not really have a function to create an empty shopping basket,
       (it is created by putting the first item in), but just as a replacement,
       we check at least whether the customer and the shop exist by querying
       the customer's account.
      */
      https= require('https');

      // Provision sandbox - needs to be done only once and can then be commented out
      // see comment in gsma_provison_payment.js
      //ProvisionSandbox(customerID,shopID) ;

      GSMA_Reservation_counter = 1;
      GSMA_Reservation_code=GSMA_Get_Reference(shopID, 10);
      GSMA_Request_location = "";

      paymentServer=GSMA_Payment_Server;
      customerRef = customerID;
      // remove prefix since the sandbox implementation does not really like that
      if(customerRef.charAt(0)=='+')customerRef=customerRef.substring(1);
      customerRef = encodeURIComponent(customerRef);
      
      credentials = shopID+ ":" + GSMA_Get_Credentials(shopID);
      authHeaderValue = base64enc(credentials);
                
      urlPath = GSMA_Data_Service_Path+customerRef ;  

      paymentBody= "";

      //console.log("GSMA_Shopping_Basket path is : " + urlPath );
      //console.log("GSMA_Shopping_Basket body is : " + paymentBody );

      var headers_list = {
        'Host': GSMA_Payment_Server+':443',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': ""+paymentBody.length,
        'Authorization': 'Basic '+authHeaderValue   
     };
         
    var options = {
    host: GSMA_Payment_Server,
    port:'443',
    path: urlPath ,      
    method: 'GET',
    headers: headers_list 
  };

    retcode="Unknown problem";

    var request = https.request(options, function (response) {
    response.on("data", function (chunk) {
        
       console.log("DATA: " + chunk);
       // do we have the subscriber in the reply?
       reply=""+chunk;  
       if(reply.indexOf("<error>")!=-1)retcode=GSMA_Error_Extract(reply,"<error>","</error>");
       else if(reply.indexOf("401 - Not Authorized")!=-1)retcode="Shop not authorized";
       else retcode="ok";
       //console.log("retcode: " + retcode);
    });
    response.on("close", function (err) {
            error.code = 1;
            error.message = "Unexpected close on call to payment server";       
            errorCallback(error); 
    });

    response.addListener("end", function () {
      if(retcode=="ok") {
           setEmptyShoppingBasket();
           successCallback(basket);
      }
      else {
            error.code = 1;
            error.message = retcode ;
            errorCallback(error); 
     }
    });
  });
  request.on('error', function(e) {
            retcode="Payment error "+e;
            error.code = 1;
            error.message = retcode ;
            errorCallback(error); 
  });
  
   request.write(paymentBody);
   request.end();                      
  };
  


    GSMA_Add_Item  =  function ( successCallback, errorCallback, customerID, shopID,
               itemProductID, itemDescription, itemCurrency, itemPrice, itemCount, itemsPrice){

      https= require('https');

    console.log("GSMA_Add_Item called");

      paymentServer=GSMA_Payment_Server;
      customerRef = customerID;

      // remove prefix since the sandbox implementation does not really like that
      if(customerRef.charAt(0)=='+')customerRef=customerRef.substring(1);
      customerRef = encodeURIComponent(customerRef);
      
      credentials = shopID+ ":" + GSMA_Get_Credentials(shopID);
      authHeaderValue = base64enc(credentials);
                
      urlPath = GSMA_Data_Reserve_Path;
       urlPath = urlPath.replace("{customerRef}", customerRef );

      if(GSMA_Reservation_counter>1)urlPath=GSMA_Request_location ; // use location returned from previous item
  
      credentials = shopID+ ":" + GSMA_Get_Credentials(shopID);
      authHeaderValue = base64enc(credentials);

      if(itemCount==1)
        itemsDescription = itemDescription;
      else
        itemsDescription = itemCount + "x"+ itemDescription+" ("+itemCount+"x"+itemPrice+" "+itemCurrency+")" ;
               
      paymentBody=
        "endUserId="+customerRef+"&"+
        "transactionOperationStatus="+"reserved"+"&"+  // intentional error
        "description="+encodeURIComponent( itemsDescription )+"&"+
        "currency="+encodeURIComponent( itemCurrency )+"&"+
        "amount="+encodeURIComponent( itemsPrice )+"&"+
        "referenceCode="+encodeURIComponent( GSMA_Reservation_code)+"&"+
        "referenceSequence="+encodeURIComponent( GSMA_Reservation_counter++)+"&";

      var headers_list = {
        'Accept': 'application/json',
        'Host': GSMA_Payment_Server+':443',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': ""+paymentBody.length,
        'Authorization': 'Basic '+authHeaderValue   
     };
         
    var options = {
    host: GSMA_Payment_Server,
    port:'443',
    path: urlPath ,      
    method: 'POST',
    headers: headers_list 
  };



      //console.log("GSMA_Shopping_Basket path is : " + urlPath );
      //console.log("GSMA_Shopping_Basket body is : " + paymentBody );

      retcode="Unknown problem";

       var request = https.request(options, function (response) {

    response.on("data", function (chunk) {
        locaHeader =  response.headers["location"];
        if((locaHeader!=null)&&(locaHeader.length>0))GSMA_Request_location = locaHeader;

       reply=""+chunk;
       if(reply.indexOf("requestError")!=-1)retcode=GSMA_Error_Extract(reply,"\"text\":\"","\",\"variables");
       else retcode="ok";

        //console.log("DATA: " + chunk);
        //console.log("RETCODE: " + retcode);
     
    });
    response.on("close", function (err) {
            error.code = 1;
            error.message = "Unexpected close on call to payment server";       
            errorCallback(error); 
    });

    response.addListener("end", function () {
      if(retcode=="ok") {
           successCallback(basket);
      }
      else {
            error.code = 1;
            error.message = retcode ;
            errorCallback(error); 
     }
    });
  });
  request.on('error', function(e) {
            retcode="Payment error "+e;
            error.code = 1;
            error.message = retcode ;
            errorCallback(error); 
  });
  
   request.write(paymentBody);
   request.end();                      
  };
  



    GSMA_Checkout   =  function ( successCallback, errorCallback, customerID, shopID, totalAmount, currency) {

      https= require('https');

      console.log("GSMA_Checkout called");

      paymentServer=GSMA_Payment_Server;
      
      credentials = shopID+ ":" + GSMA_Get_Credentials(shopID);
      authHeaderValue = base64enc(credentials);
                
      urlPath=GSMA_Request_location ; // use location returned from last item added
  
      credentials = shopID+ ":" + GSMA_Get_Credentials(shopID);
      authHeaderValue = base64enc(credentials);
              
      paymentBody=
        "endUserId="+customerRef+"&"+
        "transactionOperationStatus="+"charged"+"&"+
        "description="+encodeURIComponent( GSMA_Reservation_code )+"&"+
        "currency="+encodeURIComponent( currency )+"&"+
        "amount="+encodeURIComponent( totalAmount )+"&"+
        "referenceCode="+encodeURIComponent( GSMA_Reservation_code)+"&"+
        "referenceSequence="+encodeURIComponent( GSMA_Reservation_counter++)+"&";

      var headers_list = {
        'Accept': 'application/json',
        'Host': GSMA_Payment_Server+':443',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': ""+paymentBody.length,
        'Authorization': 'Basic '+authHeaderValue   
     };
         
    var options = {
    host: GSMA_Payment_Server,
    port:'443',
    path: urlPath ,      
    method: 'POST',
    headers: headers_list 
  };



      console.log("GSMA_Shopping_Basket path is : " + urlPath );
      console.log("GSMA_Shopping_Basket body is : " + paymentBody );

      retcode="Unknown problem";

       var request = https.request(options, function (response) {

    response.on("data", function (chunk) {
        locaHeader =  response.headers["location"];
        if((locaHeader!=null)&&(locaHeader.length>0))GSMA_Request_location = locaHeader;
        reply=""+chunk;
        if(reply.indexOf("requestError")!=-1)retcode=GSMA_Error_Extract(reply,"\"text\":\"","\",\"variables");
        else retcode="ok";
        console.log("DATA: " + chunk);
     
    });
    response.on("close", function (err) {
            error.code = 1;
            error.message = "Unexpected close on call to payment server";       
            errorCallback(error); 
    });

    response.addListener("end", function () {
      if(retcode=="ok") {
           successCallback(basket);
      }
      else {
            error.code = 1;
            error.message = retcode ;
            errorCallback(error); 
     }
    });
  });
  request.on('error', function(e) {
            retcode="Payment error "+e;
            error.code = 1;
            error.message = retcode ;
            errorCallback(error); 
  });
  
   request.write(paymentBody);
   request.end();                      
  };
  



    GSMA_Release   =  function (  customerID, shopID) {

      https= require('https');

      console.log("GSMA_Release called");

      paymentServer=GSMA_Payment_Server;
      
      credentials = shopID+ ":" + GSMA_Get_Credentials(shopID);
      authHeaderValue = base64enc(credentials);
                
      urlPath=GSMA_Request_location ; // use location returned from last item added
  
      credentials = shopID+ ":" + GSMA_Get_Credentials(shopID);
      authHeaderValue = base64enc(credentials);
              
       // Note: According to the spec, only the transactionOperationStatus and the 
       // referenceSequence are really needed. With the URL it's sufficient to
       // identify and release the reservation request.
       // But technically 'release' seems to be implemented in the GSMA sandbox
       // as a special case of 'charge', so stuff like description, currency and
       // amount are required even though the latter two  aren't even mentioned as 
       // possible parameters in the specification.

      paymentBody=
        "endUserId="+customerRef+"&"+
        "transactionOperationStatus="+"released"+"&"+
        "description="+encodeURIComponent( GSMA_Reservation_code )+"&"+
        "currency="+encodeURIComponent( "EUR")+"&"+
        "amount="+encodeURIComponent( 0)+"&"+
        "referenceCode="+encodeURIComponent( GSMA_Reservation_code)+"&"+
        "referenceSequence="+encodeURIComponent( GSMA_Reservation_counter++)+"&";

      var headers_list = {
        'Accept': 'application/json',
        'Host': GSMA_Payment_Server+':443',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': ""+paymentBody.length,
        'Authorization': 'Basic '+authHeaderValue   
     };
         
    var options = {
    host: GSMA_Payment_Server,
    port:'443',
    path: urlPath ,      
    method: 'POST',
    headers: headers_list 
  };



      console.log("GSMA_Shopping_Basket path is : " + urlPath );
      console.log("GSMA_Shopping_Basket body is : " + paymentBody );

      retcode="Unknown problem";

       var request = https.request(options, function (response) {

    response.on("data", function (chunk) {
        console.log("DATA: " + chunk);
     
    });
    response.on("close", function (err) {
    });

    response.addListener("end", function () {
    });
  });
  request.on('error', function(e) {
  });
  
   request.write(paymentBody);
   request.end();                      
  };
  



     GSMA_Get_Reference = function(shopID, nsize) {
      var result_nonce = shopID+"-";
      nonce_chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < nsize; i++) {
          char_pos= Math.floor(Math.random() * 62);
          result_nonce=result_nonce+nonce_chars.charAt(char_pos);
       }      
       return result_nonce;
    }


    GSMA_Get_Credentials = function (shopID) {
    /*
       Note - this is totally unsafe and stupid - don't try this at home
       (and much less in a work environment). But unless we have secure
       storage up and running, we need to store the credentials somewhere.
       And it's just a test account anyway.
    */
    
      credentials = new Array();
      credentials["webinosTest"] = ["testing123"];
       
      return credentials[shopID];       
  };


   GSMA_Error_Extract = function (serverMSG, fromText, toText){
     fromTextPos=serverMSG.indexOf(fromText);
     toTextPos=serverMSG.indexOf(toText);
     if(fromTextPos==-1)return serverMSG;
     if(toTextPos==-1)return serverMSG.slice(fromTextPos+fromText.length);
     return serverMSG.slice(fromTextPos+fromText.length,toTextPos);
   }

