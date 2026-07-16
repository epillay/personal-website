# Colonial Americas (Civilization V map mod)

A custom map script for Civilization V (Gods & Kings / Brave New World) for
a colonial-era Americas game: Spain, England, France, and America all start
at fixed, historically-flavored positions, and a set of City-State sites is
suggested to stand in for native nations.

Unlike a WorldBuilder scenario save, the land itself **regenerates every
game** the same way stock scripts (Continents, Pangaea, Fractal) do: the
coastline comes from Civ 5's own fractal noise, masked so it stays shaped
like the Americas but the exact coast, small islands, mountain spine,
terrain mix, marsh/forest coverage, and resource placement/density are all
re-rolled on every new game. Only the four colonial powers' start
coordinates and the Great Lakes are pinned down — everything else varies.

This was hand-written from scratch, not adapted from a tested Firaxis
script, so treat the first launch as a test run — see **Known rough edges**
below before you assume something is broken.

## Install

1. Copy the whole `civ5-colonial-americas` folder into your Civ 5 MODS
   folder:
   - Windows: `Documents\My Games\Sid Meier's Civilization 5\MODS\`
   - Mac: `~/Documents/Aspyr/Sid Meier's Civilization 5/MODS/`
   - Linux (Steam Play/Proton): under the game's compatdata `MODS` folder,
     or wherever your Civ 5 saves live.
2. Rename the copied folder to `Colonial Americas (v 1)` (Civ 5 mods are
   commonly named `<Name> (v <version>)`; the exact folder name doesn't
   have to match but this is the convention the in-game Mods browser uses).
3. Launch Civ 5 → **Mods**, enable "Colonial Americas", restart when
   prompted.
4. Start a new **Single Player** game → set **Map Script** to
   **Colonial Americas** in the advanced setup options.
5. Add Spain, England, France, and America (and any City-States) to the
   player list. Other civs will fall back to the default start-position
   finder rather than failing outright, but the fixed historical starts
   only fire for those four.

## What it does

- **Coastline (`GeneratePlotTypes`)**: `BANDS` defines a west/east column
  bound per row — the overall Americas envelope, Canada down through
  northern South America — plus explicit extra plots for Florida, Baja
  California, Cuba, the Bahamas, Hispaniola, and Puerto Rico
  (`EXTRA_LAND`). But the *exact* land/water split isn't hardcoded: each
  plot samples Civ 5's real coherent fractal noise
  (`FractalWorld:GetHeight`) against a threshold that's strict deep inside
  a band (almost always land) and loose near a band's edge or an island
  anchor (roughly even odds). That's what makes the coast, and whether a
  given island/peninsula appears at all, differ every game while the
  overall shape stays recognizable. The Great Lakes (`LAKE_PLOTS`) are the
  one exception — kept fixed as a landmark.
- **Elevation**: a mountain spine runs along the west edge of each band
  (Rockies / Sierra Madre / Andes) and a lower Appalachian hill line runs
  through the eastern US — both re-rolled per plot each game (`GetElevation`
  uses `Map.Rand`), so the ridge line shifts slightly game to game instead
  of being pixel-identical.
- **Terrain (`GenerateTerrain`)**: simplified latitude bands (snow/tundra in
  the north, grass in the tropics), with a `DRY_BELT` zone covering the
  Great Plains/Midwest that's biased toward desert/plains over grass —
  noticeably drier than the East Coast at the same latitude. How much of
  that belt reads as true desert vs. just dry plains is re-rolled once per
  game (`iAridityRoll`, roughly 40-74%), so aridity varies between
  playthroughs too.
- **Marsh (`AddFeatures`)**: `MARSH_ZONES` covers the Louisiana/Mississippi
  delta and Florida specifically, with a high (55%) per-plot marsh chance
  there and none anywhere else — so wetlands cluster on the Gulf coast and
  Florida instead of showing up in, say, Kansas.
- **Resources (`AddResources`)**: overall density is picked once per game
  (5-12% of eligible plots), then resource type leans on local
  terrain/feature (cotton/tobacco on plains, sugar/dye/cocoa in
  jungle/marsh, fur/deer in tundra and forest, silver in desert) — so both
  *how much* and *where* vary between games.
- `FIXED_STARTS` places Spain near Veracruz, England on the Chesapeake,
  France at Quebec, and America in the Ohio valley — all four playable
  from turn 1 rather than America emerging later from a British colony,
  and fixed every game since they're the scenario's historical anchor.
  Change the coordinates (or delete an entry) to retune this.
- `CITY_STATE_SITES` lists eleven suggested spots for City-States
  representing native nations (Iroquois, Shawnee, Powhatan, Cherokee,
  Sioux, Comanche, Apache, Huron, Maya, Taino, and a Muisca/Inca-frontier
  site). Civ 5 can't rename a City-State's underlying personality without
  an extra mod, but **you can rename the city itself** in World Builder —
  do that after generating the map to label each site.

## Customizing the shape or climate

Everything geographic lives in a handful of tables near the top of the Lua
file:

- `BANDS` — one row-range with a west/east column bound each. This is the
  coastline envelope; widen/narrow a zone by editing its `west`/`east`
  values. `GetLocalWaterPercent` controls how loose/strict the fractal
  threshold is near a band's edge — raise those numbers for a wigglier,
  more island-prone coast, lower them for something closer to the fixed v1
  shape.
- `EXTRA_LAND` — explicit `{x, y}` anchors for peninsulas/islands that a
  single band per row can't express.
- `LAKE_PLOTS` — plots carved out as Great Lakes.
- `DRY_BELT` — the Great Plains/Midwest aridity zone; move or resize it, or
  adjust the `40 + Map.Rand(35, ...)` aridity roll in `GenerateTerrain` to
  make the belt drier/wetter overall.
- `MARSH_ZONES` — the Gulf coast/Mississippi delta and Florida wetland
  zones; add more `{xMin, xMax, yMin, yMax}` entries for other real-world
  marsh regions (e.g. the Yucatan lowlands) if you want them too.

Coordinates: `x = 0` is the Pacific edge, `x = 53` the Atlantic edge;
`y = 0` is the southern edge of the map (northern South America), `y = 33`
the northern edge (Arctic Canada/Alaska).

## Known rough edges (please expect to iterate)

- **Untested against the live Civ 5 Lua API.** I don't have a way to launch
  Civ 5 from here, so this hasn't been run in-engine — I've only syntax
  checked the script and run its logic against a stand-in stub of the Civ 5
  API to catch Lua-level bugs (bad loops, nil table access, etc.), which
  isn't the same as verifying it against the real engine. Two spots carry
  the most risk:
  - `FractalWorld.Create()` / `:InitFractal{continent_grain=...}` /
    `:GetHeight(x,y)` / `:GetHeightFromPercent(percent)` — this is the part
    that makes the coastline regenerate with real fractal noise instead of
    being hardcoded, and it's the least-standardized corner of the API
    across Vanilla/Gods & Kings/Brave New World. If the map fails to
    generate at all, this is the first place to check.
  - The rest (`GetMapScriptInfo`, `GetMapInitData`, `GeneratePlotTypes`,
    `GenerateTerrain`, `AddFeatures`, `AddResources`, `StartPlotSystem`,
    `Map.GetPlot`, `SetPlotTypes`, `plot:SetTerrainType`,
    `PreGame.GetCivilization`, `player:SetStartingPlot`) match patterns used
    across many published Civ 5 map scripts, but exact signatures have
    drifted slightly between versions.
  - If the game rejects the mod or throws a Lua error, check
    `Logs/Lua.log` in your Civ 5 user folder — it'll point at the exact
    line/call to fix. If `FractalWorld` turns out to be the problem, the
    fallback is reverting `GeneratePlotTypes` to a plain `IsLand(x,y)` band
    check (no fractal, no water-percent threshold) — same idea as the first
    draft of this script, just without per-game coastline variation.
- **"Desert" in the Midwest is a Civ 5 vocabulary compromise.** Real Kansas/
  Nebraska read as semi-arid steppe, not true desert — but Civ 5 only has
  one arid terrain type, so "more DESERT/PLAINS tiles, less GRASS" in
  `DRY_BELT` is how "drier than the East Coast" gets expressed on this map.
- **No rivers.** River generation needs a flow/elevation algorithm this
  script doesn't attempt. Recommended: generate the map once, then hand-add
  the Mississippi, St. Lawrence, and Rio Grande in World Builder.
- **Resources are a randomized terrain/feature-based scatter**, not
  balanced for competitive multiplayer — fine for a single-player scenario,
  but expect some lumpiness.
- **Canada isn't a base-game civ.** There's no `CIVILIZATION_CANADA` in
  vanilla Civ 5, so it isn't in `FIXED_STARTS`. If you want it as a full
  playable civ, pair this map with a community Canada civ mod and add a
  `CIVILIZATION_CANADA` entry to `FIXED_STARTS`; otherwise treat one of the
  Canadian City-State sites (e.g. the Huron site at 30,29) as a Canada
  stand-in.
- **City-state renaming to native nation names is manual.** The
  `CITY_STATE_SITES` table only fixes *positions* — open World Builder
  after generating to rename each city-state's city to match its `note`.

## Suggested companion mods

For real Native American civilizations (rather than City-State stand-ins)
or a dedicated Canada civ, look for community civ mods on the Steam
Workshop — search terms like "Iroquois", "Cherokee", "Sioux civilization",
or "Canada civilization". This repo doesn't bundle any third-party mod IDs
since those change over time; search and pick what looks maintained.
