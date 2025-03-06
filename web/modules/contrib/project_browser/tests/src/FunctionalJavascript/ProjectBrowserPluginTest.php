<?php

declare(strict_types=1);

namespace Drupal\Tests\project_browser\FunctionalJavascript;

use Drupal\FunctionalJavascriptTests\WebDriverTestBase;

/**
 * Provides tests for the Project Browser Plugins.
 *
 * @group project_browser
 */
class ProjectBrowserPluginTest extends WebDriverTestBase {

  use ProjectBrowserUiTestTrait;

  // Could be moved into trait under PHP 8.3.
  protected const SECURITY_OPTION_SELECTOR = 'select[name="security_advisory_coverage"] ';
  protected const MAINTENANCE_OPTION_SELECTOR = 'select[name="maintenance_status"] ';
  protected const DEVELOPMENT_OPTION_SELECTOR = 'select[name="development_status"] ';
  protected const OPTION_CHECKED = 'option:checked';
  protected const OPTION_FIRST_CHILD = 'option:first-child';
  protected const OPTION_LAST_CHILD = 'option:last-child';

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'project_browser',
    'project_browser_test',
  ];

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'stark';

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->drupalLogin($this->drupalCreateUser([
      'administer modules',
      'administer site configuration',
    ]));
    $this->config('project_browser.admin_settings')
      ->set('enabled_sources', ['drupal_core', 'project_browser_test_mock'])
      ->save();
  }

  /**
   * Tests paging through results.
   *
   * We want to click through things and make sure that things are functional.
   * We don't care about the number of results.
   */
  public function testPaging(): void {
    $page = $this->getSession()->getPage();
    $assert_session = $this->assertSession();

    // Browse core modules, because there are enough of them to paginate.
    $this->drupalGet('admin/modules/browse/drupal_core');
    // Immediately clear filters so there are enough visible to enable paging.
    $this->svelteInitHelper('test', 'Clear Filters');
    $this->svelteInitHelper('css', '.pager__item--next');
    $assert_session->elementsCount('css', '.pager__item--next', 1);

    $page->find('css', 'a[aria-label="Next page"]')?->click();
    $this->assertNotNull($assert_session->waitForElement('css', '.pager__item--previous'));
    $assert_session->elementsCount('css', '.pager__item--previous', 1);
  }

  /**
   * Tests advanced filtering.
   */
  public function testAdvancedFiltering(): void {
    $this->drupalGet('admin/modules/browse/project_browser_test_mock');
    $this->svelteInitHelper('text', 'Results');

    $this->assertEquals('Show projects covered by a security policy', $this->getElementText(self::SECURITY_OPTION_SELECTOR . self::OPTION_CHECKED));
    $this->assertEquals('Show actively maintained projects', $this->getElementText(self::MAINTENANCE_OPTION_SELECTOR . self::OPTION_CHECKED));
    $this->assertEquals('Show all', $this->getElementText(self::DEVELOPMENT_OPTION_SELECTOR . self::OPTION_CHECKED));

    $page = $this->getSession()->getPage();
    // Clear the security covered filter.
    $page->selectFieldOption('security_advisory_coverage', 'Show all');
    // Set the development status filter.
    $page->selectFieldOption('development_status', 'Show projects under active development');

    // Clear all filters.
    $this->pressWithWait('Clear filters');
    $this->assertEquals('Show all', $this->getElementText(self::SECURITY_OPTION_SELECTOR . self::OPTION_CHECKED));
    $this->assertEquals('Show all', $this->getElementText(self::MAINTENANCE_OPTION_SELECTOR . self::OPTION_CHECKED));
    $this->assertEquals('Show all', $this->getElementText(self::DEVELOPMENT_OPTION_SELECTOR . self::OPTION_CHECKED));

    // Reset to recommended filters.
    $this->pressWithWait('Recommended filters');
    $this->assertEquals('Show projects covered by a security policy', $this->getElementText(self::SECURITY_OPTION_SELECTOR . self::OPTION_CHECKED));
    $this->assertEquals('Show actively maintained projects', $this->getElementText(self::MAINTENANCE_OPTION_SELECTOR . self::OPTION_CHECKED));
    $this->assertEquals('Show all', $this->getElementText(self::DEVELOPMENT_OPTION_SELECTOR . self::OPTION_CHECKED));
  }

  /**
   * Tests broken images.
   */
  public function testBrokenImages(): void {
    $assert_session = $this->assertSession();

    $this->drupalGet('admin/modules/browse/project_browser_test_mock');
    $this->svelteInitHelper('css', 'img[src$="images/puzzle-piece-placeholder.svg"]');

    // RandomData always give an image URL. Sometimes it is a fake URL on
    // purpose so it 404s. This check means that the original image was not
    // found and it was replaced by the placeholder.
    $assert_session->elementExists('css', 'img[src$="images/puzzle-piece-placeholder.svg"]');
  }

  /**
   * Tests the not-compatible flag.
   */
  public function testNotCompatibleText(): void {
    \Drupal::state()->set('project_browser_test_mock isCompatible', FALSE);

    $this->drupalGet('admin/modules/browse/project_browser_test_mock');
    $this->svelteInitHelper('css', '.project_status-indicator');
    $this->assertEquals($this->getElementText('.project_status-indicator .visually-hidden') . ' Not compatible', $this->getElementText('.project_status-indicator'));
  }

  /**
   * Tests the detail page.
   */
  public function testDetailPage(): void {
    $this->drupalGet('admin/modules/browse/project_browser_test_mock');
    $this->assertElementIsVisible('css', '#project-browser .pb-project');
    $this->assertPageHasText('Results');

    $this->assertElementIsVisible('css', '.pb-project .pb-project__title .pb-project__link')
      ->click();
    $this->assertPageHasText('sites report using this module');
  }

}
