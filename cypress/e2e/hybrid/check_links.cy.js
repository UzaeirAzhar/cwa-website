const { softAssert, softExpect } = chai;

const noCheckHosts = [
  'developer.apple.com',       // HTTP 403 forbidden issue on GitHub
  'ec.europa.eu',              // HTTP 502 bad gateway
  'health.ec.europa.eu',       // HTTP 502 bad gateway
  'onlinelibrary.wiley.com',   // HTTP 503 service unavailable
  'reopen.europa.eu',          // Timeout - no response
  'support.apple.com',         // Timeout - no response
  'testbuchen.de',             // HTTP 403 permission denied
  'www.instagram.com',         // SSLV3_ALERT_CLOSE_NOTIFY
  'www.t-systems.com'          // HTTP 403 forbidden issue on GitHub
];

context("Check for broken links", () => {
  const pages = ['/de',
    '/en',
    '/de/eventregistration/',
    '/en/eventregistration/',
    '/de/community/',
    '/en/community/',
    '/de/analysis/',
    '/en/analysis/',
    '/de/blog/archiv/',
    '/en/blog/archive/',
    '/de/screenshots/',
    '/en/screenshots/',
    '/de/faq/', '/de/faq/results/',
    '/en/faq/', '/en/faq/results/',
    '/de/rat-partner/',
    '/en/rat-partner/',
    '/de/privacy/',
    '/en/privacy/',
    '/de/terms-of-use/',
    '/en/terms-of-use/',
    '/de/event-qr-code-guide/',
    '/en/event-qr-code-guide/',
    '/de/blog/', '/en/blog/',
    '/de/science/',
    '/en/science/',
    '/de/simple-language/',
    '/en/simple-language/',
    '/de/sign-language/',
    '/en/sign-language/',
    '/de/sitemap/',
    '/en/sitemap/'
  ];

  it('Check if txt results exist', () => {
    cy.writeFile("cypress/logs/broken_links_result.txt", "==================== Broken links ====================\n");
  });
  pages.forEach(page => {
    it(`"${page}" - Check for broken links`, () => {
      cy.visit({ log: false, url: page });
      cy.get("a:not([href*='mailto:'],[href*='tel:'],[href*='#'])").not('.email').each(url => {
        if (url.prop('href') && !noCheckHosts.includes(url.prop('hostname'))) {
          cy.request({
            failOnStatusCode: false,
            log: false,
            url: url.prop('href')
          }).then((response) => {
            softExpect(response.status == 200 || response.status == 429 ? true : false, "Link: " + url.prop('href')).to.eq(true);
            if (response.status != 200 && response.status != 429) {
              cy.readFile("cypress/logs/broken_links_result.txt")
                .then((text) => {
                  cy.writeFile("cypress/logs/broken_links_result.txt", `${text}\n[RESPONSE ${response.status}] ${url.prop('href')} hostname: ${url.prop('hostname')} on '${page}' `, { flags: 'as+' });
                });
            }
          });
        }
      });
    });
  });
});

context("Check for broken links on entries", () => {
  const subpages = ['/de/blog/', '/en/blog/', '/de/science/', '/en/science/'];
  const pagesToAvoid = ['/de/blog/', '/en/blog/', '/de/science/', '/en/science/', '/de/blog/archiv', '/en/blog/archive'];

  subpages.forEach(sub => {
    it(`"${sub}" entries - Check for broken links`, () => {
      cy.visit({ log: false, url: sub });
      cy.get("a:not([href*='mailto:'],[href*='tel:'],[href*='#'])").not('.email').each(url => {
        if (url.prop('href').includes('localhost') && url.prop('href').includes(sub) && !pagesToAvoid.includes(url.prop('href').replace('http://localhost:8000', ''))) {
          cy.visit({ log: false, url: url.prop('href') });
          cy.get("main a:not([href*='mailto:'],[href*='tel:'])").not('.email').each(entry => {
            if (entry.prop('href') && !noCheckHosts.includes(entry.prop('hostname'))) {
              cy.request({
                failOnStatusCode: false,
                log: false,
                url: entry.prop('href')
              }).then((response) => {
                softExpect(response.status == 200 || response.status == 429 ? true : false, "Link: " + entry.prop('href')).to.eq(true);
                if (response.status != 200 && response.status != 429) {
                  cy.readFile("cypress/logs/broken_links_result.txt")
                    .then((text) => {
                      cy.writeFile("cypress/logs/broken_links_result.txt", `${text}\n[RESPONSE ${response.status}] ${entry.prop('href')} hostname: ${entry.prop('hostname')} on '${url.prop('href')}' `, { flags: 'as+' });
                    });
                }
              });
            }
          });
        }
      });
    });
  });
});
