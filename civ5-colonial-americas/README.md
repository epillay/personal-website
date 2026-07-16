# Colonial Americas (Civilization V map mod)

A custom map script for Civilization V (Gods & Kings / Brave New World) that
lays out a stylized, fixed-shape Americas continent for a colonial-era game:
Spain, England, France, and America all start at fixed positions, and a set
of City-State sites is suggested to stand in for native nations.

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

- `Maps/ColonialAmericas.lua` paints a 54×34 plot map shaped like Canada
  down through northern South America, using simple per-row west/east
  "band" bounds (see the `BANDS` table) plus explicit extra plots for
  Florida, Baja California, Cuba, the Bahamas, Hispaniola, and Puerto Rico
  (`EXTRA_LAND`), and a few carved-out Great Lakes plots (`LAKE_PLOTS`).
- A rough mountain spine runs along the west coast (Rockies / Sierra Madre
  / Andes) and a low Appalachian hill line runs through the eastern US.
- Terrain is assigned by simplified latitude bands (snow/tundra in the
  north, plains through the US, a desert patch in the SW/northern Mexico,
  grass/jungle toward the tropics).
- `FIXED_STARTS` places Spain near Veracruz, England on the Chesapeake,
  France at Quebec, and America in the Ohio valley — all four playable
  from turn 1 rather than America emerging later from a British colony.
  Change the coordinates (or delete an entry) to retune this.
- `CITY_STATE_SITES` lists eleven suggested spots for City-States
  representing native nations (Iroquois, Shawnee, Powhatan, Cherokee,
  Sioux, Comanche, Apache, Huron, Maya, Taino, and a Muisca/Inca-frontier
  site). Civ 5 can't rename a City-State's underlying personality without
  an extra mod, but **you can rename the city itself** in World Builder —
  do that after generating the map to label each site.

## Customizing the shape

Everything geographic lives in three tables at the top of the Lua file:

- `BANDS` — one row-range with a west/east column bound each. This is the
  main coastline; widen/narrow a zone by editing its `west`/`east` values.
- `EXTRA_LAND` — explicit `{x, y}` plots for peninsulas/islands that a
  single band per row can't express.
- `LAKE_PLOTS` — plots carved out as Great Lakes.

Coordinates: `x = 0` is the Pacific edge, `x = 53` the Atlantic edge;
`y = 0` is the southern edge of the map (northern South America), `y = 33`
the northern edge (Arctic Canada/Alaska).

## Known rough edges (please expect to iterate)

- **Untested against the live Civ 5 Lua API.** I don't have a way to launch
  Civ 5 from here, so this hasn't been run in-engine. The overall function
  names (`GetMapScriptInfo`, `GetMapInitData`, `GeneratePlotTypes`,
  `GenerateTerrain`, `AddFeatures`, `AddResources`, `StartPlotSystem`) and
  API calls (`Map.GetPlot`, `SetPlotType`/`SetPlotTypes`,
  `plot:SetTerrainType`, `PreGame.GetCivilization`,
  `player:SetStartingPlot`) match the patterns used across published Civ 5
  map scripts, but exact signatures have drifted slightly between Vanilla,
  Gods & Kings, and Brave New World over the years. If the game rejects the
  mod or throws a Lua error, check `Logs/Lua.log` in your Civ 5 user
  folder — that log will point at the exact line/call to fix.
- **No rivers.** River generation needs a flow/elevation algorithm this
  script doesn't attempt. Recommended: generate the map once, then hand-add
  the Mississippi, St. Lawrence, and Rio Grande in World Builder.
- **Resources are a simple random scatter**, not balanced for competitive
  play — fine for a scenario, but expect lumpy distribution.
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
