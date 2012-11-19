/*******************************************************************************
 *  Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2012 Christian Fuhrhop, Fraunhofer FOKUS
 ******************************************************************************/

describe("Payment API", function() {
        var paymentService;

        beforeEach(function() {
                this.addMatchers({
                        toHaveProp: function(expected) {
                                return typeof this.actual[expected] !== "undefined";
                        }
                });

                webinos.discovery.findServices(new ServiceType("http://webinos.org/api/payment"), {
                        onFound: function (service) {
                                paymentService = service;                                
                        }
                });

                waitsFor(function() {
                        return !!paymentService;
                }, "The discovery didn't find a Payment service", 5000);
        });

        it("should be available from the discovery", function() {
                expect(paymentService).toBeDefined();
        });

        it("has the necessary properties as service object", function() {
                expect(paymentService).toHaveProp("state");
                expect(paymentService.api).toEqual(jasmine.any(String));
                expect(paymentService.id).toEqual(jasmine.any(String));
                expect(paymentService.displayName).toEqual(jasmine.any(String));
                expect(paymentService.description).toEqual(jasmine.any(String));
                expect(paymentService.icon).toEqual(jasmine.any(String));
                expect(paymentService.bindService).toEqual(jasmine.any(Function));
        });

        it("can be bound", function() {
                var bound = false;

                paymentService.bindService({onBind: function(service) {
                        paymentService = service;
                        bound = true;
                }});

                waitsFor(function() {
                    return bound;
                }, "The service couldn't be bound", 500);

                runs(function() {
                        expect(bound).toEqual(true);
                });
        });

        it("has the necessary functions as Payment API service", function() {
                expect(paymentService.createShoppingBasket).toEqual(jasmine.any(Function));
        });
        
        var myBasket = null;
        var myItem= null;
        var oldTotal = null;
        
        it("can not create a shopping basket with null payment provider",  function() {
                var gotBasket = true;
                var gotCallback = false;
                
                 paymentService.createShoppingBasket(
                           function (basket) {myBasket = basket;gotBasket=true;gotCallback=true;},
                            function (error) {gotBasket=false; gotCallback=true;},
                            null,"mycustomer","myshop"
                  );    
                                            
                waitsFor(function() {
                        return gotCallback;
                }, "createShoppingBasket callback to be called.", 10000);

                runs(function() {
                        expect(gotBasket).toEqual(false);                        
                });

        });
        
        it("can not create a shopping basket with null customer",  function() {
                var gotBasket = true;
                var gotCallback = false;
                
                 paymentService.createShoppingBasket(
                           function (basket) {myBasket = basket;gotBasket=true; gotCallback=true;},
                            function (error) {gotBasket=false; gotCallback=true; },
                            "Local test",null,"myshop"
                  );    
                                            
                waitsFor(function() {
                         return gotCallback;
                }, "createShoppingBasket callback to be called.", 10000);

                runs(function() {
                        expect(gotBasket).toEqual(false);                        
                });

        });
        
        it("can not create a shopping basket with null shop",  function() {
                var gotBasket = true;
                var gotCallback = false;
                
                 paymentService.createShoppingBasket(
                           function (basket) {myBasket = basket;gotBasket=true; gotCallback=true;},
                            function (error) {gotBasket=false; gotCallback=true; },
                             "Local test","mycustomer",null
                  );    
                                            
                waitsFor(function() {
                        return gotCallback;
                }, "createShoppingBasket callback to be called.", 10000);

                runs(function() {
                        expect(gotBasket).toEqual(false);                        
                });

        });
        
        it("can create a shopping basket",  function() {
                var gotBasket = false;
                var gotCallback = false;
                
                 paymentService.createShoppingBasket(
                           function (basket) {myBasket = basket;gotBasket=true; gotCallback=true;},
                            function (error) {gotBasket=false;  gotCallback=true;},
                            "Local test","mycustomer","myshop"
                  );    
                                            
                waitsFor(function() {
                         return gotCallback;
                }, "createShoppingBasket callback to be called.", 10000);

                runs(function() {
                        expect(gotBasket).toEqual(true);                        
                });

        });
        
        it("has the necessary properties and functions for a shopping basket", function() {
                expect(myBasket.addItem).toEqual(jasmine.any(Function));
                expect(myBasket.update).toEqual(jasmine.any(Function));
                expect(myBasket.checkout).toEqual(jasmine.any(Function));
                expect(myBasket.release).toEqual(jasmine.any(Function));
                expect(myBasket).toHaveProp("items");
                expect(myBasket).toHaveProp("extras");
                expect(myBasket).toHaveProp("totalBill");
       });
       

        it("has the necessary properties and functions for a shopping item", function() {     
                      myItem=new ShoppingItem();
                      expect(myItem).toHaveProp("productID");
                      expect(myItem).toHaveProp("description");
                      expect(myItem).toHaveProp("currency");
                      expect(myItem).toHaveProp("itemPrice");
                      expect(myItem).toHaveProp("itemCount");
                      expect(myItem).toHaveProp("itemsPrice");
       });
         
        it("can add an item to a shopping basket",  function() {
                var addedItem = false;
                var gotCallback = false;
                
                 myItem.productID="1";
                 myItem.description="One Item";
                 myItem.currency="EUR";
                 myItem.itemPrice=12.34;
                 myItem.itemCount=1;
                 myItem.itemsPrice=12.34;

                 myBasket.addItem(
                           function () {addedItem=true; gotCallback=true;},
                           function (error) {addedItem=false; gotCallback=true;},
                            myItem
                            );    
                            
                                            
                waitsFor(function() {
                        return addedItem;
                }, "addedItem callback to be called.", 10000);

                runs(function() {
                        expect(addedItem).toEqual(true);                        
                });

        });

        it("has one item in the shopping basket",  function() {
         expect(myBasket.items.length).toEqual(1);              
        });
         
        it("can add a second item to a shopping basket",  function() {
                var addedItem = false;
                var gotCallback = false;
                
                 myItem.productID="2";
                 myItem.description="Another Item";
                 myItem.currency="EUR";
                 myItem.itemPrice=43.21;
                 myItem.itemCount=1;
                 myItem.itemsPrice=43.21;

                 myBasket.addItem(
                           function () {addedItem=true; gotCallback=true;},
                           function (error) {addedItem=false; gotCallback=true;},
                            myItem
                            );    
                            
                                            
                waitsFor(function() {
                         return gotCallback;
                }, "addedItem callback to be called.", 10000);

                runs(function() {
                        expect(addedItem).toEqual(true);                        
                });

        });

        it("has two items in the shopping basket",  function() {
         expect(myBasket.items.length).toEqual(2);              
        });

        it("total cost is at least cost of the two items",  function() {
         // might be more if VAT or other costs are added automatically...
         expect(myBasket.totalBill>=(12.34+43.21)).toEqual(true);              
         
         // store old total to make sure it doesn't change on faulty item adds
         oldTotal=myBasket.totalBill;
        });


        it("can not add item without currency value ",  function() {
                var addedItem = true;
                var gotCallback = false;
                
                 myItem.productID="3";
                 myItem.description="Dummy Item";
                 myItem.currency=null;
                 myItem.itemPrice=11.11;
                 myItem.itemCount=1;
                 myItem.itemsPrice=11.11;

                 myBasket.addItem(
                           function () {addedItem=true; gotCallback=true;},
                           function (error) {addedItem=false; gotCallback=true;},
                            myItem
                            );    
                            
                                            
                waitsFor(function() {
                        return gotCallback;
                }, "addedItem callback to be called.", 10000);

                runs(function() {
                        expect(addedItem).toEqual(false);                        
                });

        });

        it("can not add item with null item count ",  function() {
                var addedItem = true;
                var gotCallback = false;
                
                 myItem.productID="3";
                 myItem.description="Dummy Item";
                 myItem.currency="EUR";
                 myItem.itemPrice=11.11;
                 myItem.itemCount=null;
                 myItem.itemsPrice=11.11;

                 myBasket.addItem(
                           function () {addedItem=true; gotCallback=true;},
                           function (error) {addedItem=false; gotCallback=true;},
                            myItem
                            );    

                            
                                           
                waitsFor(function() {
                        return gotCallback;
                }, "addedItem callback to be called.", 10000);

                runs(function() {
                        expect(addedItem).toEqual(false);                        
                });

        });
        
        it("can not add item with zero item count ",  function() {
                var addedItem = true;
                var gotCallback = false;
                
                 myItem.productID="3";
                 myItem.description="Dummy Item";
                 myItem.currency="EUR";
                 myItem.itemPrice=11.11;
                 myItem.itemCount=0;
                 myItem.itemsPrice=11.11;

                 myBasket.addItem(
                           function () {addedItem=true; gotCallback=true;},
                           function (error) {addedItem=false; gotCallback=true;},
                            myItem
                            );    
                            
                                            
                waitsFor(function() {
                         return gotCallback;
                }, "addedItem callback to be called.", 10000);

                runs(function() {
                        expect(addedItem).toEqual(false);                        
                });

        });
        it("does not change shopping basket when item additions fail",  function() {
         expect(myBasket.items.length).toEqual(2);              
         expect(myBasket.totalBill==oldTotal).toEqual(true);              
        });
        
        it("can update basket",  function() {
                var updatedBasket = false;
                var gotCallback = false;

                 myBasket.update(
                           function () {updatedBasket=true; gotCallback=true;},
                           function (error) {updatedBasket=false; gotCallback=true;}
                            );    
                            
                                            
                waitsFor(function() {
                       return gotCallback;
                }, "update callback to be called.", 10000);

                runs(function() {
                        expect(updatedBasket).toEqual(true);                        
                });

        });
        it("can checkout basket",  function() {
                var checkoutBasket = false;
                var gotCallback = false;

                 myBasket.checkout(
                           function () {checkoutBasket=true; gotCallback=true;},
                           function (error) {checkoutBasket=false; gotCallback=true;}
                            );    
                            
                                            
                waitsFor(function() {
                       return gotCallback;
                }, "checkout callback to be called.", 10000);

                runs(function() {
                        expect(checkoutBasket).toEqual(true);                        
                });

        });
        
        it("can not add an item after checkout",  function() {
                var addedItem = true;
                var gotCallback = false;
                
                 myItem.productID="1";
                 myItem.description="One Item";
                 myItem.currency="EUR";
                 myItem.itemPrice=12.34;
                 myItem.itemCount=1;
                 myItem.itemsPrice=12.34;

                 myBasket.addItem(
                           function () {addedItem=true; gotCallback=true;},
                           function (error) {addedItem=false; gotCallback=true;},
                            myItem
                            );    
                            
                                            
                waitsFor(function() {
                        return gotCallback;
                }, "addedItem callback to be called.", 10000);

                runs(function() {
                        expect(addedItem).toEqual(false);                        
                });

        });

        it("can not update basket after checkout",  function() {
                var updatedBasket = true;
                var gotCallback = false;

                 myBasket.update(
                           function () {updatedBasket=true; gotCallback=true;},
                           function (error) {updatedBasket=false; gotCallback=true;}
                            );    
                            
                                            
                waitsFor(function() {
                        return gotCallback;
                }, "update callback to be called.", 10000);

                runs(function() {
                        expect(updatedBasket).toEqual(false);                        
                });

        });
        it("can not checkout basket again after checkout",  function() {
                var checkoutBasket = true;
                var gotCallback = false;

                 myBasket.checkout(
                           function () {checkoutBasket=true; gotCallback=true;},
                           function (error) {checkoutBasket=false; gotCallback=true;}
                            );    
                            
                                            
                waitsFor(function() {
                        return gotCallback;
                }, "checkout callback to be called.", 10000);

                runs(function() {
                        expect(checkoutBasket).toEqual(false);                        
                });

        });

        it("can release basket",  function() {
                var releasedBasket = false;

                 myBasket.release(  );    
                 releasedBasket=true;

                runs(function() {
                        expect(releasedBasket).toEqual(true);                        
                });

        });
        
        it("can not add an item to a shopping basket after basket release",  function() {
                var addedItem = true;
                var gotCallback = false;
                
                 myItem.productID="1";
                 myItem.description="One Item";
                 myItem.currency="EUR";
                 myItem.itemPrice=12.34;
                 myItem.itemCount=1;
                 myItem.itemsPrice=12.34;

                 myBasket.addItem(
                           function () {addedItem=true; gotCallback=true;},
                           function (error) {addedItem=false; gotCallback=true;},
                            myItem
                            );    
                            
                                            
                waitsFor(function() {
                       return gotCallback;
                }, "addedItem callback to be called.", 10000);

                runs(function() {
                        expect(addedItem).toEqual(false);                        
                });

        });

        it("can not update a shopping basket after basket release",  function() {
                var updatedBasket = true;
                var gotCallback = false;

                 myBasket.update(
                           function () {updatedBasket=true; gotCallback=true;},
                           function (error) {updatedBasket=false; gotCallback=true;}
                            );    
                            
                                            
                waitsFor(function() {
                         return gotCallback;
                }, "update callback to be called.", 10000);

                runs(function() {
                        expect(updatedBasket).toEqual(false);                        
                });

        });

        it("can not checkout a shopping basket after basket release",  function() {
                var checkoutBasket = true;
                var gotCallback = false;

                 myBasket.update(
                           function () {checkoutBasket=true; gotCallback=true;},
                           function (error) {checkoutBasket=false; gotCallback=true;}
                            );    
                            
                                            
                waitsFor(function() {
                        return gotCallback;
                }, "checkout callback to be called.", 10000);

                runs(function() {
                        expect(checkoutBasket).toEqual(false);                        
                });

        });


        it("can not create a GSMA shopping basket with unknown customer",  function() {
                var gotBasket = true;
                var gotCallback = false;
                
                 paymentService.createShoppingBasket(
                           function (basket) {myBasket = basket;gotBasket=true; gotCallback=true;},
                            function (error) {gotBasket=false; gotCallback=true; },
                            "GSMA", "NOSUCHCUSTOMER" ,"webinosTest"
                  );    
                                            
                waitsFor(function() {
                         return gotCallback;
                }, "createShoppingBasket callback to be called.", 10000);

                runs(function() {
                        expect(gotBasket).toEqual(false);                        
                });

        });
        
        it("can not create a GSMA shopping basket with unknown shop",  function() {
                var gotBasket = true;
                var gotCallback = false;
                
                 paymentService.createShoppingBasket(
                           function (basket) {myBasket = basket;gotBasket=true; gotCallback=true;},
                            function (error) {gotBasket=false; gotCallback=true; },
                            "GSMA", "+16309700001" ,"NOSUCHSHOP"
                  );    
                                            
                waitsFor(function() {
                        return gotCallback;
                }, "createShoppingBasket callback to be called.", 10000);

                runs(function() {
                        expect(gotBasket).toEqual(false);                        
                });

        });
        
        it("can create a GSMA shopping basket",  function() {
                var gotBasket = false;
                var gotCallback = false;
                
                 paymentService.createShoppingBasket(
                           function (basket) {myBasket = basket;gotBasket=true; gotCallback=true;},
                            function (error) {gotBasket=false;  gotCallback=true;},
                             "GSMA", "+16309700001" ,"webinosTest"
                  );    
                                            
                waitsFor(function() {
                         return gotCallback;
                }, "createShoppingBasket callback to be called.", 10000);

                runs(function() {
                        expect(gotBasket).toEqual(true);                        
                });

        });

        it("can add an item to a GSMA shopping basket",  function() {
                var addedItem = false;
                var gotCallback = false;
                
                 myItem.productID="1";
                 myItem.description="One Item";
                 myItem.currency="EUR";
                 myItem.itemPrice=12.34;
                 myItem.itemCount=1;
                 myItem.itemsPrice=12.34;

                 myBasket.addItem(
                           function () {addedItem=true; gotCallback=true;},
                           function (error) {addedItem=false; gotCallback=true;},
                            myItem
                            );    
                            
                                            
                waitsFor(function() {
                        return gotCallback;
                }, "addedItem callback to be called.", 10000);

                runs(function() {
                        expect(addedItem).toEqual(true);                        
                });

        });

        it("has one item in the GSMA shopping basket",  function() {
         expect(myBasket.items.length).toEqual(1);              
        });
         
        it("can add a second item to a GSMA shopping basket",  function() {
                var addedItem = false;
                var gotCallback = false;
                
                 myItem.productID="2";
                 myItem.description="Another Item";
                 myItem.currency="EUR";
                 myItem.itemPrice=43.21;
                 myItem.itemCount=1;
                 myItem.itemsPrice=43.21;

                 myBasket.addItem(
                           function () {addedItem=true; gotCallback=true;},
                           function (error) {addedItem=false; gotCallback=true;},
                            myItem
                            );    
                            
                                            
                waitsFor(function() {
                         return gotCallback;
                }, "addedItem callback to be called.", 10000);

                runs(function() {
                        expect(addedItem).toEqual(true);                        
                });

        });

        it("has two items in the GSMA shopping basket",  function() {
         expect(myBasket.items.length).toEqual(2);              
        });

        it("total cost is at least cost of the two items",  function() {
         // might be more if VAT or other costs are added automatically...
         expect(myBasket.totalBill>=(12.34+43.21)).toEqual(true);              
         
         // store old total to make sure it doesn't change on faulty item adds
         oldTotal=myBasket.totalBill;
        });


        it("can not add item without currency value to the GSMA shopping basket",  function() {
                var addedItem = true;
                var gotCallback = false;
                
                 myItem.productID="3";
                 myItem.description="Dummy Item";
                 myItem.currency=null;
                 myItem.itemPrice=11.11;
                 myItem.itemCount=1;
                 myItem.itemsPrice=11.11;

                 myBasket.addItem(
                           function () {addedItem=true; gotCallback=true;},
                           function (error) {addedItem=false; gotCallback=true;},
                            myItem
                            );    
                            
                                            
                waitsFor(function() {
                        return gotCallback;
                }, "addedItem callback to be called.", 10000);

                runs(function() {
                        expect(addedItem).toEqual(false);                        
                });

        });

        it("can not add item with null item count to the GSMA shopping basket ",  function() {
                var addedItem = true;
                var gotCallback = false;
                
                 myItem.productID="3";
                 myItem.description="Dummy Item";
                 myItem.currency="EUR";
                 myItem.itemPrice=11.11;
                 myItem.itemCount=null;
                 myItem.itemsPrice=11.11;

                 myBasket.addItem(
                           function () {addedItem=true; gotCallback=true;},
                           function (error) {addedItem=false; gotCallback=true;},
                            myItem
                            );    

                            
                                           
                waitsFor(function() {
                        return gotCallback;
                }, "addedItem callback to be called.", 10000);

                runs(function() {
                        expect(addedItem).toEqual(false);                        
                });

        });
        
        it("can not add item with zero item count to the GSMA shopping basket",  function() {
                var addedItem = true;
                var gotCallback = false;
                
                 myItem.productID="3";
                 myItem.description="Dummy Item";
                 myItem.currency="EUR";
                 myItem.itemPrice=11.11;
                 myItem.itemCount=0;
                 myItem.itemsPrice=11.11;

                 myBasket.addItem(
                           function () {addedItem=true; gotCallback=true;},
                           function (error) {addedItem=false; gotCallback=true;},
                            myItem
                            );    
                            
                                            
                waitsFor(function() {
                         return gotCallback;
                }, "addedItem callback to be called.", 10000);

                runs(function() {
                        expect(addedItem).toEqual(false);                        
                });

        });
        it("does not change GSMA shopping basket when item additions fail",  function() {
         expect(myBasket.items.length).toEqual(2);              
         expect(myBasket.totalBill==oldTotal).toEqual(true);              
        });
        
        it("can update GSMA shopping basket",  function() {
                var updatedBasket = false;
                var gotCallback = false;

                 myBasket.update(
                           function () {updatedBasket=true; gotCallback=true;},
                           function (error) {updatedBasket=false; gotCallback=true;}
                            );    
                            
                                            
                waitsFor(function() {
                       return gotCallback;
                }, "update callback to be called.", 10000);

                runs(function() {
                        expect(updatedBasket).toEqual(true);                        
                });

        });
        it("can checkout GSMA shopping basket",  function() {
                var checkoutBasket = false;
                var gotCallback = false;

                 myBasket.checkout(
                           function () {checkoutBasket=true; gotCallback=true;},
                           function (error) {checkoutBasket=false; gotCallback=true;}
                            );    
                            
                                            
                waitsFor(function() {
                       return gotCallback;
                }, "checkout callback to be called.", 10000);

                runs(function() {
                        expect(checkoutBasket).toEqual(true);                        
                });

        });
        
        it("can not add an item after checkout to the GSMA shopping basket",  function() {
                var addedItem = true;
                var gotCallback = false;
                
                 myItem.productID="1";
                 myItem.description="One Item";
                 myItem.currency="EUR";
                 myItem.itemPrice=12.34;
                 myItem.itemCount=1;
                 myItem.itemsPrice=12.34;

                 myBasket.addItem(
                           function () {addedItem=true; gotCallback=true;},
                           function (error) {addedItem=false; gotCallback=true;},
                            myItem
                            );    
                            
                                            
                waitsFor(function() {
                        return gotCallback;
                }, "addedItem callback to be called.", 10000);

                runs(function() {
                        expect(addedItem).toEqual(false);                        
                });

        });

        it("can not update GSMA shopping basket after checkout ",  function() {
                var updatedBasket = true;
                var gotCallback = false;

                 myBasket.update(
                           function () {updatedBasket=true; gotCallback=true;},
                           function (error) {updatedBasket=false; gotCallback=true;}
                            );    
                            
                                            
                waitsFor(function() {
                        return gotCallback;
                }, "update callback to be called.", 10000);

                runs(function() {
                        expect(updatedBasket).toEqual(false);                        
                });

        });
        it("can not checkout GSMA shopping basket again after checkout",  function() {
                var checkoutBasket = true;
                var gotCallback = false;

                 myBasket.checkout(
                           function () {checkoutBasket=true; gotCallback=true;},
                           function (error) {checkoutBasket=false; gotCallback=true;}
                            );    
                            
                                            
                waitsFor(function() {
                        return gotCallback;
                }, "checkout callback to be called.", 10000);

                runs(function() {
                        expect(checkoutBasket).toEqual(false);                        
                });

        });

        it("can release GSMA shopping basket",  function() {
                var releasedBasket = false;

                 myBasket.release(  );    
                 releasedBasket=true;

                runs(function() {
                        expect(releasedBasket).toEqual(true);                        
                });

        });
        
        it("can not add an item to a GSMA shopping basket after basket release",  function() {
                var addedItem = true;
                var gotCallback = false;
                
                 myItem.productID="1";
                 myItem.description="One Item";
                 myItem.currency="EUR";
                 myItem.itemPrice=12.34;
                 myItem.itemCount=1;
                 myItem.itemsPrice=12.34;

                 myBasket.addItem(
                           function () {addedItem=true; gotCallback=true;},
                           function (error) {addedItem=false; gotCallback=true;},
                            myItem
                            );    
                            
                                            
                waitsFor(function() {
                       return gotCallback;
                }, "addedItem callback to be called.", 10000);

                runs(function() {
                        expect(addedItem).toEqual(false);                        
                });

        });

        it("can not update a GSMA shopping basket after basket release",  function() {
                var updatedBasket = true;
                var gotCallback = false;

                 myBasket.update(
                           function () {updatedBasket=true; gotCallback=true;},
                           function (error) {updatedBasket=false; gotCallback=true;}
                            );    
                            
                                            
                waitsFor(function() {
                         return gotCallback;
                }, "update callback to be called.", 10000);

                runs(function() {
                        expect(updatedBasket).toEqual(false);                        
                });

        });

        it("can not checkout a GSMA shopping basket after basket release",  function() {
                var checkoutBasket = true;
                var gotCallback = false;

                 myBasket.update(
                           function () {checkoutBasket=true; gotCallback=true;},
                           function (error) {checkoutBasket=false; gotCallback=true;}
                            );    
                            
                                            
                waitsFor(function() {
                        return gotCallback;
                }, "checkout callback to be called.", 10000);

                runs(function() {
                        expect(checkoutBasket).toEqual(false);                        
                });

        });
        

});
