// custom graph component
// https://www.abeautifulsite.net/parsing-urls-in-javascript
const us_state_abbrev = {
    'Alabama': 'AL',
    'Alaska': 'AK',
    'Arizona': 'AZ',
    'Arkansas': 'AR',
    'California': 'CA',
    'Colorado': 'CO',
    'Connecticut': 'CT',
    'Delaware': 'DE',
    'District Of Columbia': 'DC',
    'Florida': 'FL',
    'Georgia': 'GA',
    'Hawaii': 'HI',
    'Idaho': 'ID',
    'Illinois': 'IL',
    'Indiana': 'IN',
    'Iowa': 'IA',
    'Kansas': 'KS',
    'Kentucky': 'KY',
    'Louisiana': 'LA',
    'Maine': 'ME',
    'Maryland': 'MD',
    'Massachusetts': 'MA',
    'Michigan': 'MI',
    'Minnesota': 'MN',
    'Mississippi': 'MS',
    'Missouri': 'MO',
    'Montana': 'MT',
    'Nebraska': 'NE',
    'Nevada': 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    'Northern Mariana Islands': 'MP',
    'Ohio': 'OH',
    'Oklahoma': 'OK',
    'Oregon': 'OR',
    'Palau': 'PW',
    'Pennsylvania': 'PA',
    'Puerto Rico': 'PR',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    'Tennessee': 'TN',
    'Texas': 'TX',
    'Utah': 'UT',
    'Vermont': 'VT',
    'Virgin Islands': 'VI',
    'Virginia': 'VA',
    'Washington': 'WA',
    'West Virginia': 'WV',
    'Wisconsin': 'WI',
    'Wyoming': 'WY',
    "Guam": "GU"
};
const abbrev_us_state = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "DC": "District Of Columbia",
    "FL": "Florida",
    "GA": "Georgia",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "MP": "Northern Mariana Islands",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PW": "Palau",
    "PA": "Pennsylvania",
    "PR": "Puerto Rico",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VI": "Virgin Islands",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming",
    "GU": "Guam"
};

function parseURL() {
    const url = window.location;
    let parser = document.createElement('a'),
        searchObject = {},
        queries, split, i;
    // Let the browser do the work
    parser.href = url;
    // Convert query string to object
    queries = parser.search.replace(/^\?/, '').split('&');
    for (i = 0; i < queries.length; i++) {
        split = queries[i].split('=');
        searchObject[split[0]] = split[1];
    }
    return {
        protocol: parser.protocol,
        host: parser.host,
        hostname: parser.hostname,
        port: parser.port,
        pathname: parser.pathname,
        search: parser.search,
        searchObject: searchObject,
        hash: parser.hash
    };
}

searchObject = parseURL()['searchObject'];

if (!searchObject.hasOwnProperty('mode')) {
    searchObject['mode'] = 'states';
}
if (searchObject.hasOwnProperty('province')) {
    searchObject['state'] = searchObject['province'];
}
if (!searchObject.hasOwnProperty('state')) {
    searchObject['state'] = 'GA';
}
let stateParam = searchObject['state'].replace('%20', ' ');
if (us_state_abbrev.hasOwnProperty(stateParam)) {
    stateParam = us_state_abbrev[stateParam];
}
searchObject['state'] = stateParam;
if (!abbrev_us_state.hasOwnProperty(searchObject['state'])) {
    searchObject['mode'] = 'states';
    searchObject['state'] = 'GA';
}
if (searchObject['mode'].toLowerCase() === 'global' || searchObject['mode'].toLowerCase() === 'world' || searchObject['mode'].toLowerCase() === 'worldwide') {
    searchObject['mode'] = 'countries';
}
if (searchObject['mode'].toLowerCase() === 'us' || searchObject['mode'] === 'united states' || searchObject['mode'] === 'u.s.') {
    searchObject['mode'] = 'states';
}
if (!searchObject.hasOwnProperty('minCases')) {
    if (searchObject['mode'] === 'states')
        searchObject['minCases'] = 25;
    if (searchObject['mode'] === 'countries')
        searchObject['minCases'] = 50;
    if (searchObject['mode'] === 'counties')
        searchObject['minCases'] = 5;
}
console.log(searchObject);


Vue.component('graph', {

    props: ['data', 'dates', 'day', 'selectedData', 'scale', 'resize', 'viewMode', 'selectedSubArea'],

    template: '<div ref="graph" id="graph" style="height: 100%;"></div>',

    methods: {
        makeGraph() {
            this.autosetRange = true;
            this.updateTraces();
            this.updateLayout();

            Plotly.newPlot(this.$refs.graph, this.traces, this.layout, this.config).then(e => {
                if (!this.graphMounted) {
                    this.$emit('graph-mounted');
                    this.graphMounted = true;
                }
            });

            this.$refs.graph.on('plotly_hover', this.onHoverOn)
                .on('plotly_unhover', this.onHoverOff)
                .on('plotly_relayout', this.onLayoutChange);

            this.updateAnimation();
        },

        onLayoutChange(data) {

            //console.log('layout change detected');

            if (data['xaxis.autorange'] && data['yaxis.autorange']) { // by default, override plotly autorange
                data['xaxis.autorange'] = false;
                data['yaxis.autorange'] = false;
                this.autosetRange = true;
                this.updateLayout();
                this.updateAnimation();
            } else if (data['xaxis.range[0]']) { // if range set manually
                this.autosetRange = false; // then use the manual range
                this.xrange = [data['xaxis.range[0]'], data['xaxis.range[1]']].map(e => parseFloat(e));
                this.yrange = [data['yaxis.range[0]'], data['yaxis.range[1]']].map(e => parseFloat(e));
            }

        },

        onHoverOn(data) {

            let curveNumber = data.points[0].curveNumber;
            let name = this.traces[curveNumber].name;
            this.traceIndices = this.traces.map((e, i) => e.name === name ? i : -1).filter(e => e >= 0);

            let update = {'line': {color: 'rgb(230,74,25)'}};

            for (let i of this.traceIndices) {
                Plotly.restyle(this.$refs.graph, update, [i]);
            }

        },

        onHoverOff(data) {

            let update = {'line': {color: 'rgba(0,0,0,0.15)'}};

            for (let i of this.traceIndices) {
                Plotly.restyle(this.$refs.graph, update, [i]);
            }

        },

        updateTraces() {

            let showDailyMarkers = this.data.length <= 2;

            let traces1 = this.data.map((e, i) => ({
                    x: e.cases,
                    y: e.slope,
                    name: e.area,
                    text: this.dates.map(f => e.area + '<br>' + f),
                    mode: showDailyMarkers ? 'lines+markers' : 'lines',
                    type: 'scatter',
                    legendgroup: i,
                    marker: {
                        size: 6,
                        color: 'rgba(0,0,0,0.15)'
                    },
                    line: {
                        color: 'rgba(0,0,0,0.15)'
                    },
                    hoverinfo: 'x+y+text',
                    hovertemplate: '%{text}<br>Total ' + this.selectedData + ': %{x:,}' +
                        '<br>Weekly ' + this.selectedData + ': %{y:,}' +
                        '<extra></extra>',
                })
            );

            let traces2 = this.data.map((e, i) => ({
                    x: [e.cases[e.cases.length - 1]],
                    y: [e.slope[e.slope.length - 1]],
                    text: e.area,
                    name: e.area,
                    mode: 'markers+text',
                    legendgroup: i,
                    textposition: 'top left',
                    marker: {
                        size: 8,
                        color: 'rgb(230,74,25)'
                    },
                    hovertemplate: '%{data.text}<br>Total ' + this.selectedData + ': %{x:,}' +
                        '<br>Weekly ' + this.selectedData + ': %{y:,}' +
                        '<br>' +
                        '<extra></extra>',

                })
            );

            this.traces = [...traces1, ...traces2];
            this.traceCount = new Array(this.traces.length).fill(0).map((e, i) => i);

            this.filteredCases = Array.prototype.concat(...this.data.map(e => e.cases)).filter(e => !isNaN(e));
            this.filteredSlope = Array.prototype.concat(...this.data.map(e => e.slope)).filter(e => !isNaN(e));

        },

        updateLayout() {

            //console.log('layout updated');

            if (this.autosetRange) {
                this.setxrange();
                this.setyrange();
                this.autosetRange = false;
            }

            this.layout = {
                title: 'Trajectory of ' + this.selectedData + ' (' + this.dates[this.day - 1] + ')',
                showlegend: false,
                xaxis: {
                    title: 'Total ' + this.selectedData,
                    type: this.scale === 'Logarithmic Scale' ? 'log' : 'linear',
                    range: this.xrange,
                    titlefont: {
                        size: 24,
                        color: 'rgb(230,74,25)'
                    },
                },
                yaxis: {
                    title: 'New ' + this.selectedData + ' (in the Past Week)',
                    type: this.scale === 'Logarithmic Scale' ? 'log' : 'linear',
                    range: this.yrange,
                    titlefont: {
                        size: 24,
                        color: 'rgb(230,74,25)'
                    },
                },
                hovermode: 'closest',
                font: {
                    family: 'Open Sans',
                    color: "black",
                    size: 14
                },
            };

        },


        updateAnimation() {

            let traces1 = this.data.map(e => ({
                x: e.cases.slice(0, this.day),
                y: e.slope.slice(0, this.day)
            }));

            let traces2 = this.data.map(e => ({
                x: [e.cases[this.day - 1]],
                y: [e.slope[this.day - 1]]
            }));

            Plotly.animate(this.$refs.graph, {
                data: [...traces1, ...traces2],
                traces: this.traceCount,
                layout: this.layout
            }, {
                transition: {
                    duration: 0
                },
                frame: {
                    // must be >= transition duration
                    duration: 0,
                    redraw: true
                }
            });

        },

        setxrange() {
            let xmax = Math.max(...this.filteredCases, 50);

            if (this.scale === 'Logarithmic Scale') {
                this.xrange = [1, Math.ceil(Math.log10(1.5 * xmax))]
            } else {
                this.xrange = [-0.49 * Math.pow(10, Math.floor(Math.log10(xmax))), Math.round(1.05 * xmax)];
            }

        },

        setyrange() {
            let ymax = Math.max(...this.filteredSlope, 50);

            if (this.scale === 'Logarithmic Scale') {
                this.yrange = [1, Math.ceil(Math.log10(1.5 * ymax))]
            } else {
                this.yrange = [-Math.pow(10, Math.floor(Math.log10(ymax)) - 2), Math.round(1.05 * ymax)];
            }

        },

    },

    mounted() {
        this.makeGraph();
    },

    watch: {

        resize() {
            //console.log('resize detected');
            Plotly.Plots.resize(this.$refs.graph);
        },

        scale() {
            //console.log('scale change detected', this.scale);
            this.makeGraph();
        },

        day(newDay, oldDay) {
            //console.log('day change detected', oldDay, newDay);
            this.updateLayout();
            this.updateAnimation();
        },

        selectedData() {
            //console.log('selected data change detected');
            this.$emit('update:day', this.dates.length);
        },

        data() {
            //console.log('data change detected');
            this.makeGraph();
        },
        viewMode() {
            this.makeGraph()
        }


    },

    computed: {},

    data() {
        return {
            filteredCases: [],
            filteredSlope: [],
            traces: [],
            layout: {},
            traceCount: [],
            traceIndices: [],
            xrange: [],
            yrange: [],
            autosetRange: true,
            graphMounted: false,
            config: {
                responsive: true,
                toImageButtonOptions: {
                    format: 'png', // one of png, svg, jpeg, webp
                    filename: 'Covid Trends',
                    height: 800,
                    width: 1200,
                    scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
                }
            },
        }
    }

});

// global data
let app = new Vue({

    el: '#root',

    mounted() {
        this.pullData(this.selectedData);
    },

    created: function () {

        let url = window.location.href.split('?');

        if (url.length > 1) {

            let urlParameters = new URLSearchParams(url[1]);

            if (urlParameters.has('scale')) {

                let myScale = urlParameters.get('scale').toLowerCase();

                if (myScale === 'log') {
                    this.selectedScale = 'Logarithmic Scale';
                } else if (myScale === 'linear') {
                    this.selectedScale = 'Linear Scale';
                }
            }

            if (urlParameters.has('data')) {
                let myData = urlParameters.get('data').toLowerCase();
                if (myData === 'cases') {
                    this.selectedData = 'Confirmed Cases';
                } else if (myData === 'deaths') {
                    this.selectedData = 'Reported Deaths';
                }

            }

            if (urlParameters.has('area')) {
                this.selectedAreas = urlParameters.getAll('area');
            }

        }

        window.addEventListener('keydown', e => {

            if ((e.key === ' ') && this.dates.length > 0) {
                this.play();
            } else if ((e.key === '-' || e.key === '_') && this.dates.length > 0) {
                this.paused = true;
                this.day = Math.max(this.day - 1, 8);
            } else if ((e.key === '+' || e.key === '=') && this.dates.length > 0) {
                this.paused = true;
                this.day = Math.min(this.day + 1, this.dates.length)
            }

        });
    },


    watch: {
        selectedData() {
            this.pullData(this.selectedData);
        },

        graphMounted() {
            //console.log('minDay', this.minDay);
            //console.log('autoPlay', this.autoplay);
            //console.log('graphMounted', this.graphMounted);

            if (this.graphMounted && this.autoplay && this.minDay > 0) {
                //console.log('autoplaying');
                this.day = this.minDay;
                this.play();
                this.autoplay = false; // disable autoplay on first play
            }
        }
    },

    methods: {
        showState(state) {
            console.log(state);
            let selectedState = state;
            if (us_state_abbrev.hasOwnProperty(state)) {
                selectedState = us_state_abbrev[state];
            }
            this.selectedSubArea = selectedState;
            this.viewMode = 'counties';
            this.mainName = state;
            this.areaName = "Counties";
            this.usView = false;
            this.globalView = false;
            this.lookupKey = "County Name";
            this.selectedAreas = [];
            this.covidData = [];
            this.dataSourceMainUrl = 'https://usafacts.org/visualizations/coronavirus-covid-19-spread-map/';
            this.dataSourceName = 'USAFacts';
            this.pullData(this.selectedData);
        },

        showGlobal() {
            this.selectedSubArea = "GA";
            this.viewMode = 'countries';
            this.mainName = "Global";
            this.areaName = "Countries";
            this.usView = false;
            this.globalView = true;
            this.lookupKey = "Country/Region" ;
            this.selectedAreas = [];
            this.covidData = [];
            this.dataSourceMainUrl = 'https://github.com/CSSEGISandData/COVID-19';
            this.dataSourceName = "Johns Hopkins University";
            this.pullData(this.selectedData);
        },

        showUS() {
            this.selectedSubArea = "GA";
            this.viewMode = 'states';
            this.mainName = "U.S.";
            this.areaName = "States";
            this.usView = true;
            this.globalView = false;
            this.lookupKey = "State";
            this.selectedAreas = [];
            this.covidData = [];
            this.dataSourceMainUrl = 'https://usafacts.org/visualizations/coronavirus-covid-19-spread-map/';
            this.dataSourceName = 'USAFacts';
            this.pullData(this.selectedData);


        },
        myMax() { //https://stackoverflow.com/a/12957522
            let par = [];
            for (let i = 0; i < arguments.length; i++) {
                if (!isNaN(arguments[i])) {
                    par.push(arguments[i]);
                }
            }
            return Math.max.apply(Math, par);
        },

        myMin() {
            let par = [];
            for (let i = 0; i < arguments.length; i++) {
                if (!isNaN(arguments[i])) {
                    par.push(arguments[i]);
                }
            }
            return Math.min.apply(Math, par);
        },

        pullData(selectedData) {
            if (selectedData === 'Confirmed Cases') {
                if (this.viewMode === 'states' || this.viewMode === 'counties')
                    Plotly.d3.csv('https://usafactsstatic.blob.core.windows.net/public/data/covid-19/covid_confirmed_usafacts.csv', this.processData);
                else
                    Plotly.d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv", this.processData);
            } else if (selectedData === 'Reported Deaths') {
                if (this.viewMode === 'states' || this.viewMode === 'counties')
                    //             https://usafactsstatic.blob.core.windows.net/public/data/covid-19/covid_deaths_usafacts.csv
                    Plotly.d3.csv('https://usafactsstatic.blob.core.windows.net/public/data/covid-19/covid_deaths_usafacts.csv', this.processData);
                else
                    Plotly.d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv", this.processData);

            }
        },

        removeRepeats(array) {
            return [...new Set(array)];
        },

        processData(data) {
            if (data === undefined) {
                print('bad data');
                this.covidData = [];
                return;
            }
            let areasToLeaveOut = ['Grand Princess'];

            let areas;
            if (this.viewMode === "counties") {
                areas = data.filter(r => r['State'] === this.selectedSubArea).map(e => e[this.lookupKey]).filter(s => s !== '');
            } else {
                areas = data.map(e => e[this.lookupKey]).filter(s => s !== '');
            }
            areas = this.removeRepeats(areas);

            let renameAreas = {
                'Taiwan*': 'Taiwan',
                'Korea, South': 'South Korea'
            };

            const offset = 4;
            let dates = Object.keys(data[0]).slice(offset);
            this.dates = dates;

            //this.day = this.dates.length;

            let myData = [];
            for (let area of areas) {
                let areaData;
                if (this.viewMode === 'counties') {
                    areaData = data.filter(e => e[this.lookupKey] === area && e['State'] === this.selectedSubArea);
                } else {
                    areaData = data.filter(e => e[this.lookupKey] === area);
                }
                let arr = [];

                for (let date of dates) {
                    let sum = areaData.map(e => parseInt(e[date]) || 0).reduce((a, b) => a + b);
                    if (isNaN(sum)) {
                        sum = 0;
                    }
                    arr.push(sum);
                }

                if (!areasToLeaveOut.includes(area)) {
                    let slope = arr.map((e, i, a) => e - a[i - 7]);

                    if (Object.keys(renameAreas).includes(area)) {
                        area = renameAreas[area];
                    }

                    let counts = arr.map(e => e >= this.minCasesInArea ? e : 0);
                    let total = counts[counts.length - 1];
                    let areaName = area;

                    if (this.viewMode === 'states') {
                        if (abbrev_us_state.hasOwnProperty(area)) {
                            areaName = abbrev_us_state[area];
                        }
                    }

                    myData.push({
                        area: areaName,
                        cases: counts,
                        slope: slope.map((e, i) => arr[i] >= this.minCasesInArea ? e : NaN),
                        total: total,
                        display_total: total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    });

                }
            }

            this.covidData = myData.filter(e => this.myMax(...e.cases) >= this.minCasesInArea);

            const sortedAreas = this.covidData.sort((a, b) => b.total - a.total);
            if (sortedAreas.length <= this.edgeMode) {
                this.topAreas = sortedAreas.map(e => e.area);
                this.bottomAreas = this.topAreas;
            } else {
                this.topAreas = sortedAreas.slice(0, this.edgeWindow).map(e =>
                    e.area);
                let last = sortedAreas.length - 1;
                this.bottomAreas = sortedAreas.slice(last - this.edgeWindow).map(e =>
                    e.area);
            }

            this.selectedAreas = this.topAreas;
            this.sortedCovidData = this.covidData.sort(function (a, b) {
                let up_a = a.area.toUpperCase();
                let up_b = b.area.toUpperCase();
                return (up_a < up_b) ? -1 : (up_a > up_b) ? 1 : 0;
            });
            this.areas = this.covidData.map(e => e.area).sort();

        },

        play() {
            if (this.paused) {
                if (this.day === this.dates.length) {
                    this.day = this.minDay;
                }

                this.paused = false;
                this.icon = 'icons/pause.svg';
                this.increment();

            } else {
                this.paused = true;
                this.icon = 'icons/play.svg';
            }

        },

        pause() {
            if (!this.paused) {
                this.paused = true;
                this.icon = 'icons/play.svg';
            }
        },

        increment() {
            //console.log('day', this.day);
            //console.log('incrementing');

            if (this.day === this.dates.length || this.minDay < 0) {
                this.day = this.dates.length;
                this.paused = true;
                this.icon = 'icons/play.svg';
            } else if (this.day < this.dates.length) {
                if (!this.paused) {
                    this.day++;
                    setTimeout(this.increment, 200);
                }
            }

        },

        showTops() {
            this.selectedAreas = this.topAreas;
        },

        showBottoms() {
            this.selectedAreas = this.bottomAreas;
        },

        selectAll() {
            this.selectedAreas = this.areas;
        },

        deselectAll() {
            this.selectedAreas = [];
        },

        changeScale() {
            this.selectedScale = (this.selectedScale + 1) % 2;
        },

        toggleHide() {
            this.isHidden = !this.isHidden;
        }

    },

    computed: {

        filteredCovidData() {
            return this.covidData.filter(e => this.selectedAreas.includes(e.area));
        },

        minDay() {
            let minDay = this.myMin(...this.filteredCovidData.map(e => e.slope.findIndex(f => f > 0)));
            if (isFinite(minDay) && !isNaN(minDay)) {
                return minDay;
            } else {
                return -1;
            }
        }

    },

    data: {

        paused: true,

        dataTypes: ['Confirmed Cases', 'Reported Deaths'],

        selectedData: 'Confirmed Cases',

        sliderSelected: false,

        day: 7,

        icon: 'icons/play.svg',

        scale: ['Logarithmic Scale', 'Linear Scale'],

        selectedScale: 'Logarithmic Scale',

        selectedSubArea: searchObject['state'],

        mainName: searchObject['mode'] === "states" ? "U.S." : searchObject['mode'] === "countries" ? "Global" : searchObject['state'],

        areaName: searchObject['mode'] === "states" ? "States" : searchObject['mode'] === "countries" ? "Countries" : "Counties",

        viewMode: searchObject['mode'],

        usView: searchObject['mode'] === "states",

        globalView: searchObject['mode'] === 'countries',

        lookupKey: searchObject['mode'] === "states" ? "State" : searchObject['mode'] === "countries" ? "Country/Region" : "County Name",

        minCasesInArea: searchObject['minCases'],

        dates: [],

        covidData: [],

        sortedCovidData: [],

        areas: [],

        isHidden: true,

        selectedAreas: [],

        graphMounted: false,

        autoplay: true,

        copied: false,

        dataSourceMainUrl: searchObject['mode'] === "countries" ? 'https://github.com/CSSEGISandData/COVID-19' :
            'https://usafacts.org/visualizations/coronavirus-covid-19-spread-map/',

        dataSourceName: searchObject['mode'] === "countries" ? "Johns Hopkins University" : 'USAFacts',

        topAreas: [],

        bottomAreas: [],

        edgeWindow: 10

    }

});
