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

this.ComparisonResult = (function() {

	/* public constructor */
	function ComparisonResult(
			existingConfig,            /* WidgetConfig */
			existingValidationResult,  /* ValidationResult */
			existingHasUserdata,       /* boolean */
			replacement                /* ProcessingResult */
	) {

		this.existingConfig = existingConfig;
		var replacementConfig = this.replacementConfig = replacement.widgetConfig;
		this.type = undefined;
		this.error = undefined;
		this.existingVersion = existingConfig.version;
		this.replacementVersion = replacementConfig.version;
		this.existingValidationResult = existingValidationResult;
		this.replacementValidationResult = replacement.validationResult;
		this.existingHasUserdata = existingHasUserdata;
		this.warnings = [];

		/* CODE_BLOCKED_REDUCED_TRUST */
		var existingAuthorCert = null;
		var replacementAuthorCert = null;
		if(this.existingValidationResult.status == WidgetConfig.STATUS_VALID) {
			var hasReducedTrust = false;
			if(this.replacementValidationResult.status != WidgetConfig.STATUS_VALID) {
				hasReducedTrust = true;
			} else {
				/* author signature info */
				var replacementAuthorSigs = this.replacementValidationResult.authorSignature;
				var existingAuthorSigs = this.existingValidationResult.authorSignature;
				if(existingAuthorSigs && existingAuthorSigs[0]) {
					existingAuthorCert = existingAuthorSigs[0].getEntityCertificate();
				}
				if(replacementAuthorSigs && replacementAuthorSigs[0]) {
					replacementAuthorCert = replacementAuthorSigs[0].key;
				}
				if(existingAuthorCert && !replacementAuthorCert)
					hasReducedTrust = true;

				/* distributor signature info */
				var replacementDistSigs = this.replacementValidationResult.distributorSignatures;
				var existingDistSigs = this.existingValidationResult.distributorSignatures;
				if(existingDistSigs && existingDistSigs[0] && (!replacementDistSigs || !replacementDistSigs[0]))
					hasReducedTrust = true;
			}
			if(hasReducedTrust) {
				this.setError(new Artifact(WidgetConfig.STATUS_DENIED, ComparisonResult.CODE_BLOCKED_REDUCED_TRUST, 'reduced.trust'));
				return;
			}
		}

		/* CODE_BLOCKED_AUTHOR_NOTMATCHED */
		if(existingAuthorCert) {
			var authorMatched = false;
			if(existingAuthorCert.fingerprint == replacementAuthorCert.fingerprint) {
				authorMatched = true;
			} else {
				var existingSubject = existingAuthorCert.subject;
				var replacementSubject = replacementAuthorCert.subject;
				if(existingSubject && existingSubject == replacementSubject) {
					authorMatched = true;
				} else {
					var existingDNS = existingAuthorCert.dnsIdentities;
					var replacementDNS = replacementAuthorCert.dnsIdentities;
					if(existingDNS && existingDNS.length && existingDNS[0] && replacementDNS && replacementDNS.length && (existingDNS[0] == replacementDNS[0]))
						authorMatched = true;
				}
			}
			if(!authorMatched) {
				this.setError(new Artifact(WidgetConfig.STATUS_DENIED, ComparisonResult.CODE_BLOCKED_AUTHOR_NOTMATCHED, 'author.mismatch'));
				return;
			}
		}

		/* CODE_BLOCKED_STATUS_NOTMATCHED */
		if(this.existingConfig.isTestWidget != this.replacementConfig.isTestWidget) {
			this.setError(new Artifact(WidgetConfig.STATUS_DENIED, ComparisonResult.CODE_BLOCKED_STATUS_NOTMATCHED,'status.mismatch'));
			return;
		}

		/* CODE_WARN_ELEVATED_PERMISSIONS */
		var existingFeatures = this.existingConfig.featureList;
		var replacementFeatures = this.replacementConfig.featureList;
		if(replacementFeatures && replacementFeatures.length) {
			var hasExtraFeatures = false;
			if(!existingFeatures || !existingFeatures.length) {
				hasExtraFeatures = true;
			} else {
				var existingNames = {};
				for(var i in existingFeatures)
					existingNames[existingFeatures[i].name] = undefined;
				for(var j in replacementFeatures) {
					/* check that each one was previously requested */
					if(!(replacementFeatures[j].name in existingNames)) {
						hasExtraFeatures = true;
						break;
					}
				}
			}
			if(hasExtraFeatures) {
				this.setWarning(new Artifact(WidgetConfig.STATUS_OK, ComparisonResult.CODE_WARN_ELEVATED_PERMISSIONS, 'elevated.permissions'));
			}
		}

		/* CODE_WARN_IDENTITY_ASSURANCE */
		if(this.replacementValidationResult.status == WidgetConfig.STATUS_UNSIGNED) {
			this.setWarning(new Artifact(WidgetConfig.STATUS_OK, ComparisonResult.CODE_WARN_IDENTITY_ASSURANCE, 'unassured.identity'));
		}

		/* CODE_WARN_UNKNOWN_VERSION */
		var comparison;
		if(this.existingVersion)
			comparison = this.existingVersion.compareTo(this.replacementVersion);

		if(comparison === undefined) {
			this.setWarning(new Artifact(WidgetConfig.STATUS_OK, ComparisonResult.CODE_WARN_UNKNOWN_VERSION,'incomparable.version'));
			this.type = ComparisonResult.COMPARE_UNKNOWN;
		} else {
			if(comparison == 0)
				this.type = ComparisonResult.COMPARE_EQUAL;
			else if(comparison < 0)
				this.type = ComparisonResult.COMPARE_DOWNGRADE;
			else
				this.type = ComparisonResult.COMPARE_UPGRADE;
		}
	}

	ComparisonResult.prototype.setError = function(error) {
		this.error = error;
		this.type = ComparisonResult.COMPARE_NOTMATCHED;
	};

	ComparisonResult.prototype.getError = function() {
		return this.error;
	};

	ComparisonResult.prototype.setWarning = function(warning) {
		this.warnings.push(warning);
	};

	/* Not a permitted replacement:
	 * the replacement application package is not trusted to the same
	 * level as the existing package.
	 * Details: none
	 */
	ComparisonResult.CODE_BLOCKED_REDUCED_TRUST = 3000;

	/* Not a permitted replacement:
	 * the replacement application package is not from the same
	 * author as the existing package.
	 * Details: none
	 */
	ComparisonResult.CODE_BLOCKED_AUTHOR_NOTMATCHED = 3001;

	/* Not a permitted replacement:
	 * the replacement application package and the existing
	 * application have a different status (test vs production)
	 * Details:
	 * 0: Boolean existing.isTestWidget
	 * 1: Boolean replacement.isTestWidget
	 */
	ComparisonResult.CODE_BLOCKED_STATUS_NOTMATCHED = 3002;

	/* Change in application security (requires redisplay of install prompt):
	 * the replacement application package requires additional
	 * application permissions.
	 * Details: none
	 */
	ComparisonResult.CODE_WARN_ELEVATED_PERMISSIONS = 4000;

	/* General warning:
	 * the replacement application and the existing application
	 * are not signed and cannot be verified as being from the
	 * same source.
	 * Details: none
	 */
	ComparisonResult.CODE_WARN_IDENTITY_ASSURANCE = 4001;

	/* General warning:
	 * version information is not provided, or the version
	 * strings cannot be compared
	 * Details: none
	 */
	ComparisonResult.CODE_WARN_UNKNOWN_VERSION = 4002;

	/* Result type:
	 * Replacement version cannot replace earlier version due to error
	 */
	ComparisonResult.COMPARE_NOTMATCHED = 0;

	/* Result type:
	 * Replacement version and/or existing version have no version info
	 */
	ComparisonResult.COMPARE_UNKNOWN = 1;

	/* Result type:
	 * Replacement version is earlier than existing version
	 */
	ComparisonResult.COMPARE_DOWNGRADE = 2;

	/* Result type:
	 * Replacement version is equal to existing version
	 */
	ComparisonResult.COMPARE_EQUAL = 3;

	/* Result type:
	 * Existing version is earlier than replacement version
	 */
	ComparisonResult.COMPARE_UPGRADE = 4;

	return ComparisonResult;
})();
