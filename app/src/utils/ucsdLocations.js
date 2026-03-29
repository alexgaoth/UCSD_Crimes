/**
 * Normalizes variant location name spellings to a single canonical name.
 * Keys are lowercase for case-insensitive matching.
 */
export const LOCATION_ALIASES = {
  // Case / punctuation variants
  'rimac':                                 'RIMAC Arena',
  'rimac arena':                           'RIMAC Arena',
  'arena':                                 'RIMAC Arena',
  'capa':                                  'CAPA',
  'rya':                                   'Rya',
  'sio pier':                              'SIO Pier',
  'africa hall':                           'Africa Hall',
  'rita atkinson':                         'Rita Atkinson Residences',
  'campus emergency services':             'Campus Emergency Services Building',
  'shiley eye center':                     'Shiley Eye Institute',

  // Cancer Center
  'rebecca and john moores cancer center': 'Moores Cancer Center',
  "moore's cancer center":                 'Moores Cancer Center',
  'moores cancer center':                  'Moores Cancer Center',

  // Trolley stations
  'trolley - central campus station':      'Trolley Central Campus Station',
  'trolley- central campus station':       'Trolley Central Campus Station',
  'trolley - la jolla health station':     'Trolley La Jolla Health Station',
  'trolley- la jolla health station':      'Trolley La Jolla Health Station',

  // UCSD Hillcrest
  'ucsd hillcrest hospital':               'UCSD Medical Center Hillcrest',
  'ucsd medical center - hillcrest':       'UCSD Medical Center Hillcrest',
  'ucsd hillcrest':                        'UCSD Medical Center Hillcrest',
  'ucsd medical center - la jolla':        'UCSD Health La Jolla',

  // One Miramar Street (group all buildings)
  'one miramar street':                    'One Miramar Street',
  'one miramar street, building 1':        'One Miramar Street',
  'one miramar street, building 2':        'One Miramar Street',
  'one miramar street, building 3':        'One Miramar Street',
  'one miramar street, building 4':        'One Miramar Street',
  'miramar street':                        'One Miramar Street',
  'miramar st':                            'One Miramar Street',

  // Genesee
  'genesee avenue':                        'Genesee Avenue',
  'genesee ave':                           'Genesee Avenue',

  // Jacobs Medical Center
  'jacobs medical center - bed tower':     'Jacobs Medical Center',

  // Price Center
  'price center east':                     'Price Center',
  'price center west':                     'Price Center',
  'price center plaza':                    'Price Center',
  'target - pc west':                      'Price Center',

  // Parking normalization
  'scholars parking':                      'Scholars Parking Structure',
  'scholars dr n':                         'Scholars Drive North',
  'scholars drive north':                  'Scholars Drive North',
  'scholars drive':                        'Scholars Drive North',
  'pangea parking':                        'Pangea Parking Structure',
  'pangea drive':                          'Pangea Parking Structure',
  'hopkins parking':                       'Hopkins Parking Structure',
  'gilman parking':                        'Gilman Parking Structure',
  'gilman dr':                             'Gilman Drive',
  'voigt dr':                              'Voigt Drive',

  // Housing groupings
  'central mesa apartments':               'Mesa Apartments',
  'mesa apartments central':               'Mesa Apartments',
  'mesa apartments south':                 'Mesa Apartments',
  'south mesa apartments':                 'Mesa Apartments',
  'mesa canyon parking structure':         'Mesa Apartments',
  'seventh college west #1':              'Seventh College West',
  'seventh college east #2':              'Seventh College',
  'seventh college east #3':              'Seventh College',
  'charles david keeling apartments #1':  'Charles David Keeling Apartments',
  'matthews apartments a':                'Matthews Apartments',
  'leichtag family foundation biomedical research': 'Leichtag Biomedical Research',
  'ucsd police department':               'Campus Emergency Services Building',
  'cafe ventanas':                        'Café Ventanas',
  'joan and irwin jacobs la jolla playhouse': 'La Jolla Playhouse',
};

/**
 * Known UCSD building coordinates — bypasses geocoding entirely.
 * Keys must match the CANONICAL name (post-alias resolution).
 */
export const KNOWN_COORDS = {
  // ── HEALTH SCIENCES CAMPUS ───────────────────────────────────────────
  'Thornton Pavilion':                    { lat: 32.8718, lng: -117.2244 },
  'Moores Cancer Center':                 { lat: 32.8726, lng: -117.2228 },
  'Jacobs Medical Center':                { lat: 32.8730, lng: -117.2233 },
  'Koman Family Outpatient Pavilion':     { lat: 32.8721, lng: -117.2238 },
  'Shiley Eye Institute':                 { lat: 32.8738, lng: -117.2249 },
  'Campus Emergency Services Building':   { lat: 32.8734, lng: -117.2272 },
  'Israni Biomedical Research Facility':  { lat: 32.8748, lng: -117.2261 },
  'Sally T. Wongavery Library':           { lat: 32.8751, lng: -117.2256 },
  'Sulpizio Family Cardiovascular Center':{ lat: 32.8728, lng: -117.2241 },
  'Leichtag Biomedical Research':         { lat: 32.8744, lng: -117.2258 },
  'Trolley La Jolla Health Station':      { lat: 32.8734, lng: -117.2231 },
  'UCSD Health La Jolla':                 { lat: 32.8724, lng: -117.2244 },

  // ── UCSD HILLCREST (off-main-campus) ─────────────────────────────────
  'UCSD Medical Center Hillcrest':        { lat: 32.7553, lng: -117.1670 },

  // ── MAIN ACADEMIC CAMPUS ─────────────────────────────────────────────
  'Geisel Library':                       { lat: 32.8810, lng: -117.2377 },
  'Price Center':                         { lat: 32.8796, lng: -117.2358 },
  'Library Walk':                         { lat: 32.8797, lng: -117.2370 },
  'Center Hall':                          { lat: 32.8792, lng: -117.2396 },
  'Mandeville Center':                    { lat: 32.8781, lng: -117.2415 },
  'Social Sciences Building':             { lat: 32.8779, lng: -117.2384 },
  'Student Services Center':              { lat: 32.8770, lng: -117.2395 },
  'Galbraith Hall':                       { lat: 32.8800, lng: -117.2407 },
  'Biomedical Sciences Building':         { lat: 32.8757, lng: -117.2368 },
  'Student Health and Wellness Center':   { lat: 32.8753, lng: -117.2333 },
  'Trolley Central Campus Station':       { lat: 32.8779, lng: -117.2356 },
  'Rita Atkinson Residences':             { lat: 32.8779, lng: -117.2358 },
  'RIMAC Arena':                          { lat: 32.8853, lng: -117.2392 },
  'Epstein Family Amphitheater':          { lat: 32.8797, lng: -117.2344 },
  'Warren Lecture Hall':                  { lat: 32.8824, lng: -117.2365 },
  'Tioga Hall':                           { lat: 32.8769, lng: -117.2369 },
  'Argo Hall':                            { lat: 32.8820, lng: -117.2351 },
  'Bookstore':                            { lat: 32.8797, lng: -117.2358 },
  'Ridge Walk Academic Building':         { lat: 32.8829, lng: -117.2346 },
  'Seventh College':                      { lat: 32.8870, lng: -117.2338 },
  'Seventh College West':                 { lat: 32.8870, lng: -117.2343 },
  'York Hall':                            { lat: 32.8795, lng: -117.2404 },
  'Urey Hall':                            { lat: 32.8802, lng: -117.2398 },
  'Bonner Hall':                          { lat: 32.8800, lng: -117.2384 },
  'Natural Sciences Building':            { lat: 32.8785, lng: -117.2406 },
  'Humanities and Social Sciences':       { lat: 32.8784, lng: -117.2395 },
  'Communication Building':               { lat: 32.8792, lng: -117.2383 },
  'Café Ventanas':                        { lat: 32.8790, lng: -117.2360 },
  'Sixth Market':                         { lat: 32.8883, lng: -117.2344 },
  'Canyon Vista':                         { lat: 32.8812, lng: -117.2363 },
  'Discovery Hall':                       { lat: 32.8879, lng: -117.2338 },
  'Stewart Hall':                         { lat: 32.8877, lng: -117.2342 },
  'Stewart Commons':                      { lat: 32.8877, lng: -117.2340 },
  'Preuss School':                        { lat: 32.8821, lng: -117.2288 },
  'Warren Field':                         { lat: 32.8832, lng: -117.2357 },
  'Canyonview Aquatic & Climbing Wall Facility': { lat: 32.8845, lng: -117.2364 },

  // ── ENGINEERING ──────────────────────────────────────────────────────
  'Jacobs Hall':                          { lat: 32.8815, lng: -117.2336 },
  'Atkinson Hall':                        { lat: 32.8826, lng: -117.2340 },
  'Franklin Antonio Hall':                { lat: 32.8830, lng: -117.2332 },
  'Computer Science and Engineering Building': { lat: 32.8818, lng: -117.2330 },
  'Design and Innovation Building':       { lat: 32.8832, lng: -117.2315 },
  'Halicioglu Data Science Institute':    { lat: 32.8808, lng: -117.2337 },
  'Structural and Material Engineering Building': { lat: 32.8812, lng: -117.2342 },
  'Engineering Building Unit II':         { lat: 32.8813, lng: -117.2352 },
  'Powell-Focht Bioengineering Hall':     { lat: 32.8820, lng: -117.2346 },

  // ── NORTH TPLLC HOUSING ──────────────────────────────────────────────
  'Kaleidoscope': { lat: 32.8936, lng: -117.2415 },
  'Tapestry':     { lat: 32.8940, lng: -117.2420 },
  'Brisa':        { lat: 32.8944, lng: -117.2418 },
  'Pulse':        { lat: 32.8932, lng: -117.2410 },
  'Umoja':        { lat: 32.8938, lng: -117.2425 },
  'Catalyst':     { lat: 32.8934, lng: -117.2406 },
  'Alianza':      { lat: 32.8942, lng: -117.2423 },
  'Vela':         { lat: 32.8946, lng: -117.2420 },
  'Coalition':    { lat: 32.8930, lng: -117.2412 },
  'Sankofa':      { lat: 32.8943, lng: -117.2416 },
  'Survivance':   { lat: 32.8928, lng: -117.2408 },
  'Cala':         { lat: 32.8939, lng: -117.2418 },
  'Rya':          { lat: 32.8945, lng: -117.2412 },
  'Piedra':       { lat: 32.8936, lng: -117.2422 },
  'Viento':       { lat: 32.8941, lng: -117.2414 },
  'Mosaic':       { lat: 32.8933, lng: -117.2420 },
  'Cresta':       { lat: 32.8937, lng: -117.2407 },
  'Podemos':      { lat: 32.8942, lng: -117.2419 },
  'Movement':     { lat: 32.8929, lng: -117.2415 },
  'Astilla':      { lat: 32.8944, lng: -117.2411 },
  'Azad':         { lat: 32.8940, lng: -117.2417 },
  'Porton':       { lat: 32.8943, lng: -117.2413 },
  'North America Hall': { lat: 32.8935, lng: -117.2416 },
  'Europe Hall':  { lat: 32.8941, lng: -117.2422 },
  'Artesa':       { lat: 32.8938, lng: -117.2409 },
  'Asante Hall':  { lat: 32.8931, lng: -117.2414 },
  'Cuzco House':  { lat: 32.8934, lng: -117.2417 },
  'Cuzco Hall':   { lat: 32.8934, lng: -117.2417 },
  'Latin America Hall': { lat: 32.8936, lng: -117.2411 },
  'Africa Hall':  { lat: 32.8939, lng: -117.2419 },
  'Geneva Hall':  { lat: 32.8942, lng: -117.2413 },
  'Blake Hall':   { lat: 32.8937, lng: -117.2421 },
  'Tierra':       { lat: 32.8930, lng: -117.2416 },
  'Opportunity':  { lat: 32.8933, lng: -117.2418 },
  'Peterson Hall':{ lat: 32.8940, lng: -117.2423 },
  'The Jeannie':  { lat: 32.8935, lng: -117.2412 },
  'Earth Hall North': { lat: 32.8943, lng: -117.2415 },
  'Wells Fargo Hall': { lat: 32.8941, lng: -117.2417 },
  'Harlan Hall':  { lat: 32.8838, lng: -117.2362 },  // Warren College
  'Black Apartments': { lat: 32.8851, lng: -117.2356 },

  // ── OTHER RESIDENTIAL ────────────────────────────────────────────────
  'Pepper Canyon Apartments':  { lat: 32.8768, lng: -117.2334 },
  'Pepper Canyon Hall':        { lat: 32.8771, lng: -117.2337 },
  'Tamarack Apartments':       { lat: 32.8777, lng: -117.2347 },
  'Matthews Apartments':       { lat: 32.8745, lng: -117.2365 },
  'Tuolumne Apartments':       { lat: 32.8760, lng: -117.2370 },
  'Mesa Apartments':           { lat: 32.8740, lng: -117.2355 },
  'La Jolla Del Sol Apartments': { lat: 32.8680, lng: -117.2265 },
  'Charles David Keeling Apartments': { lat: 32.8755, lng: -117.2360 },
  'Douglas Apartments':        { lat: 32.8745, lng: -117.2360 },
  'Goldberg Apartments':       { lat: 32.8851, lng: -117.2349 },
  'Brennan Apartments':        { lat: 32.8858, lng: -117.2360 },
  'Brennan Hall':              { lat: 32.8858, lng: -117.2360 },

  // ── OTHER ────────────────────────────────────────────────────────────
  'One Miramar Street':        { lat: 32.8893, lng: -117.2228 },
  'SIO Pier':                  { lat: 32.8665, lng: -117.2543 },
  'Birch Aquarium':            { lat: 32.8665, lng: -117.2545 },
  'Black\'s Beach':            { lat: 32.8747, lng: -117.2541 },
  'Gilman Drive':              { lat: 32.8780, lng: -117.2350 },
  'Gilman Parking Structure':  { lat: 32.8793, lng: -117.2341 },
  'Scholars Parking Structure':{ lat: 32.8830, lng: -117.2323 },
  'Scholars Drive North':      { lat: 32.8828, lng: -117.2325 },
  'Pangea Parking Structure':  { lat: 32.8763, lng: -117.2349 },
  'Hopkins Parking Structure': { lat: 32.8749, lng: -117.2341 },
  'South Parking Structure':   { lat: 32.8746, lng: -117.2338 },
  'Athena Parking':            { lat: 32.8759, lng: -117.2362 },
  'Theatre District Parking Structure': { lat: 32.8793, lng: -117.2336 },
  'Ola Parking':               { lat: 32.8762, lng: -117.2340 },
  'Voigt Drive':               { lat: 32.8776, lng: -117.2320 },
  'Regents Road':              { lat: 32.8760, lng: -117.2295 },
  'Genesee Avenue':            { lat: 32.8576, lng: -117.2100 },
  'North Torrey Pines Road':   { lat: 32.8900, lng: -117.2435 },
  'Fleet Services':            { lat: 32.8736, lng: -117.2278 },
  'Marine Conservation and Technology Facility': { lat: 32.8668, lng: -117.2536 },
  'La Jolla Playhouse':        { lat: 32.8795, lng: -117.2340 },
  '64 Degrees':                { lat: 32.8880, lng: -117.2342 },
  'Oceanview Terrace':         { lat: 32.8800, lng: -117.2376 },
};

/**
 * Returns the canonical name for a location, normalizing variants.
 */
export function normalizeLocationName(name) {
  if (!name) return name;
  return LOCATION_ALIASES[name.toLowerCase().trim()] || name;
}
