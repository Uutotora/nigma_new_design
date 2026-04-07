<template>
  <q-page class="users-list-page">
    <div class="content-wrapper">
      <div class="list-header">
        <div class="list-title">Пользователи</div>
      </div>

      <div class="list-layout">
        <div class="list-card">
          <div class="search-row">
            <q-input
              v-model="searchQuery"
              dense
              filled
              placeholder="Поиск по SSO ID или по номеру телефона"
              class="search-input"
              @keyup.enter="applySearch"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-btn
              color="primary"
              outline
              :icon="listSearchActive ? 'mdi-filter-remove-outline' : 'mdi-format-list-bulleted'"
              :label="listSearchActive ? 'Сбросить поиск' : 'Поиск по списку'"
              class="btn-primary"
              @click="handleListSearchButtonClick"
            />

            <q-btn
              color="primary"
              outline
              :icon="filtersOpen ? 'mdi-filter-off' : 'mdi-filter-variant'"
              :label="filtersOpen ? 'Скрыть фильтры' : 'Фильтры'"
              class="btn-primary"
              :class="{ 'btn-primary--active': filtersOpen }"
              @click="filtersOpen = !filtersOpen"
            />

            <div class="search-spacer" />

            <div class="actions-right">
              <q-btn
                dense
                flat
                icon="mdi-cog"
                class="icon-btn"
              >
                <q-badge v-if="hiddenCount > 0" color="primary" floating>{{ hiddenCount }}</q-badge>
                <q-tooltip>Выбор столбцов</q-tooltip>
                <q-menu class="columns-menu">
                  <div class="columns-menu__header">
                    <div class="columns-menu__title">Видимые столбцы</div>
                    <div class="columns-menu__actions">
                      <q-btn flat size="sm" label="Все" @click="selectAllColumns" />
                      <q-btn flat size="sm" label="Сбросить" @click="resetColumns" />
                    </div>
                  </div>
                  <q-separator />
                  <div class="columns-menu__content">
                    <div v-for="group in groupedColumns" :key="group.name" class="columns-group">
                      <div class="columns-group__title">{{ group.name }}</div>
                      <div class="columns-group__grid">
                        <q-checkbox
                          v-for="col in group.columns"
                          :key="col.field"
                          :model-value="col.isVisible"
                          :disable="col.field === 'ssoId'"
                          :label="col.label"
                          dense
                          class="columns-check"
                          @update:model-value="() => toggleColumn(col.field)"
                        />
                      </div>
                    </div>
                  </div>
                </q-menu>
              </q-btn>

              <q-btn
                dense
                flat
                icon="mdi-download"
                color="secondary"
                class="icon-btn icon-btn--export"
                @click="exportOpen = true"
              >
                <q-tooltip>Экспорт</q-tooltip>
              </q-btn>
            </div>
          </div>

          <div class="table-card">
            <q-table
              :rows="filteredRows"
              :columns="columns"
              row-key="id"
              flat
              dense
              separator="horizontal"
              :visible-columns="visibleColumnFields"
              :rows-per-page-options="[10, 25, 50, 100]"
              v-model:pagination="pagination"
              rows-per-page-label="строк на странице"
              class="users-table"
              virtual-scroll
              :virtual-scroll-item-size="34"
              :virtual-scroll-sticky-size-start="36"
            >
              <template #body-cell-ssoId="props">
                <q-td :props="props">
                  <router-link
                    :to="`/users/${props.row.ssoId}`"
                    class="sso-link"
                  >
                    <span
                      v-for="(part, idx) in highlightParts(props.value, appliedSearch)"
                      :key="idx"
                      :class="{ 'sso-highlight': part.match }"
                    >
                      {{ part.text }}
                    </span>
                  </router-link>
                </q-td>
              </template>
            </q-table>
          </div>
        </div>

        <transition name="filters-fade">
          <div v-if="filtersOpen" class="filters-panel">
            <div class="filters-header">
              <div class="filters-title">Фильтры</div>
              <q-btn flat round icon="mdi-trash-can-outline" color="grey-6" icon-size="13px" class="filters-reset-btn" @click="resetFilters" />
            </div>

            <div class="filters-body">
            <q-expansion-item label="Проекты" default-opened class="filters-section" :duration="200">
                <div class="filter-block">
                  <div class="filter-label">Участие в проектах</div>
                  <q-btn-dropdown
                    class="filter-dropdown"
                    no-caps
                    dense
                    unelevated
                    dropdown-icon="mdi-chevron-down"
                    menu-anchor="bottom left"
                    menu-self="top left"
                    :menu-offset="[0, 6]"
                    menu-class="filters-menu"
                  >
                    <template #label>
                      <div class="filter-dropdown__content">
                        <div class="filter-dropdown__value">{{ projectsTree.display }}</div>
                      </div>
                    </template>
                    <div class="filters-menu__content">
                      <q-tree
                        :nodes="projectsTree.nodes"
                        node-key="id"
                        v-model:expanded="projectsTree.expanded"
                        dense
                      >
                        <template #default-header="prop">
                          <div class="tree-item" @click="toggleTreeNode(projectsTree, prop.key)">
                            <q-checkbox
                              :model-value="isTreeTicked(projectsTree, prop.key)"
                              dense
                              @update:model-value="() => toggleTreeNode(projectsTree, prop.key)"
                              @click.stop
                            />
                            <div class="tree-item__label">{{ prop.node.label }}</div>
                          </div>
                        </template>
                      </q-tree>
                    </div>
                  </q-btn-dropdown>
                  <div class="projects-match">
                    <div class="projects-match__label">
                      Логика выбора проектов
                      <q-icon name="mdi-information-outline" size="16px" class="projects-match__info">
                        <q-tooltip max-width="320px">
                          «И» — показываются пользователи, зарегистрированные во всех выбранных проектах.
                          «ИЛИ» — зарегистрированные хотя бы в одном из выбранных проектов.
                          Переключатель доступен, когда выбрано минимум два проекта.
                        </q-tooltip>
                      </q-icon>
                    </div>
                    <div class="projects-match__seg">
                      <div
                        class="logic-toggle"
                        :class="{
                          'logic-toggle--or': filters.projectsMatch === 'or',
                          'logic-toggle--disabled': projectsMatchDisabled
                        }"
                        role="radiogroup"
                        aria-label="Логика выбора проектов"
                      >
                        <span class="logic-toggle__thumb" />
                        <button
                          type="button"
                          class="logic-toggle__btn"
                          :class="{ 'logic-toggle__btn--active': filters.projectsMatch === 'and' }"
                          :disabled="projectsMatchDisabled"
                          role="radio"
                          :aria-checked="filters.projectsMatch === 'and'"
                          @click="setProjectsMatch('and')"
                        >
                          И
                        </button>
                        <button
                          type="button"
                          class="logic-toggle__btn"
                          :class="{ 'logic-toggle__btn--active': filters.projectsMatch === 'or' }"
                          :disabled="projectsMatchDisabled"
                          role="radio"
                          :aria-checked="filters.projectsMatch === 'or'"
                          @click="setProjectsMatch('or')"
                        >
                          ИЛИ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </q-expansion-item>

            <q-expansion-item label="Данные пользователя" class="filters-section" :duration="200">
              <div class="filter-block">
                <div class="filter-label">Пол</div>
                <q-btn-dropdown
                  class="filter-dropdown"
                  no-caps
                  dense
                  unelevated
                  dropdown-icon="mdi-chevron-down"
                  menu-anchor="bottom left"
                  menu-self="top left"
                  :menu-offset="[0, 6]"
                  menu-class="filters-menu"
                >
                  <template #label>
                    <div class="filter-dropdown__content">
                      <div class="filter-dropdown__value">{{ genderTree.display }}</div>
                    </div>
                  </template>
                  <div class="filters-menu__content">
                    <q-tree
                      :nodes="genderTree.nodes"
                      node-key="id"
                      v-model:expanded="genderTree.expanded"
                      dense
                    >
                      <template #default-header="prop">
                        <div class="tree-item" @click="toggleTreeNode(genderTree, prop.key)">
                          <q-checkbox
                            :model-value="isTreeTicked(genderTree, prop.key)"
                            dense
                            @update:model-value="() => toggleTreeNode(genderTree, prop.key)"
                            @click.stop
                          />
                          <div class="tree-item__label">{{ prop.node.label }}</div>
                        </div>
                      </template>
                    </q-tree>
                  </div>
                </q-btn-dropdown>
              </div>
              <div class="filter-block">
                <div class="filter-label">Дата рождения</div>
                <div class="filter-range">
                  <div class="filter-sub">
                    <div class="filter-sub__label">От</div>
                    <q-input v-model="filters.birthDate.from" dense filled type="date" label="Дата начала" />
                  </div>
                  <div class="filter-sub">
                    <div class="filter-sub__label">До</div>
                    <q-input v-model="filters.birthDate.to" dense filled type="date" label="Дата окончания" />
                  </div>
                </div>
              </div>
              <div class="filter-block">
                <div class="filter-label">Количество детей</div>
                <div class="filter-range">
                  <div class="filter-sub">
                    <div class="filter-sub__label">От</div>
                    <q-input v-model="filters.childrenCount.from" dense filled label="От" inputmode="numeric" />
                  </div>
                  <div class="filter-sub">
                    <div class="filter-sub__label">До</div>
                    <q-input v-model="filters.childrenCount.to" dense filled label="До" inputmode="numeric" />
                  </div>
                </div>
              </div>
              <div class="filter-block">
                <div class="filter-label">Семейное положение</div>
                <q-btn-dropdown
                  class="filter-dropdown"
                  no-caps
                  dense
                  unelevated
                  dropdown-icon="mdi-chevron-down"
                  menu-anchor="bottom left"
                  menu-self="top left"
                  :menu-offset="[0, 6]"
                  menu-class="filters-menu"
                >
                  <template #label>
                    <div class="filter-dropdown__content">
                      <div class="filter-dropdown__value">{{ maritalStatusTree.display }}</div>
                    </div>
                  </template>
                  <div class="filters-menu__content">
                    <q-tree
                      :nodes="maritalStatusTree.nodes"
                      node-key="id"
                      v-model:expanded="maritalStatusTree.expanded"
                      dense
                    >
                      <template #default-header="prop">
                        <div class="tree-item" @click="toggleTreeNode(maritalStatusTree, prop.key)">
                          <q-checkbox
                            :model-value="isTreeTicked(maritalStatusTree, prop.key)"
                            dense
                            @update:model-value="() => toggleTreeNode(maritalStatusTree, prop.key)"
                            @click.stop
                          />
                          <div class="tree-item__label">{{ prop.node.label }}</div>
                        </div>
                      </template>
                    </q-tree>
                  </div>
                </q-btn-dropdown>
              </div>
              <div class="filter-block">
                <div class="filter-label">Тип учетной записи</div>
                <q-btn-dropdown
                  class="filter-dropdown"
                  no-caps
                  dense
                  unelevated
                  dropdown-icon="mdi-chevron-down"
                  menu-anchor="bottom left"
                  menu-self="top left"
                  :menu-offset="[0, 6]"
                  menu-class="filters-menu"
                >
                  <template #label>
                    <div class="filter-dropdown__content">
                      <div class="filter-dropdown__value">{{ accountTypeTree.display }}</div>
                    </div>
                  </template>
                  <div class="filters-menu__content">
                    <q-tree
                      :nodes="accountTypeTree.nodes"
                      node-key="id"
                      v-model:expanded="accountTypeTree.expanded"
                      dense
                    >
                      <template #default-header="prop">
                        <div class="tree-item" @click="toggleTreeNode(accountTypeTree, prop.key)">
                          <q-checkbox
                            :model-value="isTreeTicked(accountTypeTree, prop.key)"
                            dense
                            @update:model-value="() => toggleTreeNode(accountTypeTree, prop.key)"
                            @click.stop
                          />
                          <div class="tree-item__label">{{ prop.node.label }}</div>
                        </div>
                      </template>
                    </q-tree>
                  </div>
                </q-btn-dropdown>
              </div>
              <div class="filter-block">
                <div class="filter-label">Заблокирован</div>
                <q-btn-dropdown
                  class="filter-dropdown"
                  no-caps
                  dense
                  unelevated
                  dropdown-icon="mdi-chevron-down"
                  menu-anchor="bottom left"
                  menu-self="top left"
                  :menu-offset="[0, 6]"
                  menu-class="filters-menu"
                >
                  <template #label>
                    <div class="filter-dropdown__content">
                      <div class="filter-dropdown__value">{{ blockedTree.display }}</div>
                    </div>
                  </template>
                  <div class="filters-menu__content">
                    <q-tree
                      :nodes="blockedTree.nodes"
                      node-key="id"
                      v-model:expanded="blockedTree.expanded"
                      dense
                    >
                      <template #default-header="prop">
                        <div class="tree-item" @click="toggleTreeNode(blockedTree, prop.key)">
                          <q-checkbox
                            :model-value="isTreeTicked(blockedTree, prop.key)"
                            dense
                            @update:model-value="() => toggleTreeNode(blockedTree, prop.key)"
                            @click.stop
                          />
                          <div class="tree-item__label">{{ prop.node.label }}</div>
                        </div>
                      </template>
                    </q-tree>
                  </div>
                </q-btn-dropdown>
              </div>
            </q-expansion-item>

            <q-expansion-item label="Активность" class="filters-section" :duration="200">
              <div class="filter-block">
                <div class="filter-label">Количество активностей</div>
                <div class="filter-range">
                  <div class="filter-sub">
                    <div class="filter-sub__label">От</div>
                    <q-input v-model="filters.activityCount.from" dense filled label="От" inputmode="numeric" />
                  </div>
                  <div class="filter-sub">
                    <div class="filter-sub__label">До</div>
                    <q-input v-model="filters.activityCount.to" dense filled label="До" inputmode="numeric" />
                  </div>
                </div>
              </div>
              <div class="filter-block">
                <div class="filter-label">Дата первой активности</div>
                <div class="filter-range">
                  <div class="filter-sub">
                    <div class="filter-sub__label">От</div>
                    <q-input v-model="filters.firstActivityDate.from" dense filled type="date" label="Дата начала" />
                  </div>
                  <div class="filter-sub">
                    <div class="filter-sub__label">До</div>
                    <q-input v-model="filters.firstActivityDate.to" dense filled type="date" label="Дата окончания" />
                  </div>
                </div>
              </div>
              <div class="filter-block">
                <div class="filter-label">Дата последней активности</div>
                <div class="filter-range">
                  <div class="filter-sub">
                    <div class="filter-sub__label">От</div>
                    <q-input v-model="filters.lastActivityDate.from" dense filled type="date" label="Дата начала" />
                  </div>
                  <div class="filter-sub">
                    <div class="filter-sub__label">До</div>
                    <q-input v-model="filters.lastActivityDate.to" dense filled type="date" label="Дата окончания" />
                  </div>
                </div>
              </div>
            </q-expansion-item>

            <q-expansion-item label="Городские баллы" class="filters-section" :duration="200">
              <div class="filter-block">
                <div class="filter-label">Заработано</div>
                <div class="filter-range">
                  <div class="filter-sub">
                    <div class="filter-sub__label">От</div>
                    <q-input v-model="filters.cityPointsEarned.from" dense filled label="От" inputmode="numeric" />
                  </div>
                  <div class="filter-sub">
                    <div class="filter-sub__label">До</div>
                    <q-input v-model="filters.cityPointsEarned.to" dense filled label="До" inputmode="numeric" />
                  </div>
                </div>
              </div>
              <div class="filter-block">
                <div class="filter-label">Потрачено</div>
                <div class="filter-range">
                  <div class="filter-sub">
                    <div class="filter-sub__label">От</div>
                    <q-input v-model="filters.cityPointsSpent.from" dense filled label="От" inputmode="numeric" />
                  </div>
                  <div class="filter-sub">
                    <div class="filter-sub__label">До</div>
                    <q-input v-model="filters.cityPointsSpent.to" dense filled label="До" inputmode="numeric" />
                  </div>
                </div>
              </div>
              <div class="filter-block">
                <div class="filter-label">Остаток</div>
                <div class="filter-range">
                  <div class="filter-sub">
                    <div class="filter-sub__label">От</div>
                    <q-input v-model="filters.cityPointsBalance.from" dense filled label="От" inputmode="numeric" />
                  </div>
                  <div class="filter-sub">
                    <div class="filter-sub__label">До</div>
                    <q-input v-model="filters.cityPointsBalance.to" dense filled label="До" inputmode="numeric" />
                  </div>
                </div>
              </div>
            </q-expansion-item>

            <q-expansion-item label="Призовые баллы" class="filters-section" :duration="200">
              <div class="filter-block">
                <div class="filter-label">Заработано</div>
                <div class="filter-range">
                  <div class="filter-sub">
                    <div class="filter-sub__label">От</div>
                    <q-input v-model="filters.prizePointsEarned.from" dense filled label="От" inputmode="numeric" />
                  </div>
                  <div class="filter-sub">
                    <div class="filter-sub__label">До</div>
                    <q-input v-model="filters.prizePointsEarned.to" dense filled label="До" inputmode="numeric" />
                  </div>
                </div>
              </div>
              <div class="filter-block">
                <div class="filter-label">Потрачено</div>
                <div class="filter-range">
                  <div class="filter-sub">
                    <div class="filter-sub__label">От</div>
                    <q-input v-model="filters.prizePointsSpent.from" dense filled label="От" inputmode="numeric" />
                  </div>
                  <div class="filter-sub">
                    <div class="filter-sub__label">До</div>
                    <q-input v-model="filters.prizePointsSpent.to" dense filled label="До" inputmode="numeric" />
                  </div>
                </div>
              </div>
              <div class="filter-block">
                <div class="filter-label">Остаток</div>
                <div class="filter-range">
                  <div class="filter-sub">
                    <div class="filter-sub__label">От</div>
                    <q-input v-model="filters.prizePointsBalance.from" dense filled label="От" inputmode="numeric" />
                  </div>
                  <div class="filter-sub">
                    <div class="filter-sub__label">До</div>
                    <q-input v-model="filters.prizePointsBalance.to" dense filled label="До" inputmode="numeric" />
                  </div>
                </div>
              </div>
            </q-expansion-item>

            <q-expansion-item label="Детские баллы" class="filters-section" :duration="200">
              <div class="filter-block">
                <div class="filter-label">Заработано</div>
                <div class="filter-range">
                  <div class="filter-sub">
                    <div class="filter-sub__label">От</div>
                    <q-input v-model="filters.kidsPointsEarned.from" dense filled label="От" inputmode="numeric" />
                  </div>
                  <div class="filter-sub">
                    <div class="filter-sub__label">До</div>
                    <q-input v-model="filters.kidsPointsEarned.to" dense filled label="До" inputmode="numeric" />
                  </div>
                </div>
              </div>
              <div class="filter-block">
                <div class="filter-label">Потрачено</div>
                <div class="filter-range">
                  <div class="filter-sub">
                    <div class="filter-sub__label">От</div>
                    <q-input v-model="filters.kidsPointsSpent.from" dense filled label="От" inputmode="numeric" />
                  </div>
                  <div class="filter-sub">
                    <div class="filter-sub__label">До</div>
                    <q-input v-model="filters.kidsPointsSpent.to" dense filled label="До" inputmode="numeric" />
                  </div>
                </div>
              </div>
              <div class="filter-block">
                <div class="filter-label">Остаток</div>
                <div class="filter-range">
                  <div class="filter-sub">
                    <div class="filter-sub__label">От</div>
                    <q-input v-model="filters.kidsPointsBalance.from" dense filled label="От" inputmode="numeric" />
                  </div>
                  <div class="filter-sub">
                    <div class="filter-sub__label">До</div>
                    <q-input v-model="filters.kidsPointsBalance.to" dense filled label="До" inputmode="numeric" />
                  </div>
                </div>
              </div>
            </q-expansion-item>

            <q-expansion-item label="Мосбилет баллы" class="filters-section" :duration="200">
              <div class="filter-block">
                <div class="filter-label">Заработано</div>
                <div class="filter-range">
                  <div class="filter-sub">
                    <div class="filter-sub__label">От</div>
                    <q-input v-model="filters.mosbiletPointsEarned.from" dense filled label="От" inputmode="numeric" />
                  </div>
                  <div class="filter-sub">
                    <div class="filter-sub__label">До</div>
                    <q-input v-model="filters.mosbiletPointsEarned.to" dense filled label="До" inputmode="numeric" />
                  </div>
                </div>
              </div>
              <div class="filter-block">
                <div class="filter-label">Потрачено</div>
                <div class="filter-range">
                  <div class="filter-sub">
                    <div class="filter-sub__label">От</div>
                    <q-input v-model="filters.mosbiletPointsSpent.from" dense filled label="От" inputmode="numeric" />
                  </div>
                  <div class="filter-sub">
                    <div class="filter-sub__label">До</div>
                    <q-input v-model="filters.mosbiletPointsSpent.to" dense filled label="До" inputmode="numeric" />
                  </div>
                </div>
              </div>
              <div class="filter-block">
                <div class="filter-label">Остаток</div>
                <div class="filter-range">
                  <div class="filter-sub">
                    <div class="filter-sub__label">От</div>
                    <q-input v-model="filters.mosbiletPointsBalance.from" dense filled label="От" inputmode="numeric" />
                  </div>
                  <div class="filter-sub">
                    <div class="filter-sub__label">До</div>
                    <q-input v-model="filters.mosbiletPointsBalance.to" dense filled label="До" inputmode="numeric" />
                  </div>
                </div>
              </div>
            </q-expansion-item>

            <q-expansion-item label="Теги" class="filters-section" :duration="200">
              <div class="filter-block">
                <div class="filter-label">Теги</div>
                <q-btn-dropdown
                  class="filter-dropdown"
                  no-caps
                  dense
                  unelevated
                  dropdown-icon="mdi-chevron-down"
                  menu-anchor="bottom left"
                  menu-self="top left"
                  :menu-offset="[0, 6]"
                  menu-class="filters-menu"
                >
                  <template #label>
                    <div class="filter-dropdown__content">
                      <div class="filter-dropdown__value">{{ tagsTree.display }}</div>
                    </div>
                  </template>
                  <div class="filters-menu__content">
                    <q-tree
                      :nodes="tagsTree.nodes"
                      node-key="id"
                      v-model:expanded="tagsTree.expanded"
                      dense
                    >
                      <template #default-header="prop">
                        <div class="tree-item" @click="toggleTreeNode(tagsTree, prop.key)">
                          <q-checkbox
                            :model-value="isTreeTicked(tagsTree, prop.key)"
                            dense
                            @update:model-value="() => toggleTreeNode(tagsTree, prop.key)"
                            @click.stop
                          />
                          <div class="tree-item__label">{{ prop.node.label }}</div>
                        </div>
                      </template>
                    </q-tree>
                  </div>
                </q-btn-dropdown>
              </div>
            </q-expansion-item>

            <q-expansion-item label="Группы" class="filters-section" :duration="200">
              <div class="filter-block">
                <div class="filter-label">Группа активности</div>
                <q-btn-dropdown
                  class="filter-dropdown"
                  no-caps
                  dense
                  unelevated
                  dropdown-icon="mdi-chevron-down"
                  menu-anchor="bottom left"
                  menu-self="top left"
                  :menu-offset="[0, 6]"
                  menu-class="filters-menu"
                >
                  <template #label>
                    <div class="filter-dropdown__content">
                      <div class="filter-dropdown__value">{{ activityGroupTree.display }}</div>
                    </div>
                  </template>
                  <div class="filters-menu__content">
                    <q-tree
                      :nodes="activityGroupTree.nodes"
                      node-key="id"
                      v-model:expanded="activityGroupTree.expanded"
                      dense
                    >
                      <template #default-header="prop">
                        <div class="tree-item" @click="toggleTreeNode(activityGroupTree, prop.key)">
                          <q-checkbox
                            :model-value="isTreeTicked(activityGroupTree, prop.key)"
                            dense
                            @update:model-value="() => toggleTreeNode(activityGroupTree, prop.key)"
                            @click.stop
                          />
                          <div class="tree-item__label">{{ prop.node.label }}</div>
                        </div>
                      </template>
                    </q-tree>
                  </div>
                </q-btn-dropdown>
              </div>
              <div class="filter-block">
                <div class="filter-label">Группа лояльности</div>
                <q-btn-dropdown
                  class="filter-dropdown"
                  no-caps
                  dense
                  unelevated
                  dropdown-icon="mdi-chevron-down"
                  menu-anchor="bottom left"
                  menu-self="top left"
                  :menu-offset="[0, 6]"
                  menu-class="filters-menu"
                >
                  <template #label>
                    <div class="filter-dropdown__content">
                      <div class="filter-dropdown__value">{{ loyaltyGroupTree.display }}</div>
                    </div>
                  </template>
                  <div class="filters-menu__content">
                    <q-tree
                      :nodes="loyaltyGroupTree.nodes"
                      node-key="id"
                      v-model:expanded="loyaltyGroupTree.expanded"
                      dense
                    >
                      <template #default-header="prop">
                        <div class="tree-item" @click="toggleTreeNode(loyaltyGroupTree, prop.key)">
                          <q-checkbox
                            :model-value="isTreeTicked(loyaltyGroupTree, prop.key)"
                            dense
                            @update:model-value="() => toggleTreeNode(loyaltyGroupTree, prop.key)"
                            @click.stop
                          />
                          <div class="tree-item__label">{{ prop.node.label }}</div>
                        </div>
                      </template>
                    </q-tree>
                  </div>
                </q-btn-dropdown>
              </div>
              <div class="filter-block">
                <div class="filter-label">Группа полезности</div>
                <q-btn-dropdown
                  class="filter-dropdown"
                  no-caps
                  dense
                  unelevated
                  dropdown-icon="mdi-chevron-down"
                  menu-anchor="bottom left"
                  menu-self="top left"
                  :menu-offset="[0, 6]"
                  menu-class="filters-menu"
                >
                  <template #label>
                    <div class="filter-dropdown__content">
                      <div class="filter-dropdown__value">{{ usefulnessGroupTree.display }}</div>
                    </div>
                  </template>
                  <div class="filters-menu__content">
                    <q-tree
                      :nodes="usefulnessGroupTree.nodes"
                      node-key="id"
                      v-model:expanded="usefulnessGroupTree.expanded"
                      dense
                    >
                      <template #default-header="prop">
                        <div class="tree-item" @click="toggleTreeNode(usefulnessGroupTree, prop.key)">
                          <q-checkbox
                            :model-value="isTreeTicked(usefulnessGroupTree, prop.key)"
                            dense
                            @update:model-value="() => toggleTreeNode(usefulnessGroupTree, prop.key)"
                            @click.stop
                          />
                          <div class="tree-item__label">{{ prop.node.label }}</div>
                        </div>
                      </template>
                    </q-tree>
                  </div>
                </q-btn-dropdown>
              </div>
              <div class="filter-block">
                <div class="filter-label">Группа заинтересованности</div>
                <q-btn-dropdown
                  class="filter-dropdown"
                  no-caps
                  dense
                  unelevated
                  dropdown-icon="mdi-chevron-down"
                  menu-anchor="bottom left"
                  menu-self="top left"
                  :menu-offset="[0, 6]"
                  menu-class="filters-menu"
                >
                  <template #label>
                    <div class="filter-dropdown__content">
                      <div class="filter-dropdown__value">{{ interestGroupTree.display }}</div>
                    </div>
                  </template>
                  <div class="filters-menu__content">
                    <q-tree
                      :nodes="interestGroupTree.nodes"
                      node-key="id"
                      v-model:expanded="interestGroupTree.expanded"
                      dense
                    >
                      <template #default-header="prop">
                        <div class="tree-item" @click="toggleTreeNode(interestGroupTree, prop.key)">
                          <q-checkbox
                            :model-value="isTreeTicked(interestGroupTree, prop.key)"
                            dense
                            @update:model-value="() => toggleTreeNode(interestGroupTree, prop.key)"
                            @click.stop
                          />
                          <div class="tree-item__label">{{ prop.node.label }}</div>
                        </div>
                      </template>
                    </q-tree>
                  </div>
                </q-btn-dropdown>
              </div>
              <div class="filter-block">
                <div class="filter-label">Группа сообщений</div>
                <q-btn-dropdown
                  class="filter-dropdown"
                  no-caps
                  dense
                  unelevated
                  dropdown-icon="mdi-chevron-down"
                  menu-anchor="bottom left"
                  menu-self="top left"
                  :menu-offset="[0, 6]"
                  menu-class="filters-menu"
                >
                  <template #label>
                    <div class="filter-dropdown__content">
                      <div class="filter-dropdown__value">{{ messageGroupTree.display }}</div>
                    </div>
                  </template>
                  <div class="filters-menu__content">
                    <q-tree
                      :nodes="messageGroupTree.nodes"
                      node-key="id"
                      v-model:expanded="messageGroupTree.expanded"
                      dense
                    >
                      <template #default-header="prop">
                        <div class="tree-item" @click="toggleTreeNode(messageGroupTree, prop.key)">
                          <q-checkbox
                            :model-value="isTreeTicked(messageGroupTree, prop.key)"
                            dense
                            @update:model-value="() => toggleTreeNode(messageGroupTree, prop.key)"
                            @click.stop
                          />
                          <div class="tree-item__label">{{ prop.node.label }}</div>
                        </div>
                      </template>
                    </q-tree>
                  </div>
                </q-btn-dropdown>
              </div>
            </q-expansion-item>
          </div>

            <div class="filters-footer">
              <q-btn color="primary" label="Применить фильтры" class="filters-apply" @click="applyFiltersAction" />
            </div>
          </div>
        </transition>
      </div>
    </div>

    <q-dialog v-model="exportOpen">
      <q-card class="export-modal">
        <div class="export-header">
          <div class="export-title">
            <q-icon name="download" color="primary" />
            <span>Экспорт данных</span>
          </div>
          <q-btn flat round icon="close" :disable="isExportLoading" @click="exportOpen = false" />
        </div>
        <div class="export-count">
          Строк для экспорта: <strong>{{ filteredRows.length }}</strong>
        </div>
        <div class="export-options">
          <div
            class="export-option"
            :class="{ 'export-option--loading': exportLoadingFormat === 'excel', 'export-option--disabled': isExportLoading && exportLoadingFormat !== 'excel' }"
            @click="handleExport('excel')"
          >
            <q-spinner-dots v-if="exportLoadingFormat === 'excel'" color="positive" size="22px" />
            <q-icon v-else name="table_chart" color="positive" />
            <div>
              <div class="export-option__title">Excel (.xlsx)</div>
              <div class="export-option__desc">
                {{ exportLoadingFormat === 'excel' ? 'Формируем файл...' : 'Максимум 400 000 строк' }}
              </div>
            </div>
          </div>
          <div
            class="export-option"
            :class="{ 'export-option--loading': exportLoadingFormat === 'csv', 'export-option--disabled': isExportLoading && exportLoadingFormat !== 'csv' }"
            @click="handleExport('csv')"
          >
            <q-spinner-dots v-if="exportLoadingFormat === 'csv'" color="primary" size="22px" />
            <q-icon v-else name="insert_drive_file" color="primary" />
            <div>
              <div class="export-option__title">CSV (.csv)</div>
              <div class="export-option__desc">
                {{ exportLoadingFormat === 'csv' ? 'Формируем файл...' : 'Максимум 1 000 000 строк' }}
              </div>
            </div>
          </div>
        </div>
        <q-separator />
        <div class="export-actions">
          <q-btn outline color="grey-7" label="Отмена" :disable="isExportLoading" @click="exportOpen = false" />
        </div>
      </q-card>
    </q-dialog>

    <q-dialog v-model="listSearchOpen">
      <q-card class="list-search-modal">
        <div class="list-search-header">
          <div class="list-search-title">Поиск по списку</div>
          <q-btn flat dense label="Закрыть" class="list-search-close" @click="closeListSearch" />
        </div>
        <q-separator />
        <div class="list-search-body">
          <div class="list-search-hint">
            Введите SSO ID построчно или загрузите файл. Если заполнены оба поля, приоритет — у списка.
          </div>

          <div class="list-search-stack">
            <div class="list-search-section list-search-section--text">
              <div class="list-search-section__title">
                <span>Ввод списка SSO ID</span>
              </div>
              <q-input
                v-model="listSearchText"
                type="textarea"
                rows="12"
                :placeholder="'550e8400-e29b-41d4-a716-446655440000\n6ba7b810-9dad-11d1-80b4-00c04fd430c8\n7d444840-9dc0-11d1-b245-5ffdce74fad2\n...'"
                class="list-search-input"
              />
              <div class="list-search-caption">Каждый SSO ID — с новой строки.</div>
            </div>

            <div class="list-search-section list-search-section--file">
              <div class="list-search-section__title">
                <span>Загрузка файла SSO ID</span>
              </div>
              <label class="file-drop file-drop--compact">
                <input
                  class="file-input"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  @change="handleFileUpload"
                />
                <div class="file-title">Нажмите для выбора файла</div>
                <div class="file-caption">Форматы: .xlsx, .xls, .csv</div>
              </label>
              <div v-if="listSearchFile" class="file-success">
                Загружен файл: {{ listSearchFile.name }}
              </div>
            </div>
          </div>

          <div v-if="listSearchError" class="list-search-error">{{ listSearchError }}</div>
        </div>
        <q-separator />
        <div class="list-search-actions">
          <q-btn outline color="grey-7" label="Отменить" @click="closeListSearch" />
          <q-btn color="primary" label="Найти" @click="applyListSearch" />
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, type Ref, type ComputedRef } from 'vue';
import {
  ALL_USER_DATA,
  applyFilters as filterUsers,
  getDefaultFilters,
  ALL_PROJECTS,
  ACCOUNT_TYPES,
  GENDERS,
  MARITAL_STATUSES,
  GROUPS,
  MESSAGE_GROUPS,
  BLOCKED_OPTIONS,
  TAG_OPTIONS,
  COLUMN_DEFS,
} from 'src/data/users';
import type { FiltersState } from 'src/data/users';
import { exportToCSV, exportToExcel, getExportFilename } from 'src/utils/exportUsers';

const filtersOpen = ref(false);
const searchQuery = ref('');
const appliedSearch = ref('');
const appliedListSsoIds = ref<string[]>([]);
const cloneFiltersState = (value: FiltersState): FiltersState =>
  JSON.parse(JSON.stringify(value)) as FiltersState;

const defaultFiltersState = getDefaultFilters();
const filters = ref<FiltersState>(cloneFiltersState(defaultFiltersState));
const appliedFilters = ref<FiltersState>(cloneFiltersState(defaultFiltersState));
const exportOpen = ref(false);
const listSearchOpen = ref(false);
const listSearchText = ref('');
const listSearchFile = ref<File | null>(null);
const listSearchError = ref('');
const columnDefs = ref(COLUMN_DEFS.map((column) => ({ ...column })));
const pagination = ref({ page: 1, rowsPerPage: 50 });
const exportLoadingFormat = ref<'csv' | 'excel' | null>(null);
const listSearchActive = computed(() => appliedListSsoIds.value.length > 0);
const isExportLoading = computed(() => exportLoadingFormat.value !== null);

const filteredRows = computed(() => filterUsers(
  ALL_USER_DATA,
  appliedFilters.value,
  appliedSearch.value,
  { ssoIdList: appliedListSsoIds.value },
));
const projectsMatchDisabled = computed(() => filters.value.projects.length < 2);

type TreeFilterState = {
  nodes: { id: string; label: string; children?: { id: string; label: string }[] }[];
  ticked: Ref<string[]>;
  expanded: Ref<string[]>;
  updateTicked: (next: string[]) => void;
  syncFromFilters: (values: string[]) => void;
  display: ComputedRef<string>;
};

const createTreeFilter = (
  key: keyof FiltersState,
  options: string[],
  allDisplay = 'Все',
): TreeFilterState => {
  const rootId = `${String(key)}_all`;
  const leafIds = options.map((_, index) => `${String(key)}_${index}`);
  const labelById: Record<string, string> = Object.fromEntries(
    leafIds.map((id, index) => [id, options[index]]),
  );
  const nodes = [
    {
      id: rootId,
      label: 'Выбрать все',
      children: options.map((option, index) => ({
        id: leafIds[index],
        label: option,
      })),
    },
  ];
  const ticked = ref<string[]>([]);
  const expanded = ref<string[]>([rootId]);

  const syncFromFilters = (values: string[]) => {
    const selected = new Set(values);
    const selectedLeafs = leafIds.filter((id) => selected.has(labelById[id]));
    ticked.value = selectedLeafs.length === leafIds.length && leafIds.length > 0
      ? [rootId, ...selectedLeafs]
      : selectedLeafs;
  };
  syncFromFilters((filters.value[key] as string[]) ?? []);

  const updateTicked = (next: string[]) => {
    const leafSet = new Set(next.filter((id) => id !== rootId));
    const hadRoot = ticked.value.includes(rootId);
    const hasRoot = next.includes(rootId);
    const allLeavesSelected = leafSet.size === leafIds.length && leafIds.length > 0;

    if (hasRoot && !hadRoot) {
      ticked.value = [rootId, ...leafIds];
      (filters.value[key] as string[]) = [...options];
      return;
    }

    if (!hasRoot && hadRoot && allLeavesSelected) {
      ticked.value = [];
      (filters.value[key] as string[]) = [];
      return;
    }

    const normalizedLeafs = leafIds.filter((id) => leafSet.has(id));
    ticked.value = allLeavesSelected ? [rootId, ...normalizedLeafs] : normalizedLeafs;
    (filters.value[key] as string[]) = normalizedLeafs.map((id) => labelById[id]);
  };

  const display = computed(() => {
    const selected = (filters.value[key] as string[]) ?? [];
    const count = selected.length;
    if (count === 0) return 'Не выбрано';
    if (count === options.length) return allDisplay;
    return `Выбрано: ${count}`;
  });

  return {
    nodes,
    ticked,
    expanded,
    updateTicked,
    syncFromFilters,
    display,
  };
};

const projectsTree = createTreeFilter('projects', ALL_PROJECTS, 'Все проекты');
const genderTree = createTreeFilter('gender', GENDERS);
const maritalStatusTree = createTreeFilter('maritalStatus', MARITAL_STATUSES);
const accountTypeTree = createTreeFilter('accountType', ACCOUNT_TYPES);
const blockedTree = createTreeFilter('blocked', BLOCKED_OPTIONS);
const tagsTree = createTreeFilter('tags', TAG_OPTIONS, 'Все теги');
const activityGroupTree = createTreeFilter('activityGroup', GROUPS);
const loyaltyGroupTree = createTreeFilter('loyaltyGroup', GROUPS);
const usefulnessGroupTree = createTreeFilter('usefulnessGroup', GROUPS);
const interestGroupTree = createTreeFilter('interestGroup', GROUPS);
const messageGroupTree = createTreeFilter('messageGroup', MESSAGE_GROUPS);
const treeFiltersByKey: Partial<Record<keyof FiltersState, TreeFilterState>> = {
  projects: projectsTree,
  gender: genderTree,
  maritalStatus: maritalStatusTree,
  accountType: accountTypeTree,
  blocked: blockedTree,
  tags: tagsTree,
  activityGroup: activityGroupTree,
  loyaltyGroup: loyaltyGroupTree,
  usefulnessGroup: usefulnessGroupTree,
  interestGroup: interestGroupTree,
  messageGroup: messageGroupTree,
};

const toggleTreeNode = (state: TreeFilterState, nodeId: string) => {
  const next = new Set(state.ticked.value);
  if (next.has(nodeId)) {
    next.delete(nodeId);
  } else {
    next.add(nodeId);
  }
  state.updateTicked([...next]);
};

const isTreeTicked = (state: TreeFilterState, nodeId: string) =>
  state.ticked.value.includes(nodeId);

const columns = computed(() => columnDefs.value.map((col) => ({
  name: col.field,
  field: col.field,
  label: col.DisplayLabel,
  align: 'left',
  sortable: true,
  format: col.format,
})));

const visibleColumnFields = computed(() =>
  columnDefs.value.filter((col) => col.isVisible).map((col) => col.field),
);

const groupedColumns = computed(() => {
  const groups: { name: string; columns: { field: string; label: string; isVisible: boolean }[] }[] = [];
  columnDefs.value.forEach((col) => {
    let group = groups.find((g) => g.name === col.group);
    if (!group) {
      group = { name: col.group, columns: [] };
      groups.push(group);
    }
    group.columns.push({ field: col.field, label: col.label, isVisible: col.isVisible });
  });
  return groups;
});

const hiddenCount = computed(() => columnDefs.value.filter((col) => !col.isVisible).length);

const applySearch = () => {
  appliedListSsoIds.value = [];
  appliedSearch.value = searchQuery.value.trim();
};

const applyFiltersAction = () => {
  if (projectsMatchDisabled.value) {
    filters.value.projectsMatch = 'or';
  }
  appliedFilters.value = cloneFiltersState(filters.value);
};

const setProjectsMatch = (mode: 'and' | 'or') => {
  if (projectsMatchDisabled.value) return;
  filters.value.projectsMatch = mode;
};

const resetFilters = () => {
  filters.value = getDefaultFilters();
  Object.entries(treeFiltersByKey).forEach(([key, tree]) => {
    if (!tree) return;
    const values = (filters.value[key as keyof FiltersState] as string[]) ?? [];
    tree.syncFromFilters(values);
  });
};

const toggleColumn = (field: string) => {
  const column = columnDefs.value.find((item) => item.field === field);
  if (!column || field === 'ssoId') return;
  column.isVisible = !column.isVisible;
};

const selectAllColumns = () => {
  columnDefs.value.forEach((column) => {
    column.isVisible = true;
  });
};

const resetColumns = () => {
  columnDefs.value.forEach((column) => {
    column.isVisible = column.field === 'ssoId';
  });
};

const waitMs = (ms: number) => new Promise<void>((resolve) => {
  setTimeout(resolve, ms);
});

const handleExport = async (format: 'csv' | 'excel') => {
  if (isExportLoading.value) return;
  exportLoadingFormat.value = format;
  try {
    await waitMs(5000);

    const filename = getExportFilename('users');
    if (format === 'csv') {
      exportToCSV(filteredRows.value, columnDefs.value, filename);
    } else {
      exportToExcel(filteredRows.value, columnDefs.value, filename);
    }
    exportOpen.value = false;
  } finally {
    exportLoadingFormat.value = null;
  }
};

const closeListSearch = () => {
  listSearchOpen.value = false;
  listSearchText.value = '';
  listSearchFile.value = null;
  listSearchError.value = '';
};

const resetListSearch = () => {
  appliedListSsoIds.value = [];
  closeListSearch();
};

const handleListSearchButtonClick = () => {
  if (listSearchActive.value) {
    resetListSearch();
    return;
  }
  listSearchOpen.value = true;
};

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const isCsv = file.name.endsWith('.csv');
  const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
  if (!isCsv && !isExcel) {
    listSearchError.value = 'Пожалуйста, выберите файл Excel (.xlsx, .xls) или CSV';
    listSearchFile.value = null;
    return;
  }
  listSearchFile.value = file;
  listSearchError.value = '';
};

const normalizeSsoIdValue = (value: string): string =>
  value
    .replace(/\uFEFF/g, '')
    .replace(/[\u200B-\u200D\u2060]/g, '')
    .trim()
    .replace(/^[,;]+|[,;]+$/g, '')
    .replace(/\s+/g, '');

const parseListText = (): string[] => {
  const normalized = listSearchText.value
    .split(/\r?\n/)
    .map((line) => normalizeSsoIdValue(line))
    .filter((line) => line.length > 0);

  return Array.from(new Set(normalized));
};

const applyListSearch = () => {
  listSearchError.value = '';
  const data = parseListText();
  if (data.length > 0) {
    appliedListSsoIds.value = data;
    searchQuery.value = '';
    appliedSearch.value = '';
    closeListSearch();
    return;
  }

  if (!listSearchFile.value) {
    listSearchError.value = 'Введите SSO ID или загрузите файл';
    return;
  }

  const mockData = ['user1', 'user2', 'user3']
    .map((id) => normalizeSsoIdValue(id))
    .filter((id) => id.length > 0);
  appliedListSsoIds.value = Array.from(new Set(mockData));
  searchQuery.value = '';
  appliedSearch.value = '';
  closeListSearch();
};

const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlightParts = (text: string, query: string) => {
  const q = query.trim();
  if (!q) return [{ text, match: false }];
  const regex = new RegExp(escapeRegExp(q), 'ig');
  const parts: { text: string; match: boolean }[] = [];
  let lastIndex = 0;
  text.replace(regex, (match, offset) => {
    if (offset > lastIndex) parts.push({ text: text.slice(lastIndex, offset), match: false });
    parts.push({ text: match, match: true });
    lastIndex = offset + match.length;
    return match;
  });
  if (lastIndex < text.length) parts.push({ text: text.slice(lastIndex), match: false });
  return parts;
};
</script>

<style lang="scss" scoped>
.users-list-page {
  background-color: #027be3;
  padding: 0;
  overflow: hidden;
}

.content-wrapper {
  background-color: #e0e0e0;
  border-top-left-radius: 16px;
  height: calc(100vh - 50px);
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.list-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
}

.list-layout {
  display: flex;
  gap: 16px;
  min-height: 0;
  flex: 1;
}

.list-card {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,.08), 0 12px 28px rgba(0,0,0,.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-bottom: 1px solid #f1f1f1;
}

.search-input {
  flex: 0 0 420px;
  max-width: 520px;
}

.search-input :deep(.q-field__control) {
  border-radius: 10px;
  min-height: 34px;
  background: #fff;
  border: 1px solid #cbd5e1;
  overflow: hidden;
}

.search-input :deep(.q-field__control):before {
  border: none;
}

.search-input :deep(.q-field__control):after {
  border: none;
}

.search-input :deep(.q-field--focused .q-field__control) {
  border-color: #2563eb;
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.15);
}

.search-input :deep(.q-field__native) {
  font-size: 12px;
}

.btn-search {
  border-radius: 10px;
}

.btn-primary {
  border-radius: 10px;
  text-transform: none;
  font-weight: 600;
  font-size: 12px;
  padding: 0 12px;
  min-height: 34px;
  color: #027be3;
  border-color: rgba(2, 123, 227, 0.6);
  background: transparent;
}

.btn-columns {
  position: relative;
}

.btn-primary:hover {
  background: rgba(2, 123, 227, 0.08);
}

.btn-primary--active {
  background: rgba(2, 123, 227, 0.12);
  border-color: #027be3;
}

.search-spacer {
  flex: 1 1 auto;
}

.actions-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon-btn {
  min-width: 34px;
  min-height: 34px;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #475569;
}

.icon-btn:hover {
  background: #f8fafc;
}

.icon-btn--export {
  color: #26a69a;
  border-color: rgba(38, 166, 154, 0.45);
}

.icon-btn--export:hover {
  background: rgba(38, 166, 154, 0.08);
}

.table-card {
  flex: 1;
  min-height: 0;
  margin: 12px 14px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.users-table {
  height: 100%;
}

.users-table :deep(.q-table__container) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.users-table :deep(.q-table__middle) {
  flex: 1 1 auto;
  overflow-y: auto;
}

.users-table :deep(.q-table__top),
.users-table :deep(.q-table__bottom) {
  background: #fff;
}

.users-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 2;
}

.users-table :deep(th) {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  background: #f8fafc;
  white-space: nowrap;
}

.users-table :deep(td) {
  font-size: 12px;
  color: #334155;
}

.sso-link {
  color: inherit;
  font-weight: 400;
  text-decoration: none;
}

.sso-link:hover {
  text-decoration: underline;
}

.sso-highlight {
  background: #fef08a;
  border-radius: 2px;
  padding: 0 1px;
}

.filters-panel {
  width: 320px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,.08), 0 12px 28px rgba(0,0,0,.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 8px;
}

.filters-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
}

.filters-body {
  padding: 10px 12px 12px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  background: #f8fafc;
}

.filter-block {
  padding: 8px 0;
  border-bottom: 1px dashed #e2e8f0;
}

.filter-block:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.projects-match {
  display: grid;
  gap: 6px;
  margin-top: 8px;
}

.projects-match__label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.projects-match__info {
  color: #9ca3af;
}

.projects-match__seg {
  display: inline-flex;
  align-items: center;
  width: fit-content;
}

.logic-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 2px;
  background: #f1f5f9;
  border: 1px solid #d7dee8;
  border-radius: 999px;
  min-width: 108px;
  height: 30px;
  overflow: hidden;
}

.logic-toggle__thumb {
  position: absolute;
  top: 2px;
  bottom: 2px;
  left: 2px;
  width: calc(50% - 2px);
  background: #027be3;
  border-radius: 999px;
  box-shadow: 0 4px 10px rgba(2, 123, 227, 0.28);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.logic-toggle--or .logic-toggle__thumb {
  transform: translateX(100%);
}

.logic-toggle__btn {
  position: relative;
  z-index: 1;
  flex: 1;
  height: 24px;
  border: none;
  background: transparent;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #64748b;
  cursor: pointer;
  transition: color 0.2s ease;
}

.logic-toggle__btn--active {
  color: #ffffff;
}

.logic-toggle__btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(2, 123, 227, 0.35);
  border-radius: 999px;
}

.logic-toggle--disabled {
  opacity: 0.55;
  pointer-events: none;
}


.filter-label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
}

.filter-dropdown {
  width: 100%;
  min-height: 34px;
  padding: 6px 10px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-transform: none;
  font-weight: 600;
}

.filter-dropdown :deep(.q-btn__content) {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filter-dropdown__content {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.filter-dropdown__value {
  font-size: 12px;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.filters-menu {
  min-width: 260px;
  max-width: 360px;
}

.filters-menu__content {
  padding: 6px 8px;
  max-height: 280px;
  overflow: auto;
}

.tree-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border-radius: 6px;
  font-size: 12px;
  color: #334155;
  cursor: pointer;
}

.tree-item:hover {
  background: #f1f5f9;
}

.tree-item__label {
  line-height: 1.2;
}

.filter-range {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  align-items: start;
}

.filter-sub {
  min-width: 0;
}

.filter-sub__label {
  font-size: 11px;
  color: #9aa2af;
  margin-bottom: 3px;
}

.filters-section :deep(.q-expansion-item__header) {
  padding: 12px 14px;
  font-weight: 700;
  color: #0f172a;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
}

.filters-section :deep(.q-expansion-item__content) {
  padding: 10px 14px 12px;
  background: #ffffff;
}

.filters-section {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 10px;
  background: #ffffff;
}

.filters-section:last-child {
  margin-bottom: 0;
}


.filters-panel :deep(.q-field__control) {
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.filters-panel :deep(.q-field) {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.filters-panel :deep(.q-field__native),
.filters-panel :deep(.q-field__input) {
  min-width: 0;
}

.filters-panel :deep(.q-field__control):before,
.filters-panel :deep(.q-field__control):after {
  border: none;
}

.filters-panel :deep(.q-field--focused .q-field__control) {
  border-color: #2563eb;
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.15);
}

.filters-footer {
  padding: 12px 16px 16px;
  flex-shrink: 0;
  display: grid;
  gap: 8px;
}

.filters-reset {
  border-radius: 10px;
  background: #f8fafc;
}

.filters-fade-enter-active,
.filters-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.filters-fade-enter-from,
.filters-fade-leave-to {
  opacity: 0;
  transform: translateX(8px);
}

.filters-apply {
  width: 100%;
  border-radius: 10px;
}

.columns-menu {
  width: 420px;
  max-width: 90vw;
  max-height: 520px;
}

.columns-menu__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
}

.columns-menu__title {
  font-weight: 600;
  color: #1e293b;
}

.columns-menu__actions {
  display: flex;
  gap: 6px;
}

.columns-menu__content {
  padding: 12px 16px;
  max-height: 420px;
  overflow-y: auto;
}

.columns-group__title {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 4px 0 8px;
}

.columns-group {
  padding: 8px 0 12px;
  border-bottom: 1px solid #e5e7eb;
}

.columns-group:last-child {
  border-bottom: none;
}

.columns-group__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px 12px;
}

.columns-check :deep(.q-checkbox__label) {
  font-size: 12px;
  color: #334155;
}

.export-modal {
  width: 520px;
  max-width: 90vw;
  border-radius: 16px;
  padding: 12px 16px 16px;
}

.export-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0 8px;
}

.export-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
}

.export-count {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 16px;
  color: #64748b;
}

.export-options {
  display: grid;
  gap: 10px;
  margin-bottom: 16px;
}

.export-option {
  display: flex;
  gap: 10px;
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: 0.2s;
  position: relative;
  overflow: hidden;
}

.export-option:hover {
  border-color: #2563eb;
  background: rgba(37, 99, 235, 0.04);
}

.export-option--disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.export-option--loading {
  border-color: #2563eb;
  background: rgba(37, 99, 235, 0.08);
}

.export-option--loading::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  height: 3px;
  width: 100%;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, #2563eb 45%, #22c55e 100%);
  animation: export-progress 1.2s linear infinite;
}

.export-option__title {
  font-weight: 600;
  color: #1a1a1a;
}

.export-option__desc {
  font-size: 12px;
  color: #64748b;
}

.export-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
}

@keyframes export-progress {
  to {
    transform: translateX(100%);
  }
}

.list-search-modal {
  width: 640px;
  max-width: 95vw;
  border-radius: 16px;
  padding: 12px 16px 16px;
}

.list-search-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
}

.list-search-title {
  font-weight: 700;
  font-size: 18px;
}

.list-search-close {
  color: #64748b;
  text-transform: none;
}

.list-search-body {
  padding: 12px 0;
}

.list-search-hint {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
}

.list-search-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-search-section {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-search-section--text {
  min-height: 320px;
}

.list-search-section--file {
  min-height: 140px;
}

.list-search-section__title {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #1e293b;
}

.list-search-input {
  flex: 1 1 auto;
  display: flex;
}

.list-search-input :deep(.q-field__control) {
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  height: 100%;
  overflow: hidden;
}

.list-search-input :deep(.q-field__control):before,
.list-search-input :deep(.q-field__control):after {
  border: none;
}

.list-search-input :deep(.q-field--focused .q-field__control) {
  border-color: #2563eb;
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.15);
}

.list-search-input :deep(textarea) {
  height: 100% !important;
  max-height: unset !important;
  overflow: auto;
  resize: none;
  padding: 8px 12px 10px;
  line-height: 1.4;
  box-sizing: border-box;
}

.list-search-input :deep(textarea::placeholder) {
  white-space: pre-line;
}

.list-search-caption {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 6px;
}

.file-drop {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  display: block;
  cursor: pointer;
  color: #64748b;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}

.file-drop--compact {
  min-height: 84px;
}

.file-input {
  display: none;
}

.file-title {
  font-weight: 600;
  color: #334155;
}

.file-caption {
  font-size: 12px;
}

.file-success {
  margin-top: 6px;
  font-size: 12px;
  color: #16a34a;
}

.list-search-error {
  margin-top: 10px;
  padding: 8px 10px;
  background: #fdecea;
  color: #c10015;
  border-radius: 8px;
  font-size: 12px;
}

.list-search-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
}

@media (max-width: 1200px) {
  .list-layout {
    flex-direction: column;
  }

  .filters-panel {
    width: 100%;
  }
}

@media (max-width: 900px) {
  .list-search-section {
    min-height: unset;
  }
}
</style>

