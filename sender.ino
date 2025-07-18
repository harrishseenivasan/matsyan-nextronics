// LoRa + GPS + SOS Sender Code for ESP32 (India Legal 866 MHz Band)
#include <SPI.h>
#include <LoRa.h>
#include <TinyGPSPlus.h>
#include <HardwareSerial.h>
#include <SD.h>

#define GPS_RX 16
#define GPS_TX 17
#define SD_CS 5
#define SOS_BUTTON 12
#define FISHPOT_BUTTON 13
#define HEAVYTIDE_BUTTON 14

TinyGPSPlus gps;
HardwareSerial GPS_serial(1);

bool loraActive = false;

void setup() {
  Serial.begin(115200);
  GPS_serial.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);

  pinMode(SOS_BUTTON, INPUT_PULLUP);
  pinMode(FISHPOT_BUTTON, INPUT_PULLUP);
  pinMode(HEAVYTIDE_BUTTON, INPUT_PULLUP);

  // SD Card Init
  if (!SD.begin(SD_CS)) {
    Serial.println("SD Card failed or not present");
  } else {
    Serial.println("SD Card initialized.");
  }

  // Initialize LoRa with legal Indian frequency
  if (!LoRa.begin(866E6)) {
    Serial.println("Starting LoRa failed!");
    while (1);
  }
  Serial.println("LoRa Initialized at 866 MHz");
  loraActive = false;  // Initially LoRa is off
}

void loop() {
  while (GPS_serial.available() > 0) {
    gps.encode(GPS_serial.read());
  }

  if (gps.location.isUpdated()) {
    float lat = gps.location.lat();
    float lng = gps.location.lng();
    String timeStr = String(gps.time.hour()) + ":" + String(gps.time.minute()) + ":" + String(gps.time.second());

    if (digitalRead(SOS_BUTTON) == LOW) {
      if (!loraActive) {
        LoRa.begin(866E6);
        loraActive = true;
      }
      sendLoRaData("SOS", timeStr, lat, lng);
      delay(2000);
    }

    if (digitalRead(FISHPOT_BUTTON) == LOW) {
      saveToSD("fishspot", lat, lng);
      delay(1000);
    }

    if (digitalRead(HEAVYTIDE_BUTTON) == LOW) {
      saveToSD("heavytide", lat, lng);
      delay(1000);
    }
  }
}

void sendLoRaData(String type, String timeStr, float lat, float lng) {
  String payload = type + "," + timeStr + "," + String(lat, 7) + "," + String(lng, 7);
  LoRa.beginPacket();
  LoRa.print(payload);
  LoRa.endPacket();
  Serial.println("Sent: " + payload);
}

void saveToSD(String type, float lat, float lng) {
  File file = SD.open("data.csv", FILE_APPEND);
  if (file) {
    file.print(type);
    file.print(",");
    file.print(lat, 7);
    file.print(",");
    file.println(lng, 7);
    file.close();
    Serial.println("Saved to SD: " + type);
  } else {
    Serial.println("Error writing to SD");
  }
}