const delayInMilliseconds = 100;
const filterKeywordSearch = '#pb-text';
const filterDropdownSelector = '.pb-filter__multi-dropdown';
const dropButtonSelector = 'button.dropbutton__toggle';
const dropButtonItemSelector = 'ul.dropbutton li.secondary-action a';

module.exports = {
  '@tags': ['project_browser'],
  before(browser) {
    browser.drupalInstall().drupalInstallModule('project_browser_test', true);
  },
  after(browser) {
    browser.drupalUninstall();
  },
  'Project browser categories': (browser) => {
    const assertFocus = (selector, message) => {
      browser.execute(
        // eslint-disable-next-line func-names, prefer-arrow-callback, no-shadow
        function (selector) {
          return document.activeElement.matches(selector);
        },
        [selector],
        (result) => {
          browser.assert.ok(result.value, message);
        },
      );
    };
    function sendTabKey() {
      return this.actions().sendKeys(browser.Keys.TAB);
    }
    function sendSpaceKey() {
      return this.actions().sendKeys(browser.Keys.SPACE);
    }
    function sendDownKey() {
      return this.actions().sendKeys(browser.Keys.ARROW_DOWN);
    }
    function sendEscapeKey() {
      return this.actions().sendKeys(browser.Keys.ESCAPE);
    }
    browser.drupalLoginAsAdmin(() => {
      // We are enabling some modules in order to test the follow-up
      // actions for some already installed modules in drupal core.
      browser
        .drupalRelativeURL('/admin/modules')
        .click('[name="modules[package_manager][enable]"]')
        .click('[name="modules[contact][enable]"]')
        .click('[name="modules[help][enable]"]')
        .submitForm('input[type="submit"]')
        .waitForElementVisible(
          '.system-modules-confirm-form input[value="Continue"]',
        )
        .submitForm('input[value="Continue"]')
        .waitForElementVisible('.system-modules', 10000);
      browser
        .drupalRelativeURL('/admin/config/development/project_browser')
        .waitForElementVisible(
          '[data-drupal-selector="edit-allow-ui-install"]',
          delayInMilliseconds,
        )
        .click('[data-drupal-selector="edit-allow-ui-install"]')

        // Wait for the select element and enable it
        .waitForElementVisible(
          '[data-drupal-selector="edit-enabled-sources-drupal-core-status"]',
          delayInMilliseconds,
        )
        .execute(
          (selector) => {
            document.querySelector(selector).removeAttribute('disabled');
          },
          ['[data-drupal-selector="edit-enabled-sources-drupal-core-status"]'],
        )

        .click(
          '[data-drupal-selector="edit-enabled-sources-drupal-core-status"]',
        )
        .click(
          '[data-drupal-selector="edit-enabled-sources-drupal-core-status"] option[value="enabled"]',
        )

        // Click the Save Configuration button
        .waitForElementVisible(
          '[data-drupal-selector="edit-submit"]',
          delayInMilliseconds,
        )
        .click('[data-drupal-selector="edit-submit"]');
      // Open project browser.
      browser
        .drupalRelativeURL('/admin/modules/browse/project_browser_test_mock')
        .waitForElementVisible('h1', delayInMilliseconds)
        .assert.textContains('h1', 'Browse projects')
        .waitForElementVisible(filterDropdownSelector);

      // Use mouse to get to search box, and verify it has active focus.
      browser.click(filterKeywordSearch);
      assertFocus(filterKeywordSearch, 'Assert search box has focus.');

      // Press tab twice to navigate search button.
      browser.perform(sendTabKey).pause(delayInMilliseconds);
      assertFocus(
        '.search__search-submit',
        'Assert that focus moves to search button on tab.',
      );
      browser
        .perform(sendTabKey)
        .pause(delayInMilliseconds)
        .assert.textEquals(
          '.pb-filter__multi-dropdown__label',
          'Select categories',
          'Assert that drop-down label has initial select message.',
        )
        .assert.not.visible(
          '.pb-filter__multi-dropdown__items',
          'Assert that category checkboxes are hidden.',
        );
      assertFocus(
        filterDropdownSelector,
        'Assert that focus moves to category drop-down on tab.',
      );

      // Press space to expand categories drop-down, verify focus moves to first
      // checkbox control.
      browser
        .perform(sendSpaceKey)
        .assert.visible(
          '.pb-filter__multi-dropdown__items',
          'Assert category checkboxes are now visible.',
        )
        .pause(delayInMilliseconds);
      assertFocus(
        '.pb-filter__checkbox__container:first-child .pb-filter__checkbox',
        'Assert that first category checkbox has focus.',
      );

      // Press down arrow key, verify focus moves to next checkbox.
      browser.perform(sendDownKey).pause(delayInMilliseconds);
      assertFocus(
        '.pb-filter__checkbox__container:nth-child(2) .pb-filter__checkbox',
        'Assert that second category checkbox has focus.',
      );

      // Press space key. Verify active checkbox checked.
      browser
        .perform(sendSpaceKey)
        .pause(delayInMilliseconds)
        .assert.selected(
          '.pb-filter__checkbox__container:nth-child(2) .pb-filter__checkbox',
          'Assert second category is selected.',
        );

      // Press escape key. Verify category drop-down closes and focus goes to
      // overall drop-down.
      browser
        .perform(sendEscapeKey)
        .pause(delayInMilliseconds)
        .assert.not.visible(
          '.pb-filter__checkbox',
          'Assert category checkboxes are hidden again.',
        )
        .assert.textEquals(
          '.pb-filter__multi-dropdown__label',
          '1 category selected',
          'Assert that selection count of 1 on drop-down label.',
        );
      assertFocus(
        filterDropdownSelector,
        'Assert that focus is back on drop-down list.',
      );

      // Verify a category lozenge is shown.
      browser.assert.visible(
        '.filter-applied__label',
        'Assert that category lozenge is shown.',
      );

      // Press space to expand categories drop-down again.
      browser
        .perform(sendSpaceKey)
        .pause(delayInMilliseconds)
        .assert.visible(
          '.pb-filter__multi-dropdown__items',
          'Assert category checkboxes are now visible.',
        );

      // Category dropdown should open on second checkbox as selected.
      assertFocus(
        '.pb-filter__checkbox__container:nth-child(2) .pb-filter__checkbox',
        'Assert that second category checkbox has focus.',
      );

      // Press space key. Verify checkbox cleared.
      browser
        .perform(sendSpaceKey)
        .pause(delayInMilliseconds)
        .assert.not.selected(
          '.pb-filter__checkbox__container:nth-child(2) .pb-filter__checkbox',
          'Assert second category is selected.',
        );

      // Press escape to close drop-down.
      browser
        .perform(sendEscapeKey)
        .pause(delayInMilliseconds)
        .assert.textEquals(
          '.pb-filter__multi-dropdown__label',
          'Select categories',
          'Assert that drop-down label has initial select message.',
        )
        .assert.not.visible(
          '.pb-filter__checkbox',
          'Assert category checkboxes are hidden again.',
        );

      // Verify that no category lozenges are shown.
      browser.assert.not.elementPresent(
        '.filter-applied__label',
        'Assert that no filter lozenge is shown.',
      );

      browser
        .drupalRelativeURL('/admin/modules/browse/drupal_core')
        .waitForElementVisible('h1', delayInMilliseconds)
        .assert.textContains('h1', 'Browse projects')
        .waitForElementVisible('#aaa_update_test_title');

      browser
        .setValue('#pb-text', 'contact')
        .waitForElementVisible('button.search__search-submit', 5000)
        .execute(() =>
          document.querySelector('button.search__search-submit').click(),
        )
        .pause(1000)
        .waitForElementVisible('#contact_title', 1000);

      // Directly focus on the security icon.
      browser
        .waitForElementVisible('.pb-project__status-icon-btn', 1000)
        .execute(
          (selector) => {
            const el = document.querySelector(selector);
            if (el) {
              el.focus();
            }
          },
          ['.pb-project__status-icon-btn'],
        );
      // Navigate to maintenance icon.
      browser.perform(sendTabKey).pause(1000);
      // Navigate to installed button.
      browser.perform(sendTabKey).pause(1000);
      // Navigate to Installed button.
      browser.perform(sendTabKey).pause(1000);
      // Navigate to dropdown button.
      browser.perform(sendTabKey).pause(1000);
      assertFocus(dropButtonSelector, 'Assert dropbutton has focus.');

      // Press space to open the dropbutton menu.
      browser.perform(sendSpaceKey).pause(1000);
      browser.assert.visible(
        dropButtonItemSelector,
        'Assert dropbutton menu is visible.',
      );

      // Navigate to first dropbutton item using keyboard.
      browser.perform(sendTabKey).pause(delayInMilliseconds);
      assertFocus(
        'ul.dropbutton li.secondary-action a',
        'Assert first dropbutton item has focus.',
      );
      // Navigate to second dropbutton item using keyboard.
      browser.perform(sendTabKey).pause(delayInMilliseconds);
      assertFocus(
        'ul.dropbutton li.secondary-action a',
        'Assert second dropbutton item has focus.',
      );

      // Press escape to close the dropbutton menu.
      browser.perform(sendEscapeKey).pause(1000);
      assertFocus(
        dropButtonSelector,
        'Assert focus returns to dropbutton after closing.',
      );

      // Close out test.
      browser.drupalLogAndEnd({ onlyOnError: false });
    });
  },
};
