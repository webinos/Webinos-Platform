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

#include "MorkAddressBook.h"

std::ostream& operator<<(std::ostream& out, const W3CContact &w3c)
{
    out << "{" << std::endl;

    out << "id : " << w3c.id << std::endl;
    out << "displayName : " << w3c.displayName << std::endl;

    //structured name
    std::map<std::string, std::string>::const_iterator name_it;
    out << "name : [";
    for (name_it = w3c.name.begin(); name_it != w3c.name.end(); name_it++)
    {
        out << name_it->first << ": " << name_it->second << "; ";
    }
    out << " ]" << std::endl;

    //phone numbers
    out << "phones : [";
    for (size_t i = 0; i < w3c.phoneNumbers.size(); i++)
    {
        std::map<std::string, std::string>::const_iterator phone_it;
        out << "phone #" << i << ": [";
        for (phone_it = w3c.phoneNumbers.at(i).begin(); phone_it != w3c.phoneNumbers.at(i).end(); phone_it++)
        {
            out << phone_it->first << ": " << phone_it->second << "; ";
        }
        out << " ]" << std::endl;
    }
    out << " ]" << std::endl;

    //emails
    out << "emails : [";
    for (size_t i = 0; i < w3c.emails.size(); i++)
    {
        std::map<std::string, std::string>::const_iterator email_it;
        out << "email #" << i << ": [";
        for (email_it = w3c.emails.at(i).begin(); email_it != w3c.emails.at(i).end(); email_it++)
        {
            out << email_it->first << ": " << email_it->second << "; ";
        }
        out << " ]" << std::endl;
    }
    out << " ]" << std::endl;

    //addresses
    out << "addresses : [";
    for (size_t i = 0; i < w3c.addresses.size(); i++)
    {
        std::map<std::string, std::string>::const_iterator addr_it;
        out << "address #" << i << ": [";
        for (addr_it = w3c.addresses.at(i).begin(); addr_it != w3c.addresses.at(i).end(); addr_it++)
        {
            out << addr_it->first << ": " << addr_it->second << "; ";
        }
        out << " ]" << std::endl;
    }
    out << " ]" << std::endl;

    //ims
    out << "ims : [";
    for (size_t i = 0; i < w3c.ims.size(); i++)
    {
        std::map<std::string, std::string>::const_iterator im_it;
        out << "im #" << i << ": [";
        for (im_it = w3c.ims.at(i).begin(); im_it != w3c.ims.at(i).end(); im_it++)
        {
            out << im_it->first << ": " << im_it->second << "; ";
        }
        out << " ]" << std::endl;
    }
    out << " ]" << std::endl;

    //orgs
    out << "organizations : [";
    for (size_t i = 0; i < w3c.organizations.size(); i++)
    {
        std::map<std::string, std::string>::const_iterator org_it;
        out << "org #" << i << ": [";
        for (org_it = w3c.organizations.at(i).begin(); org_it != w3c.organizations.at(i).end(); org_it++)
        {
            out << org_it->first << ": " << org_it->second << "; ";
        }
        out << " ]" << std::endl;
    }
    out << " ]" << std::endl;

    out << "revision : " << w3c.revision << std::endl;
    out << "birthday : " << w3c.birthday << std::endl;
    out << "note : " << w3c.note << std::endl;

    //Urls
    out << "Urls : [";
    for (size_t i = 0; i < w3c.urls.size(); i++)
    {
        std::map<std::string, std::string>::const_iterator url_it;
        out << "url #" << i << ": [";
        for (url_it = w3c.urls.at(i).begin(); url_it != w3c.urls.at(i).end(); url_it++)
        {
            out << url_it->first << ": " << url_it->second << "; ";
        }
        out << " ]" << std::endl;
    }
    out << " ]" << std::endl;

    out<<"Photo base64 or URL:[";
    for (size_t i = 0; i < w3c.photos.size(); i++)
    {
        std::map<std::string, std::string>::const_iterator photo_it;
        out << "photo #" << i << ": [";
        for (photo_it = w3c.photos.at(i).begin(); photo_it != w3c.photos.at(i).end(); photo_it++)
        {
            out << photo_it->first << ": " << photo_it->second << "; ";
        }
        out << " ]" << std::endl;
    }
    out << " ]" << std::endl;

    out << "}" << std::endl;
    return out;
}
std::string MorkAddressBook::fromRawAbe(RawAbeMap &rawAbe, const std::string &paramTitle) //const char *paramTitle )
{
    std::string retText;
    RawAbeMap::iterator iter;
    iter = rawAbe.find(paramTitle);

    if (iter != rawAbe.end())
    {
        retText = std::string(iter->second.c_str());
    }
    return retText;
}

void MorkAddressBook::remapEntry(RawAbeMap &rawAbe, W3CContact &w3cContact)
{
    w3cContact.id = fromRawAbe(rawAbe, cRecordKey_);
    w3cContact.displayName = fromRawAbe(rawAbe, cDisplayName_);

    w3cContact.name = parseStructuredName(rawAbe);

    w3cContact.nickname = fromRawAbe(rawAbe, cNickName_);
    w3cContact.phoneNumbers = parsePhoneNumber(rawAbe);
    w3cContact.emails = parseEmails(rawAbe);
    w3cContact.addresses = parseAddresses(rawAbe);
    w3cContact.ims = parseIms(rawAbe);

    w3cContact.organizations = parseOrganizations(rawAbe);
    w3cContact.revision = fromRawAbe(rawAbe, cLastModifiedDate_);

    w3cContact.birthday = parseDate(rawAbe);

    //    w3cContact.gender; //NOT MAPPED
    w3cContact.note = fromRawAbe(rawAbe, cNotes_);

    w3cContact.photos = parsePhotos(rawAbe);

    //    w3cContact.categories; //NOT MAPPED
    w3cContact.urls = parseUrls(rawAbe);
    //    w3cContact.timezone; //NOT MAPPED

}

std::map<std::string, std::string> MorkAddressBook::parseStructuredName(RawAbeMap &rawAbe)
{
    std::map < std::string, std::string > name;

    name["familyName"] = fromRawAbe(rawAbe, cLastName_);
    name["givenName"] = fromRawAbe(rawAbe, cFirstName_);
    name["formatted"] = name["givenName"] + " " + name["familyName"];

    //NOT MAPPED
    name["middleName"] = "";
    name["honorificPrefix"] = "";
    name["honorificSuffix"] = "";

    return name;
}

std::vector<std::map<std::string, std::string> > MorkAddressBook::parsePhoneNumber(RawAbeMap &rawAbe)
{
    std::vector < std::map<std::string, std::string> > phoneNumbers;

    std::string tmp = fromRawAbe(rawAbe, cHomePhone_);
    if (!tmp.empty())
    {
        std::map < std::string, std::string > entry;
        entry["pref"] = "false";
        entry["value"] = tmp;
        entry["type"] = "home";
        phoneNumbers.push_back(entry);
    }

    tmp = fromRawAbe(rawAbe, cWorkPhone_);
    if (!tmp.empty())
    {
        std::map < std::string, std::string > entry;
        entry["pref"] = "false";
        entry["value"] = tmp;
        entry["type"] = "work";
        phoneNumbers.push_back(entry);
    }

    tmp = fromRawAbe(rawAbe, cCellularNumber_);
    if (!tmp.empty())
    {
        std::map < std::string, std::string > entry;
        entry["pref"] = "false";
        entry["value"] = tmp;
        entry["type"] = "mobile";
        phoneNumbers.push_back(entry);
    }

    tmp = fromRawAbe(rawAbe, cPagerNumber_);
    if (!tmp.empty())
    {
        std::map < std::string, std::string > entry;
        entry["pref"] = "false";
        entry["value"] = tmp;
        entry["type"] = "pager";
        phoneNumbers.push_back(entry);
    }

    tmp = fromRawAbe(rawAbe, cFaxNumber_);
    if (!tmp.empty())
    {
        std::map < std::string, std::string > entry;
        entry["pref"] = "false";
        entry["value"] = tmp;
        entry["type"] = "fax";
        phoneNumbers.push_back(entry);
    }

    return phoneNumbers;
}

std::vector<std::map<std::string, std::string> > MorkAddressBook::parseEmails(RawAbeMap &rawAbe)
{
    std::vector < std::map<std::string, std::string> > emails;
    std::string tmp = fromRawAbe(rawAbe, cPrimaryEmail_);
    if (!tmp.empty())
    {
        std::map < std::string, std::string > entry;
        entry["pref"] = "false";
        entry["value"] = tmp;
        entry["type"] = "primary";
        emails.push_back(entry);
    }

    tmp = fromRawAbe(rawAbe, cSecondEmail_);
    if (!tmp.empty())
    {
        std::map < std::string, std::string > entry;
        entry["pref"] = "false";
        entry["value"] = tmp;
        entry["type"] = "second";
        emails.push_back(entry);
    }

    return emails;
}

std::vector<std::map<std::string, std::string> > MorkAddressBook::parseAddresses(RawAbeMap &rawAbe)
{
    std::vector < std::map<std::string, std::string> > addresses;

    std::string tmp = fromRawAbe(rawAbe, cHomeAddress_);
    if (!tmp.empty())
    {
        std::map < std::string, std::string > entry;
        entry["pref"] = "false";
        entry["streetAddress"] = tmp;
        entry["locality"] = fromRawAbe(rawAbe, cHomeCity_);
        entry["region"] = fromRawAbe(rawAbe, cHomeState_);
        entry["postalCode"] = fromRawAbe(rawAbe, cHomeZipCode_);
        entry["country"] = fromRawAbe(rawAbe, cHomeCountry_);
        entry["formatted"] = entry["streetAddress"] + ", " + entry["locality"] + ", " + entry["postalCode"] + ", " + entry["region"] + ", " + entry["country"];
        entry["type"] = "home";
        addresses.push_back(entry);
    }

    tmp = fromRawAbe(rawAbe, cWorkAddress_);
    if (!tmp.empty())
    {
        std::map < std::string, std::string > entry;
        entry["pref"] = "false";
        entry["streetAddress"] = tmp;
        entry["locality"] = fromRawAbe(rawAbe, cWorkCity_);
        entry["region"] = fromRawAbe(rawAbe, cWorkState_);
        entry["postalCode"] = fromRawAbe(rawAbe, cWorkZipCode_);
        entry["country"] = fromRawAbe(rawAbe, cWorkCountry_);
        entry["formatted"] = entry["streetAddress"] + ", " + entry["locality"] + ", " + entry["postalCode"] + ", " + entry["region"] + ", " + entry["country"];
        entry["type"] = "work";
        addresses.push_back(entry);
    }

    return addresses;
}

std::vector<std::map<std::string, std::string> > MorkAddressBook::parseIms(RawAbeMap &rawAbe)
{
    std::vector < std::map<std::string, std::string> > ims;

    std::string tmp = fromRawAbe(rawAbe, c_AimScreenName_);
    if (!tmp.empty())
    {
        std::map < std::string, std::string > entry;
        entry["pref"] = "true";
        entry["value"] = tmp;
        entry["type"] = "aim";
        ims.push_back(entry);
    }
    return ims;
}

std::vector<std::map<std::string, std::string> > MorkAddressBook::parseOrganizations(RawAbeMap &rawAbe)
{
    //GCal only allows one organization, therefore it is always preferred
    std::vector < std::map<std::string, std::string> > organizations;

    std::string tmp = fromRawAbe(rawAbe, cCompany_);
    if (!tmp.empty())
    {
        std::map < std::string, std::string > entry;
        entry["pref"] = "true";
        entry["name"] = tmp;
        entry["type"] = "main";
        entry["department"] = fromRawAbe(rawAbe, cDepartment_);
        entry["title"] = fromRawAbe(rawAbe, cJobTitle_);
        organizations.push_back(entry);
    }

    return organizations;
}

std::vector<std::map<std::string, std::string> > MorkAddressBook::parseUrls(RawAbeMap &rawAbe)
{
    std::vector < std::map<std::string, std::string> > urls;
    std::string tmp = fromRawAbe(rawAbe, cWebPage1_);
    if (!tmp.empty())
    {
        std::map < std::string, std::string > entry;
        entry["pref"] = "true";
        entry["value"] = tmp;
        entry["type"] = "web page 1";
        urls.push_back(entry);
    }

    tmp = fromRawAbe(rawAbe, cWebPage2_);
    if (!tmp.empty())
    {
        std::map < std::string, std::string > entry;
        entry["pref"] = urls.size() == 0 ? "true" : "false";
        entry["value"] = tmp;
        entry["type"] = "web page 2";
        urls.push_back(entry);
    }

    return urls;
}

std::string base64Encode(std::vector<unsigned char> inputBuffer)
{
    std::string encodedString;
    encodedString.reserve(((inputBuffer.size() / 3) + (inputBuffer.size() % 3 > 0)) * 4);
    long temp;
    std::vector<unsigned char>::iterator cursor = inputBuffer.begin();
    for (size_t idx = 0; idx < inputBuffer.size() / 3; idx++)
    {
        temp = (*cursor++) << 16; //Convert to big endian
        temp += (*cursor++) << 8;
        temp += (*cursor++);
        encodedString.append(1, encodeLookup[(temp & 0x00FC0000) >> 18]);
        encodedString.append(1, encodeLookup[(temp & 0x0003F000) >> 12]);
        encodedString.append(1, encodeLookup[(temp & 0x00000FC0) >> 6]);
        encodedString.append(1, encodeLookup[(temp & 0x0000003F)]);
    }
    switch (inputBuffer.size() % 3)
    {
    case 1:
        temp = (*cursor++) << 16; //Convert to big endian
        encodedString.append(1, encodeLookup[(temp & 0x00FC0000) >> 18]);
        encodedString.append(1, encodeLookup[(temp & 0x0003F000) >> 12]);
        encodedString.append(2, padCharacter);
        break;
    case 2:
        temp = (*cursor++) << 16; //Convert to big endian
        temp += (*cursor++) << 8;
        encodedString.append(1, encodeLookup[(temp & 0x00FC0000) >> 18]);
        encodedString.append(1, encodeLookup[(temp & 0x0003F000) >> 12]);
        encodedString.append(1, encodeLookup[(temp & 0x00000FC0) >> 6]);
        encodedString.append(1, padCharacter);
        break;
    }
    return encodedString;
}

std::vector<std::map<std::string, std::string> > MorkAddressBook::parsePhotos(RawAbeMap &rawAbe)
{
    std::vector < std::map<std::string, std::string> > photos;


    std::string tmp = fromRawAbe(rawAbe, cPhotoType_);
    std::string filename = fromRawAbe(rawAbe, cPhotoURI_);


    if (!tmp.compare("file") && !filename.empty())
    {
        std::map < std::string, std::string > entry;


        std::ifstream imageFile(filename.substr(std::string("file://").size()).c_str(), ios::in | ios::binary | ios::ate);

        if (imageFile.is_open())
        {
            ifstream::pos_type size = imageFile.tellg();
            char * memblock = new char[size];
            imageFile.seekg(0, ios::beg);
            imageFile.read(memblock, size);
            imageFile.close();
            entry["pref"] = "true";
            entry["value"] = base64Encode(std::vector<unsigned char>(memblock, memblock + size / sizeof(unsigned char)));
            entry["type"] = "file";
            photos.push_back(entry);
            delete[] memblock;
        }

    }
    else if (!tmp.compare("web") && !filename.empty())
    {
        std::map < std::string, std::string > entry;
        entry["pref"] = "true";
        entry["value"] = fromRawAbe(rawAbe, cPhotoURI_);
        entry["type"] = "url";
        photos.push_back(entry);
    }

    return photos;
}

std::string MorkAddressBook::parseDate(RawAbeMap &rawAbe)
{
    std::string date;
    std::string tmp = fromRawAbe(rawAbe, cBirthMonth_);
    if (!tmp.empty())
    {
        stringstream ss;
        ss << tmp;
        int m;
        ss >> m;

        //new Date ( "January 6, 1972" );
        date = std::string(months[m]) + " " + fromRawAbe(rawAbe, cBirthDay_) + ", " + fromRawAbe(rawAbe, cBirthYear_);
    }

    return date;
}


bool MorkAddressBook::openAddressBook(const std::string& path)
{
    _contacts.clear();
    MorkParser mork;

    // Open and parse mork file
    if (!mork.open(path))
    {
        return false;
    }

    const int defaultScope = 0x80;

    MorkTableMap *Tables = 0;
    MorkRowMap *Rows = 0;
    MorkTableMap::iterator tableIter;
    MorkRowMap::iterator rowIter;

    Tables = mork.getTables(defaultScope);

    if (Tables)
    {
        // Iterate all tables
        for (tableIter = Tables->begin(); tableIter != Tables->end(); tableIter++)
        {
            if (0 == tableIter->first)
                continue;

            // Get rows
            Rows = mork.getRows(defaultScope, &tableIter->second);

            if (Rows)
            {
                // Iterate all rows
                for (rowIter = Rows->begin(); rowIter != Rows->end(); rowIter++)
                {
                    if (0 == rowIter->first)
                        continue;

                    RawAbeMap ram;
                    W3CContact w3c_contact;
                    std::string key;
                    std::string value;

                    // Get cells
                    for (MorkCells::iterator cellsIter = rowIter->second.begin(); cellsIter != rowIter->second.end(); cellsIter++)
                    {
                        key = mork.getColumn(cellsIter->first);
                        value = mork.getValue(cellsIter->second);

                        ram[key] = value;
                    }

                    remapEntry(ram, w3c_contact);
                    _contacts.push_back(w3c_contact);
                }
            }
        }
    }

    return true;
}

