// Un point GPX = lat, lng, altitude (m), optionnel timestamp ISO
export type TrackPoint = {
  lat: number
  lng: number
  ele: number          // altitude en mètres
  time?: string        // ISO 8601, optionnel
}

// Boîte englobante de la trace, pour centrer la carte
export type Bounds = {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

// Réglages nutrition saisis par l'utilisateur
export type NutritionSettings = {
  carbsPerHour: number          // grammes de glucides / heure cible
  waterPerHour: number          // ml d'eau / heure cible
  targetPaceSecPerKm?: number   // optionnel : allure cible en s/km
}

// Réglages nutrition par défaut (point de départ raisonnable pour un trail)
export const DEFAULT_NUTRITION: NutritionSettings = {
  carbsPerHour: 60,
  waterPerHour: 500,
}

// Une course réelle importée pour caler le profil de forme
export type FitnessActivity = {
  id: string
  user_id: string
  name: string
  activity_date: string | null
  distance_m: number
  elevation_gain_m: number | null
  moving_time_s: number
  reference_pace_s_per_km: number
  created_at: string
}

// Une course du calendrier curé
export type Race = {
  id: string
  name: string
  location_name: string
  region: string | null
  lat: number
  lng: number
  race_date: string // ISO date (YYYY-MM-DD)
  distance_km: number | null
  elevation_gain_m: number | null
  url: string | null
  image_url: string | null
}

// Un produit nutrition du catalogue (global si created_by est null, sinon perso)
export type NutritionProduct = {
  id: string
  created_by: string | null
  name: string
  brand: string | null
  kind: "gel" | "bar" | "drink" | "chew"
  carbs_g: number
  sodium_mg: number | null
  shop_url: string | null
  image_url: string | null
  created_at: string
}

// Représentation côté DB (matching exact des colonnes)
export type CourseRow = {
  id: string
  user_id: string
  name: string
  gpx_path: string
  distance_m: number | null
  elevation_gain_m: number | null
  elevation_loss_m: number | null
  bounds: Bounds | null
  track_points: TrackPoint[] | null
  nutrition_settings: NutritionSettings | null
  reference_pace_s_per_km: number | null
  predicted_time_s: number | null
  is_favorite: boolean
  aid_stations: AidStation[] | null
  created_at: string
  updated_at: string
}

// Un ravito défini par l'utilisateur sur la course
export type AidStation = {
  km: number
  name?: string
}

// Un segment élémentaire entre deux points consécutifs de la trace
export type TrackSegment = {
  fromIdx: number       // index du point de départ dans track_points
  distM: number         // distance horizontale du segment (m)
  gain: number          // D+ lissé sur ce segment (m, >= 0)
  loss: number          // D- lissé sur ce segment (m, >= 0)
  grade: number         // pente = dénivelé / distance (ex. 0.1 = 10%)
  cumDistM: number      // distance cumulée à la fin du segment
}

// Statistiques globales + segments enrichis issus d'une trace
export type CourseStats = {
  distanceM: number
  elevationGainM: number
  elevationLossM: number
  bounds: Bounds
  segments: TrackSegment[]
}

// Résultat de la prédiction de temps
export type Prediction = {
  totalTimeS: number          // temps total estimé (s)
  segmentTimes: number[]      // temps estimé par segment (aligné sur segments)
}

// Un split par km (calculé à la volée pour affichage)
export type Split = {
  km: number              // numéro du km (1, 2, 3, ...)
  distanceM: number       // distance réelle couverte sur ce split
  elevationGainM: number  // D+ sur ce km
  elevationLossM: number  // D- sur ce km
  avgGrade: number        // pente moyenne du split
  timeS: number           // temps estimé sur ce km
  cumTimeS: number        // temps cumulé à la fin du km
  paceSecPerKm: number    // allure estimée (s/km)
  carbsG: number          // glucides à consommer sur ce km
  waterMl: number         // eau à consommer sur ce km
}

// Un segment marquant détecté (côte ou descente notable)
export type KeySegment = {
  type: "climb" | "descent"
  startKm: number
  endKm: number
  distanceM: number
  elevationM: number      // D+ (climb) ou D- (descent), valeur positive
  avgGrade: number        // pente moyenne (signée)
  timeS: number           // temps estimé sur le segment
  label: string           // libellé FR (ex. "Grosse côte", "Descente rapide")
}

// Un point de relance hydratation / nutrition
export type CuePoint = {
  timeS: number           // instant (temps écoulé estimé) du rappel
  km: number              // km approximatif atteint
  lat: number
  lng: number
  carbsG: number          // glucides à prendre autour de ce point
  waterMl: number         // eau à boire autour de ce point
}

// Représentation "parsée" issue d'un GPX, avant stockage en DB
export type ParsedGpx = {
  trackPoints: TrackPoint[]
  distanceM: number
  elevationGainM: number
  elevationLossM: number
  bounds: Bounds
}

// Analyse complète d'une course (calculée à la volée pour la page détail)
export type CourseAnalysis = {
  stats: CourseStats
  prediction: Prediction
  splits: Split[]
  keySegments: KeySegment[]
  cues: CuePoint[]
}
