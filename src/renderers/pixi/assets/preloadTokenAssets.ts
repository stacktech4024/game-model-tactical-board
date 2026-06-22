import { Assets } from 'pixi.js'

import shaperMaroonUrl from '../../../assets/shapers/player_maroon.svg'
import shaperYellowUrl from '../../../assets/shapers/player_yellow.svg'
import shaperGrayUrl from '../../../assets/shapers/player_gray.svg'
import shaperCyanUrl from '../../../assets/shapers/player_cyan.svg'
import ballNikeUrl from '../../../assets/shapers/ball_nike_ORIGINAL.svg'

const TOKEN_ASSET_URLS = [
  shaperMaroonUrl,
  shaperYellowUrl,
  shaperGrayUrl,
  shaperCyanUrl,
  ballNikeUrl,
]

let preloadPromise: Promise<unknown> | undefined

// Texture.from() only does a Cache lookup — it never fetches. These URLs must
// be loaded into the Assets cache once before any Sprite is created from them,
// otherwise Texture.from() silently returns undefined and the sprite renders empty.
export function preloadTokenAssets(): Promise<unknown> {
  preloadPromise ??= Assets.load(TOKEN_ASSET_URLS)
  return preloadPromise
}
