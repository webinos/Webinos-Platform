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
    
    (function() {

var wPayment = require('./impl_payment.js');
var RPCWebinosService = require('webinos-jsonrpc2').RPCWebinosService;
        
var basket = null;

/**
 * Webinos Service constructor.
 * @constructor
 * @alias PaymentModule
 * @param rpcHandler A handler for functions that use RPC to deliver their result.  
 */
var PaymentModule = function(rpcHandler, params) {
        // inherit from RPCWebinosService
 console.log("{PAYMENT CONSTRUCTION");        
        this.base = RPCWebinosService;
        this.base({
                api:'http://webinos.org/api/payment',
                displayName:'payment',
                description:'A Webinos Payment API.'
        });
};



PaymentModule.prototype = new RPCWebinosService;

/**
 * Creates a shopping basket.
 * @param params Array of strings consisting of serviceProviderID, customerID,
 *     customerID - in that order.
 * @param successCallback Issued when the shopping basket is created.
 * @param errorCallback Issued if an error occurs during the creation of the
 *     shopping basket.
 */
PaymentModule.prototype.createShoppingBasket = function ( params, successCallback,  errorCallback){

  console.log("createShoppingBasket called on rpc receiver");

  wPayment.createShoppingBasket( 
    function (result){
          basket = result;
          successCallback(result);
       },
       function (error){
            errorCallback(error);
       },
       params[0], params[1], params[2]
  );

};

/**
 * Adds an item to a shopping basket.
 * @param params Array of objects. At 4th index is a ShoppingBasket, at 5th
 *     is the ShoppingItem.
 * @param successCallback Issued when the adding of the item to the shopping basket is correctly finished.
 * @param errorCallback Issued if an error occurs during adding the amount.
 */
PaymentModule.prototype.addItem = function ( params, successCallback,  errorCallback){

          console.log("addItem called on rpc receiver");
          basket = new wPayment.ShoppingBasket();
          // fill basket with items so far      
          basket.items=params[3].items;
          basket.extras=params[3].extras;
          basket.totalBill=params[3].totalBill;
          // add the new item   
          basket.addItem( 
          function (){
             successCallback(basket);
          },
          function (error){
            errorCallback(error);
         },
         params[4]
       );
};

/**
 * Updates the shopping basket.
 * @param params Array of objects. At 4th index is a ShoppingBasket to update.
 * @param successCallback Issued when the update is performed.
 * @param errorCallback Issued if an error occurs during update.
 */
PaymentModule.prototype.update = function ( params, successCallback,  errorCallback){

          console.log("update (ShoppingBasket) called on rpc receiver");
          basket = new wPayment.ShoppingBasket();
          // fill basket with items so far      
          basket.items=params[3].items;
          basket.extras=params[3].extras;
          basket.totalBill=params[3].totalBill;
          // update the basket
          basket.update( 
          function (){
             successCallback(basket);
          },
          function (error){
            errorCallback(error);
         }
       );
};

/**
 * Performs the checkout of the shopping basket.
 * @param params Array of objects. At 4th index is a ShoppingBasket to checkout.
 * @param successCallback Issued when the checkout is performed and payment is made.
 * @param errorCallback Issued if an error occurs during adding the amount.
 */
PaymentModule.prototype.checkout = function ( params, successCallback,  errorCallback){

          console.log("checkout (ShoppingBasket) called on rpc receiver");
          basket = new wPayment.ShoppingBasket();
          // fill basket with items so far      
          basket.items=params[3].items;
          basket.extras=params[3].extras;
          basket.totalBill=params[3].totalBill;
          // checkout the basket
          basket.checkout( 
          function (){
             successCallback(basket);
          },
          function (error){
            errorCallback(error);
         }
       );
};

/**
 * Releases a shopping basket.
 * @param params Array of objects. At 4th index is a ShoppingBasket to release.
 * @param successCallback Issued when releasing finished successfully.
 * @param errorCallback Issued if an error occurs during releasing.
 */
PaymentModule.prototype.release = function ( params, successCallback,  errorCallback){

          console.log("release (ShoppingBasket) called on rpc receiver");
          // this one could just do nothing and ignore
          // the basket, but we want to keep this properly similar
          // with addItem, update and checkout, so we create
          // a proper basket, just to kill it again...
          basket = new wPayment.ShoppingBasket();
          // fill basket with items so far      
          basket.items=params[3].items;
          basket.extras=params[3].extras;
          basket.totalBill=params[3].totalBill;
          // release the basket
          basket.release();
          successCallback(basket);
};


//export our object
exports.Service = PaymentModule;

})();
