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

#ifndef MORK_AB_H
#define MORK_AB_H

#include "MorkParser.h"
#include <string>
#include <sstream> 
#include <map>
#include <vector>
#include <fstream>

#include <iostream>

const static char months[][12]={"January","February","March","April","May","June","July","August","September","October","November","December"};


///Base 64 encoding routine from http://en.wikibooks.org/wiki/Algorithm_Implementation/Miscellaneous/Base64#C.2B.2B
///Lookup table for encoding
///If you want to use an alternate alphabet, change the characters here
const static char encodeLookup[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const static char padCharacter = '=';
/**
 *
 * @param inputBuffer buffer to be base64-encoded
 * @return
 */
std::string base64Encode(std::vector<unsigned char> inputBuffer);

const std::string cFirstName_ = "FirstName";
const std::string cLastName_ = "LastName";
const std::string cDisplayName_ = "DisplayName";
const std::string cNickName_ = "NickName";
const std::string cPrimaryEmail_ = "PrimaryEmail";
const std::string cLowercasePrimaryEmail_ = "LowercasePrimaryEmail";
const std::string cSecondEmail_ = "SecondEmail";
const std::string cPreferMailFormat_ = "PreferMailFormat";
const std::string cPopularityIndex_ = "PopularityIndex";
const std::string cAllowRemoteContent_ = "AllowRemoteContent";
const std::string cWorkPhone_ = "WorkPhone";
const std::string cHomePhone_ = "HomePhone";
const std::string cCellularNumber_ = "CellularNumber";
const std::string cPagerNumber_ = "PagerNumber";
const std::string cFaxNumber_ = "FaxNumber";
const std::string cHomeAddress_ = "HomeAddress";
const std::string cHomeCity_ = "HomeCity";
const std::string cHomeState_ = "HomeState";
const std::string cHomeZipCode_ = "HomeZipCode";
const std::string cHomeCountry_ = "HomeCountry";
const std::string cWorkAddress_ = "WorkAddress";
const std::string cWorkCity_ = "WorkCity";
const std::string cWorkState_ = "WorkState";
const std::string cWorkZipCode_ = "WorkZipCode";
const std::string cWorkCountry_ = "WorkCountry";
const std::string cJobTitle_ = "JobTitle";
const std::string cDepartment_ = "Department";
const std::string cCompany_ = "Company";
const std::string c_AimScreenName_ = "_AimScreenName";
const std::string cWebPage1_ = "WebPage1";
const std::string cWebPage2_ = "WebPage2";
const std::string cBirthYear_ = "BirthYear";
const std::string cBirthMonth_ = "BirthMonth";
const std::string cBirthDay_ = "BirthDay";
const std::string cNotes_ = "Notes";
const std::string cLastModifiedDate_ = "LastModifiedDate";
const std::string cRecordKey_ = "RecordKey";
const std::string cPhotoType_ = "PhotoType";
const std::string cPhotoName_ = "PhotoName";
const std::string cPreferDisplayName_ = "PreferDisplayName";
const std::string cDbRowID_ = "DbRowID";
const std::string cPhotoURI_ = "PhotoURI";



/**
 @brief a struct defining an Address Book Entry
 */
typedef struct _W3CContact
{
public:
    /// Entry ID
    std::string id; //-> RecordKey
    std::string displayName; //DisplayName
    std::map<std::string, std::string> name; //FirstName, Lastname...
    std::string nickname; //NickName
    std::vector<std::map<std::string, std::string> > phoneNumbers; //workphone, homephone
    std::vector<std::map<std::string, std::string> > emails; //LowercasePrimaryEmail
    std::vector<std::map<std::string, std::string> > addresses; //WorkCity,WorkCountry... HomeAddress...
    std::vector<std::map<std::string, std::string> > ims; //_AimScreenName
    std::vector<std::map<std::string, std::string> > organizations; //Company, JobTitle
    std::string revision; //LastModifiedDate
    std::string birthday; //BirthDay BirthYear BirthMonth
    std::string gender; //NOT MAPPED
    std::string note; //Notes
    std::vector<std::map<std::string, std::string> > photos; //PhotoName, PhotoType (web|file|default), PhotoURI
    std::vector<std::string> categories; //NOT MAPPED
    std::vector<std::map<std::string, std::string> > urls;//WebPage1, WebPage2
    std::string timezone; //NOT MAPPED

} W3CContact;

typedef std::vector<W3CContact> W3CContacts;

//Overload of << operator for W3CContact for nice output function writing (mainly for debug)
std::ostream& operator<<(std::ostream& out, const W3CContact &w3c);


typedef std::map< std::string, std::string > RawAbeMap;

class MorkAddressBook
{
  private:
//    AbeMap abes_;
    W3CContacts _contacts;
    
//    /**
//      get entry fields from raw address book map
//    */
//    void fromRawAbe( RawAbeMap &rawAbe, std::string &retText, const char *paramTitle );
//
    /**
     *
     * @param rawAbe
     * @param paramTitle
     * @return
     */
    std::string fromRawAbe(RawAbeMap &rawAbe, const std::string &paramTitle);
    
    /**
      append an address to a book entry
    */
    inline void appendAddress( std::string &text, const std::string &add )
    {
      if ( !add.empty() )
      {
        text += add;
        text += ", ";
      }
    }
    
    /**
     *
     * @param rawAbe
     * @param w3c
     */
    void remapEntry( RawAbeMap &rawAbe, W3CContact &w3cContact );

    /**
     *
     * @param gsc
     * @return
     */
    std::map<std::string, std::string> parseStructuredName(RawAbeMap &rawAbe);

    /**
     *
     * @param gContact
     * @return
     */
    std::vector<std::map<std::string, std::string> > parsePhoneNumber(RawAbeMap &rawAbe);

    /**
     *
     * @param gContact
     * @return
     */
    std::vector<std::map<std::string, std::string> > parseEmails(RawAbeMap &rawAbe);

    /**
     *
     * @param gContact
     * @return
     */
    std::vector<std::map<std::string, std::string> > parseAddresses(RawAbeMap &rawAbe);

    /**
     *
     * @param gContact
     * @return
     */
    std::vector<std::map<std::string, std::string> > parseIms(RawAbeMap &rawAbe);

    /**
     *
     * @param gContact
     * @return
     */
    std::vector<std::map<std::string, std::string> > parseOrganizations(RawAbeMap &rawAbe);

    /**
     *
     * @param rawAbe
     * @return
     */
    std::string parseDate(RawAbeMap &rawAbe);

    /**
     *
     * @param gContact
     * @return
     */
    std::vector<std::map<std::string, std::string> > parsePhotos(RawAbeMap &rawAbe);

    /**
     *
     * @param gContact
     * @return
     */
    std::vector<std::map<std::string, std::string> > parseUrls(RawAbeMap &rawAbe);




  public:
    /**
      class constructor
    */
    MorkAddressBook(){};
    
    /**
      class destructor
    */
    ~MorkAddressBook(){};
    
    /**
      @return address book map
    */
    W3CContacts getAB(){return this->_contacts;}
    
    /**
      Opens address book 
      @param path - path to the address book file
      @return - true if success, otherwise false
    */
    bool openAddressBook( const std::string& path );
};


#endif //MORK_AB
