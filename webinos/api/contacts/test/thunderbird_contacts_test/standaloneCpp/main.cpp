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

#include <iostream>
#include <string>
#include <MorkAddressBook.h>
#include <MorkParser.h>


int main( int argc, char ** argv )
{
  //HINT use test file abook.mab in test/testAddressBook
  
  MorkAddressBook mab;
  bool result;
  if(argc>1)
    result=mab.openAddressBook(std::string(argv[1]));
  else
  {
    std::cerr<<"No address book name supplied!\nHINT: use test file abook.mab in test/testAddressBook"<<std::endl;
      return 0;
  }
  if(!result)
    std::cerr<<"Problem opening addrss book: check program arguments and path"<<std::endl;

  //get and print contacts
  W3CContacts vcts=mab.getAB();
  std::cout<<"Found "<<vcts.size()<<" contacts:"<<std::endl;
  for(int i=0; i<vcts.size();i++)
    std::cout<<vcts.at(i)<<std::endl;

/  return 0;
}
