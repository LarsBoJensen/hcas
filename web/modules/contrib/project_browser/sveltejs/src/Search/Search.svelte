<script>
  import { createEventDispatcher, getContext } from 'svelte';
  import FilterApplied from './FilterApplied.svelte';
  import BooleanFilter from '../Filter/BooleanFilter.svelte';
  import MultipleChoiceFilter from '../Filter/MultipleChoiceFilter.svelte';
  import TextFilter from '../Filter/TextFilter.svelte';
  import SearchSort from './SearchSort.svelte';

  const { Drupal } = window;
  const dispatch = createEventDispatcher();
  const sort = getContext('sort');
  const filters = getContext('filters');

  export let refreshLiveRegion;

  export let filterDefinitions;
  export let sorts;

  if (!($sort in sorts)) {
    // eslint-disable-next-line prefer-destructuring
    $sort = Object.keys(sorts)[0];
  }
  let sortText = sorts[$sort];
  let filterComponent;

  function onFilterChange(event) {
    // This function might have been called directly when clearing or resetting
    // the filters, so we can't rely on the presence of an event.
    if (event && event.target) {
      const filterName = event.target.name;

      if (filterDefinitions[filterName]._type === 'boolean') {
        $filters[filterName] = event.target.value === 'true';
      } else {
        $filters[filterName] = event.target.value;
      }
    }

    // Wrapping all the filters and passing up to the components.
    const detail = {
      filters: {},
    };
    Object.entries($filters).forEach(([key, value]) => {
      detail.filters[key] = value;
    });

    dispatch('FilterChange', detail);
    refreshLiveRegion();
  }

  /**
   * Sets all filters to a falsy value.
   */
  function clearFilters() {
    Object.entries(filterDefinitions).forEach(([name, definition]) => {
      const { _type } = definition;

      const falsyValuesByType = {
        boolean: false,
        multiple_choice: [],
        text: '',
      };
      $filters[name] =
        _type in falsyValuesByType ? falsyValuesByType[_type] : null;
    });
    onFilterChange();
  }

  /**
   * Resets the filters to the initial values provided by the source.
   *
   * After calling this, hasUserAppliedFilters() will return false.
   */
  function resetFilters() {
    Object.entries(filterDefinitions).forEach(([name, definition]) => {
      $filters[name] = definition.value;
    });
    onFilterChange();
  }
</script>

{#if Object.keys(filterDefinitions).length !== 0}
  <form class="search__form-container">
    <div class="search__form-filters-container">
      <div class="search__form-filters">
        {#each Object.entries(filterDefinitions) as [name, filter]}
          {#if filter._type === 'boolean'}
            <BooleanFilter
              definition={filter}
              {name}
              changeHandler={onFilterChange}
            />
          {:else if filter._type === 'multiple_choice'}
            <MultipleChoiceFilter
              {name}
              filterList={Object.keys(filterDefinitions)}
              choices={filter.choices}
              on:FilterChange={onFilterChange}
              bind:this={filterComponent}
            />
          {:else if filter._type === 'text'}
            <TextFilter
              {name}
              refresh={refreshLiveRegion}
              on:FilterChange={onFilterChange}
            />
          {/if}
        {/each}
      </div>
      <div
        class="search__form-sort js-form-item js-form-type-select form-type--select js-form-item-type form-item--type"
      >
        <section
          class="search__filters"
          aria-label={Drupal.t('Search results')}
        >
          <div class="search__results-count">
            {#if 'categories' in $filters}
              {#each $filters.categories as category}
                <FilterApplied
                  label={filterDefinitions.categories.choices[category]}
                  clickHandler={() => {
                    $filters.categories.splice(
                      $filters.categories.indexOf(category),
                      1,
                    );
                    $filters.categories = $filters.categories;
                    onFilterChange();
                  }}
                />
              {/each}
            {/if}

            <button
              class="search__filter-button"
              type="button"
              on:click|preventDefault={() => clearFilters()}
            >
              {Drupal.t('Clear filters')}
            </button>
            <button
              class="search__filter-button"
              type="button"
              on:click|preventDefault={() => resetFilters()}
            >
              {Drupal.t('Recommended filters')}
            </button>
          </div>
        </section>
        <SearchSort on:sort bind:sortText refresh={refreshLiveRegion} {sorts} />
      </div>
    </div>
  </form>
{/if}
