# Colonial Americas (Civilization V map mod)

A custom map script for Civilization V (Gods & Kings / Brave New World) for
a colonial-era Americas game: Spain, England, France, and America all start
at fixed, historically-flavored positions, alongside three native nations
that are real, fully playable Civ 5 civilizations — Aztec, Iroquois, and
Shoshone — also given fixed starts. City-State sites are suggested on top
of that for native peoples that don't have a dedicated Civ 5 civ (Cherokee,
Sioux, Powhatan, Huron, Apache, Taino, and Shawnee).

The map is 70×44 (3,080 plots) — deliberately sized above Civ 5's stock
"Small" (56×36, 6-player) map, since this scenario hosts 7 fixed majors + 7
City-States (14 starting positions), more than even a stock "Huge" map's
player count. An earlier 54×34 draft worked out to roughly 43 land tiles
per starting position on average, well under what a civ needs to comfortably
grow past 2-3 cities; this size gets that up to roughly 75.

Unlike a WorldBuilder scenario save, the land itself **regenerates every
game** the same way stock scripts (Continents, Pangaea, Fractal) do: the
coastline, mountain ranges, climate belts, and forest cover all come from
Civ 5's own coherent fractal noise, each thresholded per region so a given
range/belt/forest clusters into one recognizable shape — the Rockies stay
a mountain corridor along the west coast, the Great Plains stay a dry
interior belt, the Canadian boreal forest stays a big contiguous forest —
while the exact extent, peaks, and patches differ every game. Only the
fixed civ start coordinates and the Great Lakes are pinned down exactly;
everything else regenerates.

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
5. Add players for Spain, England, France, America, Aztec, Iroquois, and
   Shoshone (and any City-States) to get all seven fixed historical starts.
   **Shoshone requires the Brave New World expansion** — if you don't
   own/enable it, Shoshone simply won't be selectable in the player list,
   and this mod doesn't need it to be present. Any other civ you add
   instead falls back to the default start-position finder rather than
   failing outright.

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
- **West Coast (`band.coast`)**: each band has a flat coastal shelf between
  the actual coastline and where the mountains start — California's Central
  Valley/Coast Ranges being the clearest real-world example — rather than
  mountains dropping straight into the Pacific. Shelf width varies per band
  (wider through the US/Mexico coast where a real coastal lowland exists,
  narrower through Canada's fjord-like coast and the Andes, which really do
  plunge close to the Pacific in South America). Shoshone and Apache sit just
  past the mountains on the *inland* side, which now lines up even better
  with reality — the Great Basin and Sonoran desert are both rain-shadow
  regions on the leeward side of a mountain range, not coastal.
- **Elevation (`GetElevation`)**: the Rockies/Sierra Madre/Andes run as a
  fixed-position, fixed-width *corridor* starting where the coastal shelf
  ends — so the range is always roughly there — but which plots within that
  corridor become full `MOUNTAIN` vs. `HILLS` vs. fade out to flat comes from
  a dedicated noise field (`g_RockiesFractal`) thresholded by distance into
  the corridor. That noise field is what makes mountains cluster into
  ridge-like shapes instead of a scattered checkerboard, while still varying
  which exact peaks appear each game. The Appalachians on the eastern US use
  a second, independent noise field (`g_AppalachianFractal`) so the two
  ranges don't move in lockstep.
- **Climate (`GetClimateBand`/`GetAridPercent`)**: aridity is modeled as a
  rain-shadow gradient centered on the mountains, not the coastline — the
  coastal shelf itself stays mild/humid (California's actual Mediterranean
  climate), with the driest conditions sitting just *east* of the mountain
  corridor, fading back to humid further inland still. That's what produces
  a Great Plains/Mexican-plateau/Andean-highland dry belt as an emergent
  shape instead of a hardcoded box, the same way stock Civ 5 terrain
  generation derives climate from geography + noise rather than
  hand-painting regions. The belt is pulled back toward humid in Canada's
  boreal band and the deep tropics, where real forest/rainforest stays wet
  regardless of rain shadow. A third noise field (`g_ClimateFractal`) then
  clusters the exact dry patches into contiguous desert cores within a wider
  dry-plains fringe.
- **Forest/jungle (`GetFeatureChance`/`AddFeatures`)**: each region gets a
  base forest/jungle chance — low (8%) in the open Great Plains interior,
  high (55-60%) in the Canadian boreal band and the deep tropics, moderate
  (32%) in the eastern woodlands — applied through a fourth noise field
  (`g_ForestFractal`) so it clusters into large contiguous blocks ("huge
  forests") rather than scattered single tiles, while still differing in
  extent every game.
- **Marsh (`MARSH_ZONES`)**: kept as an explicit rectangle rather than
  noise-driven, since real marsh follows specific low-lying river
  deltas/coastlines (the Mississippi delta, Florida) rather than a broad
  climate gradient. High (55%) per-plot chance there, none anywhere else —
  so wetlands cluster on the Gulf coast and Florida instead of showing up
  in, say, Kansas.
- **Resources (`AddResources`)**: overall density is picked once per game
  (5-12% of eligible plots). Resource *type* follows loose historical
  geography, not just terrain type everywhere it appears: Cotton and Dye
  (indigo) — standing in for Tobacco, see below — are restricted to
  `AMERICAN_SOUTH` (roughly Chesapeake through the Carolinas/Georgia) rather
  than any Plains tile on the map; Sugar/Dye/Cocoa cluster in
  jungle/marsh (Caribbean, Central America); Fur/Deer in forest and
  tundra/snow (the northern fur trade); Silver in desert (Mexican/Andean
  silver country).
- `FIXED_STARTS` covers seven civs, all playable from turn 1 and fixed every
  game since they're the scenario's historical anchor:
  - **Spain** near Veracruz, **England** on the Atlantic coast, **France**
    at Quebec, **America** as an interior frontier (rather than emerging
    later from a British colony) — spread across the width of their bands
    rather than clustered near each other, since an earlier draft had
    Iroquois/England/France/America uncomfortably close together.
  - **Aztec** (Montezuma, base game) in the central Mexican highlands,
    **Iroquois** (Hiawatha, base game) in the western Great Lakes, and
    **Shoshone** (Pocatello, requires Brave New World) in the Great
    Basin/Rocky Mountain foothills — these are real playable Civ 5
    civilizations, not City-State stand-ins, so they get proper leaders,
    unique units, and unique buildings. Maya (Pacal) was in an earlier draft
    too but was dropped — it sat right next to Aztec with barely 3 tiles
    between them, and Aztec already anchors that part of the map.
  - Iroquois in particular sits further west within the Great Lakes band
    than its real historical (upstate NY) location — a deliberate trade of
    geographic precision for breathing room from England/France/America.
  - Every coordinate here is at least 8 tiles east of where its band's
    mountain corridor starts (`band.west + band.coast`, with
    `ROCKIES_CORRIDOR_WIDTH` at 7), which guarantees zero chance of
    generating on top of a fractal-placed mountain tile (see `GetElevation`)
    — keep any new fixed start you add at that same distance or greater, OR
    place it on the coastal shelf itself (`band.west` to
    `band.west + band.coast - 1`), which is unconditionally flat.
  - Change the coordinates (or delete an entry) to retune this.
- `CITY_STATE_SITES` lists seven suggested spots for City-States representing
  native nations that AREN'T real Civ 5 civilizations: Shawnee, Powhatan,
  Cherokee, Sioux, Apache, Huron, and Taino. An earlier 9-site draft also had
  Comanche and a Muisca/Inca-frontier site, cut to reduce crowding — Comanche
  overlapped the same Great Plains niche as Sioux and Shoshone, and the
  Muisca/Inca site was the vaguest, most isolated entry and least central to
  a North America-focused colonial scenario. Civ 5 can't rename a
  City-State's underlying personality without an extra mod, but **you can
  rename the city itself** in World Builder — do that after generating the
  map to label each site.

### Why Cotton/Dye instead of Tobacco

An earlier draft of this script used `RESOURCE_TOBACCO`, which isn't
actually a base-game Civ 5 resource — that call would have silently no-oped
in-game (`GameInfoTypes["RESOURCE_TOBACCO"]` resolves to nothing, so the
`if resType then` check just skips it). Cotton and Dye are the real,
placeable resources that carry the same "Southern colonial cash crop"
flavor (cotton fields and indigo dye were both genuine Tidewater/Carolina
exports), so they're what `AMERICAN_SOUTH` actually places. If you're
running a resource-adding mod that defines a real `RESOURCE_TOBACCO`, just
add it to the `AMERICAN_SOUTH` options list in `AddResources`.

## Customizing the shape, ranges, or climate

Everything geographic lives in a handful of tables/functions near the top of
the Lua file:

- `BANDS` — one row-range with a west/east column bound each, plus a `coast`
  width (see below). `west`/`east` are the coastline envelope, and also what
  every other region (mountains, climate, forests) measures its "distance
  from the coast" against. Widen/narrow a zone by editing its `west`/`east`
  values. `GetLocalWaterPercent` controls how loose/strict the fractal
  threshold is near a band's edge — raise those numbers for a wigglier,
  more island-prone coast.
- `band.coast` — the width of flat lowland between the actual coastline
  (`west`) and where the mountain corridor starts (see West Coast, above).
  Widen it for a bigger coastal plain (more California-like), narrow/zero it
  for mountains that drop straight into the ocean (more like Canada's real
  Pacific coast or the Andes).
- `EXTRA_LAND` — explicit `{x, y}` anchors for peninsulas/islands that a
  single band per row can't express.
- `LAKE_PLOTS` — plots carved out as Great Lakes.
- `ROCKIES_CORRIDOR_WIDTH` and `GetElevation` — how many tiles past
  `band.west + band.coast` the mountain corridor can reach, and the
  peak/hills split within it. The Appalachian line (`y >= 22 and y <= 36`,
  `distFromEast` between 7 and 12) is defined directly inside `GetElevation`
  and is unaffected by `coast` (it's measured from the *east* edge).
- `GetAridPercent` — the rain-shadow formula behind the Great
  Plains/Mexican-plateau/Andean dry belt, now centered on the mountains
  rather than the coastline: flat `12` on the coastal shelf (mild/humid),
  then `55 - distFromMountains * 4.6` once past the mountains, pulled toward
  humid in Canada (`* 0.3`) and the tropics (`* 0.4`). Tune the base 55/4.6
  numbers to make the belt wider/narrower/drier/wetter.
- `MARSH_ZONES` — the Gulf coast/Mississippi delta and Florida wetland
  zones; add more `{xMin, xMax, yMin, yMax}` entries for other real-world
  marsh regions (e.g. the Yucatan lowlands) if you want them too.
- `AMERICAN_SOUTH` — where Cotton/Dye (the Tobacco stand-ins, see above) are
  allowed to place; move or resize it, or add similar zone-gated entries in
  `AddResources` for other geography-specific resources.
- `GetFeatureChance` — the base forest/jungle percentage per region (Great
  Plains interior, boreal Canada, tropics, general woodlands); raise/lower
  the numbers there to make a given region's forest cover thicker or
  thinner.

Coordinates: `x = 0` is the Pacific edge, `x = 69` the Atlantic edge;
`y = 0` is the southern edge of the map (northern South America), `y = 43`
the northern edge (Arctic Canada/Alaska). All the coordinate tables were
produced by scaling an earlier 54×34 draft by 1.3x (see git history for the
pre-scale numbers) — they're a reasonable starting point, not hand-tuned to
the pixel.

## Known rough edges (please expect to iterate)

- **Untested against the live Civ 5 Lua API.** I don't have a way to launch
  Civ 5 from here, so this hasn't been run in-engine — I've only syntax
  checked the script and run its logic (including a clustering check at the
  current 70x44 size: in a stand-in stub, mountain plots ended up with a
  mountain neighbor ~99% of the time and forest plots 100%, versus scattered
  singles before the fractal-clustering rewrite) against a stub of the Civ 5
  API, which is not the same as verifying against the real engine. Two spots
  carry the most risk:
  - `FractalWorld.Create()` / `:InitFractal{continent_grain=...}` /
    `:GetHeight(x,y)` / `:GetHeightFromPercent(percent)` — this is what makes
    the coastline, mountains, climate, and forests all regenerate with real
    fractal noise instead of being hardcoded, and it's the least-standardized
    corner of the API across Vanilla/Gods & Kings/Brave New World. This
    script now creates **five** independent `FractalWorld` instances
    (`g_ContinentFractal`, `g_RockiesFractal`, `g_AppalachianFractal`,
    `g_ClimateFractal`, `g_ForestFractal`) — if the map fails to generate at
    all, this is the first place to check.
  - The rest (`GetMapScriptInfo`, `GetMapInitData`, `GeneratePlotTypes`,
    `GenerateTerrain`, `AddFeatures`, `AddResources`, `StartPlotSystem`,
    `Map.GetPlot`, `SetPlotTypes`, `plot:SetTerrainType`,
    `PreGame.GetCivilization`, `player:SetStartingPlot`) match patterns used
    across many published Civ 5 map scripts, but exact signatures have
    drifted slightly between versions.
  - If the game rejects the mod or throws a Lua error, check
    `Logs/Lua.log` in your Civ 5 user folder — it'll point at the exact
    line/call to fix. If `FractalWorld` turns out to be the problem, the
    fallback is reverting `GeneratePlotTypes`/`GetElevation`/`GetClimateBand`/
    `GetFeatureChance` to plain distance/zone checks with `Map.Rand` instead
    of fractal thresholds — same idea as the first draft of this script,
    just without spatially-coherent per-game variation.
- **"Desert" in the dry belt is a Civ 5 vocabulary compromise.** Real
  Kansas/Nebraska/the Mexican plateau read as semi-arid steppe, not true
  desert — but Civ 5 only has one arid terrain type, so "more
  DESERT/PLAINS tiles, less GRASS" near the western mountains
  (`GetAridPercent`) is how "drier than the East Coast" gets expressed on
  this map.
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
  Canadian City-State sites (e.g. the Huron site at 39,38) as a Canada
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
