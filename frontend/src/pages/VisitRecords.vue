<template>
  <LayoutHeader>
    <template #left-header>
      <Breadcrumbs :items="[{ label: __('拜访记录'), route: { name: 'VisitRecords' } }]" />
    </template>
    <template #right-header>
      <Button
        :label="__('刷新')"
        icon-left="refresh-cw"
        variant="subtle"
        :loading="loading"
        @click="load()"
      />
    </template>
  </LayoutHeader>

  <div class="flex h-full flex-col overflow-hidden">
    <div class="flex flex-wrap items-end gap-3 border-b px-5 py-4">
      <div class="flex flex-col gap-1">
        <label class="text-xs text-ink-gray-5">{{ __('客户 / 内容') }}</label>
        <input
          v-model="keyword"
          type="text"
          :placeholder="__('输入客户名或内容关键字')"
          class="h-8 w-60 rounded border border-outline-gray-2 bg-surface-white px-2 text-sm"
          @keyup.enter="load()"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs text-ink-gray-5">{{ __('拜访类型') }}</label>
        <select
          v-model="kind"
          class="h-8 w-32 rounded border border-outline-gray-2 bg-surface-white px-2 text-sm"
          @change="load()"
        >
          <option value="">{{ __('全部类型') }}</option>
          <option v-for="k in kinds" :key="k" :value="k">{{ __(k) }}</option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs text-ink-gray-5">{{ __('开始日期') }}</label>
        <input
          v-model="fromDate"
          type="date"
          class="h-8 rounded border border-outline-gray-2 bg-surface-white px-2 text-sm"
          @change="load()"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs text-ink-gray-5">{{ __('结束日期') }}</label>
        <input
          v-model="toDate"
          type="date"
          class="h-8 rounded border border-outline-gray-2 bg-surface-white px-2 text-sm"
          @change="load()"
        />
      </div>
      <Button :label="__('查询')" variant="solid" @click="load()" />
      <span class="ml-auto text-sm text-ink-gray-5">
        {{ __('共 {0} 条', [total]) }}
      </span>
    </div>

    <div class="flex-1 overflow-y-auto px-5 py-4">
      <div v-if="!entries.length && !loading" class="py-16 text-center text-ink-gray-5">
        {{ __('暂无拜访记录') }}
      </div>
      <div v-for="row in entries" :key="row.name" class="border-b border-outline-gray-1 py-3">
        <div class="flex items-center gap-2">
          <span class="rounded px-2 py-0.5 text-xs" :class="kindClass(row.kind)">{{ __(row.kind) }}</span>
          <span class="text-sm text-ink-gray-9">{{ formatAt(row.at) }}</span>
          <router-link
            v-if="row.organization"
            :to="{ name: 'Organization', params: { organizationId: row.organization } }"
            class="text-sm text-ink-blue-6 hover:underline"
          >
            {{ row.organization_name }}
          </router-link>
          <span class="text-sm text-ink-gray-5" v-if="row.owner">· {{ row.owner }}</span>
          <span class="text-sm text-ink-gray-5" v-if="row.contact">· {{ row.contact }}</span>
          <span class="text-sm text-ink-gray-5" v-if="row.deal">· {{ __('商机') }} {{ row.deal }}</span>
        </div>
        <div class="mt-1 whitespace-pre-wrap text-sm text-ink-gray-7" v-if="row.detail">
          {{ row.detail }}
        </div>
        <div class="mt-1 text-xs text-ink-gray-5" v-if="row.next_follow_up_date">
          {{ __('下次跟进') }} {{ row.next_follow_up_date }}
          <span v-if="row.next_follow_up_note">· {{ row.next_follow_up_note }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { Breadcrumbs, Button, call, toast } from 'frappe-ui'
import LayoutHeader from '@/components/LayoutHeader.vue'

const entries = ref([])
const total = ref(0)
const kinds = ref(['电话', '拜访', '微信', '邮件', '会议', '其他', '通话'])
const keyword = ref('')
const kind = ref('')
const fromDate = ref('')
const toDate = ref('')
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const data = await call('wekona_china.crm_customer360.api.list_visit_records', {
      organization: '',
      kind: kind.value || '',
      from_date: fromDate.value || '',
      to_date: toDate.value || '',
      keyword: keyword.value || '',
      limit: 200,
    })
    entries.value = data?.entries || []
    total.value = data?.total || 0
    if (data?.kinds?.length) kinds.value = data.kinds
  } catch (error) {
    toast.error(__('拜访记录加载失败：{0}', [error?.messages?.[0] || error.message]))
  } finally {
    loading.value = false
  }
}

function formatAt(value) {
  if (!value) return ''
  return String(value).replace('T', ' ').slice(0, 16)
}

function kindClass(value) {
  return {
    电话: 'bg-surface-blue-2 text-ink-blue-7',
    拜访: 'bg-surface-green-2 text-ink-green-7',
    微信: 'bg-surface-amber-2 text-ink-amber-7',
    邮件: 'bg-surface-gray-2 text-ink-gray-7',
    会议: 'bg-surface-purple-2 text-ink-purple-7',
    通话: 'bg-surface-red-2 text-ink-red-7',
  }[value] || 'bg-surface-gray-2 text-ink-gray-7'
}

onMounted(load)
</script>
