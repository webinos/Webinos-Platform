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

this.SignatureValidator = (function() {
	var util = require('util');
	var Validator = require('xmldigsig').Validator;

	var SIG_PROPERTY_PROFILE_URI      = "http://www.w3.org/ns/widgets-digsig#profile";
	var SIG_PROPERTY_ROLE_AUTHOR      = "http://www.w3.org/ns/widgets-digsig#role-author";
	var SIG_PROPERTY_ROLE_DISTRIBUTOR = "http://www.w3.org/ns/widgets-digsig#role-distributor";

	/* public constructor */
	function SignatureValidator(widgetValidator, signum, name) {
		Validator.call(this);
		this.widgetValidator = widgetValidator;
		this.signum = parseInt(signum);
		this.name = name;

	}
	util.inherits(SignatureValidator, Validator);

	/* public instance methods */
	SignatureValidator.prototype.validate = function() {
		var exit = false;
		this.on('error', function(err) {
			that.widgetValidator.setInvalid(err);
			exit = true;
		});

		this.on('unsupported', function(err) {
			that.widgetValidator.setUnsupported(err);
			exit = true;
		});

		var that = this;
		try {
			/*
			 * ASSERTION # step-1
			 * If signature is not a valid [XMLDSIG11] document,
			 * then signature is in error.
			 */
			var sigBuffer = this.widgetValidator.res.readFileSync(this.name);
			if(!sigBuffer)
				throw new Error('SignatureValidator.parse(): internal error: unable to find signature document: ' + this.name);

			this.parse(sigBuffer);
			if(exit) return;

			/*
			 * ASSERTION # step-2
			 * Check that signature has a ds:Reference for every file that is
			 * not a signature file. If any non-signature file is not listed,
			 * then signature is in error.
			 * 
			 * ASSERTION # step-3
			 * Check that signature has a single same-document ds:Reference
			 * to a ds:Object container for [Signature Properties] in
			 * accordance with the Signature Properties Placement section
			 * of [Signature Properties].
			 */
			var expectedRefs = this.widgetValidator.nonSignatureEntries;

			/*
			 * ASSERTION # step-8-2
			 * If an author signature is present in the widget package, verify
			 * that signature has a ds:Reference for the author signature.
			 */
			if(this.sigNum > 0 && 0 in this.widgetValidator.signatureNames)
				expectedRefs = ['author-signature.xml'].concat(expectedRefs);
			
			var dereferencer = function(ref, hash) {
				try {
					var refContents = that.widgetValidator.res.readFileSync(ref);
					if(!refContents)
						throw new Error('SignatureValidator.dereferencer: reference not found: ' + ref);
					hash.update(refContents, 'binary');
				} catch(e) {
					throw new Error('SignatureValidator.dereferencer: error hashing reference: ' + e + ', reference: ' + ref);
				}
			};
			this.validateAllReferences(dereferencer, true, expectedRefs);
			if(exit) return;

			/*
			 * ASSERTION # step-4
			 * Optionally, if the ds:Signature's key length for a given 
			 * signature algorithm (e.g., RSA) is less than a user agent
			 * predefined minimum key length, then signature is in error.
			 */
			var entityKey = this.getCertificatePath()[0].public_key;
			if(8 * (entityKey.length / 3) < 2048) { 
				this.widgetValidator.setInvalid('step 4: key length too small');
				return;
			}

			/*
			 * ASSERTION # step-5
			 * Validate the profile property against the profile URI in
			 * the manner specified in [Signature Properties]. If the
			 * profile property is missing or invalid, then signature is
			 * in error.
			 */
			if(!('Profile' in this.properties)) {
				this.widgetValidator.setInvalid('step 5: missing Profile property');
				return;
			}
			
			if(this.properties.Profile.URI != SIG_PROPERTY_PROFILE_URI) {
				this.widgetValidator.setInvalid('step 5: invalid Profile URI');
				return;
			}

		 	/* 
			 * ASSERTION # step-6
			 * Validate the identifier property in the manner specified
			 * in [Signature Properties]. If the identifier property is
			 * missing or or invalid, then signature is in error.
			 */
			if(!('Identifier' in this.properties)) {
				this.widgetValidator.setInvalid('step 6: missing Identifier property');
				return;
			}
			var signatureId = this.properties.Identifier.text;
			
			/* 
			 * ASSERTION # step-7
			 * If signature's file name matches the naming convention
			 * for an author signature, validate the role property
			 * against the author role URI. If the role property is
			 * missing or or invalid, then signature is in error.
			 * 
			 * ASSERTION # step-8-1
			 * If signature's file name matches the naming convention
			 * for an distributor signature, validate the role property
			 * against the distributor role URI. If the role property is
			 * missing or or invalid, then signature is in error.
			 */
			if(!('Role' in this.properties)) {
				this.widgetValidator.setInvalid('step 7,8: missing Role property');
				return;
			}
			
			var expectedRoleURI = this.signum ? SIG_PROPERTY_ROLE_DISTRIBUTOR : SIG_PROPERTY_ROLE_AUTHOR;
			if(this.properties.Role.URI != expectedRoleURI) {
				this.widgetValidator.setInvalid('step 7,8: invalid Role URI');
				return;
			}
			
			/*
			 * ASSERTION # step-9
			 * Optionally, validate any other [Signature Properties]
			 * supported by the user agent in the manner specified in
			 * [Signature Properties].
			 */
			/* do nothing */

			/*
			 * ASSERTION # step-10
			 * Perform reference validation and signature validation on
			 * signature. If validation fails, then signature is in error.
			 */
			this.validateSignature();
			if(exit) return;

			var signature = new Signature(this.name, signatureId, this.certificatePath);	
			this.widgetValidator.addSignature(signature);
			console.log(util.inspect(this));
		} catch(e) {
			this.widgetValidator.setInvalid(new Error('Internal error: exception = ' + e));
		}
	};

	return SignatureValidator;
})();
