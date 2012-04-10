Please note: 
1. If PZP is not able to connect to PZH, check if your configuration file exists in HOME_DIR/.webinos/config/<pzp name>.json. Delete it and try again.
2. Recompile code to get PZH - PZH connection, you will need to clean your config files in HOME_DIR/.webinos/config/ 
3. In case you get invalid signature error, while trying to login. Try few times, it is issues with openid 0.4.1 try reusing 0.3.2, it does not generate this error. 

To start farm:
    1. node startFarm.js 
    2. https://localhost:9000/index.html (Login via Gmail or Yahoo)
    
Farm default configuration 
    - Default hostname is localhost, for more options use --help
    - following ports are used: 9000 (webserver) , 8090 (websocket connection) and 8000 (PZH farm). (You can change ports in webinos/pzp/lib/session_configuration.js.)
    - Parameter supported are host to specify different hostname and name to change PzhFarm (Default is devicename_pzhFarm)

To start pzp:
   1. node startPzp.js --pzh-host='localhost/HabibVirji' --context-code='code' (Required only first time to specify context-code). 
   -- mandatory pzh-host, it is your PZH Name created based on Open ID details, if in doubt check on right handside the pzh name in PZH farm web interface
   -- mandatory context-code, required only for first time, it is fetched via a PZH farm web interface.
   -- optional pzh-name is need if you need to start more than 1 pzp (By default it will use device name as PZP name)

Configuration storage information:
    1. Configuration of certificate is stored in HOME_DIR/.webinos/config
    2. Logs are stored in HOME_DIR/.webinos/logs
    3. Keys are temp stored in HOME_DIR/.webinos/keys, need to put in KEY STORAGE
    4. To add PZH just login, once login details are stored in farm. If farm is restarted it restarts PZH too , You do not need to login again ...
    5. When starting PZP, you need to specify farm_address/<Your name in OpenId> e.g. localhost/HabibVirji (if in doubt check user details page to see your name, make sure about use case)
    6. Certificates are created based on openid details. 
    
