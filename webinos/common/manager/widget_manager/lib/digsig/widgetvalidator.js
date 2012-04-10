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

this.WidgetValidator = (function() {

	/* public constructor */
	function WidgetValidator(res, certMgr) {
		this.res = res;
		this.certMgr = certMgr;
		this.status = WidgetConfig.STATUS_UNSIGNED;
		this.authorSignature = undefined;
		this.distributorSignatures = [];
		this.errorArtifact = undefined;
	}

	var isAuthorSignature = WidgetValidator.isAuthorSignature = function(name) {
		return name == 'author.xml';
	};

	var isDistributorSignature = WidgetValidator.isDistributorSignature = function(name) {
		var numStart = 'signature'.length;
		var numEnd = name.length - '.xml'.length;
		if(name.substr(0, numStart) == 'signature') {
			if(name.substr(numEnd) == '.xml') {
				var sigNum = name.substring(numStart, numEnd);
				if(parseInt(sigNum) >= 1)
					return sigNum;
			}
		}
	};

	/* public instance methods */
	WidgetValidator.prototype.validate = function() {
		var allEntries = this.res.list();
		var nonSignatureEntries = this.nonSignatureEntries = [];
		var signatureNames = this.signatureNames = {};
		var sigNum;
		for(var i in allEntries) {
			if(isAuthorSignature(i)) {
				signatureNames[0] = i;
			} else if(sigNum = isDistributorSignature(i)) {
				signatureNames[sigNum] = i;
			} else {
				nonSignatureEntries.push(i);
			}
		}
		for(var i in signatureNames) {
			(new SignatureValidator(this, i, signatureNames[i])).validate();
			if(this.status < WidgetConfig.STATUS_UNSIGNED) break;
		}
		return (this.validationResult = new ValidationResult(this.status, this.authorSignature, this.distributorSignatures, this.errorArtifact));
	};
	
	WidgetValidator.prototype.setInvalid = function(str) {
		this.status = WidgetConfig.STATUS_INVALID;
		console.log('setInvalid: ' + str);
		this.errorArtifact = new Artifact(WidgetConfig.STATUS_INVALID, Artifact.CODE_MALFORMED, str);
	};
	
	WidgetValidator.prototype.setUnsupported = function(str) {
		this.status = WidgetConfig.STATUS_CAPABILITY_ERROR;
		console.log('setUnsupported: ' + str);
		this.errorArtifact = new Artifact(WidgetConfig.STATUS_INVALID, Artifact.CODE_INCOMPATIBLE_FEATURE, str);
	};
	
	WidgetValidator.prototype.addSignature = function(signature) {
		if(signature.name == 'author.xml')
			this.authorSignature = signature;
		else
			this.distributorSignatures.push(signature);
		this.status = WidgetConfig.STATUS_VALID;
	};

	return WidgetValidator;
})();
