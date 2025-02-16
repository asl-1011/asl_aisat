export async function getDeviceInfo() {
    if (typeof window === "undefined") return {}; // Prevents execution during SSR
  
    if ("userAgentData" in navigator) {
      try {
        const uaHints = await navigator.userAgentData.getHighEntropyValues([
          "platform",
          "platformVersion",
          "architecture",
          "model",
          "uaFullVersion",
        ]);
  
        return {
          platform: uaHints.platform || "Unknown",
          platformVersion: uaHints.platformVersion || "Unknown",
          architecture: uaHints.architecture || "Unknown",
          model: uaHints.model || "Unknown",
          browserVersion: uaHints.uaFullVersion || "Unknown",
          isMobile: navigator.userAgentData.mobile || false,
          brands:
            navigator.userAgentData.brands
              .map((brand) => `${brand.brand} ${brand.version}`)
              .join(", ") || "Unknown",
        };
      } catch (err) {
        console.error("Error fetching UA-CH data:", err);
      }
    }
  
    return fallbackDeviceInfo();
  }
  
  // Fallback for older browsers that don't support `userAgentData`
  function fallbackDeviceInfo() {
    if (typeof window === "undefined") return {}; // Prevent SSR errors
  
    const userAgent = navigator.userAgent.toLowerCase();
  
    return {
      platform: "Unknown",
      details: parseUserAgent(userAgent),
      isMobile: /mobi|android|iphone|ipad|ipod/.test(userAgent),
      brands: "Unknown",
      browserVersion: "Unknown",
    };
  }
  
  // Parses `userAgent` for fallback method
  function parseUserAgent(userAgent) {
    if (userAgent.includes("android")) return "Android Device";
    if (userAgent.includes("iphone") || userAgent.includes("ipad") || userAgent.includes("ipod")) return "iOS Device";
    if (userAgent.includes("linux")) return "Linux Device";
    if (userAgent.includes("windows")) return "Windows Device";
    if (userAgent.includes("macintosh")) return "Mac OS Device";
    return "Unknown Device";
  }
  
  export function getNetworkInfo() {
    const connection = navigator.connection || {};
    return {
      effectiveType: connection.effectiveType || 'Unknown',
      downlink: connection.downlink || 'Unknown',
      rtt: connection.rtt || 'Unknown',
      saveData: connection.saveData ? 'Yes' : 'No',
      type: connection.type || 'Unknown',
    };
  }
  
  let batteryCache = null;
  export async function getBatteryInfo() {
    try {
      if (!batteryCache && navigator.getBattery) {
        batteryCache = await navigator.getBattery();
      }
      if (batteryCache) {
        return {
          charging: batteryCache.charging ? 'Yes' : 'No',
          level: `${(batteryCache.level * 100).toFixed(2)}%`,
          chargingTime: batteryCache.chargingTime === Infinity ? 'Full' : `${batteryCache.chargingTime} sec`,
          dischargingTime: batteryCache.dischargingTime === Infinity ? 'Not available' : `${batteryCache.dischargingTime} sec`,
        };
      }
    } catch (error) {
      console.error('Error fetching battery info:', error);
    }
    return {};
  }
  
  export async function getClientIp() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      return response.ok ? await response.json() : {};
    } catch (error) {
      console.error('Error fetching IP address:', error);
      return {};
    }
  }
  
  export function getPluginsInfo() {
    return navigator.plugins ? [...navigator.plugins].map(plugin => ({
      name: plugin.name,
      description: plugin.description,
      filename: plugin.filename,
    })) : [];
  }
  
  export function getLanguageInfo() {
    return {
      language: navigator.language,
      languages: navigator.languages.join(', '),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }
  
  export function getGeolocation() {
    return new Promise(resolve => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          position => resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          }),
          () => resolve({})
        );
      } else {
        resolve({});
      }
    });
  }
  
  export function getStorageInfo() {
    return {
      localStorage: localStorage.length,
      sessionStorage: sessionStorage.length,
      cookies: document.cookie ? document.cookie.split(';').filter(Boolean).length : 0,
    };
  }
  
  export function getScreenInfo() {
    return {
      screenWidth: screen.width,
      screenHeight: screen.height,
      screenOrientation: screen.orientation?.type || 'Unknown',
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      availableWidth: screen.availWidth,
      availableHeight: screen.availHeight,
    };
  }
  
  export function getHardwareInfo() {
    return {
      cpuCores: navigator.hardwareConcurrency || 'Not available',
    };
  }
  
  export async function getMediaInfo() {
    try {
      const devices = await navigator.mediaDevices?.enumerateDevices();
      return devices ? devices.map(device => ({
        kind: device.kind,
        label: device.label || 'Unknown',
        deviceId: device.deviceId,
      })) : [];
    } catch {
      return [];
    }
  }
  
  export function getAppInfo() {
    return {
      appCacheStatus: 'applicationCache' in window ? window.applicationCache.status : 'Not available',
    };
  }
  
  export async function getAllDeviceData() {
    return Promise.allSettled([
      getDeviceInfo(),
      getNetworkInfo(),
      getBatteryInfo(),
      getClientIp(),
      getPluginsInfo(),
      getLanguageInfo(),
      getGeolocation(),
      getStorageInfo(),
      getScreenInfo(),
      getHardwareInfo(),
      getMediaInfo(),
      getAppInfo(),
    ]).then(results =>
      results.reduce((acc, res, i) => {
        const keys = [
          'deviceInfo',
          'networkInfo',
          'batteryInfo',
          'clientIp',
          'pluginsInfo',
          'languageInfo',
          'geolocationInfo',
          'storageInfo',
          'screenInfo',
          'hardwareInfo',
          'mediaInfo',
          'appInfo',
        ];
        acc[keys[i]] = res.status === 'fulfilled' ? res.value : {};
        return acc;
      }, {})
    );
  }