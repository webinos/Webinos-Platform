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
* Copyright 2011-2012 Paddy Byers
*
******************************************************************************/

package org.webinos.app.wrt.mgr;

import org.meshpoint.anode.idl.Dictionary;

public class Artifact implements Dictionary {

	/************************************
	 * Error/warning conditions
	 ************************************/

	/* Invalid application package:
	 * the application package is malformed or might have been corrupted.
	 * Details: none */
	public static final int CODE_MALFORMED = 1000;

	/* Incompatible application:
	 * the application is in a format that is not supported on this device.
	 * Details:
	 * 0: FeatureRequest: unavailable feature */
	public static final int CODE_INCOMPATIBLE_CONTENT = 1001;
	
	/* Incompatible application:
	 * the application depends on functionality that is not supported on this device.
	 * Details:
	 * 0: FeatureRequest: unavailable feature */
	public static final int CODE_INCOMPATIBLE_FEATURE = 1002;
	
	/* Permission denied:
	 * the application does not have access to the functionality that it depends on.
	 * Details:
	 * 0: FeatureRequest: denied feature */
	public static final int CODE_DENIED_FEATURE = 1003;
	
	/* Revoked application:
	 * the application has been revoked and is no longer allowed to be installed.
	 * Details:
	 * 0: ISignatureInfo: signature containing revoked certificate */
	public static final int CODE_BLOCKED_REVOKED = 1004;

	/* Untrusted application:
	 * the application is untrusted or is from an unknown source and is not allowed to run.
	 * Details: none */
	public static final int CODE_BLOCKED_UNTRUSTED = 1005;
	
	/* Test application:
	 * the application is a trial version and is not allowed to run.
	 * Details: none */
	public static final int CODE_BLOCKED_TEST = 1006;

	/* Protected application:
	 * the application has copy protection and can only be installed through the shop application.
	 * Details: none */
	public static final int CODE_BLOCKED_PROTECTED = 1007;

	/* Restricted content (parental mode):
	 * the application contains explicit or unsafe content that is not allowed to be displayed.
	 * Details:
	 * array of Descriptor of the blocked features */
	public static final int CODE_BLOCKED_RESTRICTED_CONTENT = 1008;

	/* Restricted application installation (parental mode):
	 * applications are only allowed to be installed through the shop application.
	 * Details:
	 * array of Descriptor of the blocked features */
	public static final int CODE_BLOCKED_RESTRICTED_CHANNEL = 1009;
	 
	/* Unknown revication status:
	 * it has not been possible to verify that the application certificate(s) are valid
	 * and it is not possible to install this application at this time.
	 * Details: none */
	public static final int CODE_BLOCKED_UNKNOWN_OCSP = 1010;
	
	/* Possibly incompatible application:
	 * the application requires a later runtime version. Some or all of the features of the application might not work properly.
	 * Details:
	 * 0: String: the requested version
	 * 1: String: the current runtime version */
	public static final int CODE_COMPATIBILITY_VERSION = 2000;

	/* Untrusted application:
	 * the application is untrusted or is from an unknown source and might be dangerous to run.
	 * Details: none */
	public static final int CODE_UNSAFE_UNTRUSTED = 2001;

	/* Test application:
	 * the application is a trial version and might be dangerous to run.
	 * Details: none */
	public static final int CODE_UNSAFE_TEST = 2002;

	/* Privacy-related information is missing.
	 * Details:
	 * 0: FeatureRequest[]: array of FeatureRequest for which privacy disclosures are incomplete
	 * 1: AccessRequest[]: array of AccessRequest for which privacy disclosures are incomplete */
	public static final int CODE_UNSAFE_PRIVACY = 2003;
	
	/* The trust certificate on the application has expired, so it might be dangerous to run.
	 * Details:
	 * 0: ICertificateInfo: expired certificate */
	public static final int CODE_UNSAFE_EXPIRED = 2004;

	/* Unable to obtain the verification status of the trust certificate,
	 * so it might be dangerous to run; installing as untrusted.
	 * Details:
	 * 0: ICertificateInfo[]: certificates whose revocation status is unknown */
	public static final int CODE_UNSAFE_CERT_UNKNOWN = 2005;

	/* Revoked application, allowed in compliance mode:
	 * the application has been revoked and is being installed for test purposes only.
	 * Details:
	 * 0: ISignatureInfo: signature containing revoked certificate */
	public static final int CODE_UNSAFE_REVOKED = 2006;

	/************************************
	 * Public API
	 ************************************/

	/*
	 * The nature of the problem as an error code
	 * STATUS_INVALID: widget package or associated assets not valid
	 * STATUS_DENIED: the widget does not have permission for the requested functionality
	 * STATUS_CAPABILITY: the runtime does not have the requested functionality
	 * others ...
	 */
	public int status;

	/*
	 * The reason identifier
	 */
	public int code;

	/*
	 * Details that may be used in constructing a useful error message.
	 * Each reason will define the set of expected details.
	 */
	public Object[] details;
	
	/*
	 * The specific reason - an internally understood string
	 * to pinpoint the assertion or issue
	 */
	public String reason;
	
}
