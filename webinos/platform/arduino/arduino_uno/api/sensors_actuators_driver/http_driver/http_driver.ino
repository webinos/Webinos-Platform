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

//----------Begin Configuration Parameters-----------------------------
#define NUM_ELEMENTS    3
#define BOARDID        "00001"
#define BRDNAME        "ARDUINO_UNO"
#define BRDIPAD        192,168,1,120
#define BRDPORT        80
#define PZPIPAD        192,168,1,130
#define PZPPORT        3000
#define MACADDR        { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED }

//NB sa -> 0=sensor, 1=actuator
//NB ad -> 0=analog, 1=digital

#define ELEMENTS_RES "{\"id\":\""BOARDID"\",\"cmd\":\"ele\",\"elements\":[\
                          {\"id\":\""BOARDID"_000\",\"element\": {\"sa\":\"0\",\"maximumRange\":\"0.1\",\"minDelay\":\"500\",\"power\":\"0.02\",\"resolution\":\"0.001\",\"type\":\"temperature\",\"vendor\":\"vend_temp\",\"version\":\"1\"}}\
                          ,{\"id\":\""BOARDID"_002\",\"element\": {\"sa\":\"1\",\"range\":\"0-1\",\"type\":\"linearmotor\",\"vendor\":\"vend_motor\",\"version\":\"1\"}}\
                          ,{\"id\":\""BOARDID"_001\", \"element\":{\"sa\":\"0\",\"maximumRange\":\"0.1\",\"minDelay\":\"500\",\"power\":\"0.02\",\"resolution\":\"0.001\",\"type\":\"proximity\",\"vendor\":\"vend_prox\",\"version\":\"1\"}}\
                      ]}"
//----------End Configuration Parameters-----------------------------

typedef struct {
    char* id;
    bool sa;
    bool ad;
    int pin;
    bool active;
    bool mode;    // 0=valuechange, 1=fixedinterval
    long rate;
    int lastValue;
    long lastConnectionTime;
} IOElement;

IOElement * elements[NUM_ELEMENTS];

char* board_id = BOARDID;
byte mac[] = MACADDR;
IPAddress pzp_ip(PZPIPAD);
IPAddress arduino_ip(BRDIPAD);
EthernetClient client;
EthernetServer server(BRDPORT);

boolean boardconnected = false;

void sayHello(){
    client.print("GET /newboard?jsondata={\"id\":\"");
    client.print(board_id);
    client.print("\",\"protocol\":\"HTTP\",\"name\":\"ARDUINO_UNO\",\"ip\":\"");
    client.print(Ethernet.localIP());
    client.println("\",\"port\":\"80\"} HTTP/1.0");
}

void setup(){
    Serial.begin(9600);
    elements[0] = new IOElement();
    elements[0]->id = BOARDID"_000";
    elements[0]->sa = 0;
    elements[0]->ad = 0;
    elements[0]->pin = 0;
    elements[0]->active = 0;
    elements[0]->mode = 1;
    elements[0]->lastValue = -1;
    elements[0]->rate = 1000;
  
    elements[1] = new IOElement();
    elements[1]->id = BOARDID"_001";
    elements[1]->sa = 0;
    elements[1]->ad = 1;
    elements[1]->pin = 1;
    elements[1]->active = 0;
    elements[1]->mode = 0;
    elements[1]->lastValue = -1;
    elements[1]->rate = 3500;

    elements[2] = new IOElement();
    elements[2]->id = BOARDID"_002";
    elements[2]->sa = 1;
    elements[2]->ad = 1;
    elements[2]->pin = 8;
    pinMode(8, OUTPUT);

    //start Ethernet
    Ethernet.begin(mac, arduino_ip);
    //Serial.print("IP : ");
    //Serial.println(Ethernet.localIP());
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

void setValueToActuator(bool ad, int pin, int value){
    if(ad == 0){ //analog actuator
        Serial.println("Analog actuator");
        analogWrite(pin, value);
    }
    else{ //digital actuator
        Serial.println("Digital actuator");
        Serial.println(value);
        Serial.println(pin);
        
        if(value == 0){
            digitalWrite(pin,LOW);
        }
        else if(value == 1){
            digitalWrite(pin,HIGH);
        }
    }
}

void sendDataToAPI(int id_ele, bool check_value_is_changed){
    bool senddata = true;
    int val = getValueFromSensor(elements[id_ele]->ad, elements[id_ele]->pin);
    if(check_value_is_changed == true){
          if(val == elements[id_ele]->lastValue)
              senddata = false;
    }
    if (senddata && client.connect(pzp_ip, PZPPORT)) {
//        Serial.println(val);
//        Serial.println(elements[id_ele]->lastValue);
//        Serial.print("Send data id : ");
//        Serial.println(id_ele);
//        Serial.println(elements[id_ele]->rate);
        client.print("POST /sensor?id=");
        client.print(elements[id_ele]->id);
        client.print("&data=");
        client.print(val);
        client.println(" HTTP/1.0");
        client.println();
        client.stop();
        elements[id_ele]->lastConnectionTime = millis();
    }
    elements[id_ele]->lastValue = val;
}

void loop(){
    if(!boardconnected){
        Serial.println("Try connecting to PZP");   
        if (client.connect(pzp_ip, PZPPORT)) {
            sayHello();
            client.println();

            String s;
            bool nextisbody = false;   
            delay(1000);
      
            char vet[19];
            int i=0;
            int num_spaces=0;
            while(client.available() > 0){
                char c = client.read();  
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
                    
                        int len = strlen(BOARDID) + 1 + strlen(id);  // BOARD_ID + _ + pin
                        char eid[len+1];
                        strcpy(eid,BOARDID);
                        strcat(eid,"_");
                        strcat(eid,id);
                        strcat(eid,'\0');
                            
                        if(strcmp(cmd,"ele")==0){
                            client.println(ELEMENTS_RES);
                        }
                        else if(strcmp(cmd,"get")==0){
                            int pin = -1;
                            bool ad;
                            for(int i=0; i<NUM_ELEMENTS;i++){
                                if(strcmp(elements[i]->id, eid)==0){
                                    pin = elements[i]->pin;
                                    ad = elements[i]->ad;
                                    break;
                                }
                            }
                            int value = getValueFromSensor(ad,pin);
                            client.print("{\"cmd\":\"get\",\"id\":\"");
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
                                for(int i=0; i<NUM_ELEMENTS; i++){
                                    if(strcmp(elements[i]->id, eid) == 0)
                                        elements[i]->active = true;
                                }
                            }
                            else{ 
                                client.print("{\"cmd\":\"stp\",");
                                for(int i=0; i<NUM_ELEMENTS; i++){
                                    if(strcmp(elements[i]->id, eid) == 0)
                                        elements[i]->active = false;
                                }
                            }
                            client.print("\"id\":\"");
                            client.print(eid);
                            client.println("\"}");
                        }
                        else if(strcmp(cmd,"cfg")==0){
                            String tmp = dat;
                            int last_colon_pos=0;
                            String s;
                            int colon_pos = tmp.indexOf(':');
                            s = tmp.substring(0, colon_pos);
                          
                            last_colon_pos = colon_pos + 1;
                            colon_pos = tmp.indexOf(':', last_colon_pos);
                            s = tmp.substring(last_colon_pos, colon_pos);
                            for(int i=0; i<NUM_ELEMENTS; i++)
                                if(strcmp(elements[i]->id, eid) == 0)
                                    elements[i]->rate = s.toInt();                          
                          
                            last_colon_pos = colon_pos + 1;
                            s = tmp.substring(last_colon_pos);
                            for(int i=0; i<NUM_ELEMENTS; i++){
                                if(strcmp(elements[i]->id, eid) == 0){
                                    if(s.equals("fix"))
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
                        else if(strcmp(cmd,"set")==0){
                            int pin = -1;
                            bool ad;
                            for(int i=0; i<NUM_ELEMENTS;i++){
                                if(strcmp(elements[i]->id, eid)==0){
                                    pin = elements[i]->pin;
                                    ad = elements[i]->ad;
                                    String sdat = dat;
                                    setValueToActuator(ad, pin, sdat.toInt());
                                    break;
                                }
                            }
                            
                            client.print("{\"cmd\":\"set\",\"id\":\"");
                            client.print(board_id);
                            client.print("_");
                            client.print(id);
                            client.println("\"}");
                        }
                        break;
                    }
                    counter++;
                }
            }
            // give the web browser time to receive the data
            delay(10);
            client.stop();
        }  
        for(int i=0; i<NUM_ELEMENTS; i++){
            if(elements[i]->active){
                if(elements[i]->mode == 1 && millis() - elements[i]->lastConnectionTime > elements[i]->rate)
                    sendDataToAPI(i,0);
                else if(elements[i]->mode == 0)
                    sendDataToAPI(i,1);
            }
        }
    }
}

