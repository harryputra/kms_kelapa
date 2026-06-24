<script lang="ts">
import type { Component } from 'vue'
export interface WasteViz {
  slug: string
  label: string
  count: number
  desc: string
  color: string
  soft: string
  icon: Component
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronRight } from 'lucide-vue-next'

const props = defineProps<{ wastes: WasteViz[]; selected: string }>()
const emit = defineEmits<{ 'update:selected': [slug: string]; select: [slug: string] }>()

const hovered = ref<string | null>(null)
const active = computed(() => hovered.value ?? (props.selected || null))

function hover(slug: string | null) { hovered.value = slug }
function select(slug: string) { emit('update:selected', slug); emit('select', slug) }

const colorOf = (slug: string) => props.wastes.find((w) => w.slug === slug)?.color ?? '#64748B'

// ---- Geometri penampang (cut-face) kelapa ----
const cx = 300, cy = 320
// urutan luar→dalam = urutan kartu atas→bawah: sabut, tempurung, ampas(daging), air(rongga)
const LAYOUT: Record<string, { r: number; w: number; angle: number; cardY: number; disc?: boolean; dotR?: number; grad: string }> = {
  sabut: { r: 224, w: 66, angle: -56, cardY: 108, grad: 'husk' },
  tempurung: { r: 176, w: 26, angle: -16, cardY: 244, grad: 'shell' },
  ampas: { r: 128, w: 64, angle: 22, cardY: 380, grad: 'flesh' },
  air: { r: 94, w: 0, angle: 60, cardY: 516, disc: true, dotR: 62, grad: 'water' },
}
const ORDER = ['sabut', 'tempurung', 'ampas', 'air']
const orderedWastes = computed(() => ORDER.map((s) => props.wastes.find((w) => w.slug === s)).filter(Boolean) as WasteViz[])

const rad = (d: number) => (d * Math.PI) / 180
function dot(slug: string) {
  const L = LAYOUT[slug]
  const r = L.dotR ?? L.r
  return { x: cx + r * Math.cos(rad(L.angle)), y: cy + r * Math.sin(rad(L.angle)) }
}
function leaderPath(slug: string) {
  const d = dot(slug)
  const cardY = LAYOUT[slug].cardY
  return `M${d.x.toFixed(1)},${d.y.toFixed(1)} L${(d.x + 22).toFixed(1)},${cardY} L588,${cardY}`
}

function makeFibers(fcx: number, fcy: number, r1: number, r2: number, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    const rr2 = r2 + (i % 3) * 3
    return { x1: fcx + r1 * Math.cos(a), y1: fcy + r1 * Math.sin(a), x2: fcx + rr2 * Math.cos(a), y2: fcy + rr2 * Math.sin(a) }
  })
}
const fibersD = makeFibers(cx, cy, 192, 256, 50)
const fibersM = makeFibers(230, 230, 150, 198, 40)

// Style ring (dipakai desktop & mobile dgn center berbeda)
function ringStyle(slug: string, ox: number, oy: number) {
  const a = active.value
  return {
    opacity: a && a !== slug ? 0.4 : 1,
    filter: a === slug ? `drop-shadow(0 0 13px ${colorOf(slug)})` : 'none',
    transform: a === slug ? 'scale(1.035)' : 'scale(1)',
    transformOrigin: `${ox}px ${oy}px`,
  }
}
const cardStyle = (slug: string) => ({ top: `${(LAYOUT[slug].cardY / 640) * 100}%` })

// Mobile rings (viewBox 460, center 230,230)
const M: Record<string, { r: number; w: number; disc?: boolean; grad: string }> = {
  sabut: { r: 170, w: 52, grad: 'husk' }, tempurung: { r: 134, w: 20, grad: 'shell' },
  ampas: { r: 98, w: 48, grad: 'flesh' }, air: { r: 72, w: 0, disc: true, grad: 'water' },
}
</script>

<template>
  <div>
    <!-- ============ DESKTOP ============ -->
    <div class="relative mx-auto hidden w-full max-w-5xl lg:block" style="aspect-ratio: 980 / 640">
      <svg viewBox="0 0 980 640" class="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="husk-d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CE9038" /><stop offset="1" stop-color="#6F4517" /></linearGradient>
          <linearGradient id="shell-d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4C3C2E" /><stop offset="1" stop-color="#1A130C" /></linearGradient>
          <linearGradient id="flesh-d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" /><stop offset="1" stop-color="#ECDFCB" /></linearGradient>
          <radialGradient id="water-d" cx="42%" cy="36%" r="70%"><stop offset="0" stop-color="#FFFFFF" /><stop offset="1" stop-color="#CDE9F0" /></radialGradient>
        </defs>

        <ellipse :cx="cx" :cy="cy + 250" rx="200" ry="26" fill="#0F172A" opacity="0.07" />

        <!-- husk fibers -->
        <g stroke="#5A3410" stroke-width="0.8" opacity="0.34">
          <line v-for="(f, i) in fibersD" :key="i" :x1="f.x1" :y1="f.y1" :x2="f.x2" :y2="f.y2" />
        </g>

        <!-- lapisan -->
        <template v-for="slug in ORDER" :key="slug">
          <circle
            v-if="!LAYOUT[slug].disc" :cx="cx" :cy="cy" :r="LAYOUT[slug].r" fill="none"
            :stroke="`url(#${LAYOUT[slug].grad}-d)`" :stroke-width="LAYOUT[slug].w"
            class="ring" :style="ringStyle(slug, cx, cy)"
            @mouseenter="hover(slug)" @mouseleave="hover(null)" @click="select(slug)"
          />
          <circle
            v-else :cx="cx" :cy="cy" :r="LAYOUT[slug].r" :fill="`url(#${LAYOUT[slug].grad}-d)`"
            class="ring" :style="ringStyle(slug, cx, cy)"
            @mouseenter="hover(slug)" @mouseleave="hover(null)" @click="select(slug)"
          />
        </template>
        <circle :cx="cx" :cy="cy" r="258" fill="none" stroke="#3A2410" stroke-width="1.5" opacity="0.5" pointer-events="none" />

        <!-- leader lines -->
        <g pointer-events="none" fill="none" stroke-linejoin="round" stroke-linecap="round">
          <template v-for="w in orderedWastes" :key="`l-${w.slug}`">
            <path :d="leaderPath(w.slug)" stroke="#fff" stroke-width="4" opacity="0.85" />
            <path
              :d="leaderPath(w.slug)" :stroke="active === w.slug ? w.color : '#CBD5E1'"
              :stroke-width="active === w.slug ? 2.4 : 1.5"
              :style="{ opacity: active && active !== w.slug ? 0.35 : 1, transition: 'stroke .2s, stroke-width .2s, opacity .2s' }"
            />
            <circle :cx="dot(w.slug).x" :cy="dot(w.slug).y" r="6" :fill="active === w.slug ? w.color : '#fff'" :stroke="w.color" stroke-width="2.5" :style="{ transition: 'fill .2s' }" />
          </template>
        </g>
      </svg>

      <!-- kartu (absolute) -->
      <button
        v-for="w in orderedWastes" :key="`c-${w.slug}`" type="button"
        class="cdg-card" :class="{ 'cdg-card--on': active === w.slug }"
        :style="{ ...cardStyle(w.slug), borderColor: active === w.slug ? w.color : undefined }"
        :aria-pressed="selected === w.slug"
        @mouseenter="hover(w.slug)" @mouseleave="hover(null)" @focus="hover(w.slug)" @blur="hover(null)" @click="select(w.slug)"
      >
        <span class="cdg-ico" :style="{ background: w.soft, color: w.color }"><component :is="w.icon" class="h-5 w-5" /></span>
        <span class="min-w-0 flex-1 text-left">
          <span class="cdg-title" :style="{ color: w.color }">{{ w.label }}</span>
          <span class="mt-0.5 block text-sm leading-snug text-muted">{{ w.desc }}</span>
          <span class="mt-1.5 inline-flex items-center gap-1 text-xs font-medium" :style="{ color: w.color }">{{ w.count }} cetak biru <ChevronRight class="h-3.5 w-3.5" /></span>
        </span>
      </button>
    </div>

    <!-- ============ MOBILE ============ -->
    <div class="lg:hidden">
      <svg viewBox="0 0 460 460" class="mx-auto block w-full max-w-xs" aria-hidden="true">
        <defs>
          <linearGradient id="husk-m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CE9038" /><stop offset="1" stop-color="#6F4517" /></linearGradient>
          <linearGradient id="shell-m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4C3C2E" /><stop offset="1" stop-color="#1A130C" /></linearGradient>
          <linearGradient id="flesh-m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" /><stop offset="1" stop-color="#ECDFCB" /></linearGradient>
          <radialGradient id="water-m" cx="42%" cy="36%" r="70%"><stop offset="0" stop-color="#FFFFFF" /><stop offset="1" stop-color="#CDE9F0" /></radialGradient>
        </defs>
        <g stroke="#5A3410" stroke-width="0.8" opacity="0.34"><line v-for="(f, i) in fibersM" :key="i" :x1="f.x1" :y1="f.y1" :x2="f.x2" :y2="f.y2" /></g>
        <template v-for="slug in ORDER" :key="`m-${slug}`">
          <circle v-if="!M[slug].disc" cx="230" cy="230" :r="M[slug].r" fill="none" :stroke="`url(#${M[slug].grad}-m)`" :stroke-width="M[slug].w" class="ring" :style="ringStyle(slug, 230, 230)" @click="select(slug)" />
          <circle v-else cx="230" cy="230" :r="M[slug].r" :fill="`url(#${M[slug].grad}-m)`" class="ring" :style="ringStyle(slug, 230, 230)" @click="select(slug)" />
        </template>
        <circle cx="230" cy="230" r="196" fill="none" stroke="#3A2410" stroke-width="1.5" opacity="0.5" pointer-events="none" />
      </svg>

      <div class="mt-5 grid gap-2.5">
        <button
          v-for="w in orderedWastes" :key="`mc-${w.slug}`" type="button"
          class="cdg-card-m" :class="{ 'cdg-card--on': active === w.slug }"
          :style="{ borderColor: active === w.slug ? w.color : undefined }"
          :aria-pressed="selected === w.slug" @click="select(w.slug)"
        >
          <span class="cdg-ico" :style="{ background: w.soft, color: w.color }"><component :is="w.icon" class="h-5 w-5" /></span>
          <span class="min-w-0 flex-1 text-left">
            <span class="cdg-title" :style="{ color: w.color }">{{ w.label }}</span>
            <span class="mt-0.5 block text-sm leading-snug text-muted">{{ w.desc }}</span>
          </span>
          <span class="chip shrink-0" :style="{ background: w.soft, color: w.color }">{{ w.count }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ring { cursor: pointer; transition: opacity 0.25s ease, filter 0.25s ease, transform 0.25s ease; }

.cdg-card,
.cdg-card-m {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  border-radius: 1rem;
  border: 1px solid var(--cdg-line, #e6ece8);
  background: #fff;
  padding: 0.85rem 1rem;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
  transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
}
.cdg-card {
  position: absolute;
  left: 59.5%;
  width: 38.5%;
  transform: translateY(-50%);
}
.cdg-card:hover,
.cdg-card:focus-visible,
.cdg-card-m:hover {
  box-shadow: 0 10px 26px -10px rgba(15, 23, 42, 0.22);
}
.cdg-card--on {
  box-shadow: 0 14px 30px -12px rgba(15, 23, 42, 0.28);
  border-width: 1.5px;
}
.cdg-card:focus-visible,
.cdg-card-m:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
.cdg-ico {
  display: flex;
  height: 2.5rem;
  width: 2.5rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
}
.cdg-title {
  font-family: var(--font-display, inherit);
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: -0.01em;
  text-transform: uppercase;
}

@media (prefers-reduced-motion: reduce) {
  .ring { transition: opacity 0.2s ease; transform: none !important; }
  .cdg-card,
  .cdg-card-m { transition: border-color 0.2s ease; }
}
</style>
