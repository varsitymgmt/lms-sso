function alphaNumericSort(a, b) {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  const a1 = parseInt(a, 10);
  const b1 = parseInt(b, 10);
  if (a1 === b1) {
    return a.localeCompare(b);
  }
  return a1 - b1;
}

function arrayHasValues(array) {
  return array && array.length > 0;
}

function cloneObjectDeeply(object) {
  try {
    return JSON.parse(JSON.stringify(object));
  } catch (e) {
    return {};
  }
}

/**
  @description
    Function to add leading zero to number if the number is single digit
  @param  [String]
  @return [String]
  @author HariKrishna Salver
*/
function convertNumberTo2D(value) {
  return value < 10 ? `0${value}` : value;
}

/**
  @description
    Fuction to delete url param from existing url
  @param [key] [String]
  @return [void]
  @author HariKrishna Salver
*/
function deleteURLParams(key) {
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    url.searchParams.delete(key);
    window.history.replaceState({ path: url.href }, '', url.href);
  }
}

function getCookie(cname) {
  const name = `${cname}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i += 1) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

/**
  @description
    Fuction retrieve url param
  @param [key] [String]
  @return [void]
  @author HariKrishna Salver
*/
function getURLParams(key) {
  if (typeof window !== 'undefined') {
    return new URL(window.location.href).searchParams.get(key);
  }
  return null;
}

function isDefined(value) {
  if (value === undefined || value === null) {
    return false;
  }
  return true;
}

/**
  @description
    Fuction to add ordinalSuffix to the number(ex: 1st st is the ordinalSuffix)
  @param [number] [Integer]
  @author HariKrishna Salver
*/
function ordinalSuffix(number) {
  const length1Reminder = number % 10;
  const length2Reminder = number % 100;
  if (length1Reminder === 1 && length2Reminder !== 11) {
    return `${number}st`;
  }
  if (length1Reminder === 2 && length2Reminder !== 12) {
    return `${number}nd`;
  }
  if (length1Reminder === 3 && length2Reminder !== 13) {
    return `${number}rd`;
  }
  return `${number}th`;
}

function stringSort(a, b) {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

function setDefaultIfInvalid(value) {
  if (isDefined(value)) {
    return value;
  }
  return '-';
}

function setCookie(key, value, expTime, domain) {
  const date = new Date();
  date.setTime(date.getTime() + expTime);
  const expires = `expires=${date.toUTCString()}`;
  let cookie = `${key}=${value};${expires}`;
  if (domain) {
    cookie = `;domain=${domain}`;
  }
  document.cookie = cookie;
}

function convertToFixedDecimal(number, decimal) {
  if (number) {
    return parseFloat(parseFloat(number).toFixed(decimal || 2));
  }
  return setDefaultIfInvalid(number);
}

/**
  @description
    Fuction converts string to TitleCase
  @param  [String]
  @return [String]
  @author HariKrishna Salver
*/
function toCapitalize(str) {
  return str.replace(
    /\w\S*/g,
    txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
  );
}

function toFormatedDate(date) {
  const newDate = new Date(Date.parse(date));
  return newDate.toLocaleDateString();
}

/**
  @description
    Fuction converts date timestamp to dd-mmm-yyyy format
  @param  [String]
  @return [String]
  @author janardhan
*/
function toMonthFormatedDate(date) {
  const newDate = new Date(Date.parse(date));
  return newDate
    .toLocaleDateString('en-au', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    .replace(/\s/g, '-')
    .replace('.', '');
}

/**
  @description
    Fuction to toggle the loader icon
  @param [String] [name]
  @author HariKrishna Salver
*/
function toggleLoader(mode, source) {
  const loader = document.getElementById('loader');
  if (loader) {
    let count = parseInt(loader.getAttribute('count'), 10) || 0;
    if (mode) {
      loader.style.display = 'block';
    } else if (count < 2 && source !== 'client') {
      loader.style.display = 'none';
    } else if (count < 1 && source === 'client') {
      loader.style.display = 'none';
    }
    // console.log(`prev count = ${count} attr = ${loader.getAttribute('count')}`);
    if (source !== 'client') {
      count = mode ? count + 1 : count - 1;
    }
    // console.log(`count = ${count} src = ${source} mode = ${mode ? 't' : 'f'}`);
    loader.setAttribute('count', count);
  }
}

/**
  @description
    Fuction to add url param to existing url
  @param [key] [String]
  @param [value] [String]
  @return [void]
  @author HariKrishna Salver
*/
function updateURLParams(key, value) {
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.replaceState({ path: url.href }, '', url.href);
  }
}

export {
  alphaNumericSort,
  arrayHasValues,
  cloneObjectDeeply,
  convertNumberTo2D,
  convertToFixedDecimal,
  deleteURLParams,
  getCookie,
  getURLParams,
  isDefined,
  ordinalSuffix,
  stringSort,
  setDefaultIfInvalid,
  setCookie,
  toCapitalize,
  toFormatedDate,
  toMonthFormatedDate,
  toggleLoader,
  updateURLParams,
};
