(function (global) {
    "use strict";
  
    function DeviceInfo() {
      this.fetchDeviceInfo = function (callback) {
        if ("userAgentData" in navigator) {
          navigator.userAgentData
            .getHighEntropyValues(["platform", "platformVersion", "architecture", "model", "uaFullVersion"])
            .then((uaHints) => {
              callback({
                platform: uaHints.platform || "Unknown",
                platformVersion: uaHints.platformVersion || "Unknown",
                architecture: uaHints.architecture || "Unknown",
                model: uaHints.model || "Unknown",
                browserVersion: uaHints.uaFullVersion || "Unknown",
                isMobile: navigator.userAgentData.mobile || false,
                brands: navigator.userAgentData.brands
                  .map((brand) => `${brand.brand} ${brand.version}`)
                  .join(", ") || "Unknown",
              });
            })
            .catch(() => {
              callback(fallbackDeviceInfo());
            });
        } else {
          callback(fallbackDeviceInfo());
        }
      };
  
      function fallbackDeviceInfo() {
        const platform = navigator.platform || "Unknown";
        return {
          platform,
          isMobile: /Mobi|Android/i.test(platform),
          browserVersion: "Unknown",
          brands: "Unknown",
        };
      }
    }
  
    global.DeviceInfo = DeviceInfo;
  })(window);
  