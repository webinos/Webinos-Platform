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
******************************************************************************/

(function() {
 //Payment Module Functionality

        PaymentModule = function (obj){      
                this.base = WebinosService;
                this.base(obj);
        };

    var rpcServiceProviderID, rpcCustomerID, rpcShopID;

        PaymentModule.prototype = new WebinosService;
        
        /**
         * To bind the service.
         * @param bindCB BindCallback object.
         */
        PaymentModule.prototype.bindService = function (bindCB, serviceId) {
                this.listenAttr = {};
                
                if (typeof bindCB.onBind === 'function') {
                        bindCB.onBind(this);
                };
        }


    PaymentModule.prototype.createShoppingBasket = function (successCallback, errorCallback, serviceProviderID, customerID, shopID) {
                rpcServiceProviderID=serviceProviderID;
                rpcCustomerID=customerID;
                rpcShopID=shopID;
                
                var arguments = new Array();
                arguments[0]=rpcServiceProviderID;
                arguments[1]=rpcCustomerID;
                arguments[2]=rpcShopID;
                var self = this;
                var rpc = webinos.rpcHandler.createRPC(this, "createShoppingBasket", arguments);
                webinos.rpcHandler.executeRPC(rpc,
                                function (params){
                                        successCallback(new ShoppingBasket(self));
                                },
                                function (error){errorCallback(error);}
                );
        }
    /**
     * The ShoppingItem captures the attributes of a single shopping product
     *
     * 
     * The shopping basket represents a current payment action and allows to 
     * add a number of items to the basket before proceeding to checkout.
     * 
     */
    ShoppingItem = function (obj) {

        // initialize attributes

        this.productID = "";
        this.description = "";
        this.currency = "EUR";
        this.itemPrice = 0.0;
        this.itemCount = 0;
        this.itemsPrice = 0.0;
        this.base = WebinosService;
        this.base(obj);
    };        
    /**
     * An id that allows the shop to identify the purchased item
     *
     * 
     * No exceptions
     * 
     */
    ShoppingItem.prototype.productID = ""

    /**
     * A human-readable text to appear on the bill, so the user can easily see what they bought.
     *
     * 
     * No exceptions
     * 
     */
    ShoppingItem.prototype.description = "";

    /**
     * The 3-figure code as per ISO 4217.
     *
     * 
     * No exceptions
     * 
     */
    ShoppingItem.prototype.currency = "EUR";

    /**
     * The price per individual item in the currency given above, a negative number represents a refund.
     *
     * 
     * No exceptions
     * 
     */
    ShoppingItem.prototype.itemPrice = 0.0;

    /**
     * The number of identical items purchased
     *
     * 
     * No exceptions
     * 
     */
    ShoppingItem.prototype.itemCount = 0;

    /**
     * Price for all products in this shopping item.
     *
     * 
     * Typically this is itemPrice*itemCount, but special '3 for 2' rebates might apply.
     * 
     * Updated by the shopping basket update function.
     * 
     * No exceptions
     * 
     */
    ShoppingItem.prototype.itemsPrice = 0.0;

        /**
     * The ShoppingBasket interface provides access to a shopping basket
     *
     * 
     * The shopping basket represents a current payment action and allows to 
     * add a number of items to the basket before proceeding to checkout.
     * 
     */
    ShoppingBasket = function (obj) {

        // initialize attributes
        this.items =new Array(); 
        this.extras =new Array(); 
        this.totalBill = 0.0;        
        this.base = WebinosService;
        this.base(obj);
    };
  
    
    /**
     * List of items currently in the shopping basket.
     *
     * 
     * These are the items that have been added with addItem.
     * 
     * No exceptions
     * 
     */
    ShoppingBasket.prototype.items =  null;

    /**
     * Automatically generated extra items, typically rebates, taxes and shipping costs.
     *
     * 
     * These items are automatically added to the shopping basket by update()
     * (or after the addition of an item to the basket).
     * 
     * These items can contain such 'virtual' items as payback schemes, rebates, taxes,
     * shipping costs and other items that are calculated on the basis of the regular
     * items added.
     * 
     * No exceptions
     * 
     */
    ShoppingBasket.prototype.extras = null;

    /**
     * The total amount that will be charged to the user on checkout.
     *
     * 
     * Will be updated by update(), may be updated by addItem().
     * 
     * No exceptions
     * 
     */
    ShoppingBasket.prototype.totalBill = 0.0;

    /**
     * Adds an item to a shopping basket.
     *
     */
    ShoppingBasket.prototype.addItem = function (successCallback, errorCallback, item) {
                var arguments = new Array();
                arguments[0]=rpcServiceProviderID;
                arguments[1]=rpcCustomerID;
                arguments[2]=rpcShopID;
                arguments[3]=this;
                arguments[4]=item;
                var self = this;
                var rpc = webinos.rpcHandler.createRPC(this, "addItem", arguments);
                webinos.rpcHandler.executeRPC(rpc,
                                function (params){
                                        
                                              self.items=params.items;
                                              self.extras=params.extras;
                                              self.totalBill=params.totalBill;
                                        successCallback();
                                },
                                function (error){errorCallback(error);}
                );
    };

  /**
     * Updates the shopping basket
     *
     * 
     */
    ShoppingBasket.prototype.update = function (successCallback, errorCallback) {
                var arguments = new Array();
                arguments[0]=rpcServiceProviderID;
                arguments[1]=rpcCustomerID;
                arguments[2]=rpcShopID;
                arguments[3]=this;
                var self = this;
                var rpc = webinos.rpcHandler.createRPC(this, "update", arguments);
                webinos.rpcHandler.executeRPC(rpc,
                                function (params){                                       
                                              self.items=params.items;
                                              self.extras=params.extras;
                                              self.totalBill=params.totalBill;
                                        successCallback();
                                },
                                function (error){errorCallback(error);}
                );  
    };

   /**
     * Performs the checkout of the shopping basket.
     *
     * 
     * The items in the shopping basket will be charged to the shopper.
     * 
     * Depending on the implementation of the actual payment service, this function
     * might cause the checkout screen of the payment service provider to be displayed.
     * 
     */
    ShoppingBasket.prototype.checkout = function (successCallback, errorCallback) {
                var arguments = new Array();
                arguments[0]=rpcServiceProviderID;
                arguments[1]=rpcCustomerID;
                arguments[2]=rpcShopID;
                arguments[3]=this;
                var self = this;
                var rpc = webinos.rpcHandler.createRPC(this, "checkout", arguments);
                webinos.rpcHandler.executeRPC(rpc,
                                function (params){      
                                        // remove shopping basket after checkout                                 
                                              self=null;
                                        successCallback();
                                },
                                function (error){errorCallback(error);}
                );  
    };

 

    ShoppingBasket.prototype.release = function () {
                var arguments = new Array();
                arguments[0]=rpcServiceProviderID;
                arguments[1]=rpcCustomerID;
                arguments[2]=rpcShopID;
                arguments[3]=this;
                var self = this;
    
                 // now call thr release on the server, in case it needs to do some clean-up there                       
                var rpc = webinos.rpcHandler.createRPC(this, "release", arguments);
                webinos.rpcHandler.executeRPC(rpc,
                                function (params){ },
                                function (error){errorCallback(error);}
                );  
                 // remove shopping basket after release   
                 // actually, we could do that without the RPC call,
                 // but there might be data on the server side that
                  // needs to be released as well.
                     // would be best if we could null the object itself,
                     // but JavaScript doesn't allow this               
                                        self.items=null;
                                        self.extras=null;        
    };
            
}());
