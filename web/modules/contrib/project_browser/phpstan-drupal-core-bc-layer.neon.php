<?php

/**
 * @file
 * Allows for specific PHPStan ignores for different versions of Drupal core.
 */

declare(strict_types = 1);

use Drupal\Core\Recipe\Recipe;

$includes = [];
if (method_exists(Recipe::class, 'getExtra')) {
  $includes[] = 'phpstan-baseline-getExtras.neon';
}
else {
  $includes[] = 'phpstan-baseline-no-getExtras.neon';
}

$config = [];
$config['includes'] = $includes;
return $config;
