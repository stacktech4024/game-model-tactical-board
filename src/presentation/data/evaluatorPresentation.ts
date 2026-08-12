import type { PresentationPageId } from './pageOrder'

export type EvaluatorSection = 'INTRO / WHY' | 'GAME ANALYSIS / WHAT' | 'SKILL DEVELOPMENT / HOW' | 'TRAINING METHODOLOGY / REASONING' | 'CLOSE'

export type EvaluatorPresentationStep = {
  pageId: PresentationPageId
  section: EvaluatorSection
  plannedSeconds: number
  purpose: string
  script: string[]
  interaction?: string
  transition: string
}

export const EVALUATOR_PRESENTATION: EvaluatorPresentationStep[] = [
  {
    pageId: 'cover',
    section: 'INTRO / WHY',
    plannedSeconds: 20,
    purpose: 'Frame one clear evaluator story.',
    script: [
      'This is my Pickering FC U20 Game and Training Model. For this capping presentation I will follow one Attacking Organization problem from our identity, through our 1-4-4-2 game plan and Fullback behaviour, into training and match transfer.',
    ],
    transition: 'Begin with who we are and why we want to play this way.',
  },
  {
    pageId: 'intro',
    section: 'INTRO / WHY',
    plannedSeconds: 40,
    purpose: 'State the playing identity before the tactical solution.',
    script: [
      'Our identity is calm possession, purposeful width, and forward progression. The ball helps us control rhythm and move the opponent; width stretches pressure; every pass or run should improve our chance of entering Zone 4 with support.',
      'That identity is the reason the central-to-wide solution matters. We are not switching for appearance—we are moving the opponent to create and use the free player.',
    ],
    interaction: 'Reveal Possession, Width, and Purpose only once.',
    transition: 'Connect the playing identity to the club and coaching philosophy.',
  },
  {
    pageId: 'philosophy',
    section: 'INTRO / WHY',
    plannedSeconds: 60,
    purpose: 'Connect club philosophy, coaching values, and player learning.',
    script: [
      'Pickering FC prioritizes technically sound, intelligent, adaptable players and long-term development. My coaching values—honesty, accountability, empathy, and growth—support that direction.',
      'The practical connection is player ownership. I design realistic problems, give players shared language and cues, and then allow them to recognize and solve the picture. The presentation will show the same problem at team, unit, individual, and training levels.',
    ],
    interaction: 'Briefly reveal Club Philosophy, Guiding Principles, and Coaching Philosophy.',
    transition: 'Define the shared geography used to describe the problem.',
  },
  {
    pageId: 'pitch-geography',
    section: 'INTRO / WHY',
    plannedSeconds: 60,
    purpose: 'Make direction, zones, and channels unambiguous.',
    script: [
      'Canada Soccer geography gives the team one shared picture. We attack from Zone 1 toward Zone 4. The capping focus is Attacking Organization in Zones 2 and 3 into Zone 4.',
      'Horizontally, Zones 2 and 3 are where we secure, unbalance, and create. Vertically, we use the central and half-space channels to draw pressure before releasing Channel 1 width. The same labels appear in every diagram and training activity.',
    ],
    interaction: 'Show Zones, then Both. Point to the attacking-direction arrow.',
    transition: 'Move from geography to the 1-4-4-2 team solution.',
  },
  {
    pageId: 'game-analysis',
    section: 'GAME ANALYSIS / WHAT',
    plannedSeconds: 300,
    purpose: 'Explain System, Strategy, Tactics, and Skill Set as four distinct levels.',
    script: [
      'The Moment is Attacking Organization. Our attacking system is 1-4-4-2, with all eleven Pickering players and all eleven opponents visible. #2 is the right Fullback; the same relationships apply to #3 and #11 on the left.',
      'The game problem is that central pressure can close the forward lane in Zones 2 and 3. If we continue forcing the middle, the opponent stays compact and can regain facing our goal.',
      'Our strategy is to circulate through #4/#5 and #6/#8/#10, draw the opponent narrow, and switch diagonally to the free wide side before the block can reset.',
      'The tactics make that plan executable. #7 receives and fixes the wide defender. #2 waits underneath until the ball and defender create the cue, then overlaps. #10 can connect the wall pass. #9 attacks the central finishing lane, #11 arrives from the far side, and #8 or #10 supports the cutback or reset.',
      'The Skill Set is what players must execute: scan before receiving, open the body, receive on the move, time the overlap, and select the correct cross or cutback. The opponent also shifts, covers depth, narrows the far side, and recovers toward goal, so the animation remains a game picture rather than an unopposed pattern.',
    ],
    interaction: 'Show System → Strategy → Tactics → Skill Set. Replay only the cue that supports the explanation.',
    transition: 'Isolate the Fullback relationship that executes the tactic.',
  },
  {
    pageId: 'skills',
    section: 'SKILL DEVELOPMENT / HOW',
    plannedSeconds: 210,
    purpose: 'Make the Fullback, winger, and striker relationship observable.',
    script: [
      'The selected individual action is Wide Release and Overlap for #2 Aaron or #3 Christian. The Fullback first scans upfield and inside, receives with the forward picture available, and supports underneath rather than running early.',
      '#7 or #11 must hold width or move inside at the correct time to fix the wide defender. Only when the receiver is secure, the defender is fixed, and cover exists behind the ball does the Fullback accelerate beyond.',
      '#9 reads the service and attacks the central lane. The far-side winger attacks the opposite gap, while #8 or #10 arrives for the cutback and protects the reset. The Fullback enters Zone 4 with the head up and chooses cross, cutback, combination, or reset from the live picture.',
      'Success is observable: early scanning, an open first touch, patience underneath, a timed overlap, coordinated box occupation, and a final action that matches the defenders and goalkeeper—not a pre-scripted cross.',
    ],
    interaction: 'Keep Wide Release & Overlap selected. Pause once at the overlap cue and once at the Zone 4 decision.',
    transition: 'Show how the same behaviours are designed into a session.',
  },
  {
    pageId: 'how-we-train-session',
    section: 'TRAINING METHODOLOGY / REASONING',
    plannedSeconds: 100,
    purpose: 'Show the evaluator-ready session design.',
    script: [
      'The training example is grounded in my Module 26 Micro Cycle Session Plan. It is a 50 by 35 metre Whole 6v6+2 game that starts with the goalkeeper and rewards central-to-wide progression.',
      'A direct finish earns one point; a finish after combining with the wide player earns two. That reward makes the desired solution valuable without forcing it. The central defenders and midfield must still perceive pressure, and the opposition remains active.',
      'The design preserves direction, both goals, role relationships, transition, body orientation, and more than one valid solution. On a true MD+1 it stays low load, high touch, RPE 2–3, with no tackling or heavy interceptions.',
    ],
    interaction: 'Point to Pitch, Parameters, Players, Reward, Relate, and Restrict.',
    transition: 'Read the two connected game pictures.',
  },
  {
    pageId: 'how-we-train-pictures',
    section: 'TRAINING METHODOLOGY / REASONING',
    plannedSeconds: 90,
    purpose: 'Prove game realism, opposition behaviour, and body orientation.',
    script: [
      'The first diagram shows the problem and the central circulation. Every player has a starting orientation; the opponent presses, screens, shifts, and protects depth rather than standing still.',
      'The second diagram begins from the first diagram’s final positions. The wide release changes the ball carrier, the Fullback and winger relationship, the defenders’ recovery angles, the goalkeeper set, and the box occupation. This continuity is what lets players perceive the same information they will face in the match.',
    ],
    interaction: 'Run Diagram 1, then Diagram 2. Point out one opponent movement and one body rotation in each.',
    transition: 'Make the complete transfer chain explicit.',
  },
  {
    pageId: 'how-we-train-transfer',
    section: 'TRAINING METHODOLOGY / REASONING',
    plannedSeconds: 90,
    purpose: 'Prove the five-link transfer chain.',
    script: [
      'The audit chain is explicit. Game Problem: central pressure closes the forward lane. Principle, Strategy, and Tactic: create width and support, draw narrow, release wide, fix, overlap, and occupy the box.',
      'Training Activity: the 50 by 35 metre 6v6+2. Player Behaviour: scan, circulate, recognize central closed, fix the defender, time the overlap, coordinate #9 and the far side, and select the final action.',
      'Match Transfer is the same cue chain: circulate, draw pressure, switch, combine wide, and penetrate. The success indicator is not completion of a pattern; it is recognition and connected arrival against a live opponent.',
    ],
    interaction: 'Read the five numbered links left to right. Do not open another example.',
    transition: 'Place the training activity inside the weekly load progression.',
  },
  {
    pageId: 'microcycle',
    section: 'TRAINING METHODOLOGY / REASONING',
    plannedSeconds: 120,
    purpose: 'Show when and why the same AO behaviour is trained.',
    script: [
      'The weekly objective is now one evaluator theme: Attacking Organization from Zones 2 and 3 into Zone 4. Each day includes the Moment, objective, duration, RPE, methodology, activity types, and physical load.',
      'Sunday restores rhythm and perception at a moderate load. Monday is the main 90-minute Whole-Part-Whole day at RPE 6–8, progressing from the game problem into the Fullback-winger-striker relationship and back to expanded play.',
      'Wednesday reduces physical volume to RPE 3–4 but keeps tactical speed high through opponent-specific rehearsal. Match Day tests the same cue chain under full pressure. Saturday is recovery and review.',
      'The load changes; the Game Model problem does not. That continuity is how the week prepares observable match behaviour instead of collecting unrelated activities.',
    ],
    interaction: 'Trace Sunday → Monday → Wednesday → Match → Recovery. Open Monday detail only if asked.',
    transition: 'Finish with the methodology used to coach and evaluate the week.',
  },
  {
    pageId: 'methodology',
    section: 'TRAINING METHODOLOGY / REASONING',
    plannedSeconds: 90,
    purpose: 'Explain Whole-Part-Whole and SCORE as the design rationale.',
    script: [
      'Whole-Part-Whole begins with the game problem in context, isolates the key relationship only long enough to improve recognition and execution, then returns players to opposition, direction, transition, and scoring.',
      'I evaluate the environment through SCORE: Soccer Problem, Challenge, Opposition, Realism, and Enjoyment. Those principles stop the Part from becoming an isolated pattern and ensure the final Whole tests transfer.',
      'My interventions use natural stoppages or Freeze and Recreate. I rewind the relevant actions, include moving teammates and opponents, rehearse at game speed, then exit so players can make the next decision themselves.',
    ],
    interaction: 'Show Whole → Part → Whole, then point to the five SCORE principles.',
    transition: 'Close by restating the single line from identity to match behaviour.',
  },
  {
    pageId: 'closing',
    section: 'CLOSE',
    plannedSeconds: 20,
    purpose: 'Finish with one memorable summary.',
    script: [
      'One identity, one AO game problem, one connected set of player behaviours, and one weekly progression. That is how our Game Model becomes something players can recognize and execute under match pressure. Thank you.',
    ],
    transition: 'Invite questions.',
  },
]

export const EVALUATOR_PAGE_ORDER = EVALUATOR_PRESENTATION.map((step) => step.pageId)
export const EVALUATOR_TOTAL_SECONDS = EVALUATOR_PRESENTATION.reduce((total, step) => total + step.plannedSeconds, 0)

export function getEvaluatorStep(pageId: PresentationPageId) {
  return EVALUATOR_PRESENTATION.find((step) => step.pageId === pageId)
}

export function formatPlannedTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes}:${String(remainder).padStart(2, '0')}`
}
