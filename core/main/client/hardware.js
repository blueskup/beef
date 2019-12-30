//
// Copyright (c) 2006-2020 Wade Alcorn - wade@bindshell.net
// Browser Exploitation Framework (BeEF) - http://beefproject.com
// See the file 'doc/COPYING' for copying permission
//

/**
 * @namespace beef.hardware
 */

beef.hardware = {

  ua: navigator.userAgent,

  /**
   * @return {String} CPU type
   */
  getCpuArch: function() {
    var arch = 'UNKNOWN';
    // note that actually WOW64 means IE 32bit and Windows 64 bit. we are more interested
    // in detecting the OS arch rather than the browser build
    if (navigator.userAgent.match('(WOW64|x64|x86_64)') || navigator.platform.toLowerCase() == "win64"){
      arch = 'x86_64';
    }else if(typeof navigator.cpuClass != 'undefined'){
      switch (navigator.cpuClass) {
        case '68K':
          arch = 'Motorola 68K';
          break;
        case 'PPC':
          arch = 'Motorola PPC';
          break;
        case 'Digital':
          arch = 'Alpha';
          break;
        default:
          arch = 'x86';
      }
    }
    // TODO we can infer the OS is 64 bit, if we first detect the OS type (os.js).
    // For example, if OSX is at least 10.7, most certainly is 64 bit.
    return arch;
  },

  /**
   * Returns number of CPU cores
   * @return {String}
   */
  getCpuCores: function() {
    var cores = 'unknown';
    try {
      if(typeof navigator.hardwareConcurrency != 'undefined') {
        cores = navigator.hardwareConcurrency;
      }
    } catch(e) {
      cores = 'unknown';
    }
    return cores;
  },

  /**
   * Returns CPU details
   * @return {String}
   */
  getCpuDetails: function() {
    return {
      arch: beef.hardware.getCpuArch(),
      cores: beef.hardware.getCpuCores()
    }
  },

  /**
   * Returns GPU details
   * @return {object}
   */
  getGpuDetails: function() {
    var gpu = 'unknown';
    var vendor = 'unknown';
    // use canvas technique:
    // https://github.com/Valve/fingerprintjs2
    // http://codeflow.org/entries/2016/feb/10/webgl_debug_renderer_info-extension-survey-results/
    try {
      var getWebglCanvas = function () {
        var canvas = document.createElement('canvas')
        var gl = null
        try {
          gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        } catch (e) { }
        if (!gl) { gl = null }
        return gl;
      }

      var glContext = getWebglCanvas();
      var extensionDebugRendererInfo = glContext.getExtension('WEBGL_debug_renderer_info');
      var gpu = glContext.getParameter(extensionDebugRendererInfo.UNMASKED_RENDERER_WEBGL);
      var vendor = glContext.getParameter(extensionDebugRendererInfo.UNMASKED_VENDOR_WEBGL);
      beef.debug("GPU: " + gpu + " - Vendor: " + vendor);
    } catch (e) {
      beef.debug('Failed to detect WebGL renderer: ' + e.toString());
    }
    return {
      gpu: gpu,
      vendor: vendor
    }
  },

  /**
   * Returns RAM (GiB)
   * @return {String}
   */
  getMemory: function() {
    var memory = 'unknown';
    try {
      if(typeof navigator.deviceMemory != 'undefined') {
        memory = navigator.deviceMemory;
      }
    } catch(e) {
      memory = 'unknown';
    }
    return memory;
  },

  /**
   * Returns battery details
   * @return {Object}
   */
  getBatteryDetails: function() {
    var battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery;

    if (!!battery) {
      return {
        chargingStatus: battery.charging,
        batteryLevel: battery.level * 100 + "%",
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime
      }
    } else {
      return {
        chargingStatus: 'unknown',
        batteryLevel: 'unknown',
        chargingTime: 'unknown',
        dischargingTime: 'unknown'
      }
    }
  },

  /**
   * Returns zombie screen size and color depth.
   * @return {Object}
   */
  getScreenSize: function () {
    return {
      width: window.screen.width,
      height: window.screen.height,
      colordepth: window.screen.colorDepth
    }
  },

  /**
   * Is touch enabled?
   * @return {Boolean} true or false.
   */
  isTouchEnabled: function() {
    if ('ontouchstart' in document) return true;
    return false;
  },

  /**
   * Is virtual machine?
   * @return {Boolean} true or false.
   */
  isVirtualMachine: function() {
    if (this.getGpuDetails().vendor.match('VMware, Inc'))
      return true;

    if (this.isMobileDevice())
      return false;

    // if the screen resolution is uneven, and it's not a known mobile device
    // then it's probably a VM
    if (screen.width % 2 || screen.height % 2)
      return true;

    return false;
  },

  /**
   * Is a Laptop?
   * @return {Boolean} true or false.
   */
  isLaptop: function() {
    if (this.isMobileDevice()) return false;
    // Most common laptop screen resolution
    if (screen.width == 1366 && screen.height == 768) return true;
    // Netbooks
    if (screen.width == 1024 && screen.height == 600) return true;
    return false;
  },

  /**
   * Is Nokia?
   * @return {Boolean} true or false.
   */
  isNokia: function() {
    return (this.ua.match('(Maemo Browser)|(Symbian)|(Nokia)|(Lumia )')) ? true : false;
  },

  /**
   * Is Zune?
   * @return {Boolean} true or false.
   */
  isZune: function() {
    return (this.ua.match('ZuneWP7')) ? true : false;
  },

  /**
   * Is HTC?
   * @return {Boolean} true or false.
   */
  isHtc: function() {
    return (this.ua.match('HTC')) ? true : false;
  },

  /**
   * Is Ericsson?
   * @return {Boolean} true or false.
   */
  isEricsson: function() {
    return (this.ua.match('Ericsson')) ? true : false;
  },

  /**
   * Is Motorola?
   * @return {Boolean} true or false.
   */
  isMotorola: function() {
    return (this.ua.match('Motorola')) ? true : false;
  },

  /**
   * Is Google?
   * @return {Boolean} true or false.
   */
  isGoogle: function() {
    return (this.ua.match('Nexus One')) ? true : false;
  },

  /**
   * Returns true if the browser is on a Mobile device
   * @return {Boolean} true or false
   *
   * @example: if(beef.hardware.isMobileDevice()) { ... }
   */
  isMobileDevice: function() {
    return MobileEsp.DetectMobileQuick();
  },

  /**
   * Returns true if the browser is on a game console
   * @return {Boolean} true or false
   *
   * @example: if(beef.hardware.isGameConsole()) { ... }
   */
  isGameConsole: function() {
    return MobileEsp.DetectGameConsole();
  },

  getName: function() {
    var ua = navigator.userAgent.toLowerCase();
    if(MobileEsp.DetectIphone())              { return "iPhone"};
    if(MobileEsp.DetectIpod())                { return "iPod Touch"};
    if(MobileEsp.DetectIpad())                { return "iPad"};
    if (this.isHtc())               { return 'HTC'};
    if (this.isMotorola())          { return 'Motorola'};
    if (this.isZune())              { return 'Zune'};
    if (this.isGoogle())            { return 'Google Nexus One'};
    if (this.isEricsson())          { return 'Ericsson'};
    if(MobileEsp.DetectAndroidPhone())        { return "Android Phone"};
    if(MobileEsp.DetectAndroidTablet())       { return "Android Tablet"};
    if(MobileEsp.DetectS60OssBrowser())       { return "Nokia S60 Open Source"};
    if(ua.search(MobileEsp.deviceS60) > -1)   { return "Nokia S60"};
    if(ua.search(MobileEsp.deviceS70) > -1)   { return "Nokia S70"};
    if(ua.search(MobileEsp.deviceS80) > -1)   { return "Nokia S80"};
    if(ua.search(MobileEsp.deviceS90) > -1)   { return "Nokia S90"};
    if(ua.search(MobileEsp.deviceSymbian) > -1)   { return "Nokia Symbian"};
    if (this.isNokia())             { return 'Nokia'};
    if(MobileEsp.DetectWindowsPhone7())       { return "Windows Phone 7"};
    if(MobileEsp.DetectWindowsPhone8())       { return "Windows Phone 8"};
    if(MobileEsp.DetectWindowsPhone10())      { return "Windows Phone 10"};
    if(MobileEsp.DetectWindowsMobile())       { return "Windows Mobile"};
    if(MobileEsp.DetectBlackBerryTablet())    { return "BlackBerry Tablet"};
    if(MobileEsp.DetectBlackBerryWebKit())    { return "BlackBerry OS 6"};
    if(MobileEsp.DetectBlackBerryTouch())     { return "BlackBerry Touch"};
    if(MobileEsp.DetectBlackBerryHigh())      { return "BlackBerry OS 5"};
    if(MobileEsp.DetectBlackBerry())          { return "BlackBerry"};
    if(MobileEsp.DetectPalmOS())              { return "Palm OS"};
    if(MobileEsp.DetectPalmWebOS())           { return "Palm Web OS"};
    if(MobileEsp.DetectGarminNuvifone())      { return "Gamin Nuvifone"};
    if(MobileEsp.DetectArchos())              { return "Archos"}
    if(MobileEsp.DetectBrewDevice())          { return "Brew"};
    if(MobileEsp.DetectDangerHiptop())        { return "Danger Hiptop"};
    if(MobileEsp.DetectMaemoTablet())         { return "Maemo Tablet"};
    if(MobileEsp.DetectSonyMylo())            { return "Sony Mylo"};
    if(MobileEsp.DetectAmazonSilk())          { return "Kindle Fire"};
    if(MobileEsp.DetectKindle())              { return "Kindle"};
    if(MobileEsp.DetectSonyPlaystation())                 { return "Playstation"};
    if(ua.search(MobileEsp.deviceNintendoDs) > -1)        { return "Nintendo DS"};
    if(ua.search(MobileEsp.deviceWii) > -1)               { return "Nintendo Wii"};
    if(ua.search(MobileEsp.deviceNintendo) > -1)          { return "Nintendo"};
    if(MobileEsp.DetectXbox())                            { return "Xbox"};
    if(this.isLaptop())                         { return "Laptop"};
    if(this.isVirtualMachine())                 { return "Virtual Machine"};

    return 'Unknown';
  }
};

beef.regCmp('beef.hardware');
