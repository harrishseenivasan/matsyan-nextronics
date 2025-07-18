# 🌊 OceanGuard: Smart Emergency & Weather Alert System for Fishermen

## 📌 Project Overview

OceanGuard is a smart, offline-capable emergency and weather alert system specifically designed to ensure the safety of fishermen operating in deep-sea areas with limited or no internet connectivity. It uses a combination of **LoRa**, **GPS**, **ESP32**, and a **real-time monitoring dashboard** to detect and respond to critical events such as emergencies (SOS), heavy tides, and fish spot locations.

---

## 📺 Project Demo Video

Watch the live demonstration of the OceanGuard system in action:  
👉 [https://youtu.be/8Nfj13R0pLU](https://youtu.be/8Nfj13R0pLU)

---

## 🚀 Key Features

### 🛰️ 1. Boat-side Sender Unit
- **Components**: ESP32, LoRa SX1278, Neo-6M GPS, SOS button, battery/solar
- **Functionality**:
  - Captures GPS location.
  - Transmits messages such as `sos`, `heavytide`, and `fishspot` over LoRa.
  - Operates 24/7 using low-power components.

#### 📡 Message Format:

type,lat,lng

sos,6.9600001,78.8300002

heavytide,6.9649775,77.7814553

fishspot,6.9620382,78.8396941



### 🏠 2. Land-side Receiver Unit
- **Components**: ESP32, LoRa SX1278, laptop or PC
- **Functionality**:
  - Always-on listener for LoRa signals.
  - Triggers alerts if `sos` is received (buzzer/display).
  - Stores data in a local CSV file.

### 🖥️ 3. OceanGuard Dashboard
- **Built with**: HTML, JavaScript (Node.js), Firebase
- **Features**:
  - Radar view and map view of sea activity.
  - Real-time data display from LoRa receiver.
  - Upload & settings panel.
  - Firebase integration for backup and alerts.

---

## 🧱 System Architecture Description

1. **Fishermen send GPS & SOS/weather data via LoRa**
2. **ESP32 LoRa receiver at HQ receives & logs the data**
3. **Dashboard reads and displays incoming data in real-time**
4. **SOS alerts trigger visual/audio alarms**
5. **All data backed up optionally to Firebase**

---

## ⚙️ Technologies Used

- ESP32 Microcontroller (LoRa & GPS interfacing)
- LoRa SX1278 modules (for offline long-range communication)
- Neo-6M GPS module
- HTML/CSS/JS frontend
- Node.js server
- Firebase Realtime Database

---

## 📂 File Structure (Example)
OceanGuard/

├── sender_code/

│ └── esp32_lora_gps_sender.ino

├── receiver_code/

│ └── esp32_lora_receiver_to_csv.ino

├── dashboard/

│ ├── index.html

│ ├── script.js

├── data/

│ └── test.csv

└── README.md


---

## 🔔 Use Cases

- Emergency SOS alert system in high-risk sea zones.
- Live location and sea condition monitoring.
- Fish spotting data for seasonal analysis.

---

## 👨‍🔧 Future Improvements

- Add marine weather prediction using barometric sensors.
- Voice/SMS integration via SIM800L or Mesh LoRa.
- Wearable button integration for faster SOS.

---

## 👤 Developed By

- **Project Author**: Nextronics  
- **Use Case**: Agentic Hackathon
