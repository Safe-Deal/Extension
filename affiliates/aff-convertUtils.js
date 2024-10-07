/* eslint-disable no-console */
const getDomainFromURL = (url, affName, sourceFile) => {
  let examDomain = url;
  try {
    if (examDomain.endsWith(".")) {
      return examDomain;
    }

    if (examDomain.startsWith("https://") || examDomain.startsWith("http://")) {
      examDomain = examDomain.replace("https://", "http://");
      return new URL(examDomain).hostname.replace("www.", "");
    }
    examDomain = `http://${examDomain}`;
    return new URL(examDomain).hostname.replace("www.", "");
  } catch (e) {
    console.error(`Invalid URL: ${url} | Name: ${affName} | File: ${sourceFile}`.red);
    return "";
  }
};

const addParams = (url, params = [], deleteParams = []) => {
  if (!params || (params.length === 0 && deleteParams.length === 0)) {
    return url;
  }

  const urlObject = new URL(url);

  const paramArray = typeof params === "string" ? [params] : params;

  if (paramArray.length === 0) {
    return `${url}#u=`;
  }

  if (deleteParams.length > 0) {
    deleteParams.forEach((param) => urlObject.searchParams.delete(param));
  }

  paramArray.forEach((param) => {
    const [paramName, paramValue] = param.split("=");
    urlObject.searchParams.delete(paramName);
    urlObject.searchParams.append(paramName, paramValue || "");
  });

  return urlObject.href;
};

const isValidUrl = (urlString) => {
  try {
    // eslint-disable-next-line no-new
    new URL(urlString);
    return true;
  } catch (error) {
    return false;
  }
};

const getValidAffiliateLink = (affiliate, primaryKey, secondaryKey) => {
  const getAffiliateLink = (key) => {
    const link = affiliate[key];
    return link && link.trim() ? link.trim() : null;
  };

  const primaryLink = getAffiliateLink(primaryKey);
  const secondaryLink = getAffiliateLink(secondaryKey);

  return primaryLink || secondaryLink;
};

module.exports = {
  getDomainFromURL,
  addParams,
  isValidUrl,
  getValidAffiliateLink
};
