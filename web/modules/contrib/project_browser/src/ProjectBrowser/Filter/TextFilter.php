<?php

declare(strict_types=1);

namespace Drupal\project_browser\ProjectBrowser\Filter;

/**
 * Defines a filter that matches some text.
 */
final class TextFilter extends FilterBase {

  public function __construct(public string $value, mixed ...$arguments) {
    parent::__construct(...$arguments);
  }

}
