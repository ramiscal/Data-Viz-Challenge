/*
NBC Data Viz Code Challenge!
Create a Data Visualization of your choosing from the supplied Covid data
Displaying population choropleth of each state. [] Make a legend.<br>
[] Display Covid cases and deaths. [] Cases per 100K <br>
Displaying in Mercator. [] Toggle between globe and mercator.><br>
`;
/
/* ROUND 1` - Data Transformations
  1) Use the data in data/covid.csv to create a json object of the covid data
  2) Use the data in data/states-population.json and the data
    you created in step 1 to calculate the cases per 100K
*/

/* ROUND 2 - UI Building
 1) Use the COVID-19 states data supplied to render a data visualization of your choosing, ie
 - Bar Graph
 - Line Graph
 - ScatterPlot, etc

2) Ensure data visualization is annotated

3) Create an user generated interaction (click on a bar, show some information)
*/

/*Notes:
Round 1:
Data Transformations:
I used QGIS to create GeoJSON.
I imported the GeoJSON into Mapbox as tilesets.
Round 2:
1. I'm displaying the data stared in the tileset as a choropleth.
2. There's an overlay of the number of cases in each state.
3. If you hover on a state it will show you the data for that particular state.
There's also a slider to look at historical data.

*/

import * as mapboxgl from "mapbox-gl";
import '../css/mapbox-gl.css';
import '../css/style.css';


mapboxgl.accessToken = 'pk.eyJ1IjoiaXZhbnJhbWlzY2FsIiwiYSI6ImNrN3E1dHR1MDAwNTYzbXAwajhzaG94M2kifQ.7dV1OarYNRtBuWd-d_FogA';

const map = new mapboxgl.Map({
    accessToken: mapboxgl.accessToken,
    projection: 'mercator', //toggle between mercator and globe
    container: 'map', // container ID
    style: 'mapbox://styles/ivanramiscal/cln40dc8006ur01qb3ba88qm8',
    center: [-98.5796,39.8282], // starting position [lng, lat]
    zoom: 4.5 // starting zoom
});

map.on('load', () => {

  const longname = [
    '2020 JAN 21',
    '2020 JAN 22',
    '2020 JAN 23',
    '2020 JAN 24',
    '2020 JAN 25',
    '2020 JAN 26',
    '2020 JAN 27',
    '2020 JAN 28',
    '2020 JAN 29',
    '2020 JAN 30',
    '2020 FEB 01',
    '2020 FEB 02',
    '2020 FEB 03',
    '2020 FEB 04',
    '2020 FEB 05',
    '2020 FEB 06',
    '2020 FEB 07',
    '2020 FEB 08',
    '2020 FEB 09',
    '2020 FEB 10',
    '2020 FEB 11',
    '2020 FEB 12',
    '2020 FEB 13',
    '2020 FEB 14',
    '2020 FEB 15',
    '2020 FEB 16',
    '2020 FEB 17',
    '2020 FEB 18',
    '2020 FEB 19',
    '2020 FEB 20',
    '2020 FEB 21',
    '2020 FEB 22',
    '2020 FEB 23',
    '2020 FEB 24',
    '2020 FEB 25',
    '2020 FEB 26',
    '2020 FEB 27',
    '2020 FEB 28',
    '2020 FEB 29',
    '2020 MAR 01',
    '2020 MAR 02',
    '2020 MAR 03',
    '2020 MAR 04',
    '2020 MAR 05',
    '2020 MAR 06',
    '2020 MAR 07',
    '2020 MAR 08',
    '2020 MAR 09',
    '2020 MAR 10',
    '2020 MAR 11',
    '2020 MAR 12',
    '2020 MAR 13',
    '2020 MAR 14',
    '2020 MAR 15',
    '2020 MAR 16',
    '2020 MAR 17',
    '2020 MAR 18',
    '2020 MAR 19',
    '2020 MAR 20',
    '2020 MAR 21',
    '2020 MAR 22',
    '2020 MAR 23',
    '2020 MAR 24',
    '2020 MAR 25',
    '2020 MAR 26',
    '2020 MAR 27',
    '2020 MAR 28',
    '2020 MAR 29',
    '2020 MAR 30',
    '2020 MAR 31',
    '2020 APR 01',
    '2020 APR 02',
    '2020 APR 03',
    '2020 APR 04',
    '2020 APR 05',
    '2020 APR 06',
    '2020 APR 07',
    '2020 APR 08',
    '2020 APR 09',
    '2020 APR 10',
    '2020 APR 11',
    '2020 APR 12',
    '2020 APR 13',
    '2020 APR 14',
    '2020 APR 15',
    '2020 APR 16',
    '2020 APR 17',
    '2020 APR 18',
    '2020 APR 19',
    '2020 APR 20',
    '2020 APR 21',
    '2020 APR 22',
    '2020 APR 23',
    '2020 APR 24',
    '2020 APR 25',
    '2020 APR 26',
    '2020 APR 27',
    '2020 APR 28',
    '2020 APR 29',
    '2020 APR 30',
    '2020 MAY 01',
    '2020 MAY 02',
    '2020 MAY 03',
    '2020 MAY 04',
    '2020 MAY 05',
    '2020 MAY 06',
    '2020 MAY 07',
    '2020 MAY 08',
  ]


  const dates = [
    'deaths2020_01_21',
    'deaths2020_01_22',
    'deaths2020_01_23',
    'deaths2020_01_24',
    'deaths2020_01_25',
    'deaths2020_01_26',
    'deaths2020_01_27',
    'deaths2020_01_28',
    'deaths2020_01_29',
    'deaths2020_01_30',
    'deaths2020_02_01',
    'deaths2020_02_02',
    'deaths2020_02_03',
    'deaths2020_02_04',
    'deaths2020_02_05',
    'deaths2020_02_06',
    'deaths2020_02_07',
    'deaths2020_02_08',
    'deaths2020_02_09',
    'deaths2020_02_10',
    'deaths2020_02_11',
    'deaths2020_02_12',
    'deaths2020_02_13',
    'deaths2020_02_14',
    'deaths2020_02_15',
    'deaths2020_02_16',
    'deaths2020_02_17',
    'deaths2020_02_18',
    'deaths2020_02_19',
    'deaths2020_02_20',
    'deaths2020_02_21',
    'deaths2020_02_22',
    'deaths2020_02_23',
    'deaths2020_02_24',
    'deaths2020_02_25',
    'deaths2020_02_26',
    'deaths2020_02_27',
    'deaths2020_02_28',
    'deaths2020_02_29',
    'deaths2020_03_01',
    'deaths2020_03_02',
    'deaths2020_03_03',
    'deaths2020_03_04',
    'deaths2020_03_05',
    'deaths2020_03_06',
    'deaths2020_03_07',
    'deaths2020_03_08',
    'deaths2020_03_09',
    'deaths2020_03_10',
    'deaths2020_03_11',
    'deaths2020_03_12',
    'deaths2020_03_13',
    'deaths2020_03_14',
    'deaths2020_03_15',
    'deaths2020_03_16',
    'deaths2020_03_17',
    'deaths2020_03_18',
    'deaths2020_03_19',
    'deaths2020_03_20',
    'deaths2020_03_21',
    'deaths2020_03_22',
    'deaths2020_03_23',
    'deaths2020_03_24',
    'deaths2020_03_25',
    'deaths2020_03_26',
    'deaths2020_03_27',
    'deaths2020_03_28',
    'deaths2020_03_29',
    'deaths2020_03_30',
    'deaths2020_03_31',
    'deaths2020_04_01',
    'deaths2020_04_02',
    'deaths2020_04_03',
    'deaths2020_04_04',
    'deaths2020_04_05',
    'deaths2020_04_06',
    'deaths2020_04_07',
    'deaths2020_04_08',
    'deaths2020_04_09',
    'deaths2020_04_10',
    'deaths2020_04_11',
    'deaths2020_04_12',
    'deaths2020_04_13',
    'deaths2020_04_14',
    'deaths2020_04_15',
    'deaths2020_04_16',
    'deaths2020_04_17',
    'deaths2020_04_18',
    'deaths2020_04_19',
    'deaths2020_04_20',
    'deaths2020_04_21',
    'deaths2020_04_22',
    'deaths2020_04_23',
    'deaths2020_04_24',
    'deaths2020_04_25',
    'deaths2020_04_26',
    'deaths2020_04_27',
    'deaths2020_04_28',
    'deaths2020_04_29',
    'deaths2020_04_30',
    'deaths2020_05_01',
    'deaths2020_05_02',
    'deaths2020_05_03',
    'deaths2020_05_04',
    'deaths2020_05_05',
    'deaths2020_05_06',
    'deaths2020_05_07',
    'deaths2020_05_08',
  ]

  const cases = [
    'cases2020_01_21',
    'cases2020_01_22',
    'cases2020_01_23',
    'cases2020_01_24',
    'cases2020_01_25',
    'cases2020_01_26',
    'cases2020_01_27',
    'cases2020_01_28',
    'cases2020_01_29',
    'cases2020_01_30',
    'cases2020_02_01',
    'cases2020_02_02',
    'cases2020_02_03',
    'cases2020_02_04',
    'cases2020_02_05',
    'cases2020_02_06',
    'cases2020_02_07',
    'cases2020_02_08',
    'cases2020_02_09',
    'cases2020_02_10',
    'cases2020_02_11',
    'cases2020_02_12',
    'cases2020_02_13',
    'cases2020_02_14',
    'cases2020_02_15',
    'cases2020_02_16',
    'cases2020_02_17',
    'cases2020_02_18',
    'cases2020_02_19',
    'cases2020_02_20',
    'cases2020_02_21',
    'cases2020_02_22',
    'cases2020_02_23',
    'cases2020_02_24',
    'cases2020_02_25',
    'cases2020_02_26',
    'cases2020_02_27',
    'cases2020_02_28',
    'cases2020_02_29',
    'cases2020_03_01',
    'cases2020_03_02',
    'cases2020_03_03',
    'cases2020_03_04',
    'cases2020_03_05',
    'cases2020_03_06',
    'cases2020_03_07',
    'cases2020_03_08',
    'cases2020_03_09',
    'cases2020_03_10',
    'cases2020_03_11',
    'cases2020_03_12',
    'cases2020_03_13',
    'cases2020_03_14',
    'cases2020_03_15',
    'cases2020_03_16',
    'cases2020_03_17',
    'cases2020_03_18',
    'cases2020_03_19',
    'cases2020_03_20',
    'cases2020_03_21',
    'cases2020_03_22',
    'cases2020_03_23',
    'cases2020_03_24',
    'cases2020_03_25',
    'cases2020_03_26',
    'cases2020_03_27',
    'cases2020_03_28',
    'cases2020_03_29',
    'cases2020_03_30',
    'cases2020_03_31',
    'cases2020_04_01',
    'cases2020_04_02',
    'cases2020_04_03',
    'cases2020_04_04',
    'cases2020_04_05',
    'cases2020_04_06',
    'cases2020_04_07',
    'cases2020_04_08',
    'cases2020_04_09',
    'cases2020_04_10',
    'cases2020_04_11',
    'cases2020_04_12',
    'cases2020_04_13',
    'cases2020_04_14',
    'cases2020_04_15',
    'cases2020_04_16',
    'cases2020_04_17',
    'cases2020_04_18',
    'cases2020_04_19',
    'cases2020_04_20',
    'cases2020_04_21',
    'cases2020_04_22',
    'cases2020_04_23',
    'cases2020_04_24',
    'cases2020_04_25',
    'cases2020_04_26',
    'cases2020_04_27',
    'cases2020_04_28',
    'cases2020_04_29',
    'cases2020_04_30',
    'cases2020_05_01',
    'cases2020_05_02',
    'cases2020_05_03',
    'cases2020_05_04',
    'cases2020_05_05',
    'cases2020_05_06',
    'cases2020_05_07',
    'cases2020_05_08',
  ]

  const layers = [
    '0-83951',
    '83951-125926',
    '125926-167902',
    '167902-209877',
    '209877-251853',
    '251853-293828',
    '293828-335804',
    '335804+'
  ];

  const colors = [
    '#FFEDA0',
    '#FED976',
    '#FEB24C',
    '#FD8D3C',
    '#FC4E2A',
    '#E31A1C',
    '#BD0026',
    '#800026'
  ];


  const strata = map.getStyle().layers;
  // Find the index of the first symbol layer in the map style.
  let firstSymbolId;
  for (const layer of strata) {
  if (layer.type === 'symbol') {
  firstSymbolId = layer.id;
  break;
  }
  }
  
  document.getElementById('active-date').innerHTML = longname[107]

map.addSource('ier-cov', {
  type: 'vector',
  url: 'mapbox://ivanramiscal.8b2ylhhu'
  });
  

  document.getElementById('slider').addEventListener('input', (event) => {
    const index = parseInt(event.target.value);
    
    if (map.getLayer("ier-cov-layer")) {
      map.removeLayer("ier-cov-layer");
    }

    map.addLayer(
      {
        id: 'ier-cov-layer',
        type: 'fill',
        
        layout: {
          "visibility": "visible",
        },
        source: 'ier-cov',
        'source-layer': 'escaped-time-covid-all-int-c3vdvz',
  
        paint: {
          'fill-opacity': 0.80,
          'fill-color':
            [
              'interpolate',
              ['linear'],
              ["*",
                ["*", 100, ['get', cases[index]]],
              ],
              0, '#FFEDA0',
              335804, '#800026'
            ]
        }
      }
      , firstSymbolId
    );
    
    // update text in the UI
    document.getElementById('active-date').innerText = longname[index];

    map.on('mousemove', (event) => {
      const states = map.queryRenderedFeatures(event.point, {
        layers: ['ier-cov-layer']
      });

      //var blob = states[0].properties + `.` + dates[index];
      
      document.getElementById('pd').innerHTML = states.length
        ? 
        `<h2>2020 MAY 08</h2>
        <h2>${ ((states[0].properties.cases2020_05_08 / states[0].properties.population) * 100000).toFixed(2)} COVID cases per 100K in ${states[0].properties.name}</h2>
        <h3>${states[0].properties.cases2020_05_08} cases • ${states[0].properties.deaths2020_05_08} deaths • ${states[0].properties.population} people in ${states[0].properties.name}</h3>
        `

        : `<p>Hover cursor over state</p>`;
    });

  });

// create legend
const legend = document.getElementById('legend');

layers.forEach((layer, i) => {
  const color = colors[i];
  const item = document.createElement('div');
  const key = document.createElement('span');
  key.className = 'legend-key';
  key.style.backgroundColor = color;

  const value = document.createElement('span');
  value.innerHTML = `${layer}`;
  item.appendChild(key);
  item.appendChild(value);
  legend.appendChild(item);
});

   // Add zoom and rotation controls to the map.
  map.addControl(new mapboxgl.NavigationControl());


  map.addLayer(
    {
      id: 'ier-cov-layer',
      type: 'fill',
      
      layout: {
        "visibility": "visible",
      },
      source: 'ier-cov',
      'source-layer': 'escaped-time-covid-all-int-c3vdvz',

      paint: {
        'fill-opacity': 0.8,
        'fill-color':
          [
            'interpolate',
            ['linear'],
            ["*",
              ["*", 100, ['get', cases[107]]],
            ],
            0, '#FFEDA0',
            335804, '#800026'
          ]
      }
    }
    , firstSymbolId
  );


// Add a symbol layer showing all features in the source
map.addLayer({
  'id': 'labels-layer',
  'type': 'symbol',
  'source': 'ier-cov',
  'source-layer': 'escaped-time-covid-all-int-c3vdvz',
  'layout': {
    'text-field': ['get', cases[107]],
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 18
    },
    'paint': {
      'text-color': '#ffffff'
    }
  });

  map.on('mousemove', (event) => {
    const states = map.queryRenderedFeatures(event.point, {
      layers: ['ier-cov-layer']
    });
    
    document.getElementById('pd').innerHTML = states.length
      ? 
      `<h2>2020 MAY 08</h2>
      <h2>${ ((states[0].properties.cases2020_05_08 / states[0].properties.population) * 100000).toFixed(2)} COVID cases per 100K in ${states[0].properties.name}</h2>
      <h3>${states[0].properties.cases2020_05_08} cases • ${states[0].properties.deaths2020_05_08} deaths • ${states[0].properties.population} people in ${states[0].properties.name}</h3>
      `

      : `<p>Hover cursor over state</p>`;
  });
   
  
  // Change the cursor to a pointer when the mouse is over the places layer.
  map.on('mouseenter', 'ier-cov-layer', () => {
  map.getCanvas().style.cursor = 'pointer';
  });
   
  // Change it back to a pointer when it leaves.
  map.on('mouseleave', 'ier-cov-layer', () => {
  map.getCanvas().style.cursor = '';
  });
  });


