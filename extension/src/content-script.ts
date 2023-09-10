/* eslint-env browser */

import type { HrefPayload } from "./util.js";

function getCurrentUrlSanitized() {
  const url = new URL(window.location.toString());

  // Delete hash
  url.hash = "";

  // Delete UTM parameters https://en.wikipedia.org/wiki/UTM_parameters#UTM_parameters
  url.searchParams.delete("utm_source");
  url.searchParams.delete("utm_medium");
  url.searchParams.delete("utm_campaign");
  url.searchParams.delete("utm_term");
  url.searchParams.delete("utm_content");

  return url.toString();
}

let currentUrlSanitized = getCurrentUrlSanitized();
const hrefs: Set<string> = new Set();

function sendHrefs() {
  const elements = document.querySelectorAll(":is(link, a)[rel~=me]");

  for (const element of elements) {
    const href = element.getAttribute("href");
    if (href && !hrefs.has(href)) {
      hrefs.add(href);

      const hrefPayload: HrefPayload = {
        HREF_PAYLOAD: {
          tabUrl: currentUrlSanitized,
          href: href,
        },
      };
      browser.runtime.sendMessage(hrefPayload);
    }
  }
}

new MutationObserver(() => {
  const testCurrentUrlSanitized = getCurrentUrlSanitized();
  if (currentUrlSanitized !== testCurrentUrlSanitized) {
    currentUrlSanitized = testCurrentUrlSanitized;
    hrefs.clear();
  }

  sendHrefs();
}).observe(document.documentElement, {
  subtree: true,
  childList: true,
  attributeFilter: ["rel"],
});

sendHrefs();
