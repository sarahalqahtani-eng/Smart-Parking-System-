/* ============================================================================
   Smart Parking — Unified ESP32 Sketch
   Al Yamamah University

   Combines:
     - HC-SR04 ultrasonic sensor (occupancy detection)
     - SG90 servo motor (gate open/lock)
     - WiFi + Web server with CORS (browser-accessible API)

   Endpoints:
     GET /              -> simple test page
     GET /status        -> "Available, 42.5" or "Occupied, 8.3"
     GET /gate-status   -> "Open" or "Locked"
     GET /open          -> opens the gate (servo to 90°)
     GET /lock          -> locks the gate (servo to 0°)

   Wiring (ESP32 Dev Module):
     HC-SR04:
       VCC  -> 5V / VIN
       GND  -> GND
       Trig -> GPIO 5
       Echo -> GPIO 18
     SG90 Servo:
       Red    -> 5V / VIN
       Brown  -> GND
       Orange -> GPIO 13

   Required libraries (Arduino IDE -> Library Manager):
     - WiFi          (built-in)
     - WebServer     (built-in)
     - ESP32Servo    by Kevin Harrington
   ============================================================================ */

#include <WiFi.h>
#include <WebServer.h>
#include <ESP32Servo.h>

// ----------------------------------------------------------------------------
// CONFIG — change these for your setup
// ----------------------------------------------------------------------------
const char* WIFI_SSID     = "Sara Q";
const char* WIFI_PASSWORD = "77777778";

#define TRIG_PIN 5
#define ECHO_PIN 18
#define SERVO_PIN 13

#define OCCUPIED_DISTANCE_CM 15   // < this = car detected = "Occupied"

// ----------------------------------------------------------------------------
// State
// ----------------------------------------------------------------------------
Servo gateServo;
WebServer server(80);

bool   gateOpen   = false;
float  lastDistance = 999.0;
String lastStatus = "Available";
unsigned long lastSensorRead = 0;
const unsigned long SENSOR_INTERVAL_MS = 500;

// ----------------------------------------------------------------------------
// CORS helper — adds headers to every response so the website (running on
// a different origin, e.g. file:// or http://localhost) can call this API.
// ----------------------------------------------------------------------------
void sendCors() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
}

void handleOptions() {
  sendCors();
  server.send(204);
}

// ----------------------------------------------------------------------------
// Sensor
// ----------------------------------------------------------------------------
float readDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  if (duration == 0) return 999.0;
  return duration * 0.034 / 2.0;
}

void updateSensor() {
  if (millis() - lastSensorRead < SENSOR_INTERVAL_MS) return;
  lastSensorRead = millis();

  lastDistance = readDistanceCm();
  if (lastDistance > 0 && lastDistance < OCCUPIED_DISTANCE_CM) {
    lastStatus = "Occupied";
  } else {
    lastStatus = "Available";
  }

  // Optional: print to serial for debugging
  Serial.printf("Distance: %.1f cm  | Status: %s | Gate: %s\n",
                lastDistance, lastStatus.c_str(), gateOpen ? "Open" : "Locked");
}

// ----------------------------------------------------------------------------
// Routes
// ----------------------------------------------------------------------------
void handleRoot() {
  sendCors();
  String html = "<!DOCTYPE html><html><head><meta charset='UTF-8'>"
                "<title>ESP32 Smart Parking</title>"
                "<style>body{font-family:sans-serif;background:#F0F9FF;padding:40px;text-align:center;}"
                ".card{background:white;max-width:420px;margin:auto;padding:30px;border-radius:18px;"
                "box-shadow:0 10px 30px rgba(14,165,233,0.15);}"
                "h1{color:#0284C7;}p{color:#475569;}code{background:#E0F2FE;padding:2px 8px;border-radius:6px;}"
                "</style></head><body><div class='card'>"
                "<h1>ESP32 Smart Parking</h1>"
                "<p>API is running. Endpoints:</p>"
                "<p><code>/status</code> · <code>/gate-status</code> · <code>/open</code> · <code>/lock</code></p>"
                "<p style='margin-top:20px;'>Status: <b>" + lastStatus + "</b><br>"
                "Distance: <b>" + String(lastDistance, 1) + " cm</b><br>"
                "Gate: <b>" + String(gateOpen ? "Open" : "Locked") + "</b></p>"
                "</div></body></html>";
  server.send(200, "text/html", html);
}

void handleStatus() {
  sendCors();
  // Return: "Available, 42.5" or "Occupied, 8.3"
  String body = lastStatus + ", " + String(lastDistance, 1);
  server.send(200, "text/plain", body);
}

void handleGateStatus() {
  sendCors();
  server.send(200, "text/plain", gateOpen ? "Open" : "Locked");
}

void handleOpen() {
  sendCors();
  gateServo.write(90);
  gateOpen = true;
  Serial.println(">> Gate Opened");
  server.send(200, "text/plain", "Gate opened");
}

void handleLock() {
  sendCors();
  gateServo.write(0);
  gateOpen = false;
  Serial.println(">> Gate Locked");
  server.send(200, "text/plain", "Gate locked");
}

void handleNotFound() {
  sendCors();
  server.send(404, "text/plain", "Not found");
}

// ----------------------------------------------------------------------------
// Setup / Loop
// ----------------------------------------------------------------------------
void connectToWiFi() {
  Serial.printf("\nConnecting to %s ", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print('.');
    attempts++;
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("WiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.println(">>> Copy this IP into the website's settings <<<");
  } else {
    Serial.println("WiFi failed. Check SSID/password.");
  }
}

void setup() {
  Serial.begin(115200);
  delay(200);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  gateServo.attach(SERVO_PIN);
  gateServo.write(0);
  gateOpen = false;

  connectToWiFi();

  server.on("/",            HTTP_GET,     handleRoot);
  server.on("/status",      HTTP_GET,     handleStatus);
  server.on("/gate-status", HTTP_GET,     handleGateStatus);
  server.on("/open",        HTTP_GET,     handleOpen);
  server.on("/lock",        HTTP_GET,     handleLock);
  server.on("/",            HTTP_OPTIONS, handleOptions);
  server.on("/status",      HTTP_OPTIONS, handleOptions);
  server.on("/gate-status", HTTP_OPTIONS, handleOptions);
  server.on("/open",        HTTP_OPTIONS, handleOptions);
  server.on("/lock",        HTTP_OPTIONS, handleOptions);
  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP server started on port 80");
}

void loop() {
  server.handleClient();
  updateSensor();
}
