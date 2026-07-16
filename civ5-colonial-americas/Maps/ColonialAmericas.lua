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
-- the four colonial powers' starting positions and the Great Lakes are
-- pinned down exactly.
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

local MAP_WIDTH  = 54  -- x: 0 = Pacific (west) .. 53 = Atlantic (east)
local MAP_HEIGHT = 34  -- y: 0 = south (northern S. America) .. 33 = north (Arctic Canada)

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

local BANDS = {
	{yMin = 32, yMax = 33, west = 10, east = 40}, -- Arctic Canada / Alaska
	{yMin = 29, yMax = 31, west = 6,  east = 44}, -- Northern Canada
	{yMin = 26, yMax = 28, west = 8,  east = 43}, -- Central Canada / Hudson Bay area
	{yMin = 23, yMax = 25, west = 9,  east = 42}, -- Great Lakes / US-Canada border
	{yMin = 20, yMax = 22, west = 10, east = 40}, -- US Midwest / Northeast
	{yMin = 17, yMax = 19, west = 12, east = 37}, -- US South / Gulf coast (north shore)
	{yMin = 15, yMax = 16, west = 15, east = 30}, -- Northern Mexico / Texas taper
	{yMin = 13, yMax = 14, west = 17, east = 27}, -- Central Mexico
	{yMin = 11, yMax = 12, west = 19, east = 25}, -- Southern Mexico / Guatemala
	{yMin = 9,  yMax = 10, west = 20, east = 23}, -- Central American isthmus (narrowest)
	{yMin = 7,  yMax = 8,  west = 19, east = 26}, -- Panama / Colombia widening
	{yMin = 4,  yMax = 6,  west = 16, east = 29}, -- Venezuela / Colombia coast
	{yMin = 0,  yMax = 3,  west = 14, east = 31}, -- Northern edge of S. America (Ecuador/Peru/Brazil coast)
}

-- Extra land anchors added on top of the bands: peninsulas and islands that a
-- single west/east band per row can't express. Like the bands, these are a
-- bias toward land, not a guarantee -- a given game may generate them
-- slightly smaller/larger/split into two islands, etc.
local EXTRA_LAND = {
	-- Florida peninsula (east of the Gulf of Mexico gap)
	{40,19},{41,19},{42,19},{40,18},{41,18},{42,18},{43,18},{41,17},{42,17},{43,17},{42,16},{43,16},{43,15},
	-- Baja California (west of the Gulf of California gap)
	{9,20},{9,21},{8,21},{8,22},{9,22},{9,23},
	-- Cuba
	{33,15},{34,15},{35,15},{36,15},{37,15},
	-- Bahamas
	{39,16},{40,16},
	-- Hispaniola
	{38,13},{39,13},{38,12},
	-- Puerto Rico
	{41,12},
}

-- Great Lakes: carved out of the continental band as freshwater lake plots
-- (kept fixed -- the lakes are a landmark, not something that should vanish).
local LAKE_PLOTS = {
	{25,24},{26,24},{27,24},{25,23},{26,25},{28,24},
}

-- Gulf coast / Mississippi delta / Florida: where marsh should concentrate.
-- Kept as an explicit rectangle (rather than fractal-driven) since real-world
-- marsh is tied to specific low-lying river deltas/coastlines, not a broad
-- climate gradient the way aridity or forest cover is.
local MARSH_ZONES = {
	{xMin = 28, xMax = 38, yMin = 16, yMax = 19}, -- Louisiana / Mississippi delta, Gulf coast
	{xMin = 39, xMax = 44, yMin = 15, yMax = 20}, -- Florida
}

-- American South: where the historical Southern cash crops (see AddResources)
-- should concentrate, roughly Chesapeake down through the Carolinas/Georgia.
local AMERICAN_SOUTH = {xMin = 33, xMax = 44, yMin = 16, yMax = 24}

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
-- Fixed starting positions for the colonial powers, keyed by CivilizationType.
-- America is included as a separate, independent start (not spawned later)
-- so all four majors can be played from turn 1 -- adjust FIXED_STARTS or pull
-- civs out of the pre-game civ list if you'd rather America emerge from a
-- British colony instead. Unlike the terrain, these stay fixed every game --
-- they're the historical anchor the rest of the map regenerates around.
------------------------------------------------------------------------------

local FIXED_STARTS = {
	CIVILIZATION_SPAIN   = {x = 20, y = 17}, -- Gulf coast of Mexico, near Veracruz
	CIVILIZATION_ENGLAND = {x = 38, y = 24}, -- Chesapeake / mid-Atlantic coast
	CIVILIZATION_FRANCE  = {x = 34, y = 29}, -- St. Lawrence valley, Quebec
	CIVILIZATION_AMERICA = {x = 30, y = 21}, -- Ohio valley frontier
}

-- Suggested City-State sites standing in for native nations. Civ V can't
-- rename a City-State's underlying personality/type without an extra civ
-- mod, but you CAN rename the city itself in World Builder -- rename these
-- to match after generating the map (e.g. rename the city-state city at
-- 37,26 to "Onondaga" for an Iroquois stand-in).
local CITY_STATE_SITES = {
	{x = 37, y = 26, note = "Iroquois / Haudenosaunee (Great Lakes / upstate NY)"},
	{x = 35, y = 21, note = "Shawnee (Ohio valley)"},
	{x = 42, y = 21, note = "Powhatan (Chesapeake)"},
	{x = 38, y = 19, note = "Cherokee (southern Appalachians)"},
	{x = 30, y = 20, note = "Sioux / Lakota (Great Plains)"},
	{x = 22, y = 20, note = "Comanche (southern plains)"},
	{x = 12, y = 20, note = "Apache (southwest desert)"},
	{x = 30, y = 29, note = "Huron / Wendat (Ontario)"},
	{x = 22, y = 12, note = "Maya (Yucatan / Central America)"},
	{x = 35, y = 15, note = "Taino (Cuba / Caribbean)"},
	{x = 21, y = 5,  note = "Muisca / Inca frontier (northern Andes)"},
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
		if dist <= 2 then
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
-- Elevation: the Rockies/Sierra Madre/Andes run as a corridor along the west
-- edge of each band -- fixed in rough position and width (so "the Rockies"
-- stay the Rockies), with the exact peaks/foothills within that corridor
-- coming from a coherent noise field so they cluster into ridge-like shapes
-- rather than a scattered checkerboard, and shift a little every game. A
-- lower, narrower Appalachian hill line runs on the eastern US only, using
-- an independent noise field so it doesn't move in lockstep with the Rockies.
------------------------------------------------------------------------------

local ROCKIES_CORRIDOR_WIDTH = 5 -- tiles east of band.west the corridor can reach into

local function GetElevation(x, y, band)
	local distFromWest = x - band.west
	if distFromWest <= ROCKIES_CORRIDOR_WIDTH then
		-- corridorBias: ~100% chance of being "elevated ground" right at the
		-- edge, fading out toward the corridor's inland limit.
		local corridorBias = math.max(0, 100 - distFromWest * (100 / (ROCKIES_CORRIDOR_WIDTH + 1)))
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

	if y >= 17 and y <= 28 then
		local distFromEast = band.east - x
		if distFromEast >= 5 and distFromEast <= 9 then
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
-- Climate: an aridity gradient rooted in real rain-shadow geography -- driest
-- right next to the western mountain spine, fading to humid a few tiles
-- east, which is what produces a Great Plains/Mexican-plateau/Andean-
-- highland dry belt without hardcoding it as a fixed rectangle. Canada's
-- boreal band and the deep tropics are pulled back toward humid regardless
-- of mountain distance, since real boreal forest and rainforest both stay
-- wet independent of a rain-shadow effect. The noise field then clusters the
-- exact dry patches into contiguous regions instead of speckling them.
------------------------------------------------------------------------------

local function GetAridPercent(x, y, band)
	local distFromWest = x - band.west
	local rainShadow = math.max(0, 55 - distFromWest * 6) -- ~55% at the mountains, 0 by ~9 tiles east
	if y >= 23 then
		rainShadow = rainShadow * 0.3 -- boreal Canada
	elseif y < 9 then
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
	if y >= 31 then
		return TerrainTypes.TERRAIN_SNOW
	elseif y >= 26 then
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

	if y < 9 then
		return TerrainTypes.TERRAIN_PLAINS -- humid tropical Central America / N. South America (see AddFeatures for jungle)
	elseif y >= 20 then
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

	if y < 9 then
		return FeatureTypes.FEATURE_JUNGLE, 60 -- Amazon-adjacent lowland jungle
	end
	if y >= 23 then
		return FeatureTypes.FEATURE_FOREST, 55 -- Canadian boreal forest
	end

	if band and terrain == TerrainTypes.TERRAIN_PLAINS then
		local distFromWest = x - band.west
		local distFromEast = band.east - x
		local bandWidth = band.east - band.west
		if bandWidth >= 20 and distFromWest > 10 and distFromEast > 6 then
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
	-- Bypass the balanced-start algorithm entirely: place the four majors
	-- at fixed, historically-flavored coordinates, and drop City-States at
	-- the suggested native-nation sites. Any player slots beyond these
	-- (extra city-states added via the in-game player count, or majors not
	-- listed in FIXED_STARTS) fall back to the default finder so the game
	-- can still start without erroring.
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
