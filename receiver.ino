#include <SPI.h>
#include <LoRa.h>

#define BUZZER_PIN 15  // Connect buzzer to this pin
#define LORA_FREQ 866E6  // India ISM band

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);  // Buzzer off

  // Start LoRa
  if (!LoRa.begin(LORA_FREQ)) {
    Serial.println("Starting LoRa failed!");
    while (1);
  }
  Serial.println("LoRa Receiver started at 866 MHz");
}

void loop() {
  int packetSize = LoRa.parsePacket();
  if (packetSize > 0) {
    String received = "";
    while (LoRa.available()) {
      received += (char)LoRa.read();
    }

    Serial.println("Received: " + received);

    // Split the received message
    if (received.startsWith("SOS")) {
      triggerAlert(received);
    }
    // Optional: log other data like fishspot/heavytide here
  }
}

void triggerAlert(String message) {
  Serial.println("⚠  SOS ALERT! Data: " + message);

  // Buzzer beep pattern
  for (int i = 0; i < 3; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(500);
    digitalWrite(BUZZER_PIN, LOW);
    delay(500);
  }

  // You can add a visual display here (LCD/OLED) if required
}