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
* Copyright 2011 Istituto Superiore Mario Boella (ISMB)
******************************************************************************/

package org.webinos.impl;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;

import org.webinos.api.PendingOperation;
import org.webinos.api.contact.Contact;
import org.webinos.api.contact.ContactAddress;
import org.webinos.api.contact.ContactErrorCB;
import org.webinos.api.contact.ContactField;
import org.webinos.api.contact.ContactFindCB;
import org.webinos.api.contact.ContactFindOptions;
import org.webinos.api.contact.ContactManager;
import org.webinos.api.contact.ContactName;
import org.webinos.api.contact.ContactOrganization;

import org.meshpoint.anode.AndroidContext;
import org.meshpoint.anode.java.ByteArray;
import org.meshpoint.anode.module.IModule;
import org.meshpoint.anode.module.IModuleContext;

import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.ContentValues;
import android.content.Context;
import android.net.Uri;
import android.net.Uri.Builder;
import android.os.Looper;

import android.provider.Contacts.People;
import android.provider.ContactsContract;
import android.provider.ContactsContract.*;
//import android.provider.ContactsContract.PhoneLookup;
//import android.provider.ContactsContract.RawContacts;
import android.text.format.DateFormat;
import android.util.Base64;
import android.util.Log;
import android.widget.Toast;

import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;


@SuppressWarnings("unused") //TODO: to be removed...
public class ContactManagerImpl extends ContactManager implements IModule {

	private Context androidContext;
	private ContentResolver contentResolver;

	/*****************************
	 * ContactManager methods
	 *****************************/
	@Override
	public PendingOperation find(HashMap<String, String> fields, ContactFindCB successCB, ContactErrorCB errorCB, ContactFindOptions options) {
		// TODO Auto-generated method stub

        if(!fields.isEmpty()) { 
        	
        	ArrayList<String[]> parameters = inspectFields(fields);
        	Contact[] contacts = this.getFilteredContacts(parameters.get(0)[0],  parameters.get(1));
        	successCB.onSuccess(contacts);
        }
       else {
    		Contact[] contacts = this.getAllContacts();	
    		successCB.onSuccess(contacts);
        }
		
//        Log.v("DBG", "---------->#contact SEARCHED: " + Integer.toString(test()));
	
		return null;
	}
	
	private int test() {
		
//		Cursor cursor = androidContext.getContentResolver().query(	ContactsContract.Data.CONTENT_URI, null,
//																	"(" + ContactsContract.Data.MIMETYPE + " = ?" + " OR " + ContactsContract.Data.MIMETYPE + " = ?" + ") AND " + ContactsContract.Data.CONTACT_ID + " = ?",
//																	new String[]{ContactsContract.CommonDataKinds.StructuredName.CONTENT_ITEM_TYPE , ContactsContract.CommonDataKinds.Organization.CONTENT_ITEM_TYPE, "2"}, 
//																	null);
		
//		Cursor cursor = androidContext.getContentResolver().query(	ContactsContract.Data.CONTENT_URI, 
//																	null,
//																	"(" + ContactsContract.CommonDataKinds.Organization.COMPANY + " LIKE ? AND " + ContactsContract.Data.MIMETYPE + " = ?" + ") OR (" + ContactsContract.CommonDataKinds.StructuredName.GIVEN_NAME + " LIKE ?"  + " AND " + ContactsContract.Data.MIMETYPE + " = ?)",
//																	new String[]{"Empire ORG.", ContactsContract.CommonDataKinds.Organization.CONTENT_ITEM_TYPE, "Darth", ContactsContract.CommonDataKinds.StructuredName.CONTENT_ITEM_TYPE}, 
//																	null);
		
		String where = 
//						ContactsContract.Data.CONTACT_ID + " = ? AND (" +
//						"(" + ContactsContract.CommonDataKinds.Nickname.NAME + " LIKE ? AND " +
//						ContactsContract.Data.MIMETYPE + " = ?" + ")"
//						+ " OR " + 
						"((" + ContactsContract.CommonDataKinds.StructuredName.FAMILY_NAME + " LIKE ? OR " +
						ContactsContract.CommonDataKinds.StructuredName.DISPLAY_NAME + " LIKE ?) AND " +
						ContactsContract.Data.MIMETYPE + " = ?)"
						+ " AND " + 
						"(" + ContactsContract.CommonDataKinds.Nickname.NAME + " LIKE ? AND " + 
						ContactsContract.Data.MIMETYPE + " = ?"
						+ ")";
		
		Log.v("WHERE", where);

		Cursor cursor = androidContext.getContentResolver().query(	ContactsContract.Data.CONTENT_URI, 
				null,
				where,
				new String[]{	
								"Vergori", "Paolo Vergori"
								, ContactsContract.CommonDataKinds.StructuredName.CONTENT_ITEM_TYPE,
								"Nickname"
								, ContactsContract.CommonDataKinds.Nickname.CONTENT_ITEM_TYPE
//								, ContactsContract.CommonDataKinds.StructuredName.CONTENT_ITEM_TYPE
//								,"Vader", ContactsContract.CommonDataKinds.StructuredName.CONTENT_ITEM_TYPE
//								,"Empire ORG.", ContactsContract.CommonDataKinds.Organization.CONTENT_ITEM_TYPE
							}, 
				null);
		
		while(cursor.moveToNext()) Log.v("TEST", cursor.getString(cursor.getColumnIndex(ContactsContract.Data.CONTACT_ID)));
		cursor.close();
		return printDB(cursor);
	}
	
	private int printDB(Cursor cursor){
		Log.v("DBG:DB", "columns: " + cursor.getColumnCount() + " rows: " + cursor.getCount());
		int i;	
		for(i = 0; cursor.moveToNext(); i++) {
						
				for(int j=0; j<cursor.getColumnCount();j++){
					Log.v("DBG", cursor.getColumnName(j)+"---> " + cursor.getString(j));
				}		
		}		
		cursor.close();
		return i;
	}
	
	private ArrayList<String[]> inspectFields(HashMap<String, String> fields) {
		
		StringBuffer selection = new StringBuffer();
		ArrayList<String> arguments = new ArrayList<String>();
		Boolean firstElement = true;
  
    	
    	if(fields.get("name") != null) {
    		
			if(!firstElement)
				selection.append(" OR ");
			else
				firstElement = false;
    		
    		selection.append("((" +	ContactsContract.CommonDataKinds.StructuredName.FAMILY_NAME + " LIKE ? OR " +
			    					ContactsContract.CommonDataKinds.StructuredName.GIVEN_NAME + " LIKE ? OR " +
									ContactsContract.CommonDataKinds.StructuredName.DISPLAY_NAME + " LIKE ? OR " +
									ContactsContract.CommonDataKinds.StructuredName.MIDDLE_NAME + " LIKE ? OR " +
									ContactsContract.CommonDataKinds.StructuredName.PREFIX + " LIKE ? OR " +
									ContactsContract.CommonDataKinds.StructuredName.SUFFIX  + " LIKE ? OR " +
									ContactsContract.CommonDataKinds.StructuredName.DISPLAY_NAME + " LIKE ?)");
    		
    		selection.append(" AND "+ ContactsContract.Data.MIMETYPE + " = ? )");
    		
    		for(int i=0;i<7;i++)
    			arguments.add(fields.get("name"));
			arguments.add(ContactsContract.CommonDataKinds.StructuredName.CONTENT_ITEM_TYPE);
    	}
    	
    	if(fields.get("nickname") != null) {
    		
			if(!firstElement)
				selection.append(" OR ");
			else
				firstElement = false;
    		
    		selection.append("(" + ContactsContract.CommonDataKinds.Nickname.NAME + " LIKE ?");
    		selection.append(" AND "+ ContactsContract.Data.MIMETYPE + " = ?)");
    		
    		arguments.add(fields.get("nickname"));
			arguments.add(ContactsContract.CommonDataKinds.Nickname.CONTENT_ITEM_TYPE);
    	}
    	
    	if(fields.get("phoneNumber") != null) {
		
			if(!firstElement)
				selection.append(" OR ");
			else
				firstElement = false;
		
			selection.append("(" + 	ContactsContract.CommonDataKinds.Phone.NUMBER + " LIKE ?");
			selection.append(" AND "+ ContactsContract.Data.MIMETYPE + " = ?)");
			
			arguments.add(fields.get("phoneNumber"));
			arguments.add(ContactsContract.CommonDataKinds.Phone.CONTENT_ITEM_TYPE);
    	}
    	
    	if(fields.get("organization") != null) {
    		
			if(!firstElement)
				selection.append(" OR ");
			else
				firstElement = false;
		
			selection.append("((" +	ContactsContract.CommonDataKinds.Organization.COMPANY + " LIKE ? OR " +
									ContactsContract.CommonDataKinds.Organization.DEPARTMENT + " LIKE ? OR " +
									ContactsContract.CommonDataKinds.Organization.TITLE + " LIKE ?)");
			selection.append(" AND "+ ContactsContract.Data.MIMETYPE + " = ?)");
			
			for(int i=0;i<3;i++)
				arguments.add(fields.get("organization"));
			arguments.add(ContactsContract.CommonDataKinds.Organization.CONTENT_ITEM_TYPE);
    	}
    	
    	if(fields.get("email") != null) {
    		
			if(!firstElement)
				selection.append(" OR ");
			else
				firstElement = false;
		
			selection.append("(" + ContactsContract.CommonDataKinds.Email.DATA1 + " LIKE ?");
			selection.append(" AND "+ ContactsContract.Data.MIMETYPE + " = ?)");
			
			arguments.add(fields.get("email"));
			arguments.add(ContactsContract.CommonDataKinds.Email.CONTENT_ITEM_TYPE);
    	}
    	
    	if(fields.get("address") != null) {
    		
			if(!firstElement)
				selection.append(" OR ");
			else
				firstElement = false;
		
			selection.append("((" +	ContactsContract.CommonDataKinds.StructuredPostal.COUNTRY + " LIKE ? OR " +
									ContactsContract.CommonDataKinds.StructuredPostal.CITY + " LIKE ? OR " +
									ContactsContract.CommonDataKinds.StructuredPostal.REGION + " LIKE ? OR " +
									ContactsContract.CommonDataKinds.StructuredPostal.STREET + " LIKE ? OR " +
									ContactsContract.CommonDataKinds.StructuredPostal.POSTCODE + " LIKE ?)");
			selection.append(" AND "+ ContactsContract.Data.MIMETYPE + " = ?)");
			
			for(int i=0;i<5;i++)
				arguments.add(fields.get("address"));
			arguments.add(ContactsContract.CommonDataKinds.StructuredPostal.CONTENT_ITEM_TYPE);
    	}
    	
    	if(fields.get("im") != null) {
    		
			if(!firstElement)
				selection.append(" OR ");
			else
				firstElement = false;
		
			selection.append("(" +	ContactsContract.CommonDataKinds.Im.DATA + " LIKE ?");
			selection.append(" AND "+ ContactsContract.Data.MIMETYPE + " = ?)");
			

			arguments.add(fields.get("im"));
			arguments.add(ContactsContract.CommonDataKinds.Im.CONTENT_ITEM_TYPE);
    	}
    	
    	if(fields.get("url") != null) {
    		
			if(!firstElement)
				selection.append(" OR ");
			else
				firstElement = false;
		
			selection.append("(" +	ContactsContract.CommonDataKinds.Website.URL + " LIKE ?");
			selection.append(" AND "+ ContactsContract.Data.MIMETYPE + " = ?)");
			

			arguments.add(fields.get("url"));
			arguments.add(ContactsContract.CommonDataKinds.Website.CONTENT_ITEM_TYPE);
    	}
    	

    	ArrayList<String[]> parameters = new ArrayList<String[]>();
    	
    	ArrayList<String> tmp = new ArrayList<String>();
    	tmp.add(selection.toString());
    	
    	parameters.add(tmp.toArray(new String[0]));
    	parameters.add(arguments.toArray(new String[0]));

		return parameters;
	}
	
	private Contact[] getFilteredContacts(String selection, String[] arguments) {
		
//		Log.v("selction", selection);
//		for(String b: arguments) Log.v("DBG:arguments", b);
		
		Cursor cursor = androidContext.getContentResolver().query(	ContactsContract.Data.CONTENT_URI,
																	new String[] {ContactsContract.Data.CONTACT_ID}, 
																	selection, arguments, null);
		
//		Log.v("DBG:ID#", String.valueOf(printDB(cursor)));
		
		ArrayList<String> IDs = new ArrayList<String>();
//		while(cursor.moveToNext())
//			IDs.add(cursor.getString(cursor.getColumnIndex(ContactsContract.Data.CONTACT_ID)));	

		while(cursor.moveToNext()) {
			String id = cursor.getString(cursor.getColumnIndex(ContactsContract.Data.CONTACT_ID));
			Iterator<String> it = IDs.iterator();
			boolean found = false;
			while(it.hasNext()) {
				String tmp = it.next();
				if(tmp.equals(id)) {
					found = true;
					break;
				}
			}
			if(!found)
				IDs.add(id);
		}
		cursor.close();
		Collections.sort(IDs);
		
//		for(String s: IDs)
//			Log.v("DBG:IDs", s);
	
		
		ArrayList<Contact> contacts = new ArrayList<Contact>();
		
		for(String contactID: IDs) {
			ContactImpl contact =  new ContactImpl(this);
			
			contact.id = contactID;
//    		contact.displayName = getContactDisplayName(null);
    		contact.name = getContactName(null, contactID);
    		contact.revision = getContactRevision(null, contactID);		//not working
    		contact.nickname = getContactNickname(null, contactID);
//    		contact.phoneNumbers = getConcactPhoneNumbers(null, contactID);
    		contact.emails = getContactEmails(null, contactID);
    		contact.addresses = getContactAddresses(null, contactID);
    		contact.ims = getContactIms(null, contactID);
    		contact.organizations = getContactOrganizations(null, contactID);
    		contact.birthday = getContactBirthday(null, contactID);		//to be tested
    		contact.note = getContactNote(null, contactID);
    		contact.photos = getContactPhotos(contactID);					//to be tested
    		contact.categories = getContactCategories(null, contactID);	//to be tested
    		contact.urls = getContactUrls(null, contactID);
    		contact.gender = null;											//not implemented on android
    		contact.timezone = null;										//not implemented on android
    		contacts.add(contact);  
			
		}
		
		return contacts.toArray(new Contact[0]);
		
	}
	
	private Contact[] getAllContacts(){
				
		ArrayList<Contact> contacts = new ArrayList<Contact>();
		Cursor cursor = androidContext.getContentResolver().query(ContactsContract.Contacts.CONTENT_URI, null, null, null, null);
		
//		Log.v("DBG:allCursor", String.valueOf(cursor.getColumnCount()));
		
    	while(cursor.moveToNext()) {
    		
    		ContactImpl contact =  new ContactImpl(this);
    		
    		String contactID = getContactID(cursor);
    		
    		contact.id = contactID;
    		contact.displayName = getContactDisplayName(cursor);
    		contact.name = getContactName(cursor, contactID);
    		contact.revision = getContactRevision(cursor, contactID);		//not working
    		contact.nickname = getContactNickname(cursor, contactID);
    		contact.phoneNumbers = getConcactPhoneNumbers(cursor, contactID);
    		contact.emails = getContactEmails(cursor, contactID);
    		contact.addresses = getContactAddresses(cursor, contactID);
    		contact.ims = getContactIms(cursor, contactID);
    		contact.organizations = getContactOrganizations(cursor, contactID);
    		contact.birthday = getContactBirthday(cursor, contactID);		//to be tested
    		contact.note = getContactNote(cursor, contactID);
    		contact.photos = getContactPhotos(contactID);					//to be tested
    		contact.categories = getContactCategories(cursor, contactID);	//to be tested
    		contact.urls = getContactUrls(cursor, contactID);
    		contact.gender = null;											//not implemented on android
    		contact.timezone = null;										//not implemented on android
    		contacts.add(contact);   		
    	}
    		
		return contacts.toArray(new Contact[0]);
	}
	
	private String getContactID(Cursor cursor) {
		return cursor.getString(cursor.getColumnIndex(ContactsContract.Contacts._ID));
	}
	
	private String getContactDisplayName(Cursor cursor) {
		return cursor.getString(cursor.getColumnIndex(ContactsContract.PhoneLookup.DISPLAY_NAME));
	}
	
	private ContactName getContactName(Cursor cursor, String contactID){
		
		ContactName contact = new ContactName();		
		Cursor name_cursor = androidContext.getContentResolver().query( ContactsContract.Data.CONTENT_URI, 
																		null, 
																		ContactsContract.Data.CONTACT_ID + " = ? AND " + ContactsContract.Data.MIMETYPE + " = ?", 
																		new String[]{contactID, ContactsContract.CommonDataKinds.StructuredName.CONTENT_ITEM_TYPE}, 
																		null);
		
		if(name_cursor.moveToFirst()) {
			contact.familyName = name_cursor.getString(name_cursor.getColumnIndex(ContactsContract.CommonDataKinds.StructuredName.FAMILY_NAME));
			contact.givenName = name_cursor.getString(name_cursor.getColumnIndex(ContactsContract.CommonDataKinds.StructuredName.GIVEN_NAME));
			contact.middleName = name_cursor.getString(name_cursor.getColumnIndex(ContactsContract.CommonDataKinds.StructuredName.MIDDLE_NAME));
			contact.honorificPrefix = name_cursor.getString(name_cursor.getColumnIndex(ContactsContract.CommonDataKinds.StructuredName.PREFIX));
			contact.honorificSuffix = name_cursor.getString(name_cursor.getColumnIndex(ContactsContract.CommonDataKinds.StructuredName.SUFFIX));
			
			contact.formatted = "";	

			if(contact.honorificPrefix != null)
				contact.formatted = contact.formatted.concat(contact.honorificPrefix) + " ";
			if(contact.givenName != null)
				contact.formatted = contact.formatted.concat(contact.givenName) + " ";
			if(contact.middleName != null)
				contact.formatted = contact.formatted.concat(contact.middleName) + " ";
			if(contact.familyName != null)
				contact.formatted = contact.formatted.concat(contact.familyName) + " ";
			if(contact.honorificSuffix != null)
				contact.formatted = contact.formatted.concat(contact.honorificSuffix);

		}  
		name_cursor.close();
		
		return contact;
	}
	
	//TODO: to be checked and converted from milliseconds to Date()
	private Date getContactRevision(Cursor cursor, String contactID) {
		
		String tmp = null;
		Cursor name_cursor = androidContext.getContentResolver().query( ContactsContract.Data.CONTENT_URI, 
																		null, 
																		ContactsContract.Data.CONTACT_ID + " = ? AND " + ContactsContract.Data.MIMETYPE + " = ?", 
																		new String[]{contactID, ContactsContract.CommonDataKinds.StructuredName.CONTENT_ITEM_TYPE}, 
																		null);
		if(name_cursor.moveToFirst())
			tmp = name_cursor.getString(name_cursor.getColumnIndex(ContactsContract.CommonDataKinds.StructuredName.CONTACT_STATUS_TIMESTAMP));
			if(tmp != null && Integer.parseInt(tmp) == 0)
				return new Date();
		
		return null;
	}
	
	private String getContactNickname(Cursor cursor, String contactID) {
		
		String nickName = null;
		Cursor nickName_cursor = androidContext.getContentResolver().query( ContactsContract.Data.CONTENT_URI, 
																			null, 
																			ContactsContract.Data.CONTACT_ID + " = ? AND " + ContactsContract.Data.MIMETYPE + " = ?", 
																			new String[]{contactID, ContactsContract.CommonDataKinds.Nickname.CONTENT_ITEM_TYPE}, 
																			null);
		if (nickName_cursor.moveToFirst())
			nickName = nickName_cursor.getString(nickName_cursor.getColumnIndex(ContactsContract.CommonDataKinds.Note.NOTE));
		
		nickName_cursor.close();
		
		return nickName;
	}
	
	private ContactField[] getConcactPhoneNumbers(Cursor cursor, String contactID) {
		
		ArrayList<ContactField> phoneNumbers = new ArrayList<ContactField>();
		
		if(cursor.getColumnIndex(PhoneLookup.HAS_PHONE_NUMBER) != 0){
			Cursor phones_cursor = androidContext.getContentResolver().query(	ContactsContract.CommonDataKinds.Phone.CONTENT_URI, 
																				null, 
																				ContactsContract.CommonDataKinds.Phone.CONTACT_ID +" = "+ contactID, 
																				null, null); 
		while(phones_cursor.moveToNext()) {
			
			ContactField tmp = new ContactField();
			
			//TODO: to be checked
			if(phones_cursor.getString(phones_cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.IS_PRIMARY)).compareTo("0") != 0)
				tmp.pref = true;
			
			String type = phones_cursor.getString(phones_cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.TYPE));
			
			switch (Integer.parseInt(type)) {
				case ContactsContract.CommonDataKinds.Phone.TYPE_ASSISTANT :
					tmp.type = "ASSISTANT";
				break;
				case ContactsContract.CommonDataKinds.Phone.TYPE_CALLBACK :
					tmp.type = "CALLBACK";
				break;
				case ContactsContract.CommonDataKinds.Phone.TYPE_CAR :
					tmp.type = "CAR";
				break;
				case ContactsContract.CommonDataKinds.Phone.TYPE_COMPANY_MAIN :
					tmp.type = "CAMPANY_MAIN";
				break;
				case ContactsContract.CommonDataKinds.Phone.TYPE_FAX_HOME :
					tmp.type = "FAX_HOME";
				break;
				case ContactsContract.CommonDataKinds.Phone.TYPE_FAX_WORK :
					tmp.type = "FAX_WORK";
				break;
				case ContactsContract.CommonDataKinds.Phone.TYPE_HOME :
					tmp.type = "HOME";
				break;
				case ContactsContract.CommonDataKinds.Phone.TYPE_ISDN :
					tmp.type = "ISDN";
				break;
				case ContactsContract.CommonDataKinds.Phone.TYPE_MAIN :
					tmp.type = "MAIN";
				break;
				case ContactsContract.CommonDataKinds.Phone.TYPE_MMS :
					tmp.type = "MMS";
				break;
				case ContactsContract.CommonDataKinds.Phone.TYPE_MOBILE	:
					tmp.type = "MOBILE";
				break;
				case ContactsContract.CommonDataKinds.Phone.TYPE_OTHER :
					tmp.type = "OTHER";
				break;
				case ContactsContract.CommonDataKinds.Phone.TYPE_OTHER_FAX :
					tmp.type = "OTHER_FAX";
				break;
				case ContactsContract.CommonDataKinds.Phone.TYPE_PAGER :
					tmp.type = "PAGER";
				break;
				case ContactsContract.CommonDataKinds.Phone.TYPE_RADIO :
					tmp.type = "RADIO";
				break;
				case ContactsContract.CommonDataKinds.Phone.TYPE_TELEX :
					tmp.type = "TELEX";
				break;
				case ContactsContract.CommonDataKinds.Phone.TYPE_TTY_TDD :
					tmp.type = "TTY_TDD";
				break;
				case ContactsContract.CommonDataKinds.Phone.TYPE_WORK :
					tmp.type = "WORK";
				break;
				case ContactsContract.CommonDataKinds.Phone.TYPE_WORK_MOBILE :
					tmp.type = "WORK_MOBILE";
				break;
				case ContactsContract.CommonDataKinds.Phone.TYPE_WORK_PAGER :
					tmp.type = "WORK_PAGER";
				break;
				default:
					tmp.value = "UNKNOWN";
				break;
			}
			
			tmp.value = phones_cursor.getString(phones_cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER));			
			phoneNumbers.add(tmp);
		}
		
		phones_cursor.close();
		return phoneNumbers.toArray(new ContactField[0]);
		}		
		
		return null;
	}
	
	private ContactField[] getContactEmails(Cursor cursor, String contactID) {
		
		ArrayList<ContactField> emails = new ArrayList<ContactField>();
		
		Cursor emails_cursor = androidContext.getContentResolver().query(	ContactsContract.CommonDataKinds.Email.CONTENT_URI, 
																			null, 
																			ContactsContract.CommonDataKinds.Email.CONTACT_ID + " = " + contactID, 
																			null, null); 
		while (emails_cursor.moveToNext()) {
			
			ContactField tmp = new ContactField();
			
			//TODO: to be checked
			if(emails_cursor.getString(emails_cursor.getColumnIndex(ContactsContract.CommonDataKinds.Email.IS_PRIMARY)).compareTo("0") != 0)
				tmp.pref = true;
			
			String type = emails_cursor.getString(emails_cursor.getColumnIndex(ContactsContract.CommonDataKinds.Email.TYPE));
			
			switch(Integer.parseInt(type)) {
				case ContactsContract.CommonDataKinds.Email.TYPE_HOME:
					tmp.type = "HOME";
				break;
				case ContactsContract.CommonDataKinds.Email.TYPE_MOBILE:
					tmp.type = "MOBILE";
				break;
				case ContactsContract.CommonDataKinds.Email.TYPE_OTHER:
					tmp.type = "OTHER";
				break;
				case ContactsContract.CommonDataKinds.Email.TYPE_WORK:
					tmp.type = "WORK";
				break;
				case ContactsContract.CommonDataKinds.Email.TYPE_CUSTOM:
					tmp.type = "CUSTOM";
				break;
				default:
					tmp.type = "UNKNOWN";
				break;
			}

			tmp.value = emails_cursor.getString(emails_cursor.getColumnIndex(ContactsContract.CommonDataKinds.Email.DATA1));
			emails.add(tmp);
		}
		emails_cursor.close();
		
		return emails.toArray(new ContactField[0]);
	}

	private ContactAddress[] getContactAddresses(Cursor cursor, String contactID) {
		
		ArrayList<ContactAddress> addresses = new ArrayList<ContactAddress>();
		
		Cursor addresses_cursor = androidContext.getContentResolver().query(	ContactsContract.CommonDataKinds.StructuredPostal.CONTENT_URI,
												                null,
												                ContactsContract.CommonDataKinds.StructuredPostal.CONTACT_ID + " = " + contactID,
												                null, null);
		while (addresses_cursor.moveToNext()) { 
			
			ContactAddress address = new ContactAddress();
			
			//TODO: to be checked
			if(addresses_cursor.getString(addresses_cursor.getColumnIndex(ContactsContract.CommonDataKinds.StructuredPostal.IS_PRIMARY)).compareTo("0") != 0)
				address.pref = true;
			
			address.country = addresses_cursor.getString(addresses_cursor.getColumnIndex(ContactsContract.CommonDataKinds.StructuredPostal.COUNTRY));
			address.locality = addresses_cursor.getString(addresses_cursor.getColumnIndex(ContactsContract.CommonDataKinds.StructuredPostal.CITY));
			address.postalCode = addresses_cursor.getString(addresses_cursor.getColumnIndex(ContactsContract.CommonDataKinds.StructuredPostal.POSTCODE));
			address.region = addresses_cursor.getString(addresses_cursor.getColumnIndex(ContactsContract.CommonDataKinds.StructuredPostal.REGION));
			address.streetAddress = addresses_cursor.getString(addresses_cursor.getColumnIndex(ContactsContract.CommonDataKinds.StructuredPostal.STREET));
			
			address.formatted = "";
			
			if(address.streetAddress != null)
				address.formatted = address.formatted.concat(address.streetAddress) + " ";
			if(address.locality != null)
				address.formatted = address.formatted.concat(address.locality) + " ";
			if(address.region != null)
				address.formatted = address.formatted.concat(address.region) + " ";
			if(address.postalCode != null)
				address.formatted = address.formatted.concat(address.postalCode) + " ";
			if(address.country != null)
				address.formatted = address.formatted.concat(address.country);
			
			String type = addresses_cursor.getString(addresses_cursor.getColumnIndex(ContactsContract.CommonDataKinds.StructuredPostal.TYPE));
			
			switch(Integer.parseInt(type)) {
				case ContactsContract.CommonDataKinds.StructuredPostal.TYPE_HOME:
					address.type = "HOME";
				break;
				case ContactsContract.CommonDataKinds.StructuredPostal.TYPE_OTHER:
					address.type = "OTHER";
				break;
				case ContactsContract.CommonDataKinds.StructuredPostal.TYPE_WORK:
					address.type = "WORK";
				break;
				default:
					address.type = "UNKNOWN";
				break;
			}
			
			addresses.add(address);
		}  
		addresses_cursor.close();
		
		return addresses.toArray(new ContactAddress[0]);
	}
	
	private ContactField[] getContactIms(Cursor cursor, String contactID) {
		
		ArrayList<ContactField> ims = new ArrayList<ContactField>();
		
		Cursor ims_cursor = androidContext.getContentResolver().query(  ContactsContract.Data.CONTENT_URI, 
																		null, 
																		ContactsContract.Data.CONTACT_ID + " = ? AND " + ContactsContract.Data.MIMETYPE + " = ?", 
																		new String[]{contactID, ContactsContract.CommonDataKinds.Im.CONTENT_ITEM_TYPE}, 
																		null);
		while (ims_cursor.moveToNext()) {
			
			ContactField tmp = new ContactField();

			//TODO: to be checked
			if(ims_cursor.getString(ims_cursor.getColumnIndex(ContactsContract.CommonDataKinds.Im.IS_PRIMARY)).compareTo("0") != 0)
				tmp.pref = true;
			
			tmp.value = ims_cursor.getString(ims_cursor.getColumnIndex(ContactsContract.CommonDataKinds.Im.DATA));
			
			String imType = ims_cursor.getString(ims_cursor.getColumnIndex(ContactsContract.CommonDataKinds.Im.PROTOCOL));			
			
			switch(Integer.parseInt(imType)) {
				case ContactsContract.CommonDataKinds.Im.PROTOCOL_AIM :
					tmp.type = "AIM";
				break;
				case ContactsContract.CommonDataKinds.Im.PROTOCOL_CUSTOM :
					tmp.type = "CUSTOM";
				break;
				case ContactsContract.CommonDataKinds.Im.PROTOCOL_GOOGLE_TALK :
					tmp.type = "GOOGLE_TALK";
				break;
				case ContactsContract.CommonDataKinds.Im.PROTOCOL_ICQ :
					tmp.type = "ICQ";
				break;
				case ContactsContract.CommonDataKinds.Im.PROTOCOL_JABBER :
					tmp.type = "JABBER";
				break;
				case ContactsContract.CommonDataKinds.Im.PROTOCOL_MSN :
					tmp.type = "MSN";
				break;
				case ContactsContract.CommonDataKinds.Im.PROTOCOL_QQ :
					tmp.type = "QQ";
				break;
				case ContactsContract.CommonDataKinds.Im.PROTOCOL_SKYPE :
					tmp.type = "SKYPE";
				break;
				case ContactsContract.CommonDataKinds.Im.PROTOCOL_YAHOO :
					tmp.type = "YAHOO";
				break;
			}
				
			ims.add(tmp);
		} 
		ims_cursor.close();

		return ims.toArray(new ContactField[0]);
	}
	
	private ContactOrganization[] getContactOrganizations(Cursor cursor, String contactID) {
		
		ArrayList<ContactOrganization> organization = new ArrayList<ContactOrganization>();
		
		Cursor org_cursor = androidContext.getContentResolver().query(	ContactsContract.Data.CONTENT_URI, 
																		null, 
																		ContactsContract.Data.CONTACT_ID + " = ? AND " + ContactsContract.Data.MIMETYPE + " = ?", 
																		new String[]{contactID, ContactsContract.CommonDataKinds.Organization.CONTENT_ITEM_TYPE}, 
																		null);
		while (org_cursor.moveToNext()) {
			
			ContactOrganization tmp = new ContactOrganization();
			tmp.name = org_cursor.getString(org_cursor.getColumnIndex(ContactsContract.CommonDataKinds.Organization.DATA));
			tmp.title = org_cursor.getString(org_cursor.getColumnIndex(ContactsContract.CommonDataKinds.Organization.TITLE));
			tmp.department = org_cursor.getString(org_cursor.getColumnIndex(ContactsContract.CommonDataKinds.Organization.DEPARTMENT));
			
			//TODO: to be checked
			if(org_cursor.getString(org_cursor.getColumnIndex(ContactsContract.CommonDataKinds.Organization.IS_PRIMARY)).compareTo("0") != 0)
				tmp.pref = true;
			
			String type = org_cursor.getString(org_cursor.getColumnIndex(ContactsContract.CommonDataKinds.Organization.TYPE));
			
			switch(Integer.parseInt(type)) {
				case ContactsContract.CommonDataKinds.Organization.TYPE_CUSTOM:
					tmp.type = "CUSTOM";
				break;
				case ContactsContract.CommonDataKinds.Organization.TYPE_OTHER:
					tmp.type = "OTHER";
				break;
				case ContactsContract.CommonDataKinds.Organization.TYPE_WORK:
					tmp.type = "WORK";
				break;
				default:
					tmp.type = "UNKNOWN";
				break;
			}
			
			organization.add(tmp);
		}
		org_cursor.close();
		
		return organization.toArray(new ContactOrganization[0]);
	}
	
	//TODO: needs to be checked. Can't be tested on the emulator
	private Date getContactBirthday(Cursor cursor, String displayName) {
		
		String contactID = displayName;
		Date date = null;
		
        /*String[] projection = new String[] {
        		displayName,
                ContactsContract.CommonDataKinds.Event.CONTACT_ID,
                ContactsContract.CommonDataKinds.Event.START_DATE
        };

        String where = ContactsContract.Data.MIMETYPE + "= ? AND " +
                		ContactsContract.CommonDataKinds.Event.TYPE + "=" + ContactsContract.CommonDataKinds.Event.TYPE_BIRTHDAY;
        String[] selectionArgs = new String[] {ContactsContract.CommonDataKinds.Event.CONTENT_ITEM_TYPE};
        
	 	
	    Cursor birthday_cursor = androidContext.getContentResolver().query( ContactsContract.Data.CONTENT_URI, 
																			projection, 
																			where,
																			selectionArgs, 
																			null);*/
		
		Cursor birthday_cursor = androidContext.getContentResolver().query(	ContactsContract.Data.CONTENT_URI, 
																			null, 
																			ContactsContract.Data.CONTACT_ID + " = ? AND " + ContactsContract.Data.MIMETYPE + " = ?", 
																			new String[]{contactID, ContactsContract.CommonDataKinds.Event.CONTENT_ITEM_TYPE}, 
																			null);
	   
    	while(birthday_cursor.moveToFirst()) {     		
    		if(Integer.parseInt(birthday_cursor.getString(birthday_cursor.getColumnIndex(ContactsContract.CommonDataKinds.Event.TYPE))) == 
    				ContactsContract.CommonDataKinds.Event.TYPE_BIRTHDAY) {
    				
    		String tmp = birthday_cursor.getString(birthday_cursor.getColumnIndex(ContactsContract.CommonDataKinds.Event.START_DATE));
    		
    		//TODO: test this:
    		//String tmp = birthday_cursor.getString(0);
    		
    		date = new Date();
    		
    		//supposed a date like 10.1.1966
    		try {
	    		String subs[] = tmp.split(".");
	    		date.setDate(Integer.parseInt(subs[0]));
	    		date.setMonth(Integer.parseInt(subs[1]));
	    		date.setYear(Integer.parseInt(subs[2]));
    		}
    		catch(NullPointerException e){ return null; }
    		catch(Exception e){ e.printStackTrace(); }
    		
    		break;
    		}
    	}  
    	birthday_cursor.close();
		
		return date;
	}
	
	private String getContactNote(Cursor cursor, String contactID) {
		
		String note = null;
 		Cursor note_cursor = androidContext.getContentResolver().query( ContactsContract.Data.CONTENT_URI, 
																		null, 
																		ContactsContract.Data.CONTACT_ID + " = ? AND " + ContactsContract.Data.MIMETYPE + " = ?", 
																		new String[]{contactID, ContactsContract.CommonDataKinds.Note.CONTENT_ITEM_TYPE}, 
																		null);
		if(note_cursor.moveToFirst()) 
			note = note_cursor.getString(note_cursor.getColumnIndex(ContactsContract.CommonDataKinds.Note.NOTE));

		note_cursor.close();
		return note;
	}
	
	private ContactField[] getContactPhotos(String contactID) {
		
		ArrayList<ContactField> photos = new ArrayList<ContactField>();
		InputStream input = ContactsContract.Contacts.openContactPhotoInputStream(androidContext.getContentResolver(), 
										ContentUris.withAppendedId(ContactsContract.Contacts.CONTENT_URI, Integer.parseInt(contactID)));

		if(input != null) {
			ContactField pic = new ContactField();
			
			ByteArrayOutputStream tmp = new ByteArrayOutputStream();
			BitmapFactory.decodeStream(input).compress(Bitmap.CompressFormat.PNG, 100, tmp);	
			
			pic.value = Base64.encodeToString(tmp.toByteArray(), Base64.DEFAULT);
			photos.add(pic);
		}
		
		return photos.toArray(new ContactField[0]);
	}
	
	private String[] getContactCategories(Cursor cursor, String contactID) {
		
		ArrayList<String> categories = new ArrayList<String>();
	 	Cursor categories_cursor = androidContext.getContentResolver().query(  ContactsContract.Data.CONTENT_URI,
																				null,
																				ContactsContract.Data.CONTACT_ID + " = ? AND " + ContactsContract.Data.MIMETYPE + " = ?", 
																				new String[]{contactID, ContactsContract.CommonDataKinds.StructuredName.CONTENT_ITEM_TYPE}, 
																				null);


		if(categories_cursor.moveToFirst())
			categories.add(categories_cursor.getString(categories_cursor.getColumnIndex(ContactsContract.CommonDataKinds.StructuredName.CONTACT_STATUS_LABEL)));
		
		categories_cursor.close();
		
		return categories.toArray(new String[0]);
	}
	
	private ContactField[] getContactUrls(Cursor cursor, String contactID) {
		
		ArrayList<ContactField> urls = new ArrayList<ContactField>();
 		Cursor urls_cursor = androidContext.getContentResolver().query( ContactsContract.Data.CONTENT_URI, 
																		null, 
																		ContactsContract.Data.CONTACT_ID + " = ? AND " + ContactsContract.Data.MIMETYPE + " = ?", 
																		new String[]{contactID, ContactsContract.CommonDataKinds.Website.CONTENT_ITEM_TYPE}, 
																		null);

		while (urls_cursor.moveToNext()) {
			
			ContactField tmp = new ContactField();
			String url = urls_cursor.getString(urls_cursor.getColumnIndex(ContactsContract.CommonDataKinds.Website.URL));
			
			//TODO: to be checked
			if(urls_cursor.getString(urls_cursor.getColumnIndex(ContactsContract.CommonDataKinds.Website.IS_PRIMARY)).compareTo("0") != 0)
				tmp.pref = true;
			
			String type = urls_cursor.getString(urls_cursor.getColumnIndex(ContactsContract.CommonDataKinds.Website.TYPE));
			switch(Integer.parseInt(type)) {
				case ContactsContract.CommonDataKinds.Website.TYPE_CUSTOM :
					tmp.type = "CUSTOM";
				break;
				case ContactsContract.CommonDataKinds.Website.TYPE_BLOG :
					tmp.type = "BLOG";
				break;
				case ContactsContract.CommonDataKinds.Website.TYPE_FTP :
					tmp.type = "FTP";
				break;
				case ContactsContract.CommonDataKinds.Website.TYPE_HOME :
					tmp.type = "HOME";
				break;
				case ContactsContract.CommonDataKinds.Website.TYPE_HOMEPAGE :
					tmp.type = "HOMEPAGE";
				break;
				case ContactsContract.CommonDataKinds.Website.TYPE_OTHER:
					tmp.type = "OTHER";
				break;
				case ContactsContract.CommonDataKinds.Website.TYPE_PROFILE:
					tmp.type = "PROFILE";
				break;
				case ContactsContract.CommonDataKinds.Website.TYPE_WORK:
					tmp.type = "WORK";
				break;
				default:
					tmp.type = "UNKNOWN";
				break;
			}
			
			if (url.length() > 0) {
				tmp.value = url;
			}
			
			urls.add(tmp);
		}
		urls_cursor.close();
		
		return urls.toArray(new ContactField[0]);
	}
	
	
	
	/*****************************
	 * IModule methods
	 *****************************/
	@Override
	public Object startModule(IModuleContext ctx) {
		androidContext = ((AndroidContext)ctx).getAndroidContext();
		/*
		 * perform any module initialisation here ...
		 */
		contentResolver = androidContext.getContentResolver();
		Looper.prepare();

		return this;
	}

	@Override
	public void stopModule() {
		/*
		 * perform any module shutdown here ...
		 */
	}
}
