/* This file has been automatically generated; do not edit */

package org.meshpoint.anode.stub.gen.platform;

public class Org_webinos_api_contact_Contact {

	private static Object[] __args = new Object[0];

	public static Object[] __getArgs() { return __args; }

	static Object __get(org.webinos.api.contact.Contact inst, int attrIdx) {
		Object result = null;
		switch(attrIdx) {
		case 0: /* addresses */
			result = inst.addresses;
			break;
		case 1: /* birthday */
			result = inst.birthday;
			break;
		case 2: /* categories */
			result = inst.categories;
			break;
		case 3: /* displayName */
			result = inst.displayName;
			break;
		case 4: /* emails */
			result = inst.emails;
			break;
		case 5: /* gender */
			result = inst.gender;
			break;
		case 6: /* id */
			result = inst.id;
			break;
		case 7: /* ims */
			result = inst.ims;
			break;
		case 8: /* name */
			result = inst.name;
			break;
		case 9: /* nickname */
			result = inst.nickname;
			break;
		case 10: /* note */
			result = inst.note;
			break;
		case 11: /* organizations */
			result = inst.organizations;
			break;
		case 12: /* phoneNumbers */
			result = inst.phoneNumbers;
			break;
		case 13: /* photos */
			result = inst.photos;
			break;
		case 14: /* revision */
			result = inst.revision;
			break;
		case 15: /* timezone */
			result = inst.timezone;
			break;
		case 16: /* urls */
			result = inst.urls;
			break;
		default:
		}
		return result;
	}

	static void __set(org.webinos.api.contact.Contact inst, int attrIdx, Object val) {
		switch(attrIdx) {
		case 0: /* addresses */
			inst.addresses = (org.webinos.api.contact.ContactAddress[])val;
			break;
		case 1: /* birthday */
			inst.birthday = (java.util.Date)val;
			break;
		case 2: /* categories */
			inst.categories = (String[])val;
			break;
		case 3: /* displayName */
			inst.displayName = (String)val;
			break;
		case 4: /* emails */
			inst.emails = (org.webinos.api.contact.ContactField[])val;
			break;
		case 5: /* gender */
			inst.gender = (String)val;
			break;
		case 6: /* id */
			inst.id = (String)val;
			break;
		case 7: /* ims */
			inst.ims = (org.webinos.api.contact.ContactField[])val;
			break;
		case 8: /* name */
			inst.name = (org.webinos.api.contact.ContactName)val;
			break;
		case 9: /* nickname */
			inst.nickname = (String)val;
			break;
		case 10: /* note */
			inst.note = (String)val;
			break;
		case 11: /* organizations */
			inst.organizations = (org.webinos.api.contact.ContactOrganization[])val;
			break;
		case 12: /* phoneNumbers */
			inst.phoneNumbers = (org.webinos.api.contact.ContactField[])val;
			break;
		case 13: /* photos */
			inst.photos = (org.webinos.api.contact.ContactField[])val;
			break;
		case 14: /* revision */
			inst.revision = (java.util.Date)val;
			break;
		case 15: /* timezone */
			inst.timezone = (String)val;
			break;
		case 16: /* urls */
			inst.urls = (org.webinos.api.contact.ContactField[])val;
			break;
		default:
			throw new UnsupportedOperationException();
		}
	}

}
