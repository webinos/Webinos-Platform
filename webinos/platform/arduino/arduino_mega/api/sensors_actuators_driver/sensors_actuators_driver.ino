/*******************************************************************************
 *  Code contributed to the webinos project
 * 
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0
 *  
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * Author: Giuseppe La Torre - University of Catania
 * 
 ******************************************************************************/

#include <SPI.h>
#include <Ethernet.h>
#include <SD.h>
#include "Util.h"

#define  CONFIG_FILE          "config.txt"
#define  DFLT_BOARD_IP        192,168,1,120
#define  DFLT_BOARD_PORT      80
#define  MAX_NUM_ELEMENTS     10
#define  DFLT_ELEMENT_RATE    1000
#define  DFLT_ELEMENT_ACTIVE  false

typedef struct {
    char* id;
    bool sa;      // 0=sensor, 1=actuator
    bool ad;      // 0=analog, 1=digital
    int pin;
    bool active;
    bool mode;    // 0=valuechange, 1=fixedinterval
    long rate;
    int lastValue;
    long lastConnectionTime;
} IOElement;

IOElement * elements[MAX_NUM_ELEMENTS];

byte mac[] = {  0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xAC };
byte* pzp_ip;
byte* board_ip;
IPAddress BOARD_IP(DFLT_BOARD_IP);
EthernetClient client;
EthernetServer server(DFLT_BOARD_PORT);
int pzp_port;
int board_port;

char*  board_id;
int    num_elements=0;
boolean boardconnected = false;
boolean sd_ready = false;
boolean elements_ready = false;

void sayHello(){
    client.print("GET /newboard?jsondata={\"id\":\"");
    client.print(board_id);
    client.print("\",\"protocol\":\"HTTP\",\"name\":\"ARDUINO_MEGA\",\"ip\":\"");
    client.print(Ethernet.localIP());
    client.println("\",\"port\":\"80\"} HTTP/1.0");
}

void getInfoFromSD(boolean check_for_elements){
    boolean first_element = true;
    boolean ignore = false;
    
    // see if the card is present and can be initialized:
    if (!sd_ready && !SD.begin(chipSelect)) {
        Serial.println("Card failed, or not present");
        // don't do anything more:
        return;
    }
    else{
        Serial.println("card initialized.");
        sd_ready = true;
    }
    
    // open the file. note that only one file can be open at a time,
    // so you have to close this one before opening another.
    File configFile = SD.open(CONFIG_FILE);
    if (configFile) {
        String s;
        char c;
        
        if(check_for_elements && !client.connected())
            client = server.available();
        
        while (configFile.available()) {
            c = configFile.read();
            if(c == '#' ){
                ignore = true;
                s="";
            }
            else if(!ignore){
                if(s.length()==7 && !s.startsWith("BOARDID") && !s.startsWith("PZPIPAD") && !s.startsWith("PZPPORT") && !s.startsWith("ELEMENT")){
                    s = "";
                    ignore = true;
                }
                else
                    if(c!=' ' && c !='\t')
                        s += c;
            }
          
            if(c == '\n'){
                ignore = false;
                if(!check_for_elements && s.startsWith("BOARDID")){  // BOARD ID
                    String tmp = s.substring(7);
                    char * buf = (char*) malloc(sizeof(char)*tmp.length());
                    for(int i=0; i<tmp.length();i++)
                        buf[i] = tmp.charAt(i);
                    buf[tmp.length()-1] = '\0';
                    board_id = buf;
                }
//                else if(s.startsWith("BRDIPAD")){  // BOARD IP ADDRESS
//                    board_ip = strIp2byteVect(s.substring(7));
//                }
//                else if(s.startsWith("BRDPORT")){  // BOARD PORT 
//                    board_port = s.substring(7).toInt();
//                }
                else if(!check_for_elements && s.startsWith("PZPIPAD")){  // PZP IP ADDRESS
                    pzp_ip = strIp2byteVect(s.substring(7));
                }
                else if(!check_for_elements && s.startsWith("PZPPORT")){  // PZP PORT
                    pzp_port = s.substring(7).toInt();
                }
                else if(check_for_elements && num_elements < MAX_NUM_ELEMENTS && s.startsWith("ELEMENT")){
                    String tmp = s.substring(7);
                    String field;
                    int counter=0;
                    int tp_pos = 0;
                    if(first_element){
                        first_element=false;
//                        req += "[";
                        client.print("[");
                    }
                    else{
//                        req += ",";
                        client.print(",");
                    }
                    for(int i=0; i<tmp.length(); i++){
                        if(tmp.charAt(i) == ':' || tmp.charAt(i) == '\n'){
                            field = tmp.substring(tp_pos,i);
                            
                            if(counter == 0){  // ELEMENT ID
                                elements[num_elements] = new IOElement();
//                                req += "{\"id\":\"";
//                                req += board_id;
//                                req += "_";
//                                req += field;
//                                req += "\", \"element\":{";
                                client.print("{\"id\":\"");
                                client.print(board_id);
                                client.print("_");
                                client.print(field);
                                client.print("\", \"element\":{");
                                
                                int len = strlen(board_id) + 1 + field.length() +1 ;  // BOARD_ID + _ + id + \0
                                char * buf = (char*) malloc(sizeof(char)*(len));
                                strcpy(buf,board_id);
                                strcat(buf,"_");
                                for(int i=strlen(board_id)+1,j=0; i<len;i++,j++)
                                    buf[i] = field.charAt(j);
                                buf[len] = '\0';                              
                                elements[num_elements]->id = buf;
                                elements[num_elements]->active = DFLT_ELEMENT_ACTIVE;
                                elements[num_elements]->rate = DFLT_ELEMENT_RATE;
                            }
                            else if(counter == 1){  // ELEMENT SA
//                                req += "\"sa\":\"";
//                                req += field;
//                                req += "\",";
                                client.print("\"sa\":\"");
                                client.print(field);
                                client.print("\",");
                                elements[num_elements]->sa = !field.equals("0");
                            }
                            else if(counter == 2){  // ELEMENT AD
                                elements[num_elements]->ad = !field.equals("0");
                            }
                            else if(counter == 3){  // ELEMENT PIN
                                elements[num_elements]->pin = field.toInt();
                            }
                            else if(counter == 4){  // ELEMENT MAXIMUMRANGE
//                                req += "\"maximumRange\":\"";
//                                req += field;
//                                req += "\",";
                                client.print("\"maximumRange\":\"");
                                client.print(field);
                                client.print("\",");
                            }
                            else if(counter == 5){  // ELEMENT MINDELAY
//                                req += "\"minDelay\":\"";
//                                req += field;
//                                req += "\",";
                                client.print("\"minDelay\":\"");
                                client.print(field);
                                client.print("\",");
                            }
                            else if(counter == 6){  // ELEMENT POWER
//                                req += "\"power\":\"";
//                                req += field;
//                                req += "\",";
                                client.print("\"power\":\"");
                                client.print(field);
                                client.print("\",");
                            }
                            else if(counter == 7){  // ELEMENT RESOLUTION
//                                req += "\"resolution\":\"";
//                                req += field;
//                                req += "\",";
                                client.print("\"resolution\":\"");
                                client.print(field);
                                client.print("\",");
                            }
                            else if(counter == 8){  // ELEMENT TYPE
//                                req += "\"type\":\"";
//                                req += field;
//                                req += "\",";
                                client.print("\"type\":\"");
                                client.print(field);
                                client.print("\",");
                            }
                            else if(counter == 9){  // ELEMENT VENDOR
//                                req +="\"vendor\":\"";
//                                req += field;
//                                req += "\",";
                                client.print("\"vendor\":\"");
                                client.print(field);
                                client.print("\",");
                            }
                            else if(counter == 10){  // ELEMENT VERSION
//                                req +="\"version\":\"";
//                                req += field;
//                                req += "\"}}";
                                client.print("\"version\":\"");
                                client.print(field);
                                client.print("\"}}");
                            }
                            counter++;
                            tp_pos = i+1;
                        }
                        field += tmp.charAt(i);                    
                    }
                    num_elements++;
                }
                s = "";
            }
        }
        if(check_for_elements){
//            req += "]";
              client.print("]");
        }
        configFile.close();
    }
    else {
        Serial.println("error opening configuration file");
    }
}

int getValueFromSensor(bool ad, int pin){  
    int value = -1;
    if(ad == 0){ //analog sensor
        value = analogRead(pin);
    }
    else{ //digital sensor
        value = digitalRead(pin);
    }
    return value;
}

void sendDataToAPI(int id_ele, bool check_value_is_changed){
    bool senddata = true;
    int val = getValueFromSensor(elements[id_ele]->ad, elements[id_ele]->pin);
    if(check_value_is_changed == true){
        if(val == elements[id_ele]->lastValue)
            senddata = false;
    }
    
    if(client.connected())
      client.stop();
    
    if (senddata && client.connect(pzp_ip, pzp_port)) {
//        Serial.println(val);
//        Serial.println(elements[id_ele]->lastValue);
//        Serial.print("Send data id : ");
//        Serial.println(id_ele);
//        Serial.println(elements[id_ele]->rate);
        client.print("POST /sensor?id=");
        client.print(elements[id_ele]->id);
        client.print("&data=");
        client.print(val);
        client.println("\0 HTTP/1.0");
        client.println();
        client.stop();
        elements[id_ele]->lastConnectionTime = millis();
    }
    elements[id_ele]->lastValue = val;
}

void setup(){
    Serial.begin(9600);
    
    getInfoFromSD(false);
    
    /*
    if(board_ip != NULL)
        Ethernet.begin(mac, board_ip);
    else
        Ethernet.begin(mac, BOARD_IP);
    */
    
    Serial.println("Trying to get an IP address using DHCP");
    if (Ethernet.begin(mac) == 0) {
        Serial.println("Failed to configure Ethernet using DHCP");
        
        // initialize the ethernet device not using DHCP:
        if(board_ip != NULL)
            Ethernet.begin(mac, board_ip);
        else
            Ethernet.begin(mac, BOARD_IP);
    }
    
    Serial.print("My IP address: ");
    Serial.println(Ethernet.localIP());
}

void loop(){
    if(!boardconnected){
        Serial.println("Try connecting to PZP");
        if (client.connect(pzp_ip, pzp_port)) {
            sayHello();
            client.println();
            delay(1000);
            
            String s;
            bool nextisbody = false;   
            char vet[19];
            int i=0;
            int num_spaces=0;
            while(client.available() > 0){
                char c = client.read();
//              Serial.print(c);  
                if(num_spaces == 4){
                    vet[i++] = c;
                    if(i==19){
                        vet[i-1] = '\0';
                        String s = vet;
                        if(s == "{\"ack\":\"newboard\"}"){
                            Serial.println("new board");
                            boardconnected=true;
                        }
                        else{
                            Serial.println("Connection Error");
                        }            
                        break;
                    }
                }
                else{
                    if(c == '\n' || c == '\r'){
                        num_spaces++;
                    }
                    else
                        num_spaces=0;
                }
            }
            client.stop();
        }
        else {
            Serial.println("PZP unavailable");
            delay(2000);
        }
    }
    else{ // boardisconnected == true
        EthernetClient client = server.available();
        if (client) {
            // an http request ends with a blank line
            boolean currentLineIsBlank = true;
            char cmd[4];
            char id[4];
            char dat[30];
            int counter=1;
            int i=0,j=0,z=0;
            bool finish = false;

            while (client.connected()) {        
                if (client.available()) {
                    char c = client.read();       
                    // GET /?cmd=get&pin=012&dat=.....\n        
                    if(counter>10 && counter<14)
                        cmd[i++] = c;         
                    if(counter>18 && counter<22)
                        id[j++] = c;
                    if(counter > 26){
                        dat[z++] = c;
                        if(c == '\ ')
                            finish=true;
                    }
                    if(finish){
                        cmd[i] = '\0';
                        id[j] = '\0';
                        dat[z-1] = '\0';
                    
                        Serial.println(cmd);
                        Serial.println(id);
                        Serial.println(dat);
                        client.println("HTTP/1.1 200 OK");
                        client.println("Content-Type: application/json");
                        client.println("Connnection: keep-alive");
                        client.println();
                    
                        int len = strlen(board_id) + 1 + strlen(id);  // BOARD_ID + _ + id
                        char eid[len+1];
                        strcpy(eid,board_id);
                        strcat(eid,"_");
                        strcat(eid,id);
                        strcat(eid,'\0');
                            
                        if(strcmp(cmd,"ele")==0){
                            client.print("{\"bid\":\"");
                            client.print(board_id);
                            client.print("\",\"cmd\":\"ele\",\"elements\":");
                            getInfoFromSD(true);
                            //client.print(getInfoFromSD(true));
                            client.println("}");
                            elements_ready = true;
                        }
                        else if(strcmp(cmd,"get")==0){
                            int pin = -1;
                            for(int i=0; i<num_elements;i++){
                                if(strcmp(elements[i]->id, id)==0){
                                    pin = elements[i]->pin;
                                    break;
                                }
                            }
                            int value = analogRead(pin);
                            client.print("{\"cmd\":\"get\",\"eid\":\"");
                            client.print(board_id);
                            client.print("_");
                            client.print(id);
                            client.print("\",\"dat\":\"");
                            client.print(value);
                            client.println("\"}");
                        }
                        else if(strcmp(cmd,"str")==0 || strcmp(cmd,"stp")==0){                                     
                            if(strcmp(cmd,"str")==0){
                                client.print("{\"cmd\":\"str\",");                                  
                                for(int i=0; i<num_elements; i++){
                                    if(strcmp(elements[i]->id, eid) == 0){
                                        Serial.print("starting ");
                                        Serial.println(elements[i]->id);
                                        elements[i]->active = true;
                                    }
                                }
                            }
                            else{ 
                                client.println("{\"cmd\":\"stp\"}");
                                for(int i=0; i<num_elements; i++){
                                    if(strcmp(elements[i]->id, id) == 0)
                                        elements[i]->active = false;
                                }
                            }
                            client.print("\"id\":\"");
                            client.print(eid);
                            client.println("\"}");
                        }
                        else if(strcmp(cmd,"cfg")==0){
                            String tmp = dat;
                            int last_tp_pos=0;
                            String s;
                            int tp_pos = tmp.indexOf(':');
                            s = tmp.substring(0, tp_pos);                          
                            last_tp_pos = tp_pos + 1;
                            tp_pos = tmp.indexOf(':', last_tp_pos);
                            s = tmp.substring(last_tp_pos, tp_pos);
                            for(int i=0; i<num_elements; i++)
                                if(strcmp(elements[i]->id, eid) == 0)
                                    elements[i]->rate = s.toInt();                                                    
                            last_tp_pos = tp_pos + 1;
                            s = tmp.substring(last_tp_pos);
                            for(int i=0; i<num_elements; i++){
                                if(strcmp(elements[i]->id, eid) == 0){
                                    if(s.equals("fixedinterval"))
                                        elements[i]->mode = 1;
                                    else //valuechange
                                        elements[i]->mode = 0;
                                 }                      
                            }
                            client.print("{\"cmd\":\"cfg\",");
                            client.print("\"id\":\"");
                            client.print(eid);
                            client.println("\"}");
                        }
                        break;
                    }
                    counter++;
                }
            }
            // give the web browser time to receive the data
            delay(1);
            client.stop();
        }  
        
        if(elements_ready){
            for(int i=0; i<num_elements; i++){
                if(elements[i]->active){
                    if(elements[i]->mode == 1 && millis() - elements[i]->lastConnectionTime > elements[i]->rate)
                        sendDataToAPI(i,0);
                    else if(elements[i]->mode == 0)
                        sendDataToAPI(i,1);
                }
            }
        }
    }
}
