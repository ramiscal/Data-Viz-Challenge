//function-controls.js
var site = "https://ivaner.pythonanywhere.com";
//var headers = new Headers();
//headers.append('Origin','http://localhost:5000');
//headers.append('Access-Control-Allow-Origin', 'http://localhost:5000');
//headers.append('Access-Control-Allow-Credentials', 'true');

var energyFactorPanel = false;
var stateAbbr = "VA";
var countyName = "";
var countyFeatures = [{}];

// Holds visible visibleStores features for filtering
var visibleStores = [];

var chartWidth = 200;
var chartHeight = 100;

// Create a popup, but don't add it to the map yet.
var popup = new mapboxgl.Popup({
  closeButton: false
});

function flyToStore(currentFeature, theMap) {
  theMap.flyTo({
    center: currentFeature.geometry.coordinates,
    zoom: 8
  });
}

function createPopUp(e, m) {
  var popup = new mapboxgl.Popup({ closeOnClick: false })
    .setLngLat(e.lngLat)
    .setHTML(e.features[0].properties.name)
    .addTo(m);
}

var yourVlSpec = {};
var ejsVlSpec = {};
var plantVlSpec = {};
var demandVlSpec = {};
var incomeVlSpec = {};

function calculate(new_state) {
  //Get the values.
  resource_type = document.getElementById("resource-type").value;
  capex = document.getElementById("sliderCapex").value;
  opex = document.getElementById("sliderOpex").value;
  stateAbbr = new_state;
  state_abbr = stateAbbr; //features[0].properties.state;
  local_CIM_direct = document.getElementById("sliderLCIM-direct").value;
  local_CIM_supplier = document.getElementById("sliderLCIM-supplier").value;
  local_OM_direct = document.getElementById("sliderLOM-direct").value;
  local_OM_supplier = document.getElementById("sliderLOM-supplier").value;
  overhead_rate = document.getElementById("sliderOverheadRate").value;

  fetch(
    "http://" +
      site +
      "/calc/" +
      capex +
      "/" +
      opex +
      "/" +
      resource_type +
      "/" +
      state_abbr +
      "/" +
      local_CIM_direct +
      "/" +
      local_CIM_supplier +
      "/" +
      local_OM_direct +
      "/" +
      local_OM_supplier +
      "/" +
      overhead_rate
  )
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      //document.getElementById('result').innerHTML = data;
      econChart(data);
      econBlock(data, "vis3");
    })
    .catch(function (error) {
      console.log("Error: " + error);
    });
}

function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;
  if (arguments.length === 1) {
    (s = h.s), (v = h.v), (h = h.h);
  }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      (r = v), (g = t), (b = p);
      break;
    case 1:
      (r = q), (g = v), (b = p);
      break;
    case 2:
      (r = p), (g = v), (b = t);
      break;
    case 3:
      (r = p), (g = q), (b = v);
      break;
    case 4:
      (r = t), (g = p), (b = v);
      break;
    case 5:
      (r = v), (g = p), (b = q);
      break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

function linear_interpolate(first, second, fraction) {
  return (second - first) * fraction + first;
}

//#238B45
//#74C476
//#BAE4B3
//#EDF8E9
var ej_colors = [
  { value: "#238B45", range: [0.75, 1.0] },
  { value: "#74C476", range: [0.5, 0.75] },
  { value: "#BAE4B3", range: [0.25, 0.5] },
  { value: "#EDF8E9", range: [0.0, 0.25] }
];

function calculateEJ(first_time, how_large, theMap, new_state) {
  //Get the values.
  //state_abbr = stateAbbr;                  //features[0].properties.state;
  //county_name = countyName;
  //console.log(map.queryRenderedFeatures())

  //console.log(geoids);
  //   energy_burden = document.getElementById('sliderA').value;
  //   generation = document.getElementById('sliderB').value;
  //   portfolio = document.getElementById('sliderC').value;
  //   jobs = document.getElementById('sliderD').value;
  //   health = document.getElementById('sliderE').value;
  //   stateAbbr = new_state;
  //   state_abbr = stateAbbr;
  energy_burden_slider = document.getElementById("sliderA").value;
  portfolio_slider = document.getElementById("sliderC").value;
  jobs_slider = document.getElementById("sliderD").value;
  cost_slider = document.getElementById("sliderB").value;
  health_slider = document.getElementById("sliderE").value;

  var fetch_url = "https://ivaner.pythonanywhere.com";
  if (how_large == "some") {
    rendered_features = theMap.queryRenderedFeatures();
    geoids = [];
    for (var uh_index = 0; uh_index < rendered_features.length; uh_index++) {
      if (rendered_features[uh_index]["properties"]["GEOID"] != undefined) {
        if (
          geoids.indexOf(rendered_features[uh_index]["properties"]["GEOID"]) < 0
        ) {
          geoids.push(rendered_features[uh_index]["properties"]["GEOID"]);
        }
      }
    }
    fetch_url =
      site +
      "/calc_ej/" +
      energy_burden_slider +
      "/" +
      portfolio_slider +
      "/" +
      jobs_slider +
      "/" +
      cost_slider +
      "/" +
      health_slider +
      "/" +
      geoids;
  } else {
    fetch_url =
      site +
      "/calc_ej/" +
      energy_burden_slider +
      "/" +
      portfolio_slider +
      "/" +
      jobs_slider +
      "/" +
      cost_slider +
      "/" +
      health_slider +
      "/" +
      "ALL";
  }

  fetch(fetch_url)
    //  .then(function (response) {
    //    console.log(response.json())
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);

      // Build a GL match expression that defines the color for every vector tile feature
      // Use the GEOID code as the lookup key for the county shape
      matchExpression = ["match", ["get", "GEOID"]];

      // Calculate color values for each country based on 'hdi' value
      for (const row of data) {
        // Convert the range of data values to a suitable color

        const green = row["EJ_score"];
        let color = "";
        if (green > 0 && green <= 1) {
          if (
            green > ej_colors[0]["range"][0] &&
            green <= ej_colors[0]["range"][1]
          ) {
            color = ej_colors[0]["value"];
          } else if (
            green > ej_colors[1]["range"][0] &&
            green <= ej_colors[1]["range"][1]
          ) {
            color = ej_colors[1]["value"];
          } else if (
            green > ej_colors[2]["range"][0] &&
            green <= ej_colors[2]["range"][1]
          ) {
            color = ej_colors[2]["value"];
          } else if (
            green > ej_colors[3]["range"][0] &&
            green <= ej_colors[3]["range"][1]
          ) {
            color = ej_colors[3]["value"];
          }
        } else {
          color = `rgba(128, 128, 128, 0.3)`;
        }

        matchExpression.push(row["GEOID"], color);
        //alert('in here')
      }

      // Last value is the default, used where there is no data
      matchExpression.push("rgba(0.1, 0.1, 0.1, 0.1)");

      //console.log(matchExpression);
      /*
            if (first_time == false) {
              theMap.removeLayer('counties-join');
              theMap.addLayer(
                {
                  'id': 'counties-join',
                  'type': 'fill',
                  'source': 'counties',
                  'source-layer': 'BASE001geoids',
                  'paint': {
                    'fill-color': matchExpression
                  }
                },
                'admin-1-boundary-bg'
              );
            }
      */
      if (first_time == false) {
        theMap.removeLayer("counties-join");
      }

      // Add layer from the vector tile source to create the choropleth
      // Insert it below the 'admin-1-boundary-bg' layer in the style

      console.log(countyFeatures);
      if (Object.keys(countyFeatures[0]).length > 0) {
        var county_features = [{}];
        county_features[0].geometry = {};
        county_features[0].properties = {};
        var coordinates = countyFeatures[0].geometry.coordinates;
        county_features[0].geometry.coordinates = coordinates;

        var population = countyFeatures[0].properties.pe;
        county_features[0].properties.pe = population;

        var energyBurden =
          (countyFeatures[0].properties.aaeb * energy_burden_slider) / 100;
        county_features[0].properties.aaeb = energyBurden;

        var n_energyBurden =
          ((1 - countyFeatures[0].properties.aaebn) * energy_burden_slider) /
          100;
        county_features[0].properties.aaebn = n_energyBurden;

        var renewableGen =
          (countyFeatures[0].properties.rgp * portfolio_slider) / 100;
        county_features[0].properties.rgp = renewableGen;

        var n_renewableGen =
          (countyFeatures[0].properties.rgpn * portfolio_slider) / 100;
        county_features[0].properties.rgpn = n_renewableGen;

        var renewableJobs =
          (countyFeatures[0].properties.rjp * jobs_slider) / 100;
        county_features[0].properties.rjp = renewableJobs;

        var n_renewableJobs =
          (countyFeatures[0].properties.rjpn * jobs_slider) / 100;
        county_features[0].properties.rjpn = n_renewableJobs;

        var outage = (countyFeatures[0].properties.s * cost_slider) / 100;
        county_features[0].properties.s = outage;

        var n_outage =
          ((1 - countyFeatures[0].properties.sn) * cost_slider) / 100;
        county_features[0].properties.sn = n_outage;

        var health = (countyFeatures[0].properties.hf * health_slider) / 100;
        county_features[0].properties.hf = health;

        var n_health = (countyFeatures[0].properties.hfn * health_slider) / 100;
        county_features[0].properties.hfn = n_health;

        var ejs =
          (n_energyBurden +
            n_renewableGen +
            n_renewableJobs +
            n_outage +
            n_health) /
          (energy_burden_slider / 100 +
            portfolio_slider / 100 +
            jobs_slider / 100 +
            cost_slider / 100 +
            health_slider / 100);
        county_features[0].properties.ejs = ejs;

        console.log(county_features);

        var name = countyFeatures[0].properties.name;
        county_features[0].properties.name = name;
        var state = countyFeatures[0].properties.state;
        county_features[0].properties.state = state;

        infoTap(county_features, "info-block");
      }

      theMap.addLayer(
        {
          id: "counties-join",
          type: "fill",
          source: "counties",
          "source-layer": "BASE001geoids",
          paint: {
            "fill-color": matchExpression
          }
        },
        "admin-1-boundary-bg"
      );
    })
    .catch(function (error) {
      console.log("Error: " + error);
    });
}

/*
    var mapLayer = theMap.getLayer('counties-join');

    if(typeof mapLayer !== 'undefined') {
      console.log("IER: mapLayer counties-join found.")
      // Remove map layer & source.
      console.log("IER: removeLayer counties-join")
      theMap.removeLayer('counties-join');//.removeSource('route');
    }
      console.log("IER: counties-join addLayer")
    theMap.addLayer(
      {
        'id': 'counties-join',
        'type': 'fill',
        'source': 'counties',
        'source-layer': 'BASE001geoids',
        'paint': {
          'fill-color': matchExpression
        }
      },
      'admin-1-boundary-bg'
    );

    })
    .catch(function (error) {
      console.log(error);
    });
}
*/

function calculateEJ_state(new_state) {
  //Get the values.
  //state_abbr = stateAbbr;                  //features[0].properties.state;
  //county_name = countyName;
  //console.log(map.queryRenderedFeatures())

  //console.log(geoids);
  console.log("ping: calculateEJ_state()");
  energy_burden = document.getElementById("sliderA").value / 100;
  portfolio = document.getElementById("sliderC").value / 100;
  jobs = document.getElementById("sliderD").value / 100;
  cost = document.getElementById("sliderB").value / 100;
  health = document.getElementById("sliderE").value / 100;
  //stateAbbr = new_state;
  state_abbr = stateAbbr;

  var fetch_url =
    site +
    "/calc_state_ej/" +
    energy_burden +
    "/" +
    portfolio +
    "/" +
    jobs +
    "/" +
    cost +
    "/" +
    health +
    "/" +
    state_abbr;
  //TODO:Add health to above

  fetch(fetch_url)
    //  .then(function (response) {
    //    console.log(response.json())
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);

      // Build a GL match expression that defines the color for every vector tile feature
      // Use the GEOID code as the lookup key for the county shape

      var calculated_data = [];
      // calculated_data.push((1-data[0]["a"]) * energy_burden)
      // calculated_data.push(data[0]["b"] * portfolio)
      // calculated_data.push(data[0]["c"] * jobs)
      // calculated_data.push((1-data[0]["d"]) * cost)
      // calculated_data.push((1-data[0]["e"]) * health)

      let energy_burden_temp = energy_burden;
      let portfolio_temp = portfolio;
      let jobs_temp = jobs;
      let cost_temp = cost;
      let health_temp = health;

      if (data[0]["a"] >= 0) {
        calculated_data.push((1 - data[0]["a"]) * energy_burden);
      } else {
        calculated_data.push(0);
        energy_burden_temp = 0;
      }
      if (data[0]["b"] >= 0) {
        calculated_data.push(data[0]["b"] * portfolio);
      } else {
        calculated_data.push(0);
        portfolio_temp = 0;
      }
      if (data[0]["c"] >= 0) {
        calculated_data.push(data[0]["c"] * jobs);
      } else {
        calculated_data.push(0);
        jobs_temp = 0;
      }
      if (data[0]["d"] >= 0) {
        calculated_data.push((1 - data[0]["d"]) * cost);
      } else {
        calculated_data.push(0);
        cost_temp = 0;
      }
      if (data[0]["e"] >= 0) {
        calculated_data.push(data[0]["e"] * health);
      } else {
        calculated_data.push(0);
        health_temp = 0;
      }

      var ej_score =
        (calculated_data[0] +
          calculated_data[1] +
          calculated_data[2] +
          calculated_data[3] +
          calculated_data[4]) /
        (energy_burden_temp +
          portfolio_temp +
          jobs_temp +
          cost_temp +
          health_temp);

      calculated_data.push(ej_score);
      calculated_data.push(state_abbr);
      ejsChart(calculated_data, "#vis4");
      energyBlock(calculated_data, "vis5");
    })
    .catch(function (error) {
      console.log("Error: " + error);
    });
}

function connectEJsliders(theMap) {
  console.log("IER: ConnectEJSliders");
  var sliderA = document.getElementById("sliderA");
  var sliderValueA = document.getElementById("slider-valueA");
  var sliderB = document.getElementById("sliderB");
  var sliderValueB = document.getElementById("slider-valueB");
  var sliderC = document.getElementById("sliderC");
  var sliderValueC = document.getElementById("slider-valueC");
  var sliderD = document.getElementById("sliderD");
  var sliderValueD = document.getElementById("slider-valueD");
  var sliderE = document.getElementById("sliderE");
  var sliderValueE = document.getElementById("slider-valueE");

  sliderA.addEventListener("input", function (e) {
    //Value indicator
    sliderValueA.textContent = e.target.value + "%";
  });

  sliderA.addEventListener("mouseup", function (e) {
    console.log("IER: sliderA mouseup");
    calculateEJ(false, "all", theMap, stateAbbr);
    calculateEJ_state(stateAbbr);
  });

  sliderB.addEventListener("input", function (e) {
    //Value indicator
    sliderValueB.textContent = e.target.value + "%";
  });

  sliderB.addEventListener("mouseup", function (e) {
    console.log("IER: sliderB mouseup");
    calculateEJ(false, "all", theMap, stateAbbr);
    calculateEJ_state(stateAbbr);
  });

  sliderC.addEventListener("input", function (e) {
    //Value indicator
    sliderValueC.textContent = e.target.value + "%";
  });

  sliderC.addEventListener("mouseup", function (e) {
    console.log("IER: sliderA mouseup");
    calculateEJ(false, "all", theMap, stateAbbr);
    calculateEJ_state(stateAbbr);
  });

  sliderD.addEventListener("input", function (e) {
    //Value indicator
    sliderValueD.textContent = e.target.value + "%";
  });

  sliderD.addEventListener("mouseup", function (e) {
    console.log("IER: sliderA mouseup");
    calculateEJ(false, "all", theMap, stateAbbr);
    calculateEJ_state(stateAbbr);
  });

  sliderE.addEventListener("input", function (e) {
    //Value indicator
    sliderValueE.textContent = e.target.value + "%";
  });

  sliderE.addEventListener("mouseup", function (e) {
    console.log("IER: sliderA mouseup");
    calculateEJ(false, "all", theMap, stateAbbr);
    calculateEJ_state(stateAbbr);
  });

  return "connectSliders called";
}

function ejsChart(features, pane) {
  if (features.length) {
    ejsVlSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      title: "Energy Equity Score",
      description: "The factors that comprise the MITRE Energy Equity Score.",
      width: chartWidth,
      height: chartHeight,
      //height: { 'step': 16 },
      data: {
        values: [
          { factor: "Energy Equity Score", value: features[5] },
          { factor: "Energy Burden", value: features[0] },
          { factor: "Renewable Generation", value: features[1] },
          { factor: "Renewable Jobs", value: features[2] },
          { factor: "Outage", value: features[3] },
          { factor: "Health", value: features[4] }
        ]
      },
      layer: [
        {
          mark: "bar",
          encoding: {
            y: { field: "factor", type: "ordinal", sort: "null" },
            x: { field: "value", type: "quantitative" },
            //color: {field: 'factor', type: 'ordinal'},
            tooltip: { field: "value", type: "quantitative" }
          }
        }
      ]
    };
  }
  vegaEmbed(pane, ejsVlSpec);
  return "charted";
}

function energyBlock(data, pane) {
  var eB = document.getElementById(pane);

  var energy_burden = data[0];
  var renewable_generation = data[1];
  var renewable_jobs = data[2];
  var outage = data[3];
  var health = data[4];
  var ejs = data[5];

  //adjust the table headers and variables.
  eB.innerHTML =
    "<div id='info-block-header' class='txt-bold flex flex--row flex--center-cross'><svg class='icon h18 w18 pr6'><use xlink:href='#icon-position'></use></svg>Energy Equity Score</div>" +
    "<div class='tbl txt-l txt-bold'><div class='cel'>" +
    ejs.toFixed(2) +
    "</div><div class='cel'>" +
    energy_burden.toFixed(2) +
    "</div><div class='cel'>" +
    renewable_generation.toFixed(2) +
    "</div><div class='cel'>" +
    renewable_jobs.toFixed(2) +
    "</div><div class='cel'>" +
    outage.toFixed(2) +
    "</div><div class='cel'>" +
    health.toFixed(2) +
    "</div></div>" +
    "<div class='tbl'><div class='cel'>Energy Equity Score</div><div class='cel'>Energy Burden</div><div class='cel'>Renew Gen</div><div class='cel'>Renew Jobs</div><div class='cel'>SAIDI</div><div class='cel'>Health</div></div></div><br>";

  var e_header = document.getElementById("state_name");
  e_header.innerHTML = data[6];
}

function collectionChart(features, pane, xmp) {
  var featurez = xmp.queryRenderedFeatures({
    layers: [
      "data-driven-circles-solar",
      "data-driven-circles-coal",
      "data-driven-circles-nuclear",
      "data-driven-circles-wind",
      "data-driven-circles-natural-gas",
      "data-driven-circles-geothermal"
    ]
  });

  vLSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    //data: {"url": "data/movies.json"},
    data: features,
    mark: "square",
    encoding: {
      x: {
        bin: { maxbins: 10 },
        field: "total_generation"
      },
      y: {
        bin: { maxbins: 10 },
        field: "type"
      },
      size: { aggregate: "count" }
    }
  };
  vegaEmbed(pane, vLSpec);
}

function plantChart(features, pane) {
  //console.log(pane);
  //pane = '#vis';
  if (features.length) {
    features.forEach(function (feature) {
      console.log(feature.properties);
    });
    //console.log(features[0].properties.name);
    //countyName.innerText = features[0].properties.name;
    plantVlSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      title:
        features[0].properties.name +
        ", " +
        features[0].properties.state +
        " " +
        features[0].properties.type,
      description:
        features[0].properties.name +
        ", " +
        features[0].properties.state +
        " " +
        features[0].properties.type,
      width: chartWidth,
      height: chartHeight,
      data: {
        values: [
          {
            factor: "Total Generation",
            value: features[0].properties.total_generation
          }
        ]
      },
      layer: [
        {
          mark: "bar",
          encoding: {
            y: { field: "factor", type: "ordinal" },
            x: { field: "value", type: "quantitative" },
            //color: {field: 'factor', type: 'ordinal'},

            tooltip: { field: "value", type: "quantitative" }
          }
        }
      ]
    };
  }
  vegaEmbed(pane, plantVlSpec);
  return "plantCharted";
}

function incomeChart(features, pane) {
  if (features.length) {
    features.forEach(function (feature) {
      console.log(feature.properties);
    });
    console.log(features[0].properties.name);
    incomeVlSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      title: "Income and Poverty in " + features[0].properties.nme,
      description: "Income and Poverty",
      width: chartWidth / 2,
      height: chartHeight,
      //height: { 'step': 16 },
      data: {
        values: [
          { factor: "Average Income", value: features[0].properties.avin },
          { factor: "Poverty Percentage", value: features[0].properties.povn }
        ]
      },
      layer: [
        {
          mark: "bar",
          encoding: {
            y: { field: "factor", type: "ordinal", sort: "null" },
            x: { field: "value", type: "quantitative" },
            tooltip: { field: "value", type: "quantitative" }
          }
        }
      ]
    };
  }

  vegaEmbed(pane, incomeVlSpec);

  return "Income";
}

function demandChart(features, pane) {
  if (features.length) {
    features.forEach(function (feature) {
      console.log(feature.properties);
    });
    console.log(features[0].properties.name);
    //countyName.innerText = features[0].properties.normalisedTitle;
    demandVlSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      title:
        features[0].properties.normalisedTitle +
        ", " +
        features[0].properties.city +
        " " +
        features[0].properties.state,
      width: chartWidth,
      height: chartHeight,
      data: {
        values: [
          {
            factor: "Job Count",
            value: features[0].properties.JobCountLast90Days
          }
        ]
      },
      layer: [
        {
          mark: "bar",
          encoding: {
            y: { field: "factor", type: "ordinal" },
            x: { field: "value", type: "quantitative" },
            //color: {field: 'factor', type: 'ordinal'},

            tooltip: { field: "value", type: "quantitative" }
          }
        }
      ]
    };
  }
  vegaEmbed(pane, demandVlSpec);
  return "demandChart";
}

function donutChart(features, pane) {
  console.log("donut");
  if (features.length) {
    /*features.forEach(function (feature) {
      console.log(feature.properties);
    });
    */
    var sol = 0;
    var hyd = 0;
    var nuc = 0;
    var oth = 0;
    var win = 0;
    var fos = 0;

    for (var i = 0; i < features.length; i++) {
      //var coordinates = features[i].geometry.coordinates;
      //var name = features[i].properties.county;
      //var state = features[i].properties.STATE_NAME;
      //var minimum_ed = features[i].properties.minimum_ed;
      //var minimum_ex = features[i].properties.minimum_ex;
      //var predicted_salary = features[i].properties.predicted_salary;
      //var occupation = features[i].properties.occupation;
      //var certs = features[i].properties.certificat;
      var industry = features[i].properties.specializ3;
      /*
      if(industry == "Other Electric Power Generation") {
        oth = oth + 1;
      }
      if(industry == "Solar Electric Power Generation") {
        sol = sol + 1;
      }
      */
      switch (industry) {
        case "Other Electric Power Generation":
          oth = oth + 1;
          break;
        case "Solar Electric Power Generation":
          sol = sol + 1;
          break;
        case "Fossil Fuel Electric Power Generation":
          fos = fos + 1;
          break;
        case "Hydroelectric Power Generation":
          hyd = hyd + 1;
          break;
        case "Nuclear Electric Power Generation":
          nuc = nuc + 1;
          break;
        case "Wind Electric Power Generation":
          win = win + 1;
          break;
        default:
          console.log(`Unfound`);
      }
    }
    /*
    const values = [];

    if(sol > 0) {
      values.push({"category": "Solar", "value": sol})
    }
    if(oth > 0) {
      values.push({"category": "Other", "value": oth})
    }
    if(fos > 0) {
      values.push({"category": "Fossil", "value": fos})
    }
    if(hyd > 0) {
      values.push({"category": "Hydro", "value": hyd})
    }
    if(nuc > 0) {
      values.push({"category": "Nuclear", "value": nuc})
    }
    if(win > 0) {
      values.push({"category": "Wind", "value": win})
    }
*/

    donutSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description: "A simple donut chart with embedded data.",
      data: {
        //values
        values: [
          { category: "Solar", value: sol },
          { category: "Wind", value: win },
          { category: "Nuclear", value: nuc },
          { category: "Fossil", value: fos },
          { category: "Other", value: oth },
          { category: "Hydro", value: hyd }
        ]
      },
      mark: { type: "arc", innerRadius: 60 },
      encoding: {
        theta: { field: "value", type: "quantitative" },
        color: { field: "category", type: "nominal" }
      }
    };
  }
  vegaEmbed(pane, donutSpec);
  return "donutChart";
}

function donut2Chart(features, pane) {
  console.log("donut2");
  if (features.length) {
    /*features.forEach(function (feature) {
      console.log(feature.properties);
    });
    */
    var sol = 0;
    var hyd = 0;
    var nuc = 0;
    var oth = 0;
    var win = 0;
    var fos = 0;

    for (var i = 0; i < features.length; i++) {
      var industry = features[i].properties.specializ3;

      switch (industry) {
        case "Other Electric Power Generation":
          oth = oth + 1;
          break;
        case "Solar Electric Power Generation":
          sol = sol + 1;
          break;
        case "Fossil Fuel Electric Power Generation":
          fos = fos + 1;
          break;
        case "Hydroelectric Power Generation":
          hyd = hyd + 1;
          break;
        case "Nuclear Electric Power Generation":
          nuc = nuc + 1;
          break;
        case "Wind Electric Power Generation":
          win = win + 1;
          break;
        default:
          console.log(`Unfound`);
      }
    }

    donutSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description: "A simple donut chart with embedded data.",
      data: {
        //values
        values: [
          { category: "Solar", value: sol },
          { category: "Wind", value: win },
          { category: "Nuclear", value: nuc },
          { category: "Fossil", value: fos },
          { category: "Other", value: oth },
          { category: "Hydro", value: hyd }
        ]
      },
      transform: [
        {
          window: [
            {
              op: "sum",
              field: "value",
              as: "totalValue"
            }
          ],
          frame: [null, null]
        },
        {
          calculate: "datum.value/datum.totalValue * 100",
          as: "PercentOfTotal"
        }
      ],
      mark: { type: "arc", innerRadius: 60 },
      params: [
        {
          name: "category",
          select: { type: "point", fields: ["category"] },
          bind: "legend"
        }
      ],
      encoding: {
        theta: { field: "value", type: "quantitative" },
        color: { field: "category", type: "nominal" },
        opacity: {
          condition: { param: "category", value: 1 },
          value: 0.2
        }
      }
    };
  }
  vegaEmbed(pane, donutSpec);
  return "donut2Chart";
}

// OCCUPATIONS
/*          [
            {"category": "job1", "salary": 34657},
            {"category": "job2", "salary": 3463},
            {"category": "job3", "salary": 231253},
            {"category": "job4", "salary": 6463},
            {"category": "job5", "salary": 4464},
            {"category": "job6", "salary": 6464}
          ]
*/

function industryPoints(features, pane) {
  var array = [];
  for (var i = 0; i < features.length; i++) {
    array.push({ Industry: features[i].properties.specializ3 });
  }

  chartSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: {
      values: array
    },
    layer: [
      {
        mark: "point",
        encoding: {
          y: { field: "Industry", type: "ordinal" }
        }
      }
    ]
  };

  vegaEmbed(pane, chartSpec);
}

function jobPoints(features, pane) {
  var array = [];
  for (var i = 0; i < features.length; i++) {
    array.push({ Job: features[i].properties.occupation });
  }

  chartSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: {
      values: array
    },
    layer: [
      {
        mark: "point",
        encoding: {
          y: { field: "Job", type: "ordinal" }
        }
      }
    ]
  };

  vegaEmbed(pane, chartSpec);
}

function salaryTicks(features, pane) {
  var array = [];
  for (var i = 0; i < features.length; i++) {
    array.push({
      category: i,
      Salary: features[i].properties.predicted_salary
    });
  }

  chartSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: {
      values: array
    },
    mark: "tick",
    encoding: {
      x: { field: "Salary", type: "quantitative" }
    }
  };
  vegaEmbed(pane, chartSpec);
}

function expTicks(features, pane) {
  var array = [];
  for (var i = 0; i < features.length; i++) {
    if (features[i].properties.minimum_ex == "0 to 2 Years") {
      array.push({ job: i, experience: 0 });
      array.push({ job: i, experience: 2 });
    }
    if (features[i].properties.minimum_ex == "3 to 5 Years") {
      array.push({ job: i, experience: 3 });
      array.push({ job: i, experience: 5 });
    }
  }
  /*
    [
      {"job": 0, "experience": 0},
      {"job": 0, "experience": 3},
      {"job": 1, "experience": 2},
      {"job": 1, "experience": 3},
      {"job": 2, "experience": 2},
      {"job": 2, "experience": 5},
      {"job": 3, "experience": 3},
      {"job": 3, "experience": 5},
      {"job": 4, "experience": 3},
      {"job": 4, "experience": 5}
    ]
*/
  chartSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description:
      "A ranged dot plot that uses 'layer' to convey changing life expectancy for the five most populous countries (between 1955 and 2000).",
    data: {
      values: array
    },
    encoding: {
      x: {
        field: "experience",
        type: "quantitative",
        title: "Experience"
      },
      y: {
        field: "job",
        type: "nominal",
        title: "Job",
        axis: {
          offset: 1,
          ticks: false,
          minExtent: 0,
          domain: false
        }
      }
    },
    layer: [
      {
        mark: "line",
        encoding: {
          detail: {
            field: "job",
            type: "nominal"
          },
          color: { value: "#db646f" }
        }
      },
      {
        mark: {
          type: "point",
          filled: true
        },
        encoding: {
          color: {
            field: "experience",
            type: "ordinal",
            scale: {
              domain: [0, 2, 3, 5],
              range: ["#feebe2", "#fa9fb5", "#c51b8a", "#7a0177"]
              //"range": ["#feebe2", "#fcc5c0","#fa9fb5","#f768a1","#c51b8a","#7a0177"]
            },
            title: "Yrs"
          },
          size: { value: 50 },
          opacity: { value: 1 }
        }
      }
    ]
  };

  vegaEmbed(pane, chartSpec);
}

function jobDetails(features, pane) {
  pane.innerHTML = "";
  console.log("jobdetails");
  for (var i = 0; i < features.length; i++) {
    var name = features[i].properties.county;
    var state = features[i].properties.STATE_NAME;
    var minimum_ed = features[i].properties.minimum_ed;
    var minimum_ex = features[i].properties.minimum_ex;
    var predicted_salary = features[i].properties.predicted_salary;
    var occupation = features[i].properties.occupation;
    var industry = features[i].properties.specializ3;
    var certs = features[i].properties.certificat;

    if (i == 0) {
      pane.innerHTML +=
        "<div class='relative bg-white py12'>" +
        "<span class='txt-m txt-bold'>" +
        name +
        ", " +
        state +
        "</span>";
    }

    pane.innerHTML +=
      "<span class='txt-s pr12'>Industry</span>" +
      "<span class='txt-s txt-bold pr2 '>" +
      industry +
      "</span><br>" +
      "<span class='txt-s pr12'>Occupation</span>" +
      "<span class='txt-s txt-bold pr2 '>" +
      occupation +
      "</span><br>" +
      "<span class='txt-s pr12'>Minimum Ex</span>" +
      "<span class='txt-s txt-bold pr2 '>" +
      minimum_ex +
      "</span><br>" +
      "<span class='txt-s pr12'>Minimum Ed</span>" +
      "<span class='txt-s txt-bold pr2 '>" +
      minimum_ed +
      "</span><br>";

    pane.innerHTML +=
      "<span class='txt-s pr12'>Certifications</span>" +
      "<span class='txt-s txt-bold pr2 '>" +
      certs +
      "</span><br>";

    pane.innerHTML +=
      "<span class='txt-s pr12'>Predicted Salary</span>" +
      "<span class='txt-s txt-bold pr2 '>$" +
      predicted_salary +
      "</span>";

    if (i < features.length - 1) {
      pane.innerHTML += "<hr>";
    }
  }
}

function jobsList(features, pane) {
  console.log("jobsList");
  if (features.length) {
    /*features.forEach(function (feature) {
      console.log(feature.properties);
    });
    */

    var jobs = [];

    for (var i = 0; i < features.length; i++) {
      var industry = features[i].properties.specializ3;
      jobs.push({ category: "occupation", value: industry });
      console.log(jobs[i]);
    }

    donutSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description: "A job list with embedded data.",
      data: {
        values: jobs
      },
      transform: [
        {
          window: [
            {
              op: "sum",
              field: "value",
              as: "totalValue"
            }
          ],
          frame: [null, null]
        },
        {
          calculate: "datum.value/datum.totalValue * 100",
          as: "PercentOfTotal"
        }
      ],
      vconcat: [
        {
          encoding: {
            y: {
              field: "category",
              type: "nominal",
              axis: null
            }
          },
          layer: [
            {
              mark: { type: "bar", color: "#ddd" },
              encoding: {
                x: {
                  aggregate: "mean",
                  //"field": "PercentOfTotal",
                  scale: { domain: [0, features.length] },
                  field: "value",
                  //"title":"Count",
                  title: "Jobs"
                }
              }
            },
            {
              mark: {
                type: "text",
                align: "left",
                x: 5,
                y: 5
              },
              encoding: {
                text: { field: "value" },
                detail: { aggregate: "count" }
              }
            }
          ]
        }
      ]
    };
  }
  vegaEmbed(pane, donutSpec);
  return "jobsList";
}

//var minimum_ed = features[i].properties.minimum_ed;
//var minimum_ex = features[i].properties.minimum_ex;
//var predicted_salary = features[i].properties.predicted_salary;
//var occupation = features[i].properties.occupation;
//var certs = features[i].properties.certificat;

function donutBarChart(features, pane) {
  console.log("donut2");
  if (features.length) {
    /*features.forEach(function (feature) {
      console.log(feature.properties);
    });
    */
    var sol = 0;
    var hyd = 0;
    var nuc = 0;
    var oth = 0;
    var win = 0;
    var fos = 0;

    for (var i = 0; i < features.length; i++) {
      var industry = features[i].properties.specializ3;

      switch (industry) {
        case "Other Electric Power Generation":
          oth = oth + 1;
          break;
        case "Solar Electric Power Generation":
          sol = sol + 1;
          break;
        case "Fossil Fuel Electric Power Generation":
          fos = fos + 1;
          break;
        case "Hydroelectric Power Generation":
          hyd = hyd + 1;
          break;
        case "Nuclear Electric Power Generation":
          nuc = nuc + 1;
          break;
        case "Wind Electric Power Generation":
          win = win + 1;
          break;
        default:
          console.log(`Unfound`);
      }
    }

    donutSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description: "A simple donut chart with embedded data.",
      data: {
        //values
        values: [
          { category: "Solar", value: sol },
          { category: "Wind", value: win },
          { category: "Nuclear", value: nuc },
          { category: "Fossil", value: fos },
          { category: "Other", value: oth },
          { category: "Hydro", value: hyd }
        ]
      },
      transform: [
        {
          window: [
            {
              op: "sum",
              field: "value",
              as: "totalValue"
            }
          ],
          frame: [null, null]
        },
        {
          calculate: "datum.value/datum.totalValue * 100",
          as: "PercentOfTotal"
        }
      ],
      vconcat: [
        {
          mark: { type: "arc", innerRadius: 50 },
          params: [
            {
              name: "category",
              select: { type: "point", fields: ["category"] },
              bind: "legend"
            }
          ],
          encoding: {
            theta: { field: "value", type: "quantitative" },
            color: { field: "category", type: "nominal" },

            opacity: {
              condition: { param: "category", value: 1 },
              value: 0.2
            }
          }
        },
        {
          encoding: {
            y: {
              field: "category",
              type: "nominal",
              axis: null
            }
          },
          layer: [
            {
              mark: { type: "bar", color: "#ddd" },
              encoding: {
                x: {
                  aggregate: "mean",
                  //"field": "PercentOfTotal",
                  scale: { domain: [0, features.length] },
                  field: "value",
                  //"title":"Count",
                  title: "Jobs"
                }
              }
            },
            {
              mark: { type: "text", align: "left", x: 5 },
              encoding: {
                text: { field: "category" },
                detail: { aggregate: "count" }
              }
            }
          ]
        }
      ]
    };
  }
  vegaEmbed(pane, donutSpec);
  return "donutBarChart";
}

function toggleItem(pane) {
  console.log("toggleItem");
  var x = document.getElementById(pane);
  if (x.style.visibility === "hidden") {
    x.style.visibility = "visible";
  } else {
    x.style.visibility = "hidden";
  }
}

function plantBlock(features, pane) {
  var iB = document.getElementById(pane);

  if (features.length) {
    var plantClass = features[0].properties.class;
    var county = features[0].properties.county;
    var name = features[0].properties.name;
    var state = features[0].properties.state;
    var total = features[0].properties.total_generation;
    var net = features[0].properties.net_generation;
    var type = features[0].properties.type;

    if (net) {
      net = net.toFixed(2);
    }
  }

  iB.innerHTML =
    "<div id='plant-block-header' class='txt-bold flex flex--row flex--center-cross'><svg class='icon h18 w18 pr6'><use xlink:href='#icon-industry'></use></svg>Energy Facility</div>" +
    "<div class='relative bg-white px12 py12'>" +
    "<span class='txt-m pr12 txt-bold'>" +
    name +
    "<br>" +
    county +
    ", " +
    state +
    "</span><br>" +
    "<span class='txt-s pr12'>Plant Class</span>" +
    "<span class='txt-s txt-bold absolute right pr10'>" +
    plantClass +
    "</span><br>" +
    "<span class='txt-s pr12'>Type</span>" +
    "<span class='txt-s txt-bold absolute right pr10'>" +
    type +
    "</span><br>" +
    "<span class='txt-s pr12'>Total Generation</span>" +
    "<span class='txt-s txt-bold absolute right pr10'>" +
    total +
    "</span><br>" +
    "<span class='txt-s pr12'>Net Generation</span>" +
    "<span class='txt-s txt-bold absolute right pr10'>" +
    net +
    "</span><br>";
}

function econChart(data) {
  if (data.length) {
    data.forEach(function (feature) {
      console.log(feature.properties);
    });

    yourVlSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      title: "Economic Model Results in " + stateAbbr,
      description: "Economic Model",
      width: 200,
      //height: { 'step': 16 },
      data: {
        values: [
          { factor: "CIM jobs", value: data[0] },
          { factor: "OM jobs", value: data[1] },
          { factor: "CIM val add", value: data[2] },
          { factor: "OM val add", value: data[3] },
          { factor: "Local CIM jobs", value: data[4] },
          { factor: "Local OM jobs", value: data[5] },
          { factor: "Local CIM val add", value: data[6] },
          { factor: "Local OM val add", value: data[7] }
        ]
      },
      layer: [
        {
          mark: "bar",
          encoding: {
            y: { field: "factor", type: "ordinal" },
            x: { field: "value", type: "quantitative" },
            tooltip: { field: "value", type: "quantitative" }
          }
        }
      ]
    };
  }
  vegaEmbed("#vis2", yourVlSpec);
  return "EconChart drawn";
}

function econBlock(data, pane) {
  var eB = document.getElementById(pane);

  var CIM_jobs = data[0];
  var OM_jobs = data[1];
  var CIM_val_add = data[2];
  var OM_val_add = data[3];
  var Local_CIM_jobs = data[4];
  var Local_OM_jobs = data[5];
  var Local_CIM_val_add = data[6];
  var Local_OM_val_add = data[7];

  /*
  Project = {'type' : 'wind',                   # Resource
             'average_overhead_rate' : 0.456,   # Additional employer costs per employee (overhead, benefits, etc.) with respect to salary
             'Local CIM Direct %' : 1,          # What % of onsite constr./install. labor can be supplied by the state/locality?
             'Local CIM Supplier %' : 1,        # What % of and materials/fuel/manufacturing will be sourced to the state/locality?
             'Local O&M Direct %' : 1,          # What % of onsite oper./maint. labor can be supplied by the state/locality?
             'Local O&M Supplier %' : 1,        # What % of and materials/fuel/manufacturing will be sourced to the state/locality?
             'capex' : 345.5,                   # One-time investment cost ($M) to construct the facility
             'opex' : 1.3,                       # Annual cost ($M) to operate the facility
             'state' : 'TX'}                    # State abbreviation (for state-specific sector-level mean salaries)
  */

  eB.innerHTML =
    "<div id='info-block-header' class='txt-bold flex flex--row flex--center-cross'><svg class='icon h18 w18 pr6'><use xlink:href='#icon-position'></use></svg>Economic Impact</div>" +
    "<div class='relative bg-white px12 py12'>" +
    "<span class='txt-m pr12 txt-bold'>" +
    " " +
    stateAbbr +
    "</span><br>" +
    "<table>" +
    "<tr><th>Construction</th><th></th><th class='px24'>Operations</th></tr>" +
    "<tr><td class='txt-bold'>Total</td></tr>" +
    "<tr class='txt-l txt-bold'><td>" +
    CIM_jobs.toFixed(0) +
    " </td><td> $" +
    CIM_val_add.toFixed(0) +
    "M</td><td class='px24'>" +
    OM_jobs.toFixed(0) +
    "</td><td>$" +
    OM_val_add.toFixed(0) +
    "M</td></tr>" +
    "<tr><td>Jobs</td><td>Value Add</td><td class='px24'>Jobs</td><td>Value Add</td></tr>" +
    "<tr><td class='txt-bold'>Local</td></tr>" +
    "<tr class='txt-l txt-bold'><td>" +
    Local_CIM_jobs.toFixed(0) +
    " </td><td> $" +
    Local_CIM_val_add.toFixed(0) +
    "M</td><td class='px24'>" +
    Local_OM_jobs.toFixed(0) +
    "</td><td> $" +
    Local_OM_val_add.toFixed(0) +
    "M</td></tr>" +
    "<tr><td>Jobs</td><td>Value Add</td><td class='px24'>Jobs</td><td>Value Add</td></tr>" +
    "</table>";
}

function hardLeft() {
  comparisonMap.setSlider(0);
}

function hardRight() {
  comparisonMap.setSlider(window.innerWidth);
}

function hardCenter() {
  comparisonMap.setSlider(window.innerWidth / 2);
}

let dollarUS = Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
  //maximumSignificantDigits: 0,
});

function situationBlock(features, pane) {
  var iB = document.getElementById(pane);
  if (features.length) {
    var coordinates = features[0].geometry.coordinates;

    var ejs = features[0].properties.ejs;
    var population = features[0].properties.pe2;

    var energyBurden = features[0].properties.aaeb;
    var n_energyBurden = features[0].properties.aaebn;

    var renewableGen = features[0].properties.rgp;
    var n_renewableGen = features[0].properties.rgpn;

    var renewableJobs = features[0].properties.rjp;
    var n_renewableJobs = features[0].properties.rjpn;

    var outage = features[0].properties.saidi;
    var n_outage = features[0].properties.saidin;

    var health = features[0].properties.hf;

    //var averageIncome = features[0].properties.avi;
    var averageIncome = dollarUS.format(features[0].properties.avi);
    //var n_averageIncome = features[0].properties.avin;

    var energyCost = features[0].properties.aec;
    //var n_energyCost = features[0].properties.aecn;

    var energyPrice = features[0].properties.epr;
    //var n_energyPrice = features[0].properties.eprn;

    var poverty = features[0].properties.pov;
    //var n_poverty = features[0].properties.povn;

    var name = features[0].properties.nme;
    var state = features[0].properties.sta;

    iB.innerHTML =
      "<div id='situation-block-header' class='txt-bold flex flex--row flex--center-cross'><svg class='icon h18 w18 pr6'><use xlink:href='#icon-position'></use></svg>Situation</div>" +
      "<div class='relative bg-white px12 py12'>" +
      "<span class='txt-m pr12 txt-bold'>" +
      name +
      " " +
      state +
      "</span><br>" +
      "<span class='txt-m pr12 txt-bold'>Situational Awareness</span><br>" +
      "<span class='txt-s pr12'>Average Annual Income</span>" +
      "<span class='txt-s txt-bold absolute right'>" +
      averageIncome.toLocaleString("en-US") +
      "</span><br>" +
      "<span class='txt-s pr12'>Average Annual Energy Cost</span>" +
      "<span class='txt-s txt-bold absolute right'>$" +
      energyCost.toLocaleString("en-US") +
      "</span><br>" +
      "<span class='txt-s pr12'>Energy Price (per KilowattHour)</span>" +
      "<span class='txt-s txt-bold absolute right'>&#162;" +
      energyPrice +
      "</span><br>" +
      "<span class='txt-s pr12'>Percentage of People in Poverty</span>" +
      "<span class='txt-s txt-bold absolute right'>" +
      poverty.toFixed(1) +
      "%</span>";
  }
}

/*
function jobDemandBlock(features, pane) {
  var iB = document.getElementById(pane);
  var count = "";
  var name = "";
  var city = "";
  var state = "";

  if (features != null) {
    count = features[0].properties.JobCountLast90Days;
    name = features[0].properties.normalisedTitle;
    city = features[0].properties.city;
    state = features[0].properties.state;
  }

  if (name != "") {
    iB.innerHTML =
      "<div id='demand-block-header' class='txt-bold flex flex--row '><svg class='icon h18 w18'><use xlink:href='#icon-walk'></use></svg><span class='txt-bold pr12'>Job Demand</span></div>" +
      "<div class='relative bg-white px12 py12'>" +
      "<span class='txt-m pr12 txt-bold'>" + name.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()) + "<br>" + city + ", " + state + "</span><br>" +
      "<span class='txt-s pr12'>Job count</span>" +
      "<span class='txt-s txt-bold absolute right pr10'>" + count + "</span><br>"
  }
  else {
    iB.innerHTML =
      "<div id='demand-block-header' class='txt-bold flex flex--row '><svg class='icon h18 w18'><use xlink:href='#icon-walk'></use></svg><span class='txt-bold pr12'>Job Demand</span></div>" +
      "<div class='relative bg-white px12 py12'>" +
      "<span class='txt-s pr12'>Hover over circles for more data.</span>"
  }

}
*/

function addHover(feature, theMap) {
  var coordinates = feature[0].geometry.coordinates;
  var plantClass = feature[0].properties.class;
  var name = feature[0].properties.name;
  var total = feature[0].properties.total_generation;

  console.log(coordinates);
  console.log(plantClass);
  console.log(name);
  console.log(total);

  popup
    .setLngLat(coordinates)
    .setHTML(
      "<h2><b>" +
        name +
        "</b><br>" +
        plantClass +
        "</h2><hr><b>Total generation: " +
        total +
        "</b>"
    )
    .addTo(theMap);
}

function popIt(features) {
  if (features.length) {
    features.forEach(function (feature) {
      console.log(feature.properties);
    });
  }
}

function normalize(string) {
  return string.trim().toLowerCase();
}

function getUniqueFeatures(array, comparatorProperty) {
  var existingFeatureKeys = {};
  // Because features come from tiled vector data, feature geometries may be split
  // or duplicated across tile boundaries and, as a result, features may appear
  // multiple times in query results.
  var uniqueFeatures = array.filter(function (el) {
    if (existingFeatureKeys[el.properties[comparatorProperty]]) {
      return false;
    } else {
      existingFeatureKeys[el.properties[comparatorProperty]] = true;
      return true;
    }
  });

  return uniqueFeatures;
}
