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

this.Artifact = (function() {

  /* public constructor */
  function Artifact(status, code, reason, details) {

	/*
	 * The nature of the problem as an error code
	 * STATUS_INVALID: widget package or associated assets not valid
	 * STATUS_DENIED: the widget does not have permission for the requested functionality
	 * STATUS_CAPABILITY: the runtime does not have the requested functionality
	 * others ...
	 */
	this.status = status;

	/*
	 * The reason identifier
	 */
	this.code = code;
	
	/*
	 * The specific reason - an internally understood string
	 * to pinpoint the assertion or issue
	 */
	this.reason = reason;

	/*
	 * Details that may be used in constructing a useful error message.
	 * Each reason will define the set of expected details.
	 */
	this.details = details;
  }

  /* public variables */
  
  /* Invalid application package:
   * the application package is malformed or might have been corrupted.
   * Details: none */
  Artifact.CODE_MALFORMED = 1000;

  /* Incompatible application:
   * the application is in a format that is not supported on this device.
   * Details:
   * 0: FeatureRequest: unavailable feature */
  Artifact.CODE_INCOMPATIBLE_CONTENT = 1001;
	
  /* Incompatible application:
   * the application depends on functionality that is not supported on this device.
   * Details:
   * 0: FeatureRequest: unavailable feature */
  Artifact.CODE_INCOMPATIBLE_FEATURE = 1002;
	
  /* Permission denied:
   * the application does not have access to the functionality that it depends on.
   * Details:
   * 0: FeatureRequest: denied feature */
   Artifact.CODE_DENIED_FEATURE = 1003;
	
  /* Revoked application:
   * the application has been revoked and is no longer allowed to be installed.
   * Details:
   * 0: ISignatureInfo: signature containing revoked certificate */
  Artifact.CODE_BLOCKED_REVOKED = 1004;

  /* Untrusted application:
   * the application is untrusted or is from an unknown source and is not allowed to run.
   * Details: none */
  Artifact.CODE_BLOCKED_UNTRUSTED = 1005;
	
  /* Protected application:
   * the application has copy protection and can only be installed through the shop application.
   * Details: none */
  Artifact.CODE_BLOCKED_PROTECTED = 1007;

  /* Unknown revocation status:
   * it has not been possible to verify that the application certificate(s) are valid
   * and it is not possible to install this application at this time.
   * Details: none */
  Artifact.CODE_BLOCKED_UNKNOWN_OCSP = 1010;
	
  /* Possibly incompatible application:
   * the application requires a later runtime version. Some or all of the features of the application might not work properly.
   * Details:
   * 0: String: the requested version
   * 1: String: the current runtime version */
  Artifact.CODE_COMPATIBILITY_VERSION = 2000;

  /* Untrusted application:
   * the application is untrusted or is from an unknown source and might be dangerous to run.
   * Details: none */
  Artifact.CODE_UNSAFE_UNTRUSTED = 2001;

  /* The trust certificate on the application has expired, so it might be dangerous to run.
   * Details:
   * 0: ICertificateInfo: expired certificate */
  Artifact.CODE_UNSAFE_EXPIRED = 2004;

  /* Unable to obtain the verification status of the trust certificate,
   * so it might be dangerous to run; installing as untrusted.
   * Details:
   * 0: ICertificateInfo[]: certificates whose revocation status is unknown */
  Artifact.CODE_UNSAFE_CERT_UNKNOWN = 2005;

  /* Revoked application, allowed in compliance mode:
   * the application has been revoked and is being installed for test purposes only.
   * Details:
   * 0: ISignatureInfo: signature containing revoked certificate */
  Artifact.CODE_UNSAFE_REVOKED = 2006;

  /* public instance methods */
  Artifact.prototype.getStatusText = function() {
    var result = 'STATUS_UNKNOWN';
    if(this.status == WidgetConfig.STATUS_INVALID)
      result = 'STATUS_INVALID';
    else if(this.status == WidgetConfig.STATUS_DENIED)
      result = 'STATUS_DENIED';
    return result;
  };

  Artifact.prototype.getDetailsText = function() {
    var result = new Array[this.details.length];
    for(var i in this.details)
      result[i] = this.details[i].toString();
    return result;
  };

  return Artifact;
})();
