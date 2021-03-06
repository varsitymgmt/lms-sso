export class BrowserInfo {
  constructor(name, version, os) {
    this.name = name;
    this.version = version;
    this.os = os;
  }
}
export class NodeInfo {
  constructor(version) {
    this.version = version;
    this.name = 'node';
    this.os = process.platform;
  }
}
export class BotInfo {
  constructor() {
    this.bot = true; // NOTE: deprecated test name instead
    this.name = 'bot';
    this.version = null;
    this.os = null;
  }
}

function createVersionParts(count) {
  const output = [];
  for (let ii = 0; ii < count; ii += 1) {
    output.push('0');
  }
  return output;
}

/* eslint-disable */

// tslint:disable-next-line:max-line-length
const SEARCHBOX_UA_REGEX = /alexa|bot|crawl(er|ing)|facebookexternalhit|feedburner|google web preview|nagios|postrank|pingdom|slurp|spider|yahoo!|yandex/;
const SEARCHBOT_OS_REGEX = /(nuhk)|(Googlebot)|(Yammybot)|(Openbot)|(Slurp)|(MSNBot)|(Ask Jeeves\/Teoma)|(ia_archiver)/;
const REQUIRED_VERSION_PARTS = 3;
const userAgentRules = [
  ['aol', /AOLShield\/([0-9\._]+)/],
  ['edge', /Edge\/([0-9\._]+)/],
  ['yandexbrowser', /YaBrowser\/([0-9\._]+)/],
  ['vivaldi', /Vivaldi\/([0-9\.]+)/],
  ['kakaotalk', /KAKAOTALK\s([0-9\.]+)/],
  ['samsung', /SamsungBrowser\/([0-9\.]+)/],
  ['silk', /\bSilk\/([0-9._-]+)\b/],
  ['miui', /MiuiBrowser\/([0-9\.]+)$/],
  ['beaker', /BeakerBrowser\/([0-9\.]+)/],
  ['edge-chromium', /Edg\/([0-9\.]+)/],
  ['maxthon', /Maxthon\/([0-9\.]+)/],
  [
    'chromium-webview',
    /(?!Chrom.*OPR)wv\).*Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/,
  ],
  ['ucbrowser', /UBrowser\/([0-9\.]+)(:?\s|$)/],
  ['ucbrowser', /UCBrowser\/([0-9\.]+)(:?\s|$)/],
  ['phantomjs', /PhantomJS\/([0-9\.]+)(:?\s|$)/],
  ['crios', /CriOS\/([0-9\.]+)(:?\s|$)/],
  ['firefox', /Firefox\/([0-9\.]+)(?:\s|$)/],
  ['fxios', /FxiOS\/([0-9\.]+)/],
  ['opera-mini', /Opera Mini.*Version\/([0-9\.]+)/],
  ['opera', /Opera\/([0-9\.]+)(?:\s|$)/],
  ['opera', /OPR\/([0-9\.]+)(:?\s|$)/],
  ['ie', /Trident\/7\.0.*rv\:([0-9\.]+).*\).*Gecko$/],
  ['ie', /MSIE\s([0-9\.]+);.*Trident\/[4-7].0/],
  ['ie', /MSIE\s(7\.0)/],
  ['bb10', /BB10;\sTouch.*Version\/([0-9\.]+)/],
  ['android', /Android\s([0-9\.]+)/],
  ['ios', /Version\/([0-9\._]+).*Mobile.*Safari.*/],
  ['safari', /Version\/([0-9\._]+).*Safari/],
  ['facebook', /FBAV\/([0-9\.]+)/],
  ['instagram', /Instagram\s([0-9\.]+)/],
  ['ios-webview', /AppleWebKit\/([0-9\.]+).*Mobile/],
  ['ios-webview', /AppleWebKit\/([0-9\.]+).*Gecko\)$/],
  ['chrome', /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/],
  ['searchbot', SEARCHBOX_UA_REGEX],
];
const operatingSystemRules = [
  ['iOS', /iP(hone|od|ad)/],
  ['Android OS', /Android/],
  ['BlackBerry OS', /BlackBerry|BB10/],
  ['Windows Mobile', /IEMobile/],
  ['Amazon OS', /Kindle/],
  ['Windows 3.11', /Win16/],
  ['Windows 95', /(Windows 95)|(Win95)|(Windows_95)/],
  ['Windows 98', /(Windows 98)|(Win98)/],
  ['Windows 2000', /(Windows NT 5.0)|(Windows 2000)/],
  ['Windows XP', /(Windows NT 5.1)|(Windows XP)/],
  ['Windows Server 2003', /(Windows NT 5.2)/],
  ['Windows Vista', /(Windows NT 6.0)/],
  ['Windows 7', /(Windows NT 6.1)/],
  ['Windows 8', /(Windows NT 6.2)/],
  ['Windows 8.1', /(Windows NT 6.3)/],
  ['Windows 10', /(Windows NT 10.0)/],
  ['Windows ME', /Windows ME/],
  ['Open BSD', /OpenBSD/],
  ['Sun OS', /SunOS/],
  ['Chrome OS', /CrOS/],
  ['Linux', /(Linux)|(X11)/],
  ['Mac OS', /(Mac_PowerPC)|(Macintosh)/],
  ['QNX', /QNX/],
  ['BeOS', /BeOS/],
  ['OS/2', /OS\/2/],
  ['Search Bot', SEARCHBOT_OS_REGEX],
];

/* eslint-enable */

export function detectOS(ua) {
  for (let ii = 0, count = operatingSystemRules.length; ii < count; ii += 1) {
    const [os, regex] = operatingSystemRules[ii];
    const match = regex.test(ua);
    if (match) {
      return os;
    }
  }
  return null;
}

export function parseUserAgent(ua) {
  // opted for using reduce here rather than Array#first with a regex.test call
  // this is primarily because using the reduce we only perform the regex
  // execution once rather than once for the test and for the exec again below
  // probably something that needs to be benchmarked though
  const matchedRule =
    ua !== '' &&
    userAgentRules.reduce((matched, [browser, regex]) => {
      if (matched) {
        return matched;
      }
      const uaMatch = regex.exec(ua);
      return !!uaMatch && [browser, uaMatch];
    }, false);
  if (!matchedRule) {
    return null;
  }
  const [name, match] = matchedRule;
  if (name === 'searchbot') {
    return new BotInfo();
  }
  let versionParts = match[1] && match[1].split(/[._]/).slice(0, 3);
  if (versionParts) {
    if (versionParts.length < REQUIRED_VERSION_PARTS) {
      versionParts = [
        ...versionParts,
        ...createVersionParts(REQUIRED_VERSION_PARTS - versionParts.length),
      ];
    }
  } else {
    versionParts = [];
  }
  return new BrowserInfo(name, versionParts.join('.'), detectOS(ua));
}

export function getNodeVersion() {
  const isNode = typeof process !== 'undefined' && process.version;
  return isNode ? new NodeInfo(process.version.slice(1)) : null;
}

export function detect(userAgent) {
  if (userAgent) {
    return parseUserAgent(userAgent);
  }
  if (typeof navigator !== 'undefined') {
    return parseUserAgent(navigator.userAgent);
  }
  return getNodeVersion();
}
