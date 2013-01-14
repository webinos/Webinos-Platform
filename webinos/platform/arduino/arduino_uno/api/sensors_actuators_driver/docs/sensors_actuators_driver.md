#HTTP DRIVER FOR ARDUINO UNO BOARD

This HTTP driver allows the Arduino UNO board to exchange sensors' and actuators' control information with the PZP through RESTfull Web Services. The driver is separated in two files:

* One representing the PZP driver (located in webinos/core/api/iotdrivers/lib/drivers/httpDriver.js)
* One representing the board (Arduino) driver (located in webinos/platform/arduino/arduino_uno/api/sensors_actuators_driver/sensors_actuators_driver.ino)

The hardware required by the HTTP driver is:

* [Arduino UNO board](http://arduino.cc/en/Main/arduinoBoardUno)
* [Arduino Ethernet Shield](http://www.arduino.cc/en/Main/ArduinoEthernetShield)


The PZP driver exposes a server to listen for incoming requests from the board. For this driver [express](http://expressjs.com/) server was used.


##HOW HTTP DRIVER WORKS

Once flashed with the driver and configured (view the next section), the Arduino board is ready to be connected to the PZP through a direct ethernet connection (or through a router).
At the first stage, the board periodically (every 2 seconds) tries to send to the PZP an hello message to introduce itself. This message is a tuple containing the following information:

* board_ID
* board_PROTOCOL
* board_NAME
* board_IP
* board_PORT

An example of hello message sent to *http://PZP_IP:PZP_PORT* is the following:

<pre>
GET /newboard?jsondata={"id":"00001","protocol":"HTTP","name":"ARDUINO_MEGA","ip":"192.168.1.2","port":"80"} HTTP/1.0
</pre>

Once the connection has been estabilished, if the board was successfully registered, the board sends back to the PZP an ack message with a payload containing the json string *{"ack":"newboard"}*.

![hello](https://raw.github.com/glatorre/Webinos-Platform/WP-671/webinos/platform/arduino/arduino_mega/api/sensors_actuators_driver/docs/figures/hello.png)

The PZP driver can send requests to board server (listening at board_ip:board_port) using the following parameters:

* **cmd** (must be exactly 3 characters)
* **eid** (must be exactly 3 characters)
* **dat** (must be up to 30 characters)

The meaning of the above parameters changes depending on the kind of request. A detailed description of all the available requests is provided in the rest of this section.

###Getting the elements list
After the board has been configured, the PZP requires the list of the elements (sensors or actuators) directly connected to the board. This is possible through the **"ele"** command sent through the following request:

<pre>
http://board_IP:board_PORT/?cmd=ele&eid=000&dat=000
</pre>

The parameters **eid** and **dat** are not relevant for this kind of request and assume the null value 000.

![get_elements](https://raw.github.com/glatorre/Webinos-Platform/WP-671/webinos/platform/arduino/arduino_mega/api/sensors_actuators_driver/docs/figures/ele.png)

The board replies sending back to the PZP Driver the same command of the request (ele), the board id (00001) and a list of elements as an array of JSON object. For example an object returned inside the *elements* array may have the following form:

<pre>
{"id":"00001_000", "element": {"sa":"0","maximumRange":"0.1","minDelay":"500","power":"0.02","resolution":"0.001","type":"temperature","vendor":"apple_temp","version":"1"}}
</pre>


###Starting sensors' acquisition

The board can start the sensor's data acquisition with the **"str"** command sent through the following request:

<pre>
http://board_ip:board_port/?cmd=str&eid=001&dat=vch
</pre>

Where **eid** represents the ID of the element to start and **dat** can assume values *"vch"* (valuechange) or *"fix"* (fixedinterval) and represents the eventFireMode described by Generic Sensors API.

![start_element](https://raw.github.com/glatorre/Webinos-Platform/WP-671/webinos/platform/arduino/arduino_mega/api/sensors_actuators_driver/docs/figures/str.png)

The board replies sending back to the PZP Driver the same command of the request (str) and the element id which has been started (00001_001).


###Stopping sensors' acquisition

The board can start the sensor's data acquisition with the **"stp"** command sent through the following request:

<pre>
http://board_ip:board_port/?cmd=stp&eid=001&dat=000
</pre>

Where **eid** represents the ID of the element to stop. The **dat** parameter is set with the null value 000.

![stop_element](https://raw.github.com/glatorre/Webinos-Platform/WP-671/webinos/platform/arduino/arduino_mega/api/sensors_actuators_driver/docs/figures/stp.png)

The board replies sending back to the PZP Driver the same command of the request (stp) and the element id which has been stopped (00001_001).

###Configuring a sensor

The board can configure a sensor with the **"cfg"** command sent through the following request:

<pre>
http://board_ip:board_port/?cmd=cfg&eid=001&dat=120:1500:fix
</pre>


Where **eid** represents the ID of the element to configure and the **dat** parameter contains a colon-separated tuple *"timeout:rate:eventfiremode"*. Each of these configuration parameters is described in the ConfigureSensorOptions class defined in the Generic Sensors API. Briefly

* **timeout** is a timeout value for when configureSensor() is canceled in seconds between 0-65535. Default value is 120 seconds. 0 means infinite.
* **rate** is the requested rate of the sensor data. It is the time interval before a new event is generated. The value is expressed in ms. If the interval is too small for the sensor (that is it is unable to generate data at the selected rate) it shall use the maximum rate it can support. 
* **eventfiremode** is the requested sensor event fire mode. It can assume two values: **fix** (is an abbreviation for *fixedinterval*) means that the sensor will send to the API its current value every a fixed time, **vch** (is an abbreviation for *valuechange*) means that the sensor will send its value every time this changes.

![configure_element](https://raw.github.com/glatorre/Webinos-Platform/WP-671/webinos/platform/arduino/arduino_mega/api/sensors_actuators_driver/docs/figures/cfg.png)

The board replies sending back to the PZP Driver the same command of the request (cfg) and the element id which has been configured (00001_001).

###Getting values from a sensor

After a sensors has been started, it sends the read value to the PZP. The way in which this communication takes place depends on the eventfiremode set for the sensor. If the eventfiremode is "fixedinterval" the sensor will send periodically the current value to the PZP.

![configure_element](https://raw.github.com/glatorre/Webinos-Platform/WP-671/webinos/platform/arduino/arduino_mega/api/sensors_actuators_driver/docs/figures/get2.png)

Otherwise if eventfiremode is set to "valuechange" the board will notifiy the PZP only when the sensor's value changes.

![configure_element](https://raw.github.com/glatorre/Webinos-Platform/WP-671/webinos/platform/arduino/arduino_mega/api/sensors_actuators_driver/docs/figures/get1.png)

###Setting value for an actuator
TBD

##HOW TO CONFIGURE HTTP DRIVER

To edit the configuration parameters for the Arduino UNO board some customizations of the source code are necessary. The driver source code is placed in WEBINOS_ROOT/webinos/platform/arduino/arduino_uno/api/sensors_actuators_driver/sensors_actuators_driver.ino.
The code section which contains the configuration parameters is the following:

	//----------Begin Configuration Parameters-----------------------------
	#define NUM_ELEMENTS    2
	#define BOARDID        "00001"
	#define BRDNAME        "ARDUINO_UNO"
	#define BRDIPAD        192,168,1,120
	#define BRDPORT        80
	#define PZPIPAD        192,168,1,130
	#define PZPPORT        3000
	#define MACADDR        { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED }
	#define ELEMENTS_RES "{\"id\":\""BOARDID"\",\"cmd\":\"ele\",\"elements\":[\
                          {\"id\":\""BOARDID"_000\",\"element\": {\
                              \"sa\":\"0\",\
                              \"maximumRange\":\"0.1\",\
                              \"minDelay\":\"500\",\
                              \"power\":\"0.02\",\
                              \"resolution\":\"0.001\",\
                              \"type\":\"temperature\",\
                              \"vendor\":\"apple_temp\",\
                              \"version\":\"1\"}},\
                          {\"id\":\""BOARDID"_001\", \"element\":{\
                              \"sa\":\"0\",\
                              \"maximumRange\":\"0.1\",\
                              \"minDelay\":\"500\",\
                              \"power\":\"0.02\",\
                              \"resolution\":\"0.001\",\
                              \"type\":\"proximity\",\
                              \"vendor\":\"apple_prox\",\
                              \"version\":\"1\"}}\
                      ]}"
	//----------End Configuration Parameters-----------------------------
	


It is possibile to configure the following parameters:

* **NUM_ELEMENTS** represents the number of sensors and actuators connected to the board
* **BOARDID**	represents the board ID. [MANDATORY, e.g. 00001]
* **PZPIPAD**	represents the PZP IP address [MANDATORY, e.g. 192.168.1.130]
* **PZPPORT**	represents the PZP port where the express server is listening [MANDATORY, e.g. 1984]
* **BRDIPAD**	represents the board's IP address. [MANDATORY, e.g. 192.168.1.120]
* **BRDPORT** 	represents the board's port where the server will be listening.[MANDATORY, e.g. 80]
* **MACADDR** represents the board's MAC address expressed in a colon-separated form. [MANDATORY, e.g. AA:AD:BE:EF:FE:BB]
* **ELEMENT_RES** represents a JSON array with a series of information for each element connected to the board. These information is described in the table below:

<table>
  <tr>
    <th>ID</th><th>Parameters</th><th>Type</th><th>Meaning</th><th>Example</th>
  </tr>
  <tr>
    <td>1</td><td>id</td><td>string
    </td><td>The element ID. Is in the form BOARDID_ELEMENTID where ELEMENTID is an array of three characters.</td><td>00001_001</td>
  </tr>
  <tr>
    <td>2</td><td>sa</td><td>boolean</td><td>A boolean which values is 0 if the element is a sensor otherwise 1 if it is an actuator.</td><td>0</td>
  </tr>
  <tr>
    <td>3</td><td>ad</td><td>boolean</td><td>A boolean which values is 0 if the element is analog otherwise 1 if it is digital.</td><td>0</td>
  </tr>
  <tr>
    <td>4</td><td>pin</td><td>integer</td><td>Represents the number of the pin where the element is attached to</td><td>5</td>
  </tr>
  <tr>
    <td>5</td><td>maximumrange</td><td>real</td><td>Represents the max range of sensor in the sensors unit.</td><td>0.22</td>
  </tr>
  <tr>
    <td>6</td><td>mindelay</td><td>integer</td><td>Represents the min delay of sensor allowed between two events in microsecond or zero if this sensor only returns a value when the data it's measuring changes.</td><td>600</td>
  </tr>
  <tr>
    <td>7</td><td>power</td><td>real</td><td>Represents the power consumption of sensor in mA used by this sensor while in use.</td><td>0.02</td>
  </tr>
  <tr>
    <td>8</td><td>resolution</td><td>real</td><td>Represents the resolution of the sensor in the sensors unit.</td><td>0.003</td>
  </tr>
  <tr>
    <td>9</td><td>type</td><td>string</td><td>Represents the type of the element.</td><td>Allowed types are: light, noise, temperature, pressure, proximity, humidity, heartratemonitor</td>
  </tr>
  <tr>
    <td>10</td><td>vendor</td><td>string</td><td>Represents the vendor string of the element.</td><td>parallax</td>
  </tr>
  <tr>
    <td>11</td><td>version</td><td>real</td><td>Represents the version of the element's module.</td><td>1.0</td>
  </tr>
</table>

Each element is stored into memory using the following data structure:

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
	
The list of available elements is statically initialized in the **setup** function:

	void setup(){
		…
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
    	…
	}


##HOW TO TEST HTTP DRIVER

* Connect the Arduino Board to the PZP (e.g. Notebok) directly through an Ethernet cable or alternatively through a router.
* Launch the PZP script
* Power-on the board

Note: The steps order can be whatever.

