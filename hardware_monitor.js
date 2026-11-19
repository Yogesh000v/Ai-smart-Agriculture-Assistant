/**
 * ============================================================================
 * AI Smart Agriculture Assistant - Hardware IoT & C/C++ Studio (JavaScript)
 * Terminal emulator, C-filter signal processing visualizer, and code inspector.
 * ============================================================================
 */

const HardwareMonitor = {
  serialInterval: null,
  isPaused: false,
  tickCount: 1,

  // Moving average state
  filterWindowSize: 8,
  kalmanQ: 0.08,
  kalmanR: 0.4,
  kalmanEstimate: 24.5,
  kalmanP: 1.0,

  init() {
    this.startSerialStream();
    this.bindControls();
    this.bindCodeTabs();
    this.bindFilterSliders();
  },

  startSerialStream() {
    this.appendSerial("[BOOT] ESP-IDF v4.4.2-dirty / FreeRTOS Kernel", "info");
    this.appendSerial("[BOOT] Target MCU: ESP32-WROOM-32D (Dual-Core 240MHz)", "info");
    this.appendSerial("[C-FILTER] Moving Average Buffer (N=8) allocated.", "info");
    this.appendSerial("[WIFI] Connecting to AgroTech_SmartFarm_IoT... IP: 192.168.1.142", "info");
    this.appendSerial("[SETUP] Sensor initialization OK. Ready for sampling.\n", "info");

    this.serialInterval = setInterval(() => {
      if (this.isPaused) return;

      const rawMoist = +(32.0 + (Math.random() * 4.0 - 2.0)).toFixed(1);
      const filteredMoist = +(32.0 + (Math.random() * 0.4 - 0.2)).toFixed(1);
      const temp = +(28.2 + (Math.random() * 0.3)).toFixed(1);

      const line = `[TICK #${String(this.tickCount).padStart(3, '0')}] ADC34:${rawMoist}% -> C-Filtered:${filteredMoist}% | DHT22:${temp}°C | RS485-NPK: 76-44-40 | HTTP POST -> Node Gateway (200 OK)`;
      this.appendSerial(line);

      this.tickCount++;
    }, 2800);
  },

  appendSerial(text, type = '') {
    const term = document.getElementById('serialTerminal');
    if (!term) return;

    const span = document.createElement('span');
    span.className = `serial-line ${type}`;
    span.textContent = text;
    term.appendChild(span);

    // Auto-scroll
    term.scrollTop = term.scrollHeight;

    // Prune old lines
    if (term.childNodes.length > 80) {
      term.removeChild(term.firstChild);
    }
  },

  bindControls() {
    const pauseBtn = document.getElementById('pauseSerialBtn');
    const clearBtn = document.getElementById('clearSerialBtn');
    const pingBtn = document.getElementById('sendPingBtn');

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        this.isPaused = !this.isPaused;
        pauseBtn.textContent = this.isPaused ? '▶ Resume' : '⏸ Pause';
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        const term = document.getElementById('serialTerminal');
        if (term) term.innerHTML = '';
      });
    }

    if (pingBtn) {
      pingBtn.addEventListener('click', () => {
        this.appendSerial("[COMMAND] Manual AT+PING trigger sent to ESP32 node...", "info");
        setTimeout(() => {
          this.appendSerial("[RESPONSE] +PONG: RSSI -58 dBm, Batt: 3.96V (96%), FreeHeap: 184 KB", "warn");
          App.toast("ESP32 IoT Node responded to ping in 14ms.", "success");
        }, 300);
      });
    }
  },

  bindFilterSliders() {
    const winSlider = document.getElementById('filterWindowSlider');
    const winVal = document.getElementById('filterWindowVal');

    if (winSlider && winVal) {
      winSlider.addEventListener('input', () => {
        this.filterWindowSize = parseInt(winSlider.value);
        winVal.textContent = winSlider.value;
        this.appendSerial(`[C-CONFIG] Moving average window adjusted to N=${this.filterWindowSize}`, "warn");
      });
    }
  },

  bindCodeTabs() {
    const tabs = document.querySelectorAll('.code-file-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const file = tab.getAttribute('data-file');
        this.displaySourceCode(file);
      });
    });
  },

  displaySourceCode(file) {
    const codeEl = document.getElementById('cppSourceCode');
    const fileNameEl = document.getElementById('codeCurrentFileName');
    if (!codeEl) return;

    if (fileNameEl) fileNameEl.textContent = file;

    const sources = {
      'esp32_smart_node.ino': `// ESP32 Arduino C++ Firmware (iot_firmware/esp32_smart_node.ino)
#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include "sensor_filter.h"

#define PIN_SOIL_ADC       34   // Capacitive Moisture
#define PIN_DHT            4    // DHT22 Temp & Humidity
#define PIN_RELAY_VALVE    26   // Solenoid Relay
#define CALIB_AIR_VALUE    3200 // Dry ADC calibration
#define CALIB_WATER_VALUE  1380 // Wet ADC calibration

MovingAverageFilter moistureFilter;
KalmanFilter tempKalman;

void setup() {
    Serial.begin(115200);
    setupHardware();
    connectWiFi();
}

void loop() {
    int rawAdc = analogRead(PIN_SOIL_ADC);
    float calMoist = calibrate_soil_moisture(rawAdc, CALIB_AIR_VALUE, CALIB_WATER_VALUE);
    float filteredMoist = filter_update(&moistureFilter, calMoist);

    float rawTemp = dht.readTemperature();
    float filteredTemp = kalman_update(&tempKalman, rawTemp);

    transmitTelemetry(filteredMoist, filteredTemp);
    delay(5000);
}`,

      'sensor_filter.h': `// C Sensor Filtering Header (iot_firmware/sensor_filter.h)
#ifndef SENSOR_FILTER_H
#define SENSOR_FILTER_H

#ifdef __cplusplus
extern "C" {
#endif

#define FILTER_WINDOW_SIZE 8

typedef struct {
    float buffer[FILTER_WINDOW_SIZE];
    int index;
    int count;
    float sum;
} MovingAverageFilter;

typedef struct {
    float q; // Process noise covariance
    float r; // Measurement noise covariance
    float x; // State estimate
    float p; // Error covariance
    float k; // Kalman gain
} KalmanFilter;

void filter_init(MovingAverageFilter* filter);
float filter_update(MovingAverageFilter* filter, float raw_sample);
float calibrate_soil_moisture(int raw_adc, int air_value, int water_value);

#ifdef __cplusplus
}
#endif
#endif`,

      'sensor_filter.c': `// C Sensor Filtering Implementation (iot_firmware/sensor_filter.c)
#include "sensor_filter.h"
#include <string.h>

void filter_init(MovingAverageFilter* filter) {
    memset(filter->buffer, 0, sizeof(filter->buffer));
    filter->index = 0;
    filter->count = 0;
    filter->sum = 0.0f;
}

float filter_update(MovingAverageFilter* filter, float raw_sample) {
    filter->sum -= filter->buffer[filter->index];
    filter->buffer[filter->index] = raw_sample;
    filter->sum += raw_sample;

    filter->index = (filter->index + 1) % FILTER_WINDOW_SIZE;
    if (filter->count < FILTER_WINDOW_SIZE) filter->count++;

    return filter->sum / (float)filter->count;
}

float calibrate_soil_moisture(int raw_adc, int air_value, int water_value) {
    if (raw_adc >= air_value) return 0.0f;
    if (raw_adc <= water_value) return 100.0f;
    return 100.0f * (float)(air_value - raw_adc) / (float)(air_value - water_value);
}`,

      'node_sim.cpp': `// Native C++ IoT Simulator (iot_firmware/node_sim.cpp)
#include <iostream>
#include <iomanip>
#include "sensor_filter.h"

int main() {
    MovingAverageFilter filter;
    filter_init(&filter);

    std::cout << "[C++ IoT Node Simulator Started]" << std::endl;
    for(int tick = 1; tick <= 10; ++tick) {
        float raw = 32.0f + ((rand() % 100) - 50) / 25.0f;
        float clean = filter_update(&filter, raw);
        std::cout << "Tick #" << tick << " Raw: " << raw << "% Clean: " << clean << "%" << std::endl;
    }
    return 0;
}`
    };

    codeEl.textContent = sources[file] || '// Source file not found.';
  }
};

window.HardwareMonitor = HardwareMonitor;
document.addEventListener('DOMContentLoaded', () => HardwareMonitor.init());
