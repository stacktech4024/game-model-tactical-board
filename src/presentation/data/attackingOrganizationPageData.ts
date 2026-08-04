export const ATTACKING_ORGANIZATION_TABS = ['System', 'Strategy', 'Tactics', 'Skill Set'] as const

export type AttackingOrganizationTab = (typeof ATTACKING_ORGANIZATION_TABS)[number]

export const ATTACKING_ORGANIZATION_PAGE_BODY =
  'In Attacking Organization, we build from Zone 2 through Zone 3 into Zone 4: #3 releases the wide channel, #11 and #7 provide Channel 1 width, #6/#4 support underneath, and #10 links #9 for the central finish.'

export const ATTACKING_ORGANIZATION_TAB_COPY: Record<
  AttackingOrganizationTab,
  { headline: string; note: string; chips: string[] }
> = {
  System: {
    headline: '1-4-4-2: fullback-supported build',
    note: '#3 is the ball-side fullback release, while #2 and #7 hold a far-side switch option without disconnecting from the unit.',
    chips: ['Zone 2 build', 'Zone 3 link', 'Zone 4 finish'],
  },
  Strategy: {
    headline: 'Build through wide channels',
    note: 'Use Channel 1 width to unbalance the block, connect through Channel 2 support, then enter Channel 3 for the central finish.',
    chips: ['Channel 1 width', 'Channel 2 support / overlap', 'Channel 3 central finish'],
  },
  Tactics: {
    headline: 'Key tactical behaviours',
    note: 'The fullback supports the wide action, #11 connects into #6, #4 arrives underneath the ball, and #10 finds #9 as the back line reacts.',
    chips: ['#3 release and support', '#7/#11 width', '#10 link / switch', '#9 central target', 'Rest-defence balance'],
  },
  'Skill Set': {
    headline: 'Skill Set under pressure',
    note: 'Scanning, support angles, overlap timing, and the final pass make the wide-channel progression repeatable against an organized block.',
    chips: ['Scanning', 'First touch forward', 'Support angle', 'Overlap timing', 'Pass selection'],
  },
}
