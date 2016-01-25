/**
 * Created by tougo on 24/1/16.
 */
// url of the GIS server for additional layers from map.bgs.ac.uk
var gis_server_url = "https://map.bgs.ac.uk/arcgis/services/BGS_Detailed_Geology/MapServer/WMSServer?";

// UK EPSG 27700 definiton for proj4 library
proj4.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 ' + '+x_0=400000 +y_0=-100000 +ellps=airy ' + '+towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 ' + '+units=m +no_defs');
var proj27700 = ol.proj.get('EPSG:27700');
proj27700.setExtent([0, 0, 700000, 1300000]);

// since map is our main module we declare it as a global so we can easily access it from anywhere
var map = new ol.Map({
    layers: [
        new ol.layer.Tile({
            title: "OpenLayers Map",
            visible: true,
            source: new ol.source.OSM({
            })
        })
    ],
    target: 'map',
    view: new ol.View({
        projection: "EPSG:27700",
        center: [461800,331000],
        zoom: 10
    })
});

//this is the html element for the identify popup
var element = $('#popup')[0];

//an element to be displayed over the map and attached to a single map location (the element is the popup from above)
var popup = new ol.Overlay({
    element: element,
    autoPan: true,
    positioning: 'bottom-center',
    stopEvent: false
});

//add the element to the map object
map.addOverlay(popup);

// display popup on click
map.on('click', function(evt) {
    //finds the clicked feature (if it exist)
    var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature) {
            //Gets the feature data and creates an html string, sets the html string, returns the feature
            var feature_data = feature.get('data');
            var html_content = "";
            Object.keys(feature_data).forEach(function(key) {
                if(key.indexOf("Image")!== -1) {
                    html_content += "<img src='data/"+feature_data[key]+"' style='width:240px;height:240px'>";
                }
                else {
                    html_content += "<b>" + key + " :</b>" + feature_data[key] + "<br>";
                }
            });
            feature.html = html_content;
            return feature;
        });
    //if there is indeed a feature returned the popup is called and the html string is being rendered
    if (feature) {
        var geometry = feature.getGeometry();
        var coord = geometry.getCoordinates();
        popup.setPosition(coord);

        $(element).attr( 'data-placement', 'top' );
        $(element).attr( 'data-original-title', "info" );
        $(element).attr( 'data-content', feature.html );
        $(element).attr( 'data-html', true );

        $(element).popover('show');
    } else {
        $(element).popover('destroy');
    }
});

// If one is to drag the map the popup needs to close
map.on('pointermove', function(e) {
    if (e.dragging) {
        $(element).popover('destroy');
        return;
    }});

// On document ready
jQuery( document ).ready(function( $ ) {
    //Point Layers from the data files provided
    getLayersFromTextFiles();

    //Normally this object is created by querying the WMS GetCapabilites but due to CORS I wrote the useful part, myself
    var layers = [{Name: "BGS.50k.Bedrock"},
            {Name: "BGS.50k.Superficial.deposits"},
            {Name: "BGS.50k.Artificial.ground"},
            {Name: "BGS.50k.Mass.movement"},
            {Name: "BGS.50k.Linear.features"}];

    //adds dynamically the layers object items as map layers
    layers.forEach(function (layer) {
        var display_name = layer.Name;
        var myLayer1303 = new ol.layer.Tile({
            title: display_name,
            visible: false,
            source: new ol.source.TileWMS({
                projection: 'EPSG:27700',
                url: gis_server_url,
                params: {
                    'LAYERS': layer.Name,
                    'FORMAT': 'image/gif',
                    'STYLES': 'default'
                }
            })
        });
        map.addLayer(myLayer1303);
    });
});

// Read all the provided text files and display them on the map
function getLayersFromTextFiles() {
    //Array of the files to be read
    var files_to_read_and_display = [
        "data/borehole.txt",
        "data/fossil.txt",
        "data/measurement.txt",
        "data/rock.txt"
    ];

    //create ajax request functions for each file
    var ajaxrequests = [];
    files_to_read_and_display.forEach(function (file) {
        ajaxrequests.push($.ajax({
            method: "GET",
            url: file
        }));
    });

    //when all requests finish read the results and create the points layers
    $.when.all(ajaxrequests).done(function(results) {
        results.forEach(function(response){
            //transforming the delimited text from each file to javascript objects
            var response_object = response[0].split("\n");
            var table_data_collection = [];

            var table_headers = response_object[0].split("\t");
            var table_data = {};

            response_object.forEach(function(item, index) {
                var table_data_row = item.split("\t");
                if(table_headers.length === table_data_row.length && index !==0) {
                    table_data = {};
                    table_data_row.forEach(function(item, index) {
                        table_data[table_headers[index]] = item;
                    });
                    table_data_collection.push(table_data);
                }
            });

            //does the file has X, Y in the UK EPSG or Lon/Lat in WGS84????
            var icon_Feature_Collection = [];
            table_data_collection.forEach(function(item){
                var x;
                var y;
                var Is_projection_local = true;
                Object.keys(item).forEach(function(key) {
                    if (key === "X") {
                        x = item[key];
                    }
                    if (key === "Y") {
                        y = item[key];
                    }
                    if (key === "Latitude (WGS84)") {
                        y = item[key];
                        Is_projection_local = false;
                    }
                    if (key === "Longitude (WGS84)") {
                        x = item[key];
                    }
                });

                //if system WGS84 then transform it to 27700
                if(!Is_projection_local){
                    var tp = ol.proj.transform([x, y],'EPSG:4326', 'EPSG:27700');
                    x = tp[0];
                    y = tp[1];
                }

                //Create a point Feature
                var iconFeature = new ol.Feature({
                    geometry: new ol.geom.Point([x, y]),
                    data : item
                });

                //Give the point feature an icon
                var iconStyle = new ol.style.Style({
                    image: new ol.style.Icon({
                        anchor: [0.5, 46],
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'pixels',
                        opacity: 0.75,
                        src: 'css/icons/'+table_data_collection[0].Type+'.png'
                    })
                });

                iconFeature.setStyle(iconStyle);

                //add point features to a Collection
                icon_Feature_Collection.push(iconFeature);
            });

            //Create Vector Layers
            var vectorSource = new ol.source.Vector({
                features: icon_Feature_Collection
            });

            var vectorLayer = new ol.layer.Vector({
                title: table_data_collection[0].Type,
                source: vectorSource
            });

            map.addLayer(vectorLayer);
        });
        //Dynamically create the Tree in the navigation sidebar
        Create_Tree_And_Events();
    });
}

// Create the navigation (tree-like) sidebar
function Create_Tree_And_Events()
{
    var lyr = map;
    var lyrs = lyr.getLayers().getArray().slice().reverse();
    var l;

    //reads everything added to the map and creates a html input checkbox list
    lyrs.forEach(function(item) {
        l = item;
        var mguid = guid();

        $('#tree').append("<div class='checkbox'><li><input id='"
        + mguid
        + "' type='checkbox' value='"
        + l.get('title')
        + "' >"
        + l.get('title')
        + "</div>");

        var layer = map.getLayer(l.get('title'));

        //Finds the true state of the layer (some are visible, others non visible)
        $('#' + mguid)[0].checked = layer.get("visible");


        //click events for each layer
        $('#' + mguid).on("click", function () {
            var sl = map.getLayer(this.value);
            sl.setVisible(this.checked);
        });
    });
}

// bind the enter key to the Search field
$('#search').bind("enterKey",function(e) {
    $("#searchtable").empty();
    $("#searchtable").append("<tr><th>Results</th></tr>");

    //search anything in the UK, roads, cities, counties, PostCodes
    //PostCodes needs a space like this LE5 5UD else they end up querying junk
    $.ajax({
        method: "GET",
        url: "http://nominatim.openstreetmap.org/search/gb/?q=" + $("#search").val() + ",UK&format=json&polygon=1"
    }).success(function (reponse) {
        reponse.forEach(function (result) {
            var mguid = guid();
            $("#searchtable").append("<tr><td>" + result.display_name + "<button value='"
            + result.boundingbox[3] + ","
            + result.boundingbox[0] + ","
            + result.boundingbox[2] + ","
            + result.boundingbox[1]
            + "' id='" + mguid + "' class='btn btn-default'>GO</button></td></tr>");
            $('#' + mguid).on("click", function () {
                zoom_to_result_extent(this.value);
                $("#searchModal").modal('hide');
            });

        });

        $("#searchModal").modal('show');
    });
});

$('#search').keyup(function(e){
    if(e.keyCode === 13)
    {
        $(this).trigger("enterKey");
    }
});

// Zoom to the selected search result
function zoom_to_result_extent(bbox)
{
    var textent = ol.proj.transformExtent(bbox.split(','),'EPSG:4326', 'EPSG:27700');
    map.getView().fit(textent,map.getSize());
}

// GUID generator, handy to generate random html ids
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

// when takes as arguments predefined number of variables, in our case we changed it a bit to take arrays of functions
jQuery.when.all = function(deferreds) {
    var deferred = new jQuery.Deferred();
    $.when.apply(jQuery, deferreds).then(
        function() {
            deferred.resolve(Array.prototype.slice.call(arguments));
        },
        function() {
            deferred.fail(Array.prototype.slice.call(arguments));
        });

    return deferred;
};

// OpenLayers 3 does not yet have, to my knowledge, a getLayer by title, so I wrote it, it's handy
ol.Map.prototype.getLayer = function (title) {
    var layer;
    this.getLayers().forEach(function (lyr) {
        if (title === lyr.get('title')) {
            layer = lyr;
        }
    });
    return layer;
};



