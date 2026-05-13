<script setup lang="ts">
import type { DataLabLocale, DataTable } from '../types/dataLab'

withDefaults(defineProps<{
  table: DataTable
  locale?: DataLabLocale
  maxRows?: number
}>(), {
  locale: 'zh-CN',
  maxRows: 7,
})

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === '') return 'NA'
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(2)
  return String(value)
}
</script>

<template>
  <div class="data-table-view">
    <table>
      <thead>
        <tr>
          <th v-for="column in table.columns" :key="column.key">
            {{ column.label[locale] }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in table.rows.slice(0, maxRows)" :key="rowIndex">
          <td
            v-for="column in table.columns"
            :key="column.key"
            :class="{ 'is-missing': row[column.key] === null || row[column.key] === undefined || row[column.key] === '' }"
          >
            {{ displayValue(row[column.key]) }}
          </td>
        </tr>
      </tbody>
    </table>
    <p v-if="table.rows.length > maxRows">
      {{ locale === 'zh-CN' ? `另有 ${table.rows.length - maxRows} 行未显示` : `${table.rows.length - maxRows} more rows hidden` }}
    </p>
  </div>
</template>
