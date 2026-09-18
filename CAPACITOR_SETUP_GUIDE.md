# Capacitor Mobile App Guide (React + Vite to Android APK & Google Play Store)

Complete handbook for wrapping existing React + Vite + TypeScript web applications (Customer, Technician, Partner) in Capacitor to run natively on Android, test on physical devices, and publish to the Google Play Store.

---

## 1. Prerequisites (Setup Once)

> [!IMPORTANT]
> Must be installed on your machine before running native builds:
> 1. **Android Studio** → https://developer.android.com/studio
> 2. **JDK 17+ / JBR** (bundled inside Android Studio at `D:\Android-studio\jbr` or `C:\Program Files\Android\Android Studio\jbr`)
> 3. After installation, open Android Studio once to download the Android SDK (API 34/35) and platform tools.
> 4. `ANDROID_HOME` environment variable pointing to your SDK path (typically `%LOCALAPPDATA%\Android\Sdk`).

---

## 2. All Capacitor CLI Commands Reference

| Command | What it does | When to run it |
| :--- | :--- | :--- |
| `npx cap init [name] [id] --web-dir=dist` | Creates `capacitor.config.ts` with app name and package ID. | **Only once** at project creation. |
| `npx cap add android` | Generates the native Android project container inside `android/`. | **Only once** per app. |
| `npx cap copy android` | Copies compiled `dist/` web assets into Android's native assets folder. | After running `npm run build`. |
| `npx cap update android` | Updates native Gradle plugins when a Capacitor plugin is installed. | After `npm install @capacitor/<plugin>`. |
| `npx cap sync android` | **Runs both `copy` + `update` together in one command.** | **Every time** you change frontend code or install plugins. |
| `npx cap open android` | Launches the `android/` project inside **Android Studio**. | To debug, test on phone, or build release APK/AAB. |
| `npx cap run android` | Builds and boots the app on a connected USB/wireless device via CLI. | For quick command-line testing. |
| `npx cap doctor` | Runs health check on Android SDK, JDK, and toolchain configurations. | When diagnosing build errors. |

---

## 3. Step-by-Step Initial Setup (One-Time)

### Step 1: Install Core Packages
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### Step 2: Initialize Configuration
```bash
npx cap init "Assure" "com.assuretechnologies.customer" --web-dir=dist
```

In `capacitor.config.ts`:
```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.assuretechnologies.customer',
  appName: 'Assure',
  webDir: 'dist',
  server: {
    // During local HTTP/IP testing:
    androidScheme: 'http',
    cleartext: true
    // When live backend is ready (HTTPS):
    // androidScheme: 'https'
  }
};

export default config;
```

### Step 3: Configure Mobile Meta Tags in `index.html`
Add safe-area and mobile webview meta tags inside `<head>`:
```html
<meta name="theme-color" content="#0076A8" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

### Step 4: Build Web Assets & Add Android Container
```bash
npm run build
npx cap add android
```

### Step 5: Add Convenient npm Scripts in `package.json`
```json
"scripts": {
  "cap:build": "npm run build && npx cap sync android",
  "cap:sync": "npx cap sync android",
  "cap:open": "npx cap open android"
}
```

---

## 4. Daily Development vs. Live Production Workflows

### Scenario A: Daily React / UI Development
Whenever you edit React components, CSS, or routes:
```bash
npm run cap:build
```
Then in Android Studio, click **Run (▶️)** to push the changes to your phone/emulator.

---

### Scenario B: Switching to the Live Production Backend
When your backend is live on the internet (`https://assuretech.chenchala.com`):

1. **Update `.env.production`**:
   ```env
   VITE_API_BASE_URL=https://assuretech.chenchala.com
   ```
2. **Set HTTPS Scheme in `capacitor.config.ts`**:
   ```ts
   server: {
     androidScheme: 'https'
   }
   ```
3. **Remove Cleartext Traffic in `android/app/src/main/AndroidManifest.xml`**:
   Remove or set to false:
   ```xml
   android:usesCleartextTraffic="false"
   ```
4. **Compile & Sync**:
   ```bash
   npm run cap:build
   ```
5. **Open Android Studio to Generate Signed Release**:
   ```bash
   npx cap open android
   ```

---

## 5. Google Play Store Launch Checkpoints

To publish your app to the Google Play Store without rejections, ensure each checkpoint below is met:

### A. Technical Checkpoints
- [ ] **Android App Bundle (.aab)**: Google Play requires `.aab` format (not `.apk`). Built via Android Studio > **Build** > **Generate Signed Bundle / APK**.
- [ ] **Target Android SDK 34/35**: Must target the latest Android SDK version (handled in `android/variables.gradle`).
- [ ] **App Versioning (`android/app/build.gradle`)**:
  - `versionCode`: Integer incremented on every release (e.g. `1`, `2`, `3`).
  - `versionName`: User-facing version string (e.g. `"1.0.0"`).
- [ ] **Upload Keystore (`.jks`)**:
  - Generated when creating your signed bundle.
  - **CRITICAL**: Store your `.jks` file, key alias, and passwords in secure backup storage. If lost, you cannot update your app on the Play Store.
- [ ] **HTTPS Enforced**: All API calls must route through valid SSL (`https://`).

### B. App Branding & Store Assets
- [ ] **Store App Icon**: `512 x 512 px`, 32-bit PNG (no transparency, max 1MB).
- [ ] **Adaptive Device Icons**: Foreground and background layers generated in `android/app/src/main/res/mipmap-*`.
  - Automatic generation tool: `npx @capacitor/assets generate --android`
- [ ] **Splash Screen**: Configured via `@capacitor/splash-screen` to prevent white flicker on app startup.
- [ ] **Feature Graphic**: `1024 x 500 px`, JPG or 24-bit PNG (max 15MB). Appears at the top of your Play Store listing.
- [ ] **Phone Screenshots**: Minimum 2 (recommended 4–8), min 1080px resolution, 16:9 or 9:16 aspect ratio.

### C. Mandatory Legal & Policy Requirements
- [ ] **Privacy Policy URL**: A live, public webpage (e.g. `https://assuretech.chenchala.com/privacy-policy`) describing what user data is collected and how it is used.
- [ ] **Account & Data Deletion (Google Policy)**:
  - Any app allowing user registration must provide a visible way for users to delete their account and associated data.
  - Must provide both an in-app button (e.g. Profile > Delete Account) and a public web URL for account deletion requests.
- [ ] **Data Safety Form**: Completed in Play Console declaring data collected (Name, Phone, Email, Location, Payment info via Razorpay).
- [ ] **Payment Policy Compliance**:
  - Physical goods and on-site physical services (networking, smart locks, CCTV, drone spray) are **100% permitted to use third-party gateways like Razorpay**.
  - Google Play In-App Billing (30% fee) is only required for digital-only goods.

### D. Google Play Console Account Setup
- [ ] **Organization / Company Account**: Requires business registration and **D-U-N-S Number**. Enables direct production rollout upon approval.
- [ ] **Personal / Individual Account**: Requires **20 closed testers for at least 14 continuous days** before Google permits production publication.
- [ ] **Testing Track Sequence**:
  1. **Internal Testing**: Immediate team distribution with zero Google review delay.
  2. **Closed Testing**: Verify payment flows, authentication, and notifications on real user devices.
  3. **Production Track**: Submit final build for Google Play Review (takes 24–72 hours).

---

## 6. Android Configuration & Version Management

Key native files that control your app's name, versioning, SDK levels, and permissions:

### A. App Name & Display Titles (`strings.xml`)
- **File Location**: [`android/app/src/main/res/values/strings.xml`](file:///d:/AssureTechnologies/Assure-frontend/android/app/src/main/res/values/strings.xml)
```xml
<?xml version='1.0' encoding='utf-8'?>
<resources>
    <!-- Change this text to change the name displayed below the icon on user phones -->
    <string name="app_name">Assure</string>
    <string name="title_activity_main">Assure</string>
    <string name="package_name">com.assuretechnologies.customer</string>
    <string name="custom_url_scheme">com.assuretechnologies.customer</string>
</resources>
```

---

### B. App Versioning & Package ID (`android/app/build.gradle`)
- **File Location**: [`android/app/build.gradle`](file:///d:/AssureTechnologies/Assure-frontend/android/app/build.gradle)

```groovy
android {
    namespace = "com.assuretechnologies.customer"
    compileSdk = rootProject.ext.compileSdkVersion
    defaultConfig {
        applicationId "com.assuretechnologies.customer"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        
        // --- Version Settings for Releases ---
        versionCode 1          // MUST be incremented by +1 on EVERY Play Store release (1 -> 2 -> 3)
        versionName "1.0"      // Human-readable version shown to customers (e.g. "1.0.0", "1.0.1")
        ...
    }
}
```

> [!IMPORTANT]
> **Play Store Rule:** Google Play Console will reject an uploaded bundle if the `versionCode` is the same as or lower than an already uploaded build. You must bump `versionCode` by at least `1` for each store release.

---

### C. Android SDK Versions (`android/variables.gradle`)
- **File Location**: [`android/variables.gradle`](file:///d:/AssureTechnologies/Assure-frontend/android/variables.gradle)

```groovy
ext {
    minSdkVersion = 24       // Android 7.0 (covers ~98%+ of all Android devices in the world)
    compileSdkVersion = 36   // Android 15/16 ready
    targetSdkVersion = 36    // Exceeds Google Play minimum requirement (>= 34)
}
```

---

### D. App Permissions & Network Traffic (`AndroidManifest.xml`)
- **File Location**: [`android/app/src/main/AndroidManifest.xml`](file:///d:/AssureTechnologies/Assure-frontend/android/app/src/main/AndroidManifest.xml)

```xml
<application
    android:allowBackup="true"
    android:icon="@mipmap/ic_launcher"
    android:label="@string/app_name"
    android:roundIcon="@mipmap/ic_launcher_round"
    android:supportsRtl="true"
    android:usesCleartextTraffic="true" <!-- Keep "true" for local HTTP dev; remove or set "false" for live HTTPS production -->
    android:theme="@style/AppTheme">
    ...
</application>

<!-- Keep permissions minimal to pass Google Play review quickly -->
<uses-permission android:name="android.permission.INTERNET" />
```

---

## 7. Quick Command Cheat Sheet

```bash
# 1. Day-to-day code update:
npm run cap:build

# 2. Add native plugins (camera, geolocation, etc.):
npm install @capacitor/camera
npx cap sync android

# 3. Open in Android Studio to test or generate AAB:
npm run cap:open

# 4. Generate all mobile icon and splash screen assets:
npx @capacitor/assets generate --android
```

