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
 * Copyright 2011 Krishna Bangalore, TU München
 ******************************************************************************/
(function () {
  /**
   * Webinos corePZinformation service constructor (client side).
   * @constructor
   * @param obj Object containing displayName, api, etc.
   */
  corePZinformationModule = function (obj) {
    this.base = WebinosService;
    this.base(obj);
  };

  corePZinformationModule.prototype = new WebinosService;

  /**
   * To bind the service.
   * @param bindCB BindCallback object.
   */
  corePZinformationModule.prototype.bindService = function (bindCB, serviceId) {

/*Returns PZP Name*/
    this.pzpname = function (successCB, errorCB) {	 
    if (webinos.session.getSessionId()) {
          successCB(webinos.session.getSessionId());
    } else {
          errorCB("PZP Name is not set");
    } 
    };

/*Returns PZP State*/
    this.pzpstate = function (successCB, errorCB) {
     if (webinos.session.isConnected()) {
          successCB("connected =" + webinos.session.getPZHId());
    } else {
          errorCB("Enrolled to " + webinos.session.getPZHId() + "not-connected");
    } 
    };

/*Returns PZH Name*/
    this.pzhname = function (successCB, errorCB) {
      if (webinos.session.getPZHId()){
          successCB(webinos.session.getPZHId());
    } else {
          errorCB("PZH Name is not set");
    } 
    };

/*Returns PZP ID*/
    this.pzpid = function (successCB, errorCB) {
      if (webinos.session.getPZPId()){
          successCB(webinos.session.getPZPId());
    } else {
          errorCB("PZP ID is not set");
    } 
    };

  };
}());
