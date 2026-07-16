------------------------------------------------------------------------------
-- Colonial Americas
--
-- A regenerating map script for Civilization V (Gods & Kings / Brave New
-- World). The overall shape -- Canada down through northern South America --
-- is fixed so it stays recognizable, but the exact coastline, elevation,
-- terrain mix, marsh/forest coverage, and resource placement/density are all
-- re-rolled from Civ 5's own fractal noise and RNG each time you start a new
-- game, the same way stock scripts like Continents or Fractal do. Only the
-- four colonial powers' starting positions are pinned down, since those are
-- meant to be historically fixed for the scenario.
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
-- per zone to reshape that overall envelope.
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

------------------------------------------------------------------------------
-- Regional climate zones used by GenerateTerrain/AddFeatures below.
------------------------------------------------------------------------------

-- Great Plains / Midwest rain-shadow belt: drier than the East Coast at the
-- same latitude. Real-world Kansas/Nebraska read as semi-arid steppe rather
-- than true desert, but Civ 5 only has one arid terrain type, so "more
-- DESERT/PLAINS, less GRASS" is how that dryness shows up on the map.
local DRY_BELT = {xMin = 13, xMax = 27, yMin = 16, yMax = 27}

-- Gulf coast / Mississippi delta / Florida: where marsh should concentrate.
local MARSH_ZONES = {
	{xMin = 28, xMax = 38, yMin = 16, yMax = 19}, -- Louisiana / Mississippi delta, Gulf coast
	{xMin = 39, xMax = 44, yMin = 15, yMax = 20}, -- Florida
}

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
-- Coastline: real fractal noise, masked toward the Americas silhouette.
--
-- g_ContinentFractal:GetHeight(x, y) returns a per-plot noise value from the
-- same coherent (Perlin/plasma-style) fractal stock scripts use, so
-- neighboring plots vary smoothly instead of a "salt and pepper" random
-- scatter. g_ContinentFractal:GetHeightFromPercent(p) converts a target
-- land/water split into the matching height threshold.
--
-- GetLocalWaterPercent(x, y) supplies a DIFFERENT target split per plot:
-- deep in a band's interior, almost all noise values should count as land;
-- near a band edge or an island anchor, roughly half should; far outside any
-- band, all of it should count as water. Comparing the same noise field
-- against a threshold that varies by location is what keeps the coastline
-- both fractal-coherent and shaped like the Americas.
------------------------------------------------------------------------------

local g_ContinentFractal = nil

local function GetLocalWaterPercent(x, y)
	if InExtra(x, y, EXTRA_LAND) then
		return 45 -- islands/peninsulas: roughly even odds, so size/shape varies
	end
	for _, band in ipairs(BANDS) do
		if y >= band.yMin and y <= band.yMax then
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
	end
	return 100
end

------------------------------------------------------------------------------
-- Elevation: a mountain spine along the western edge of each band (Rockies /
-- Sierra Madre / Andes) and a lower Appalachian hill line on the east --
-- but rolled per-plot each game so the exact ridge line shifts, rather than
-- being pixel-identical every time.
------------------------------------------------------------------------------

local function GetElevation(x, y)
	for _, band in ipairs(BANDS) do
		if y >= band.yMin and y <= band.yMax then
			if x <= band.west + 1 then
				if Map.Rand(100, "Colonial Americas mountain roll") < 65 then
					return "MOUNTAIN"
				end
				return "HILLS"
			elseif x >= band.east - 6 and x <= band.east - 5 and y >= 17 and y <= 28 then
				if Map.Rand(100, "Colonial Americas hill roll") < 55 then
					return "HILLS" -- Appalachians, US only
				end
				return "FLAT"
			end
			return "FLAT"
		end
	end
	return "FLAT"
end

------------------------------------------------------------------------------
-- Terrain: simplified latitude bands, with the Great Plains/Midwest DRY_BELT
-- biased drier (desert/plains over grass) than the East Coast at the same
-- latitude. iAridityRoll is picked once per game so how much of the belt
-- reads as true desert vs. dry plains varies game to game.
------------------------------------------------------------------------------

local function GetTerrain(x, y, iAridityRoll)
	if y >= 31 then
		return TerrainTypes.TERRAIN_SNOW
	elseif y >= 26 then
		return TerrainTypes.TERRAIN_TUNDRA
	elseif InZone(x, y, DRY_BELT) then
		if Map.Rand(100, "Colonial Americas aridity roll") < iAridityRoll then
			return TerrainTypes.TERRAIN_DESERT
		end
		return TerrainTypes.TERRAIN_PLAINS
	elseif y >= 20 then
		return TerrainTypes.TERRAIN_PLAINS
	elseif y >= 15 then
		return TerrainTypes.TERRAIN_PLAINS
	elseif y >= 9 then
		return TerrainTypes.TERRAIN_GRASS
	else
		return TerrainTypes.TERRAIN_PLAINS -- tropical Central America / N. South America
	end
end

local function GetFeatureChance(x, y, terrain)
	if InAnyZone(x, y, MARSH_ZONES) then
		return FeatureTypes.FEATURE_MARSH, 55
	elseif terrain == TerrainTypes.TERRAIN_SNOW or terrain == TerrainTypes.TERRAIN_TUNDRA then
		return FeatureTypes.FEATURE_FOREST, 25
	elseif terrain == TerrainTypes.TERRAIN_DESERT then
		return -1, 0
	elseif y < 9 then
		return FeatureTypes.FEATURE_JUNGLE, 45
	else
		return FeatureTypes.FEATURE_FOREST, 30
	end
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

	g_ContinentFractal = FractalWorld.Create()
	g_ContinentFractal:InitFractal{continent_grain = 3}

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
				local elevation = GetElevation(x, y)
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

	-- Picked once per game: how much of the DRY_BELT reads as true desert
	-- vs. merely dry plains. Keeps "how arid this playthrough's Midwest is"
	-- variable, the way resource density below is too.
	local iAridityRoll = 40 + Map.Rand(35, "Colonial Americas aridity base roll") -- 40-74

	for y = 0, MAP_HEIGHT - 1 do
		for x = 0, MAP_WIDTH - 1 do
			local plot = Map.GetPlot(x, y)
			if not plot:IsWater() then
				if plot:GetPlotType() == PlotTypes.PLOT_MOUNTAIN then
					plot:SetTerrainType(TerrainTypes.TERRAIN_GRASS, false, false) -- terrain under the peak
				elseif InAnyZone(x, y, MARSH_ZONES) then
					plot:SetTerrainType(TerrainTypes.TERRAIN_GRASS, false, false) -- marsh feature goes on grass
				else
					plot:SetTerrainType(GetTerrain(x, y, iAridityRoll), false, false)
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
				local terrain = plot:GetTerrainType()
				local feature, chance = GetFeatureChance(x, y, terrain)
				if feature and feature >= 0 and Map.Rand(100, "Colonial Americas feature roll") < chance then
					plot:SetFeatureType(feature, -1)
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

	local BONUS_BY_TERRAIN = {
		[TerrainTypes.TERRAIN_GRASS]  = {"RESOURCE_WHEAT", "RESOURCE_COW", "RESOURCE_SUGAR"},
		[TerrainTypes.TERRAIN_PLAINS] = {"RESOURCE_WHEAT", "RESOURCE_COTTON", "RESOURCE_TOBACCO"},
		[TerrainTypes.TERRAIN_TUNDRA] = {"RESOURCE_DEER", "RESOURCE_FUR"},
		[TerrainTypes.TERRAIN_SNOW]   = {"RESOURCE_FUR"},
		[TerrainTypes.TERRAIN_DESERT] = {"RESOURCE_SILVER"},
	}
	local BONUS_BY_FEATURE = {
		[FeatureTypes.FEATURE_MARSH]  = {"RESOURCE_SUGAR", "RESOURCE_DYE"},
		[FeatureTypes.FEATURE_JUNGLE] = {"RESOURCE_DYE", "RESOURCE_SUGAR", "RESOURCE_COCOA"},
		[FeatureTypes.FEATURE_FOREST] = {"RESOURCE_FUR", "RESOURCE_DEER"},
	}

	for y = 0, MAP_HEIGHT - 1 do
		for x = 0, MAP_WIDTH - 1 do
			local plot = Map.GetPlot(x, y)
			if not plot:IsWater() then
				local featureOptions = BONUS_BY_FEATURE[plot:GetFeatureType()]
				local options = featureOptions or BONUS_BY_TERRAIN[plot:GetTerrainType()]
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
