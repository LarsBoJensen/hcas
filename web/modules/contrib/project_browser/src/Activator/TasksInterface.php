<?php

declare(strict_types=1);

namespace Drupal\project_browser\Activator;

use Drupal\project_browser\ProjectBrowser\Project;

/**
 * An interface for activators that can expose follow-up tasks for a project.
 */
interface TasksInterface extends ActivatorInterface {

  /**
   * Returns a set of follow-up tasks for a project.
   *
   * Tasks are exposed as simple links, but could link anywhere. Examples:
   * - The configuration form for a module.
   * - A setup wizard or dashboard created by a recipe.
   * - An uninstall confirmation form for a module.
   * - ...etc.
   *
   * @param \Drupal\project_browser\ProjectBrowser\Project $project
   *   A project object.
   *
   * @return \Drupal\Core\Link[]
   *   An array of follow-up task links for the project.
   */
  public function getTasks(Project $project): array;

}
