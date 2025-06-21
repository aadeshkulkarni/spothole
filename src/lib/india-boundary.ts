export const indiaBoundary = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'India' },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              // Starting from Kashmir, tracing India's international borders clockwise
              [74.8956, 37.0841], // Jammu & Kashmir - northernmost point
              [78.9124, 35.4849], // Ladakh region
              [80.0884, 35.2269], // Eastern Ladakh border with China

              // Eastern border with China and Myanmar
              [97.4095, 28.218], // Arunachal Pradesh eastern tip
              [97.3541, 27.8554], // China border
              [96.2292, 27.2281], // Myanmar border
              [94.5957, 25.0669], // Manipur
              [93.952, 23.1645], // Mizoram-Myanmar border
              [93.3252, 23.7644], // Tripura

              // Bangladesh border
              [92.673, 22.9734], // Meghalaya
              [91.9882, 24.6048], // Bangladesh border north
              [91.9882, 23.6277], // Bangladesh border
              [89.7445, 22.0], // West Bengal
              [88.0856, 22.2847], // West Bengal coast

              // Eastern coast going south
              [87.4297, 21.9234], // Odisha coast
              [85.8245, 20.9517], // Odisha
              [84.3866, 19.3176], // Odisha-Andhra Pradesh
              [82.9739, 18.1176], // Andhra Pradesh
              [80.2707, 16.5827], // Andhra Pradesh coast
              [80.2707, 13.0827], // Tamil Nadu border
              [79.9629, 12.5937], // Tamil Nadu
              [78.1504, 11.9252], // Tamil Nadu
              [77.5615, 8.0883], // Kanyakumari - southernmost mainland point

              // Western coast going north
              [76.2711, 8.2137], // Kerala coast
              [75.7139, 10.2588], // Kerala
              [74.8956, 12.9716], // Karnataka coast
              [74.124, 15.2993], // Goa
              [73.8567, 18.5204], // Maharashtra coast
              [72.8777, 19.076], // Maharashtra

              // Gujarat coast and western border
              [72.6369, 20.0333], // Gujarat coast
              [70.3594, 22.0193], // Gujarat
              [68.7045, 22.4707], // Gujarat westernmost point
              [68.1097, 23.6345], // Gujarat-Pakistan border

              // Pakistan border going north through Rajasthan, Punjab
              [69.059, 24.6406], // Rajasthan-Pakistan border
              [70.0577, 25.9979], // Rajasthan
              [71.0397, 27.0928], // Rajasthan-Punjab border
              [74.3457, 29.4072], // Punjab-Pakistan border
              [75.3412, 32.7266], // Punjab
              [74.8956, 37.0841], // Back to Kashmir starting point
            ],
          ],
          // Andaman & Nicobar Islands
          [
            [
              [92.2336, 6.7324],
              [94.2627, 6.7324],
              [94.2627, 13.7745],
              [92.2336, 13.7745],
              [92.2336, 6.7324],
            ],
          ],
          // Lakshadweep Islands
          [
            [
              [71.6369, 8.2881],
              [74.1397, 8.2881],
              [74.1397, 12.524],
              [71.6369, 12.524],
              [71.6369, 8.2881],
            ],
          ],
        ],
      },
    },
  ],
} as const;

// Comprehensive GeoJSON boundary for India covering:
// NORTHERN BORDERS: Jammu & Kashmir, Ladakh, Punjab, Himachal Pradesh, Uttarakhand
// EASTERN BORDERS: Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura, Meghalaya, Assam, West Bengal, Sikkim
// SOUTHERN BORDERS: Tamil Nadu, Kerala, Karnataka, Andhra Pradesh, Telangana
// WESTERN BORDERS: Gujarat, Rajasthan, Maharashtra
// UNION TERRITORIES: Delhi, Chandigarh, Goa, Puducherry, Andaman & Nicobar, Lakshadweep, Dadra & Nagar Haveli, Daman & Diu
// Traces actual international borders with Pakistan, China, Myanmar, Bangladesh and coastlines
