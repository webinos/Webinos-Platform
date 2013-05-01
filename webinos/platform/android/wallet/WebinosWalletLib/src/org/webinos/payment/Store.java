package org.webinos.payment;

import android.os.Bundle;

public class Store {

    /** The merchant id. */
    public String storeID = "";
    /** The merchant authentication token. */
    public String storeDescription = "";

    private Store() {
    }

    /**
     * Instantiates a new Store.
     *
     * @param bundle : the bundle for unmarshalling to a Store
     */
    public Store(Bundle bundle) {
        if(bundle != null) {
            init(bundle.getString("storeID"),
                    bundle.getString("storeDescription"));
        }
        else
        {
            init("", "");
        }
    }

    /**
     * Instantiates a new Store.
     *
     * @param storeID : the Store id
     * @param storeDescription : the Store description (normally some authentication token should be here)
     */
    public Store(String storeID, String storeDescription) {
        init(storeID, storeDescription);
    }

    private void init(String storeID, String storeDescription) {
        this.storeID = storeID;
        this.storeDescription = storeDescription;
    }

    /**
     * To bundle.
     *
     * @return the Store marshalled to a bundle
     */
    public Bundle toBundle() {
        Bundle bundle = new Bundle();
        bundle.putString("storeID", storeID);
        bundle.putString("storeDescription", storeDescription);
        return bundle;
    }
}
