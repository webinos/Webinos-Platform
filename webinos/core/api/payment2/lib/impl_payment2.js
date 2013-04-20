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
 * Interface for Payment functions.
 *
 *
 * This API provides generic shopping basket functionality to provide in-app payment.
 *
 * It is not linked to a specific payment service provider and is designed to be
 * sufficiently generic to be mapable to various payment services like GSMA OneAPI,
 * Andoid Payment API or PayPal.
 *
 */

    //making namespaces
    if (typeof webinos === "undefined") { webinos = {}; }
    if (!webinos.payment2) { webinos.payment2 = {}; }

    /**
     * The WebinosPayment interface describes the part of the payment API accessible through the webinos object.
     *
     */
    WebinosPayment2 = function () {

        this.payment2 = new Payment2();
    };

    /**
     * webinos.payment2 object.
     *
     */
    WebinosPayment2.prototype.payment2 = null;

    /**
     * The ShoppingItem captures the attributes of a single shopping product
     *
     *
     * The shopping basket represents a current payment action and allows to
     * add a number of items to the basket before proceeding to checkout.
     *
     */
    ShoppingItem = function () {

        // initialize attributes

        this.productID = "";
        this.description = "";
        this.currency = "EUR";
        this.itemPrice = 0.0;
        this.itemCount = 0;
        this.itemsPrice = 0.0;
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
     * Callback for successful payment related functions
     *
     */
    Payment2SuccessCB = function () {
        //TODO implement constructor logic if needed!

    };

    /**
     * Callback for successful of payment related functions
     *
     */
    Payment2SuccessCB.prototype.onSuccess = function (proofOfPurchase) {
        //TODO: Add your application logic here!

        return;
    };

    /**
     * Callback for errors during payment related functions
     *
     */
    Payment2ErrorCB = function () {
        //TODO implement constructor logic if needed!

    };

    /**
     * Callback for errors during payment related functions
     *
     */
    Payment2ErrorCB.prototype.onError = function (error) {
        //TODO: Add your application logic here!

        return;
    };

    /**
     * The PendingOperation interface
     *
     *
     * The PendingOperation interface describes objects that are returned by asynchronous methods that are cancellable. It makes it possible to bring 
     * these operations to a stop if they haven't produced a result within a desired time or before a given event, thereby possibly reclaiming resources.
     *
     */
    PendingOperation = function () {
        //TODO implement constructor logic if needed!

    };

    /**
     * Method Cancel
     *
     *
     * Cancel the pending asynchronous operation. When this method is called, the user agent must immediately bring the operation to a stop and return. No success or error callback for the pending operation will be invoked.
     *
     */
    PendingOperation.prototype.cancel = function () {
        //TODO: Add your application logic here!

        return;
    };

    /**
     * Payment specific errors.
     *
     *
     * The PaymentError interface encapsulates all errors in the manipulation of payments objects in the Payment API.
     *
     */
    Payment2Error = function () {
        //TODO implement constructor logic if needed!

        //TODO initialize attributes

        this.code = Number;
        this.message = String;
        this.retryPossible = Boolean;
    };

    /**
     * Bill is already open
     *
     */
    Payment2Error.prototype.PAYMENT_SHOPPING_BASKET_OPEN_ERROR = 1;

    /**
     * Bill is not open
     *
     */
     Payment2Error.prototype.PAYMENT_SHOPPING_BASKET_NOT_OPEN_ERROR = 2;

    /**
     * Charging operation failed, the charge was not applied
     *
     */
    Payment2Error.prototype.PAYMENT_CHARGE_FAILED = 3;

    /**
     * Refunds not supported
     *
     */
    Payment2Error.prototype.PAYMENT_REFUND_NOT_SUPPORTED = 4;

    /**
     * Refund failed
     *
     */
    Payment2Error.prototype.PAYMENT_REFUND_FAILED = 5;

    /**
     * Chargeable amount exceeded
     *
     */
    Payment2Error.prototype.PAYMENT_CHARGEABLE_EXCEEDED = 6;

    /**
     * Chargeable Authentication failed. Payment credentials are incorrect.
     *
     */
    Payment2Error.prototype.PAYMENT_AUTHENTICATION_FAILED = 7;

    /**
     * An error code assigned by an implementation when an error has occurred in Payment processing.
     *
     *
     * No exceptions.
     *
     */
    Payment2Error.prototype.code = Number;

    /**
     * A text describing an error occuring in the Payment in human readable form.
     *
     *
     * No exceptions.
     *
     */
    Payment2Error.prototype.message = String;

    /**
     * A text describing an whether an error might be recoverable on subsequent tries
     *
     *
     * No exceptions.
     *
     */
    Payment2Error.prototype.retryPossible = Boolean;

    /**
     * The Payment interface
     *
     *
     * The Payment interface provides access to payment functionality.
     *
     *
     */
    Payment2 = function () {
        //TODO implement constructor logic if needed!

    };
    webinos.payment2 = new Payment2();

    /**
     * Pay a bill
     *
     */
    webinos.payment2.pay = function (successCallback, errorCallback, challengeCallback, itemList, bill, customerID, sellerID) {
        console.log("Implementation of webinos.payment2.pay called");

      // cover a number of possible error conditions
      error = {};
      if((sellerID==null)||(sellerID.length==0)) {
         error.code = Payment2Error.prototype.PAYMENT_AUTHENTICATION_FAILED;
         error.message = "Failed to provide seller ID";
         errorCallback(error);
         return new PendingOperation();
      }
      if((customerID==null)||(customerID==0)) {
         error.code = Payment2Error.prototype.PAYMENT_AUTHENTICATION_FAILED;
         error.message = "Failed to provide customer ID";
         errorCallback(error);
         return new PendingOperation();
      }

      // Everything is fine - perform the payment
        successCallback("Payment of "+bill.itemPrice+" "+bill.currency+" performed on bill "+bill.productID);
        return new PendingOperation();
    };

exports.pay = webinos.payment2.pay;

