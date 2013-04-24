package org.webinos.payment;

import android.app.Activity;
import android.content.Intent;
import android.os.*;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import org.webinos.payment.WalletEngine;

public class TestWallet extends Activity {

    private final static String TAG = TestWallet.class.getName();
    private Activity thi$;

    /**
     * Called when the activity is first created.
     */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        thi$ = this;
        Intent intent = getIntent();
        Double totalAmount = intent.getDoubleExtra(WalletServiceMessageHandler.ACTION_PARAMETER_TOTALPRICE, 0);

        setContentView(R.layout.main);

        TextView textView = (TextView)findViewById(R.id.fldAmount);
        textView.setText(totalAmount.toString() + " Euros");

        Button cmdOk = (Button)findViewById(R.id.cmdOk);
        cmdOk.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                sendMessage(WalletEngine.RESPONSE_CODE_CHECKOUT_OK);
                thi$.finish();
            }
        });

        Button cmdCancel = (Button)findViewById(R.id.cmdCancel);
        cmdCancel.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                sendMessage(WalletEngine.RESPONSE_CODE_CHECKOUT_FAIL);
                thi$.finish();
            }
        });
    }

    private void sendMessage(int code) {
        if (TestWallet.respondTo!=null){
            Message answ = new Message();
            answ.what = code;
            Log.v(TAG, "Will send user input"+code);
            try {
                TestWallet.respondTo.replyTo.send(answ);
            } catch (RemoteException e) {
                Log.e(TAG, "Can not reply",e);
            }
        }
    }


    // This is for demo purposes... You shouldn't have static sharing store in production
    private static Message respondTo;
    public static void setMessage(Message incomingMsg) {
        Message msg = new Message();
        msg.copyFrom(incomingMsg);
        TestWallet.respondTo = msg;
    }
}
