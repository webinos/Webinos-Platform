#define CONNECTED      "con"
#define IDLE           "ele"
#define START          "str"
#define STOP           "stp"
#define CONFIGURE      "cfg"
#define SET            "set"

#define BOARDID        "00002"
#define NUM_ELEMENTS    2
/*
#define ELEMENTS_RES "{\"id\":\""BOARDID"\",\"cmd\":\"ele\",\"elements\":[\
                          {\"id\":\""BOARDID"_000\",\"element\": {\"sa\":\"0\",\"maximumRange\":\"0.1\",\"minDelay\":\"500\",\"power\":\"0.02\",\"resolution\":\"0.001\",\"type\":\"temperature\",\"vendor\":\"vend_temp\",\"version\":\"1\"}}\
                          ,{\"id\":\""BOARDID"_002\",\"element\": {\"sa\":\"1\",\"range\":\"0-1\",\"type\":\"linearmotor\",\"vendor\":\"vend_motor\",\"version\":\"1\"}}\
                          ,{\"id\":\""BOARDID"_001\", \"element\":{\"sa\":\"0\",\"maximumRange\":\"0.1\",\"minDelay\":\"500\",\"power\":\"0.02\",\"resolution\":\"0.001\",\"type\":\"proximity\",\"vendor\":\"vend_prox\",\"version\":\"1\"}}\
                      ]}"
*/

#define ELEMENTS_RES "{\"id\":\""BOARDID"\",\"cmd\":\"ele\",\"elements\":[\
                          {\"id\":\""BOARDID"_000\",\"element\": {\"sa\":\"0\",\"maximumRange\":\"0.1\",\"minDelay\":\"500\",\"power\":\"0.02\",\"resolution\":\"0.001\",\"type\":\"temperature\",\"vendor\":\"vend_temp\",\"version\":\"1\"}}\
                          ,{\"id\":\""BOARDID"_001\", \"element\":{\"sa\":\"0\",\"maximumRange\":\"0.1\",\"minDelay\":\"500\",\"power\":\"0.02\",\"resolution\":\"0.001\",\"type\":\"proximity\",\"vendor\":\"vend_prox\",\"version\":\"1\"}}\
                      ]}"
int num_message = 0;

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

void connect_to_pzp(){
    Serial.print("<{\"cmd\":\"con\", \"id\":\"");
    Serial.print(BOARDID);
    Serial.println("\",\"protocol\":\"serial\",\"name\":\"ARDUINO_UNO\"}>");
}

void send_ack(char* cmd, char* eid, char* dat){
    Serial.println();
    Serial.println();
    Serial.print("<{\"cmd\":\"");
    Serial.print(cmd);
    Serial.print("\",\"id\":\"");
    Serial.print(eid);
    Serial.print("\",\"dat\":\"");
    Serial.print(dat);
    Serial.print("\",\"num\":\"");
    Serial.print(num_message++);
    Serial.println("\"}>");
    delay(100);
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
        analogWrite(pin, value);
    }
    else{ //digital actuator
        if(value == 0){
            digitalWrite(pin,LOW);
        }
        else if(value == 1){
            digitalWrite(pin,HIGH);
        }
    }
}

void setup(){
    Serial.begin(9600);
    
    elements[0] = new IOElement();
    elements[0]->id = BOARDID"_000";
    elements[0]->sa = 0;
    elements[0]->ad = 0;
    elements[0]->pin = 0;
    elements[0]->active = 0;
    elements[0]->mode = 0;
    elements[0]->lastValue = -1;
    elements[0]->rate = 1000;
  
    elements[1] = new IOElement();
    elements[1]->id = BOARDID"_001";
    elements[1]->sa = 0;
    elements[1]->ad = 0;
    elements[1]->pin = 1;
    elements[1]->active = 0;
    elements[1]->mode = 1;
    elements[1]->lastValue = -1;
    elements[1]->rate = 3500;
  /*
    elements[2] = new IOElement();
    elements[2]->id = BOARDID"_002";
    elements[2]->sa = 1;
    elements[2]->ad = 1;
    elements[2]->pin = 13;
    pinMode(13, OUTPUT);
    */
    delay(1000);
    connect_to_pzp();
}

String s = "";
char cmd[4];
char id[4];
char dat[30];
bool prevIsCmd = false;
String configuration_params;


void loop(){  
    if(Serial.available()>0){
        char c = (char) Serial.read();
        if(c == '\n'){
            prevIsCmd = true;
            //cmd=con&eid=000&dat=ack
            int i=0,j=0,z=0;
            bool finish = false;
            for(int index=0; index<s.length();index++){
                if(index>3 && index<7)
                    cmd[i++] = s.charAt(index);
                if(index>11 && index<15)
                    id[j++] = s.charAt(index);
                if(index>19){
                    if(s.charAt(index) != '\n')
                        dat[z++] = s.charAt(index);
                    else
                        break;
                }    
            }
            cmd[i] = '\0';
            id[j] = '\0';
            dat[z] = '\0';    
            s = "";
        }
        else
            s += c;
    }
  
    int len = strlen(BOARDID) + 1 + strlen(id);  // BOARD_ID + _ + pin
    char eid[len+1];
    strcpy(eid,BOARDID);
    strcat(eid,"_");
    strcat(eid,id);
    strcat(eid,'\0'); 
    
    if(strcmp(cmd, CONNECTED) == 0){
        Serial.print("<");
        Serial.print(ELEMENTS_RES);
        Serial.println(">");
    }
    else if(strcmp(cmd, START) == 0){
        for(int i=0; i<NUM_ELEMENTS; i++){
            if(strcmp(elements[i]->id, eid) == 0){
                elements[i]->active = true;
                send_ack(cmd,eid,dat);
                break;
             }
         }
    }
    else if(strcmp(cmd, STOP) == 0){
        //stopping element eid
        for(int i=0; i<NUM_ELEMENTS; i++){
            if(strcmp(elements[i]->id, eid) == 0)
                elements[i]->active = false;
        }
        send_ack(cmd,eid,dat);
    }
    else if(strcmp(cmd, CONFIGURE) == 0){      
        //configuring element eid
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
        send_ack(cmd,eid,dat);      
    }
    else if(strcmp(cmd, SET) == 0){
        //setting element eid
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
        send_ack(cmd,eid,dat);
    }
    else
        ;
    
    for(int i=0;i<4;i++)
        cmd[i] = '\0';
                
    for(int i=0; i<NUM_ELEMENTS; i++){
        if(elements[i]->active){
            int val = getValueFromSensor(elements[i]->ad, elements[i]->pin);
            if(elements[i]->mode == 1 && millis() - elements[i]->lastConnectionTime > elements[i]->rate){
                char cval[4];
                itoa(val,cval,10);
                send_ack("val",elements[i]->id, cval);
                elements[i]->lastConnectionTime = millis();
            }
            else if(elements[i]->mode == 0){
                if(val == elements[i]->lastValue){
                    char cval[4];
                    itoa(val,cval,10);
                    send_ack("val",elements[i]->id, cval);
                }
            }
            elements[i]->lastValue = val;
        }
    }
}
