// Import library sesuai kebutuhan sistem
#include <ESP8266WiFi.h>
#include <Servo.h>
#include <LiquidCrystal_I2C.h>
#include <PubSubClient.h>

// Kredensial koneksi WiFi
const char* ssid = "PinJem";
const char* password = "pinjem123";

// Konfigurasi MQTT
const char* mqtt_server = "broker.emqx.io";
const int mqtt_port = 1883;
const char* clientID = "ESP8266_PinJem_Client";

// Topik MQTT
const char* topicDataSensor = "sensor/pinjem/data/AbCdEf1234";
const char* topicServoCmd = "servo/pinjem/command/AbCdEf1234";
const char* topicModeCmd = "mode/pinjem/command/AbCdEf1234";

// Inisialisasi pin
const int servo_pin = D4;
const int ldr_pin = A0;
const int raindrop_pin = D5;

// Inisialisasi objek Servo, LCD, dan MQTT Client
Servo servo;
LiquidCrystal_I2C lcd(0x27, 16, 2);
WiFiClient espClient;
PubSubClient client(espClient);

// Konfigurasi servo
const int open_angle = 40;
const int close_angle = 130;
int current_angle = close_angle;

// Inisialisasi variabel mode sistem
bool manual_mode = false;

// Konfigurasi timer kondisi Sensor & Publish MQTT
unsigned long last_check = 0;
unsigned long last_publish = 0;
const unsigned long check_interval = 2000;
const unsigned long publish_interval = 5000;

// Fungsi untuk memperoleh value photo sensor
int getLDRValue() {
    return analogRead(ldr_pin);
}

// Fungsi untuk memperoleh value raindrop sensor
bool isRaining() {
    return digitalRead(raindrop_pin) == LOW;
}

// Fungsi untuk memperoleh status hari, apakah cerah atau gelap
bool isBright(int ldrValue) {
    return ldrValue <= 200;
}

// Fungsi untuk memperoleh status atap
String getRoofState() {
    if (current_angle <= open_angle + 5) return "Terbuka";
    else if (current_angle >= close_angle - 5) return "Tertutup";
    return "Bergerak";
}

// Fungsi untuk mengatur pergerakan servo
void servoMove(int to_angle, int speed) {
    if (current_angle != to_angle) {
        int step = (to_angle > current_angle) ? 1 : -1;
        lcd.setCursor(0, 1);
        lcd.print("Servo Bergerak ");
        for (int pos = current_angle; pos != to_angle; pos += step) {
            servo.write(pos);
            delay(speed);
        }
        servo.write(to_angle);
        current_angle = to_angle;
        Serial.print("Servo moved to: "); Serial.println(current_angle);
        // Setelah selesai bergerak, update LCD dengan status akhir
        String finalMsg = String(manual_mode ? "[MAN] " : "[OTO] ") + getRoofState();
        updateLCD(finalMsg);
        // Publish status terbaru setelah bergerak
        publishStatus();
    }
}

// Fungsi untuk update pesan LCD
String last_message = "";
void updateLCD(const String& msg) {
    if (msg != last_message) {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("IP: " + WiFi.localIP().toString());
        lcd.setCursor(0, 1);
        lcd.print(msg.substring(0, 16));
        last_message = msg;
        Serial.print("LCD Updated: "); Serial.println(msg);
    }
}

// Fungsi callback saat menerima pesan MQTT
void callback(char* topic, byte* payload, unsigned int length) {
    Serial.print("Message arrived [");
    Serial.print(topic);
    Serial.print("] ");
    String message;
    for (int i = 0; i < length; i++) {
        message += (char)payload[i];
    }
    Serial.println(message);

    // Proses pesan berdasarkan topik
    if (strcmp(topic, topicServoCmd) == 0) {
        manual_mode = true;
        if (message == "OPEN") {
            Serial.println("[MQTT_CMD] Membuka atap (Manual)");
            updateLCD("[MAN] Buka Atap");
            servoMove(open_angle, 15);
        } else if (message == "CLOSE") {
            Serial.println("[MQTT_CMD] Menutup atap (Manual)");
            updateLCD("[MAN] Tutup Atap");
            servoMove(close_angle, 15);
        } else {
            Serial.println("[MQTT_CMD] Perintah servo tidak dikenal.");
        }
    } else if (strcmp(topic, topicModeCmd) == 0) {
        if (message == "AUTO") {
            Serial.println("[MQTT_CMD] Mengaktifkan Mode Otomatis");
            updateLCD("[SYS] Auto Aktif");
            manual_mode = false;

            publishStatus();
        } else {
             Serial.println("[MQTT_CMD] Perintah mode tidak dikenal.");
        }
    }
}

// Fungsi untuk setup koneksi MQTT
void setup_mqtt() {
    client.setServer(mqtt_server, mqtt_port);
    client.setCallback(callback);
}

// Fungsi untuk rekoneksi MQTT jika terputus
void reconnect_mqtt() {
    // Loop sampai terhubung kembali
    while (!client.connected()) {
        Serial.print("Attempting MQTT connection...");
        if (client.connect(clientID)) {
            Serial.println("connected");

            client.subscribe(topicServoCmd);
            client.subscribe(topicModeCmd);
            Serial.println("Subscribed to command topics");
            updateLCD("MQTT Connected");
        } else {
            Serial.print("failed, rc=");
            Serial.print(client.state());
            Serial.println(" try again in 5 seconds");
            updateLCD("MQTT Conn Fail");

            delay(5000);
        }
    }
}

// Fungsi untuk mempublish status sensor dan sistem ke MQTT
void publishStatus() {
    if (!client.connected()) {
        return;
    }

    int ldrValue = getLDRValue();
    bool raining = isRaining();
    String roofState = getRoofState();
    String currentMode = manual_mode ? "Manual" : "Otomatis";

    // Buat payload JSON
    char jsonPayload[200];
    snprintf(jsonPayload, sizeof(jsonPayload),
             "{\"ldr_value\":%d, \"is_raining\":%s, \"roof_state\":\"%s\", \"mode\":\"%s\"}",
             ldrValue,
             raining ? "true" : "false",
             roofState.c_str(),
             currentMode.c_str());

    Serial.print("Publishing to MQTT: ");
    Serial.println(jsonPayload);
    if (client.publish(topicDataSensor, jsonPayload)) {
         Serial.println("Publish successful");
    } else {
         Serial.println("Publish failed");
    }
}


void setup() {
    // Inisialisasi komunikasi serial
    Serial.begin(115200);
    Serial.println("\nStarting PinJem System with MQTT...");

    // Inisialisasi pin mode
    pinMode(ldr_pin, INPUT);
    pinMode(raindrop_pin, INPUT);

    // Inisialisasi Servo & LCD
    servo.attach(servo_pin, 500, 2400);
    servo.write(current_angle);
    lcd.init();
    lcd.backlight();

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Sistem PinJem");
    lcd.setCursor(0, 1);
    lcd.print("Starting...");
    delay(2000);

    // Melakukan koneksi WiFi
    Serial.print("Connecting to WiFi: ");
    Serial.println(ssid);
    updateLCD("Connecting WiFi");
    WiFi.begin(ssid, password);
    int wifi_retries = 0;
    while (WiFi.status() != WL_CONNECTED && wifi_retries < 20) {
        delay(500);
        Serial.print(".");
        wifi_retries++;
    }

    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\nWiFi Connected!");
      Serial.print("IP Address: ");
      Serial.println(WiFi.localIP());
      updateLCD("IP:" + WiFi.localIP().toString());
      delay(2000);

      setup_mqtt();
    } else {
      Serial.println("\nWiFi Connection Failed!");
      updateLCD("WiFi Conn Fail!");

      while(1) delay(1000);
    }

    Serial.println("Setup complete. Running main loop.");
    updateLCD("System Ready");
}

void loop() {
    // Cek koneksi WiFi, coba reconnect jika perlu
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi Disconnected. Reconnecting...");
        updateLCD("WiFi Lost...");
        WiFi.begin(ssid, password);
        int wifi_retries = 0;
        while (WiFi.status() != WL_CONNECTED && wifi_retries < 10) {
            delay(500);
            Serial.print(".");
            wifi_retries++;
        }
        if (WiFi.status() != WL_CONNECTED) {
             Serial.println("WiFi Reconnect Failed!");
        } else {
             Serial.println("WiFi Reconnected!");
             updateLCD("IP:" + WiFi.localIP().toString());
             // Coba reconnect MQTT juga jika WiFi baru nyambung lagi
             if (!client.connected()) {
                reconnect_mqtt();
             }
        }
    }

    // Pastikan terhubung ke MQTT Broker
    if (!client.connected()) {
        reconnect_mqtt();
    }
    // Penting untuk memproses pesan masuk dan menjaga koneksi MQTT
    client.loop();

    unsigned long current_millis = millis();

    // Memeriksa pengkondisian sesuai waktu yang ditentukan
    if (current_millis - last_check >= check_interval) {
        last_check = current_millis;

        int ldrValue = getLDRValue();
        bool raining = isRaining();

        // Pengkondisian fitur override (Hujan selalu menutup, bahkan di mode manual)
        if (raining && current_angle != close_angle) {
            if (manual_mode) {
                Serial.println("[OVERRIDE] Hujan terdeteksi! Menutup atap (Mode Manual dinonaktifkan sementara).");
                updateLCD("[FORCE] Tutup");
            } else {
                 Serial.println("[AUTO] Hujan terdeteksi, menutup atap.");
                 updateLCD("[OTO] Tutup Atap");
            }
            servoMove(close_angle, 15);
             // Langsung publish status karena ada perubahan paksa
            publishStatus();
        }
        // Hanya jalankan logika otomatis jika tidak hujan dan mode otomatis aktif
        else if (!manual_mode && !raining) {
            if (isBright(ldrValue) && current_angle != open_angle) {
                updateLCD("[OTO] Buka Atap");
                Serial.println("[AUTO] Cerah & tidak hujan, membuka atap.");
                servoMove(open_angle, 15);
                 // Publish status setelah bergerak
                publishStatus();
            } else if (!isBright(ldrValue) && current_angle != close_angle) {
                updateLCD("[OTO] Tutup Atap");
                Serial.println("[AUTO] Gelap & tidak hujan, menutup atap.");
                servoMove(close_angle, 15);
                 // Publish status setelah bergerak
                publishStatus();
            } else {
                 Serial.print("[AUTO] Kondisi stabil: ");
                 Serial.println(isBright(ldrValue) ? "Cerah/Terbuka" : "Gelap/Tertutup");
            }
        } else if (manual_mode) {
             updateLCD("[MAN] Mode Aktif");
        }
    }

    // Mempublish data secara periodik
    if (current_millis - last_publish >= publish_interval) {
        last_publish = current_millis;

        // Panggil fungsi publish
        publishStatus();
    }
}