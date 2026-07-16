------------------------------------------------------------------------------
-- Colonial Americas
--
-- A regenerating map script for Civilization V (Gods & Kings / Brave New
-- World). The overall shape -- Canada down through northern South America --
-- is fixed so it stays recognizable, but the coastline, elevation, terrain
-- mix, forest/jungle coverage, and resource placement/density are all
-- re-rolled from Civ 5's own fractal noise and RNG each time you start a new
-- game, the same way stock scripts like Continents or Fractal do. Regions
-- like the Rockies, the Great Plains, and the Canadian boreal forest are
-- built the same way real Civ 5 terrain is: a coherent noise field
-- thresholded per region, so a given range/biome clusters into one
-- recognizable shape instead of "salt and pepper" independent-per-tile
-- randomness -- while still coming out slightly different every game. Only
-- the fixed civ starting positions and the Great Lakes are pinned down
-- exactly.
--
-- Map size: 70x44 (3,080 plots), deliberately sized above Civ 5's stock
-- "Small" (56x36, 6-player) map so the 7 fixed major civs + 7 City-States
-- this scenario hosts aren't packed as tightly as the original 54x34 draft.
-- All coordinate tables below were produced by scaling that original draft
-- by 1.3x (see PR history), which is why the numbers don't look like round
-- hand-picked values -- treat them as a starting point for further tuning,
-- not gospel.
--
-- This is a from-scratch, hand-written script rather than a tweak of a
-- stock Firaxis map script, so treat it as a first draft: load it in-game,
-- watch the Lua log (Logs/Lua.log under Documents/My Games/... ), and be
-- ready to adjust the tables below if something doesn't generate the way
-- you expect. See README.md in this mod folder for install steps, exactly
-- which parts are highest-risk/least-tested, and known rough edges.
------------------------------------------------------------------------------

include("MapEnums")
include("MapUtilities")
include("MountainsCliffs")
include("FractalWorld")

------------------------------------------------------------------------------
-- Map dimensions
------------------------------------------------------------------------------

local MAP_WIDTH  = 70  -- x: 0 = Pacific (west) .. 69 = Atlantic (east)
local MAP_HEIGHT = 44  -- y: 0 = south (northern S. America) .. 43 = north (Arctic Canada)

------------------------------------------------------------------------------
-- Continent silhouette, defined as [west, east] land bounds per row band.
-- This is a MASK, not the final coastline: fractal noise (see
-- GetLocalWaterPercent/GeneratePlotTypes below) decides the exact land/water
-- split within and around these bounds, so the coast wiggles differently
-- every game while staying inside the overall shape. Edit these two numbers
-- per zone to reshape that overall envelope. Every other region below
-- (mountains, climate, forests) also reads its "how close to the western
-- edge / how wide is this band" geometry from this same table.
------------------------------------------------------------------------------

-- `coast` is the width of flat Pacific lowland between the actual coastline
-- (`west`) and where the Rockies/Sierra Madre/Andes corridor begins (see
-- GetElevation) -- a real West Coast (California's Central Valley + Coast
-- Ranges being the clearest example) rather than mountains dropping straight
-- into the ocean. Widths are loosely calibrated to real geography: wider
-- through the US/Mexico Pacific coast where a real coastal lowland exists,
-- narrower through Canada's fjord-like Pacific coast, the Central American
-- isthmus (already too narrow for much of one), and the Andes (which really
-- do plunge close to the Pacific in South America).
local BANDS = {
	{yMin = 42, yMax = 43, west = 8,  east = 52, coast = 5}, -- Arctic Canada / Alaska
	{yMin = 38, yMax = 40, west = 4,  east = 57, coast = 4}, -- Northern Canada
	{yMin = 34, yMax = 36, west = 6,  east = 56, coast = 4}, -- Central Canada / Hudson Bay area
	{yMin = 30, yMax = 33, west = 6,  east = 55, coast = 6}, -- Great Lakes / US-Canada border
	{yMin = 26, yMax = 29, west = 5,  east = 52, coast = 8}, -- US Midwest / Northeast
	{yMin = 22, yMax = 25, west = 9,  east = 48, coast = 7}, -- US South / Gulf coast (north shore)
	{yMin = 20, yMax = 21, west = 14, east = 39, coast = 6}, -- Northern Mexico / Texas taper
	{yMin = 17, yMax = 18, west = 17, east = 35, coast = 5}, -- Central Mexico
	{yMin = 14, yMax = 16, west = 21, east = 33, coast = 4}, -- Southern Mexico / Guatemala
	{yMin = 12, yMax = 13, west = 24, east = 30, coast = 2}, -- Central American isthmus (narrowest)
	{yMin = 9,  yMax = 10, west = 22, east = 34, coast = 3}, -- Panama / Colombia widening
	{yMin = 5,  yMax = 8,  west = 18, east = 38, coast = 3}, -- Venezuela / Colombia coast
	{yMin = 0,  yMax = 4,  west = 15, east = 40, coast = 3}, -- Northern edge of S. America (Ecuador/Peru/Brazil coast)
}

-- Extra land anchors added on top of the bands: peninsulas and islands that a
-- single west/east band per row can't express. Like the bands, these are a
-- bias toward land, not a guarantee -- a given game may generate them
-- slightly smaller/larger/split into two islands, etc.
local EXTRA_LAND = {
	-- Florida peninsula (east of the Gulf of Mexico gap)
	{52,25},{53,25},{54,25},{55,25},{52,23},{53,23},{54,23},{55,23},{56,23},
	{53,22},{54,22},{55,22},{56,22},{55,21},{56,21},{56,20},
	-- Baja California (west of the Gulf of California gap)
	{4,26},{4,27},{2,27},{2,29},{4,29},{6,30},
	-- Cuba
	{43,20},{44,20},{45,20},{46,20},{47,20},{48,20},
	-- Bahamas
	{51,21},{52,21},
	-- Hispaniola
	{49,17},{50,17},{51,17},{49,16},
	-- Puerto Rico
	{53,16},
	-- Jamaica (south of Cuba, a real English sugar colony -- given a proper
	-- multi-tile footprint rather than a 1-tile speck so it can host an
	-- actual city)
	{44,17},{45,17},{44,18},{45,18},
	-- Barbados (isolated further east in the Atlantic than the rest of the
	-- Antilles chain -- small but was one of the single most profitable
	-- English sugar colonies)
	{58,14},{59,14},
	-- Cape Cod (Massachusetts) -- Plymouth/Massachusetts Bay landmark, a
	-- small hooked peninsula off the New England coast near England's start
	{56,32},{57,32},{58,32},{57,33},
}

-- Great Lakes: carved out of the continental band as freshwater lake plots
-- (kept fixed -- the lakes are a landmark, not something that should vanish).
local LAKE_PLOTS = {
	{33,31},{34,31},{35,31},{33,30},{34,33},{36,31},
}

-- Gulf coast / Mississippi delta / Florida: where marsh should concentrate.
-- Kept as an explicit rectangle (rather than fractal-driven) since real-world
-- marsh is tied to specific low-lying river deltas/coastlines, not a broad
-- climate gradient the way aridity or forest cover is.
local MARSH_ZONES = {
	{xMin = 36, xMax = 49, yMin = 21, yMax = 25}, -- Louisiana / Mississippi delta, Gulf coast
	{xMin = 51, xMax = 57, yMin = 20, yMax = 26}, -- Florida
}

-- American South: where the historical Southern cash crops (see AddResources)
-- should concentrate, roughly Chesapeake down through the Carolinas/Georgia.
local AMERICAN_SOUTH = {xMin = 43, xMax = 57, yMin = 21, yMax = 31}

local function InZone(x, y, zone)
	return x >= zone.xMin and x <= zone.xMax and y >= zone.yMin and y <= zone.yMax
end

local function InAnyZone(x, y, zones)
	for _, zone in ipairs(zones) do
		if InZone(x, y, zone) then
			return true
		end
	end
	return false
end

local function InExtra(x, y, list)
	for _, p in ipairs(list) do
		if p[1] == x and p[2] == y then
			return true
		end
	end
	return false
end

local function GetBand(y)
	for _, band in ipairs(BANDS) do
		if y >= band.yMin and y <= band.yMax then
			return band
		end
	end
	return nil
end

------------------------------------------------------------------------------
-- Fixed starting positions, keyed by CivilizationType. Covers both the four
-- colonial powers AND the three native nations that are real, fully playable
-- Civ 5 civilizations rather than City-State stand-ins: Aztec (Montezuma,
-- base game), Iroquois (Hiawatha, base game), and Shoshone (Pocatello,
-- requires Brave New World). If a player slot isn't set to one of these
-- civs (or the DLC isn't installed so the civ was never selectable), that
-- entry is simply never matched in StartPlotSystem -- no crash, the slot
-- just falls through to the default start finder.
--
-- Unlike the terrain, these stay fixed every game -- they're the historical
-- anchor the rest of the map regenerates around. Coordinates are also kept
-- at least 8 tiles from each band's west edge (ROCKIES_CORRIDOR_WIDTH is 7)
-- so a fixed start can never land on a fractal-generated mountain tile.
--
-- Iroquois/England/France/America were deliberately spread across the full
-- width of their bands (rather than clustered near the middle, as an
-- earlier draft had them) to reduce crowding between the four -- Iroquois
-- in particular sits further west within the Great Lakes band than its
-- real historical (upstate NY) location, trading some geographic precision
-- for breathing room. Maya was dropped from this list (and not replaced by
-- a City-State) since Aztec already anchors that corner of the map and the
-- two were uncomfortably close together.
------------------------------------------------------------------------------

local FIXED_STARTS = {
	CIVILIZATION_SPAIN    = {x = 28, y = 22}, -- Gulf coast of Mexico, near Veracruz
	CIVILIZATION_ENGLAND  = {x = 52, y = 31}, -- Atlantic coast
	CIVILIZATION_FRANCE   = {x = 48, y = 38}, -- St. Lawrence valley, Quebec
	CIVILIZATION_AMERICA  = {x = 31, y = 27}, -- interior frontier
	CIVILIZATION_AZTEC    = {x = 31, y = 18}, -- Central Mexican highlands (Valley of Mexico)
	CIVILIZATION_IROQUOIS = {x = 21, y = 31}, -- western Great Lakes
	CIVILIZATION_SHOSHONE = {x = 22, y = 27}, -- Great Basin / Rocky Mountain foothills
}

-- Suggested City-State sites standing in for native nations that DON'T have
-- a dedicated Civ 5 civilization (Aztec/Iroquois/Shoshone are handled as
-- real civs above instead). Civ V can't rename a City-State's underlying
-- personality/type without an extra civ mod, but you CAN rename the city
-- itself in World Builder -- rename these to match after generating the map
-- (e.g. rename the city-state city at 51,29 to "Werowocomoco" for a
-- Powhatan stand-in).
--
-- Comanche and the Muisca/Inca-frontier site were cut from an earlier,
-- 9-site draft to reduce crowding: Comanche overlapped the same Great
-- Plains niche as Sioux and Shoshone, and the Muisca/Inca site was the
-- vaguest, most isolated entry and least central to a North America-focused
-- colonial scenario.
local CITY_STATE_SITES = {
	{x = 46, y = 27, note = "Shawnee (Ohio valley)"},
	{x = 51, y = 29, note = "Powhatan (Chesapeake)"},
	{x = 42, y = 23, note = "Cherokee (southern Appalachians)"},
	{x = 35, y = 26, note = "Sioux / Lakota (Great Plains)"},
	{x = 25, y = 23, note = "Apache (southwest desert)"},
	{x = 39, y = 38, note = "Huron / Wendat (Ontario)"},
	{x = 46, y = 20, note = "Taino (Cuba / Caribbean)"},
}

------------------------------------------------------------------------------
-- Noise fields. Every region below (coastline, mountains, climate, forest
-- cover) works the same way: sample a coherent fractal at (x, y), and
-- compare it to a threshold that varies by location (via GetHeightFromPercent,
-- which converts "what fraction of the noise range should count as land/
-- mountain/arid/forested here" into the matching height cutoff). That's what
-- makes each region cluster into one recognizable shape -- a ridge, a belt,
-- a forest block -- instead of independent per-tile coin flips, while still
-- differing in its exact extent every game because the underlying noise
-- reseeds each time. Five independent fields are used so the ranges/belts
-- below don't all wiggle in lockstep with each other.
------------------------------------------------------------------------------

local g_ContinentFractal = nil  -- coastline
local g_RockiesFractal   = nil  -- west-coast mountain spine (Rockies/Sierra Madre/Andes)
local g_AppalachianFractal = nil -- eastern US hill line
local g_ClimateFractal   = nil  -- aridity gradient (Great Plains, Mexican plateau, Andean highlands)
local g_ForestFractal    = nil  -- forest/jungle clumping

local function InitFractals()
	g_ContinentFractal = FractalWorld.Create()
	g_ContinentFractal:InitFractal{continent_grain = 3}

	g_RockiesFractal = FractalWorld.Create()
	g_RockiesFractal:InitFractal{continent_grain = 5}

	g_AppalachianFractal = FractalWorld.Create()
	g_AppalachianFractal:InitFractal{continent_grain = 5}

	g_ClimateFractal = FractalWorld.Create()
	g_ClimateFractal:InitFractal{continent_grain = 3}

	g_ForestFractal = FractalWorld.Create()
	g_ForestFractal:InitFractal{continent_grain = 4}
end

------------------------------------------------------------------------------
-- Coastline
------------------------------------------------------------------------------

local function GetLocalWaterPercent(x, y)
	if InExtra(x, y, EXTRA_LAND) then
		return 45 -- islands/peninsulas: roughly even odds, so size/shape varies
	end
	local band = GetBand(y)
	if not band then
		return 100
	end
	if x < band.west or x > band.east then
		local dist = math.min(math.abs(x - band.west), math.abs(x - band.east))
		if dist <= 3 then
			return 72 -- coastal fringe: occasional small island/inlet
		end
		return 100 -- firmly outside the envelope: force ocean
	end
	local edgeDist = math.min(x - band.west, band.east - x)
	if edgeDist <= 1 then
		return 55 -- band edge: wiggly coastline
	end
	return 12 -- band interior: almost always land
end

------------------------------------------------------------------------------
-- Elevation: the Rockies/Sierra Madre/Andes run as a corridor -- fixed in
-- rough position and width (so "the Rockies" stay the Rockies) -- starting
-- `band.coast` tiles east of the actual coastline, which is what leaves a
-- flat West Coast lowland (California's Central Valley being the clearest
-- real-world example) between the ocean and the mountains instead of peaks
-- dropping straight into the sea. The exact peaks/foothills within the
-- corridor come from a coherent noise field so they cluster into ridge-like
-- shapes rather than a scattered checkerboard, and shift a little every
-- game. A lower, narrower Appalachian hill line runs on the eastern US only,
-- using an independent noise field so it doesn't move in lockstep with the
-- Rockies.
------------------------------------------------------------------------------

local ROCKIES_CORRIDOR_WIDTH = 7 -- tiles past the coastal shelf the corridor can reach into

local function GetElevation(x, y, band)
	local mountainStart = band.west + (band.coast or 0)
	local distFromMountainStart = x - mountainStart
	if distFromMountainStart >= 0 and distFromMountainStart <= ROCKIES_CORRIDOR_WIDTH then
		-- corridorBias: ~100% chance of being "elevated ground" right where
		-- the coastal shelf ends, fading out toward the corridor's inland limit.
		local corridorBias = math.max(0, 100 - distFromMountainStart * (100 / (ROCKIES_CORRIDOR_WIDTH + 1)))
		local h = g_RockiesFractal:GetHeight(x, y)
		local elevatedThreshold = g_RockiesFractal:GetHeightFromPercent(100 - corridorBias)
		if h >= elevatedThreshold then
			local peakThreshold = g_RockiesFractal:GetHeightFromPercent(40) -- top 60% of ALL heights = full peak
			if h >= peakThreshold then
				return "MOUNTAIN"
			end
			return "HILLS"
		end
	end

	if y >= 22 and y <= 36 then
		local distFromEast = band.east - x
		if distFromEast >= 7 and distFromEast <= 12 then
			local h = g_AppalachianFractal:GetHeight(x, y)
			local threshold = g_AppalachianFractal:GetHeightFromPercent(55) -- top 45% = hills
			if h >= threshold then
				return "HILLS"
			end
		end
	end

	return "FLAT"
end

------------------------------------------------------------------------------
-- Climate: an aridity gradient rooted in real rain-shadow geography. The
-- coastal shelf itself (west of the mountains) stays mild/humid -- like
-- California's actual Mediterranean coastal climate -- with the driest
-- conditions instead sitting just EAST of the mountain corridor (the real
-- rain-shadow effect: the Great Basin, the Sonoran desert, the Mexican
-- plateau, the Andean highlands all sit on the leeward side of their range),
-- fading back to humid further east still. That's what produces a Great
-- Plains/Mexican-plateau/Andean-highland dry belt as an emergent shape
-- instead of a hardcoded box. Canada's boreal band and the deep tropics are
-- pulled back toward humid regardless of mountain distance, since real
-- boreal forest and rainforest both stay wet independent of a rain-shadow
-- effect. The noise field then clusters the exact dry patches into
-- contiguous regions instead of speckling them.
------------------------------------------------------------------------------

local function GetAridPercent(x, y, band)
	local mountainStart = band.west + (band.coast or 0)
	local distFromMountains = x - mountainStart
	local rainShadow
	if distFromMountains < 0 then
		rainShadow = 12 -- coastal shelf: mild, mostly humid (e.g. California's Mediterranean coast)
	else
		rainShadow = math.max(0, 55 - distFromMountains * 4.6) -- ~55% right past the mountains, 0 by ~12 tiles further east
	end
	if y >= 30 then
		rainShadow = rainShadow * 0.3 -- boreal Canada
	elseif y < 12 then
		rainShadow = rainShadow * 0.4 -- deep tropics
	end
	return math.min(90, rainShadow)
end

-- Returns "DESERT", "DRY_PLAINS", or "HUMID". The same noise field backs both
-- thresholds, so true desert forms a smaller core within the wider dry-plains
-- fringe, rather than two independently-scattered categories.
local function GetClimateBand(x, y, band)
	local aridPercent = GetAridPercent(x, y, band)
	if aridPercent <= 1 then
		return "HUMID"
	end
	local h = g_ClimateFractal:GetHeight(x, y)
	local dryThreshold = g_ClimateFractal:GetHeightFromPercent(aridPercent)
	local desertThreshold = g_ClimateFractal:GetHeightFromPercent(aridPercent * 0.45)
	if h < desertThreshold then
		return "DESERT"
	elseif h < dryThreshold then
		return "DRY_PLAINS"
	end
	return "HUMID"
end

local function GetTerrain(x, y)
	if y >= 40 then
		return TerrainTypes.TERRAIN_SNOW
	elseif y >= 34 then
		return TerrainTypes.TERRAIN_TUNDRA
	end

	local band = GetBand(y)
	if band then
		local climate = GetClimateBand(x, y, band)
		if climate == "DESERT" then
			return TerrainTypes.TERRAIN_DESERT
		elseif climate == "DRY_PLAINS" then
			return TerrainTypes.TERRAIN_PLAINS
		end
	end

	if y < 12 then
		return TerrainTypes.TERRAIN_PLAINS -- humid tropical Central America / N. South America (see AddFeatures for jungle)
	elseif y >= 26 then
		return TerrainTypes.TERRAIN_PLAINS -- humid interior/eastern US
	end
	return TerrainTypes.TERRAIN_GRASS
end

------------------------------------------------------------------------------
-- Forest/jungle cover: a base chance per region (low in the open Great
-- Plains interior, high in the Canadian boreal band and the deep tropics,
-- moderate in the eastern woodlands), applied through the forest noise field
-- so it clusters into large contiguous blocks -- "huge forests" -- rather
-- than scattered single tiles.
------------------------------------------------------------------------------

local function GetFeatureChance(x, y, terrain, band)
	if InAnyZone(x, y, MARSH_ZONES) and terrain ~= TerrainTypes.TERRAIN_DESERT then
		return FeatureTypes.FEATURE_MARSH, 55
	end
	if terrain == TerrainTypes.TERRAIN_DESERT then
		return -1, 0
	end

	if y < 12 then
		return FeatureTypes.FEATURE_JUNGLE, 60 -- Amazon-adjacent lowland jungle
	end
	if y >= 30 then
		return FeatureTypes.FEATURE_FOREST, 55 -- Canadian boreal forest
	end

	if band and terrain == TerrainTypes.TERRAIN_PLAINS then
		local distFromWest = x - band.west
		local distFromEast = band.east - x
		local bandWidth = band.east - band.west
		if bandWidth >= 26 and distFromWest > 13 and distFromEast > 8 then
			return FeatureTypes.FEATURE_FOREST, 8 -- Great Plains interior: stay open grassland
		end
	end

	return FeatureTypes.FEATURE_FOREST, 32 -- eastern woodlands / general temperate forest
end

------------------------------------------------------------------------------
-- Standard map script entry points
------------------------------------------------------------------------------

function GetMapScriptInfo()
	return {
		Name = "TXT_KEY_MAP_COLONIAL_AMERICAS",
		Description = "TXT_KEY_MAP_COLONIAL_AMERICAS_HELP",
		IsAdvancedMap = false,
		IconIndex = 1,
		SortIndex = 1,
	}
end

function GetMapInitData(worldSize)
	-- Fixed custom dimensions regardless of the World Size dropdown, since
	-- this is a scenario-style map rather than a scalable generator.
	return {
		Width = MAP_WIDTH,
		Height = MAP_HEIGHT,
		WrapX = false,
		WrapY = false,
	}
end

function GeneratePlotTypes()
	print("Colonial Americas: generating plot types from masked fractal noise")

	InitFractals()

	local plotTypes = {}
	for y = 0, MAP_HEIGHT - 1 do
		for x = 0, MAP_WIDTH - 1 do
			local i = y * MAP_WIDTH + x + 1
			local waterPercent = GetLocalWaterPercent(x, y)

			local isLand
			if waterPercent >= 100 then
				isLand = false
			else
				local height = g_ContinentFractal:GetHeight(x, y)
				local threshold = g_ContinentFractal:GetHeightFromPercent(waterPercent)
				isLand = height >= threshold
			end

			if not isLand then
				plotTypes[i] = PlotTypes.PLOT_OCEAN
			else
				local band = GetBand(y)
				local elevation = band and GetElevation(x, y, band) or "FLAT"
				if elevation == "MOUNTAIN" then
					plotTypes[i] = PlotTypes.PLOT_MOUNTAIN
				elseif elevation == "HILLS" then
					plotTypes[i] = PlotTypes.PLOT_HILLS
				else
					plotTypes[i] = PlotTypes.PLOT_LAND
				end
			end
		end
	end

	SetPlotTypes(plotTypes)
	Map.CalculateAreas()
end

function GenerateTerrain()
	print("Colonial Americas: generating terrain")

	for y = 0, MAP_HEIGHT - 1 do
		for x = 0, MAP_WIDTH - 1 do
			local plot = Map.GetPlot(x, y)
			if not plot:IsWater() then
				if plot:GetPlotType() == PlotTypes.PLOT_MOUNTAIN then
					plot:SetTerrainType(TerrainTypes.TERRAIN_GRASS, false, false) -- terrain under the peak
				elseif InAnyZone(x, y, MARSH_ZONES) then
					plot:SetTerrainType(TerrainTypes.TERRAIN_GRASS, false, false) -- marsh feature goes on grass
				else
					plot:SetTerrainType(GetTerrain(x, y), false, false)
				end
			elseif InExtra(x, y, LAKE_PLOTS) then
				plot:SetTerrainType(TerrainTypes.TERRAIN_COAST, false, false)
				plot:SetLake(true, false)
			else
				local isCoast = false
				for dx = -1, 1 do
					for dy = -1, 1 do
						local nPlot = Map.GetPlot(x + dx, y + dy)
						if nPlot and not nPlot:IsWater() then
							isCoast = true
						end
					end
				end
				plot:SetTerrainType(isCoast and TerrainTypes.TERRAIN_COAST or TerrainTypes.TERRAIN_OCEAN, false, false)
			end
		end
	end
	Map.RecalculateAreas()
end

function AddFeatures()
	print("Colonial Americas: adding features (forest/jungle/marsh)")

	for y = 0, MAP_HEIGHT - 1 do
		for x = 0, MAP_WIDTH - 1 do
			local plot = Map.GetPlot(x, y)
			if not plot:IsWater() and plot:GetPlotType() ~= PlotTypes.PLOT_MOUNTAIN then
				local band = GetBand(y)
				local terrain = plot:GetTerrainType()
				local feature, baseChance = GetFeatureChance(x, y, terrain, band)
				if feature and feature >= 0 and baseChance > 0 then
					local h = g_ForestFractal:GetHeight(x, y)
					local threshold = g_ForestFractal:GetHeightFromPercent(100 - baseChance)
					if h >= threshold then
						plot:SetFeatureType(feature, -1)
					end
				end
			end
		end
	end
end

function AddRivers()
	-- Rivers need a shape-aware flow algorithm this script doesn't attempt.
	-- Recommended: after generating the map once, open it in World Builder
	-- and hand-paint the Mississippi, St. Lawrence, and Rio Grande.
end

function AddLakes()
	-- Handled inline in GenerateTerrain() via LAKE_PLOTS.
end

function AddResources()
	print("Colonial Americas: scattering resources")

	-- Picked once per game so overall resource abundance varies noticeably
	-- between playthroughs, not just placement.
	local iResourceDensity = 5 + Map.Rand(8, "Colonial Americas resource density roll") -- 5-12%

	for y = 0, MAP_HEIGHT - 1 do
		for x = 0, MAP_WIDTH - 1 do
			local plot = Map.GetPlot(x, y)
			if not plot:IsWater() then
				local feature = plot:GetFeatureType()
				local terrain = plot:GetTerrainType()
				local options = nil

				-- Loose historical resourcing: cash crops follow the region
				-- they were actually grown in colonial times, not just the
				-- underlying terrain type everywhere it appears.
				if feature == FeatureTypes.FEATURE_MARSH then
					options = {"RESOURCE_SUGAR", "RESOURCE_DYE"} -- Gulf/Caribbean sugar, indigo
				elseif feature == FeatureTypes.FEATURE_JUNGLE then
					options = {"RESOURCE_DYE", "RESOURCE_SUGAR", "RESOURCE_COCOA"} -- Central/N. South America
				elseif feature == FeatureTypes.FEATURE_FOREST then
					options = {"RESOURCE_FUR", "RESOURCE_DEER"} -- Canadian/northern fur trade
				elseif plot:GetPlotType() == PlotTypes.PLOT_HILLS then
					-- Mineral wealth up and down the whole cordillera -- the
					-- Sierra Nevada foothills (California, 1848), Colorado,
					-- and Mexico/the Andes (the actual reason Spain conquered
					-- the Aztec and Inca) all produced gold and/or silver.
					options = {"RESOURCE_GOLD", "RESOURCE_SILVER"}
				elseif terrain == TerrainTypes.TERRAIN_DESERT then
					options = {"RESOURCE_SILVER"} -- Mexican/Andean silver country
				elseif InZone(x, y, AMERICAN_SOUTH) and (terrain == TerrainTypes.TERRAIN_PLAINS or terrain == TerrainTypes.TERRAIN_GRASS) then
					-- Civ 5 has no base-game Tobacco resource, so Cotton and
					-- Dye (indigo) stand in as the real, obtainable resources
					-- carrying the Tidewater/Southern colonial cash-crop
					-- flavor (see README).
					options = {"RESOURCE_COTTON", "RESOURCE_DYE"}
				elseif terrain == TerrainTypes.TERRAIN_GRASS then
					options = {"RESOURCE_WHEAT", "RESOURCE_COW"}
				elseif terrain == TerrainTypes.TERRAIN_PLAINS then
					options = {"RESOURCE_WHEAT"}
				elseif terrain == TerrainTypes.TERRAIN_TUNDRA or terrain == TerrainTypes.TERRAIN_SNOW then
					options = {"RESOURCE_DEER", "RESOURCE_FUR"}
				end

				if options and Map.Rand(100, "Colonial Americas resource roll") < iResourceDensity then
					local resName = options[1 + Map.Rand(#options, "Colonial Americas resource pick")]
					local resType = GameInfoTypes[resName]
					if resType then
						plot:SetResourceType(resType, 1)
					end
				end
			end
		end
	end
end

function StartPlotSystem()
	-- Bypass the balanced-start algorithm entirely: place the fixed civs at
	-- their historically-flavored coordinates, and drop City-States at the
	-- suggested native-nation sites. Any player slots beyond these (extra
	-- city-states added via the in-game player count, or majors not listed
	-- in FIXED_STARTS) fall back to the default finder so the game can
	-- still start without erroring.
	local startPlotSystem = AssignStartingPlots.Create()

	for playerID, player in pairs(Players) do
		if player:IsEverAlive() then
			local civRow = PreGame.GetCivilization(playerID)
			local civType = civRow and GameInfo.Civilizations[civRow].Type or nil

			if civType and FIXED_STARTS[civType] then
				local coords = FIXED_STARTS[civType]
				player:SetStartingPlot(Map.GetPlot(coords.x, coords.y))
			elseif player:IsMinorCiv() then
				local slot = player:GetID() % #CITY_STATE_SITES
				local site = CITY_STATE_SITES[slot + 1]
				player:SetStartingPlot(Map.GetPlot(site.x, site.y))
			end
		end
	end

	-- Let the stock finder fill in anything left unassigned (e.g. if the
	-- player added more civs/city-states than this script has fixed sites
	-- for) rather than leaving a slot with no start at all.
	startPlotSystem:ChooseLocations()
	startPlotSystem:BalanceAndAssign()
end
