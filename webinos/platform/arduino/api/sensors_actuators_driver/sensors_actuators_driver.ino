#include <SPI.h>
#include <Ethernet.h>

#define NUM_ELEMENTS   2

#define BOARD_ID         "00001"
//#define BOARD_LANGUAGE "webinos"
//#define BOARD_PROTOCOL "HTTP"
//#define BOARD_NAME     "ARDUINO_UNO"
#define BOARD_IP         192,168,1,120
#define BOARD_PORT       80

#define PZP_IP           192,168,1,130
#define PZP_PORT         1984

//NB sa -> 0=sensor, 1=actuator
//NB ad -> 0=analog, 1=digital
#define ELEMENTS_RES "{\"bid\":\"00001\",\"cmd\":\"ele\",\"elements\":[{\"id\":\"00001_000\", \"element\": {\"sa\":\"0\",\"maximumRange\":\"0.1\",\"minDelay\":\"500\",\"power\":\"0.02\",\"resolution\":\"0.001\",\"type\":\"temperature\",\"vendor\":\"apple_temp\",\"version\":\"1\"}},{\"id\":\"00001_001\", \"element\":{\"sa\":\"0\",\"maximumRange\":\"0.1\",\"minDelay\":\"500\",\"power\":\"0.02\",\"resolution\":\"0.001\",\"type\":\"proximity\",\"vendor\":\"apple_prox\",\"version\":\"1\"}}]}"
#define HELLO_REQ "GET /newboard?jsondata={\"id\":\"00001\",\"protocol\":\"HTTP\",\"name\":\"ARDUINO_UNO\",\"ip\":\"192.168.1.120\",\"port\":\"80\"} HTTP/1.0"


typedef struct {
    char* id;
    bool sa;
    bool ad;
    int pin;
    bool active;
    long rate;
    long lastConnectionTime;
} IOElement;

IOElement * elements[NUM_ELEMENTS];


//Ethernet stuff
byte mac[] = {  0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
IPAddress pzp_ip(PZP_IP);
IPAddress arduino_ip(BOARD_IP);
EthernetClient client;
EthernetServer server(BOARD_PORT);

boolean boardconnected = false;

void setup(){
    Serial.begin(9600);
    
    elements[0] = new IOElement();
    elements[0]->id = "00001_000";
    elements[0]->sa = 0;
    elements[0]->ad = 0;
    elements[0]->pin = 0;
    elements[0]->active = 0;
    elements[0]->rate = 1000;
  
    elements[1] = new IOElement();
    elements[1]->id = "00001_001";
    elements[1]->sa = 0;
    elements[1]->ad = 1;
    elements[1]->pin = 1;
    elements[1]->active = 0;
    elements[1]->rate = 3500;
  
    //start Ethernet
    Ethernet.begin(mac, arduino_ip);
}

String getValueFromSensor(bool ad, int pin){  
    int value = -1;
    if(ad == 0){ //analog sensor
        value = analogRead(pin);
    }
    else{ //digital sensor
        value = digitalRead(pin);
    }
    return String(value);
}

void sendDataToAPI(int id_ele){
    if (client.connect(pzp_ip, PZP_PORT)) {
        Serial.print("Send data id : ");
        Serial.println(id_ele);
        client.print("POST /sensor?id=");
        client.print(elements[id_ele]->id);
        client.print("&data=");
        client.print(getValueFromSensor(elements[id_ele]->ad, elements[id_ele]->pin));
        client.println("\0 HTTP/1.0");
        client.println();
        client.stop();
        elements[id_ele]->lastConnectionTime = millis();
    }
}

void loop(){
    if(!boardconnected){
        Serial.println("Try connecting to PZP");   
        if (client.connect(pzp_ip, PZP_PORT)) {
            client.println(HELLO_REQ);
            client.println();
            
            String s;
            bool nextisbody = false;   
            delay(1000);
      
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
                            Serial.println("error");
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
//            Serial.println("PZP unavailable");
            delay(2000);
        }
    }
    else{ // boardisconnected == true
        EthernetClient client = server.available();
        if (client) {
            // an http request ends with a blank line
            boolean currentLineIsBlank = true;
            char cmd[4];
            char pin[4];
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
                        pin[j++] = c;
                    if(counter > 26){
                        dat[z++] = c;
                        if(c == '\ ')
                            finish=true;
                    }
                    if(finish){
                        cmd[i] = '\0';
                        pin[j] = '\0';
                        dat[z-1] = '\0';
                    
                        Serial.println(cmd);
                        Serial.println(pin);
                        Serial.println(dat);
                        client.println("HTTP/1.1 200 OK");
                        client.println("Content-Type: application/json");
                        client.println("Connnection: keep-alive");
                        client.println();
                    
                        if(strcmp(cmd,"ele")==0){
                            client.println(ELEMENTS_RES);
                        }
                        else if(strcmp(cmd,"get")==0){
                            int ipin = atoi(pin);
                            int value = analogRead(ipin);
                            client.print("{\"cmd\":\"get\",\"eid\":\"");
                            client.print(BOARD_ID);
                            client.print("_");
                            client.print(ipin);
                            client.print("\",\"dat\":\"");
                            client.print(value);
                            client.println("\"}");
                        }
                        else if(strcmp(cmd,"str")==0 || strcmp(cmd,"stp")==0){  
                            Serial.print(pin);
                            Serial.print(" mode : ");
                            Serial.println(dat);              

                            int len = strlen(BOARD_ID) + 1 + strlen(pin);  // BOARD_ID + _ + pin
                            char eid[len+1];
                            strcpy(eid,BOARD_ID);
                            strcat(eid,"_");
                            strcat(eid,pin);
                            strcat(eid,'\0');
//                            Serial.println(eid);
              
                            if(strcmp(cmd,"str")==0){
                                client.print("{\"cmd\":\"str\",");
                                client.print("\"id\":\"");
                                client.print(eid);
                                client.println("\"}");
                                Serial.print("starting sensor ");
                                Serial.println(eid);
                            
                                for(int i=0; i<NUM_ELEMENTS; i++){
                                    if(strcmp(elements[i]->id, eid) == 0)
                                        elements[i]->active = true;
                                }
                            }
                            else{ 
                                client.println("{\"cmd\":\"stp\"}");
                                Serial.println("stopping sensor ");
                                for(int i=0; i<NUM_ELEMENTS; i++){
                                    if(strcmp(elements[i]->id, eid) == 0)
                                        elements[i]->active = false;
                                }
                            }             
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
        for(int i=0; i<NUM_ELEMENTS; i++){
            if(elements[i]->active && (millis() - elements[i]->lastConnectionTime > elements[i]->rate)){
                sendDataToAPI(i);
            }
        }
    }
}