# iOS Device Context & System API Catalog

**Audience:** App Store third-party apps · **Era:** iOS 18 → iOS 26 (July 2026)  
**Scope:** What developers can actually ship. Restricted / entitlement-gated items are flagged.

| Tag | Meaning |
|-----|---------|
| ✅ | Standard App Store capability |
| ⚠️ | Permission / Info.plist / user friction |
| 🔒 | Special entitlement or Apple approval |
| ❌ | Not available to third parties (or research-only) |
| BG | Usable / wakeable in background under conditions |

---

## 1. Sensors & Hardware

### CoreMotion
- **Signals:** Accelerometer, gyroscope, magnetometer, pedometer, relative altitude, activity type (walk/run/bike/auto/stationary), headphone motion
- **Permission:** ⚠️ Motion & Fitness for pedometer/activity
- **Background:** Limited; not continuous high-rate IMU forever
- **AI angle:** Fuse gait + activity into on-device context embeddings for coaching / adaptive UI

### CoreLocation
- **Signals:** GPS, geofences, significant-change, visit monitoring, iBeacon, Precise vs Approximate
- **Permission:** ⚠️ When In Use / Always; Precise Location toggle
- **Background:** BG with Always + location mode; geofences/visits are energy-efficient wakes
- **AI angle:** Place memory + arrival-triggered agents without uploading a trail

### Camera / AVFoundation / LiDAR / TrueDepth
- **Signals:** Frames, multi-cam, depth maps (Pro LiDAR), face mesh blendshapes (not Face ID templates)
- **Permission:** ⚠️ Camera (+ mic if recording)
- **Background:** Generally foreground
- **AI angle:** Vision + Foundation Models for live scene understanding / spatial notes

### Microphone / Audio
- **Signals:** PCM, levels, route; Sound Analysis classifications
- **Permission:** ⚠️ Microphone (system indicator always shown)
- **Background:** Only with legitimate Audio background mode
- **AI angle:** SpeechAnalyzer + Sound Analysis for ambient events / meeting capture (consented)

### NFC (CoreNFC)
- **Signals:** NDEF / ISO tag sessions
- **Limits:** ❌ No general background NFC; user must present phone to tag
- **AI angle:** Physical object → entity grounding (museum, product, desk tag)

### Bluetooth / Nearby Interaction (UWB)
- **Signals:** BLE GATT; UWB distance/direction (iPhone 11+)
- **Background:** BLE state restoration; UWB BG mainly with paired accessories
- **AI angle:** Object/person presence → context packs; accessory telemetry

### Battery / Thermal / Network
- **Signals:** Battery level, Low Power Mode, `ProcessInfo.thermalState`, `NWPathMonitor`
- **AI angle:** Defer heavy on-device LLM work when hot/low battery; gate cloud vs on-device by path cost

### Not available (consumer App Store)
- Raw ambient light ❌ (SensorKit research only)
- SMS/iMessage/Mail inbox ❌
- Call history / cellular internals ❌
- Face ID / Touch ID templates ❌
- Other apps’ screen contents / raw Screen Time ❌

---

## 2. Personal Data Frameworks

| Framework | What you get | Friction | AI fit |
|-----------|--------------|----------|--------|
| **HealthKit** | Steps, HR, HRV, sleep, workouts, cycles… | Per-type read/write; Review health rules | On-device recovery coaching |
| **EventKit** | Calendar + Reminders | Full / Write Only / Limited | Day briefing agents |
| **Contacts** | Contact graph | Full or Limited Access | Entity resolution (minimize) |
| **Photos / PHPicker** | Assets, metadata | Prefer PHPicker (least privilege) | On-device album storytelling |
| **MusicKit** | Library + catalog | Token + user auth | Mood-aware playlists from context |
| **CloudKit** | Private sync | iCloud account | Sync structured agent memory |
| **FamilyControls / DeviceActivity / ManagedSettings** | Opaque app tokens, shields, schedules | 🔒 Distribution entitlement | Focus coaching without learning app names |
| **Focus filters** | App config when Focus active | User configures in Settings | Auto-suggest Focus from calendar/location |
| **App Intents** | Actions, entities, Siri/Shortcuts/Spotlight | Per-intent + underlying perms | Primary agent surface on modern iOS |

---

## 3. On-Device Intelligence / Apple AI

| Surface | Role |
|---------|------|
| **Core ML** | Custom classifiers on sensor streams |
| **Vision** | OCR, faces, barcodes, documents — tools for LLMs |
| **Natural Language** | Cheap pre-filters (lang, NER, sentiment) |
| **SpeechAnalyzer** | On-device STT (preferred over legacy SFSpeechRecognizer) |
| **Sound Analysis** | Ambient event classification |
| **Translation** | On-device MT |
| **Foundation Models** | On-device Apple Intelligence LM: generation, `@Generable`, tool calling |
| **Writing Tools** | Free rewrite/proofread in standard text views |
| **Visual Intelligence + App Intents** | Appear in system visual search via `IntentValueQuery` |
| **Image Playground** | Generative images without hosting diffusion |

**Rule:** Sense → Understand (Vision/Speech/Sound) → Reason (Foundation Models + tools) → Act (Intents/Controls) → Glance (Widgets/Island/Watch).

---

## 4. Widgets & Glanceable Surfaces

| Surface | Framework | Best for AI |
|---------|-----------|-------------|
| Home / Lock / StandBy widgets | WidgetKit | Next-best-action, daily pulse |
| Live Activities / Dynamic Island | ActivityKit | Bounded agent/gen/coaching progress |
| Control Center / Lock Screen / Action Button | `ControlWidget` | One-tap verbs (listen, capture, start session) |
| App Shortcuts / Spotlight | App Intents + Core Spotlight | Intent-first product; Siri invocation |
| Apple Watch | Complications, Smart Stack, WCSession | Wrist micro-interventions |
| CarPlay widgets (iOS 26) | WidgetKit small | Driver-safe glanceable status |

**Update budgets (practical):**
- Widgets: ~40–70 reloads/day; entries ≥ ~5 min; prefer predicted timelines + optional widget push
- Live Activities: ≤ ~8h active (+ stale window); ContentState ~4KB; prefer APNs priority 5 for routine ticks
- Watch complications: tight push budgets — phase + haptic, not transcripts

---

## 5. Background & Continuous Context

| Mechanism | Use |
|-----------|-----|
| Significant location / geofences / visits | Place-based agent triggers |
| HealthKit background delivery | React to sleep/HR anomalies locally |
| BGAppRefresh / BGProcessing | Nightly on-device summarization when cool/charging |
| DeviceActivityMonitor | 🔒 Usage-threshold interventions |
| Silent / LA / widget push | Hint “new data” → run local model |

---

## 6. Spatial / AR

- **ARKit / RealityKit** — world tracking, mesh, face/body, geotracking
- **RoomPlan** — parametric room scans (Pro LiDAR preferred)
- **Object Capture** — photogrammetry → 3D assets
- **AI angle:** Ground answers in real-world anchors; vertical AR field guides beat horizontal “AR ChatGPT”

---

## 7. Entitlement Hotlist (ship blockers)

| Entitlement | Needed for |
|-------------|------------|
| 🔒 Family Controls (distribution) | Screen Time APIs |
| 🔒 SensorKit | Research sensors |
| 🔒 CarPlay app categories | Full CarPlay apps (widgets/LAs may not need this) |
| ⚠️ Always location, Health, Bluetooth, NFC | Hardware/personal data + Review justification |
| Default Calling / Messaging / Navigation / Translation | iOS 18.2+ default app roles |

---

## Practical context stack for AI apps (2026)

1. **Sense:** CoreMotion + visits/geofences + on-demand mic/camera + HealthKit  
2. **Understand:** Vision / SpeechAnalyzer / SoundAnalysis / NL  
3. **Reason:** Foundation Models (+ tools over App Intents, HealthKit, Vision)  
4. **Act:** App Intents, Controls, Live Activities, ManagedSettings (if entitled)  
5. **Glance:** WidgetKit + Island + Watch  
6. **Respect:** Permission minimization, thermal/battery, Apple Intelligence availability fallbacks  
