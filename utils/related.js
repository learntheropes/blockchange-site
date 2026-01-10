// utils/related.js
// Source of truth for internal linking. Keep it explicit and versioned.
//
// Rules:
// - Blog post pages: show 3 related blog posts (hand-picked per slug)
// - Architecture pages: show exactly 3 blog posts (hand-picked per architecture slug)
// - Fallbacks exist so new content doesn't break linking.

export const FOUNDATION_POST = 'payments-are-architecture-not-apis'

export const BLOG_RELATED_BY_SLUG = {
  'payments-are-architecture-not-apis': [
    'multi-rail-payment-architecture',
    'choosing-a-payment-structure',
    'payment-architecture-for-borderline-industries',
  ],

  'multi-rail-payment-architecture': [
    'payments-are-architecture-not-apis',
    'choosing-a-payment-structure',
    'payment-architecture-for-borderline-industries',
  ],

  'choosing-a-payment-structure': [
    'payments-are-architecture-not-apis',
    'multi-rail-payment-architecture',
    'payment-architecture-for-borderline-industries',
  ],

  'payment-architecture-for-borderline-industries': [
    'payments-are-architecture-not-apis',
    'multi-rail-payment-architecture',
    'choosing-a-payment-structure',
  ],
}

export const ARCH_RECOMMENDED_POSTS = {
  // Each architecture page links to EXACTLY 3 posts
  'in-ramp-architecture': [
    'multi-rail-payment-architecture',
    'payments-are-architecture-not-apis',
    'choosing-a-payment-structure',
  ],

  'off-ramp-and-payout-architecture': [
    'payments-are-architecture-not-apis',
    'payment-architecture-for-borderline-industries',
    'multi-rail-payment-architecture',
  ],

  'reduce-false-declines': [
    'multi-rail-payment-architecture',
    'choosing-a-payment-structure',
    'payments-are-architecture-not-apis',
  ],
}

export const ARCH_PILLARS = [
  'in-ramp-architecture',
  'off-ramp-and-payout-architecture',
  'reduce-false-declines',
]

// Helpers
export function unique(arr) {
  const out = []
  const seen = new Set()
  for (const x of arr || []) {
    const s = String(x || '').trim()
    if (!s) continue
    if (seen.has(s)) continue
    seen.add(s)
    out.push(s)
  }
  return out
}

export function getBlogRelatedSlugs(currentSlug, limit = 3) {
  const base = BLOG_RELATED_BY_SLUG[currentSlug] || []
  const fallback = [FOUNDATION_POST]
  const slugs = unique([...base, ...fallback]).filter(s => s !== currentSlug)
  return slugs.slice(0, limit)
}

export function getArchRelatedBlogSlugs(archSlug, limit = 3) {
  const base = ARCH_RECOMMENDED_POSTS[archSlug] || []
  const fallback = [FOUNDATION_POST]
  const slugs = unique([...base, ...fallback]).slice(0, limit)
  return slugs
}
