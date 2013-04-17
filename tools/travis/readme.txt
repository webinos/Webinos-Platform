/******************************************************************************
 * 
 * Readme for pzh-test-gmail.js
 *
 * Wei Guo, Samsung R&D Institute UK.
 * 
 ******************************************************************************/

pzh-test-gmail.js is a PhantomJS script for testing PZH enrolment and inter-
Personal Zone connections, which is described in JIRA issue WP-835:

http://jira.webinos.org/browse/WP-835

It is an all-in-one script testing

  1. PZH enrolling with Provider
  2. inter-connection of PZHs with a same Provider
  3. inter-connection of PZHs with different Providers  

Currently it is NOT integrated in Travis CI yet as it needs two Providers
running on different machines. Travis CI is limited to providing only one VM. A
user (tester) has to test manually at the moment.


How to use:

1. Install PhantomJS, if not yet.

    npm install -g phantomjs
    
    As this Readme is writen it runs with phantomjs v1.9.0.    

2. Get two Gmail accounts by signing up at http://gmail.com

    The accounts must have 'gmail.com' as domain name. E.g.
    
    webinosa@gmail.com
        with password: webinostest, First name: A, Surname: WEBINOS
    webinosb@gmail.com
        with password: webinostest, First name: B, Surname: WEBINOS

3. Clear local settings
    
    rm -rf $HOME/.webinosPzh
    
4. Setup two Providers

    Local: 
    
        Webinos-Platform/webinos_pzh.js
        
    On another machine <ProviderTobeConnected>, e.g. 106.1.9.98:
    
        Webinos-Platform/webinos_pzh.js
        
    And enroll the first PZH, e.g., webinosa@gmail.com
   
5. Run the script

    Usage: phantomjs --ignore-ssl-errors=yes pzh-test-gmail.js <Gmail account-1> <Gmail account-1 passwd> <Gmail account-1 "firstname surname"> <Gmail account-2> <Gmail account-2 passwd> <Gmail account-2 "firstname surname"> <ProviderTobeConnected>
    
    An example: 
    
    phantomjs --ignore-ssl-errors=yes pzh-test-gmail.js webinosa webinostest "A WEBINOS" webinosb webinostest "B WEBINOS" 106.1.9.98    

    The testing information is directed to standard output. There also will be
    two screenshots generated if successful:
    
        inner-provider.png
        inter-provider.png


