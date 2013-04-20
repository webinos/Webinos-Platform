package org.webinos.api.payment;

import org.meshpoint.anode.idl.Dictionary;

public class ShoppingItem implements Dictionary {
	public String productID;
	public String description;
	public String currency;
    public float itemPrice;

    public int itemCount;
    public float itemsPrice;
}
