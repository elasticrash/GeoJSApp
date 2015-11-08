/**
 * Created by tougo on 7/11/15.
 */
var geoserver = "http://XXX.XX.XX.XXX:8082/";

var geoserverWfsDefaults= {
    wfsUrl: geoserver+ "geoserver/ELPHO/wfs?",
    wfsFeatureNS: "http://demo-greece/Greek",
    wfsVersion: "1.0.0",
    wfsSrsName: "EPSG:2100",
    nsAlias: 'ELPHO'
};
var geoserverWmsDefaults= {
    wmsUrl: geoserver+"geoserver/ELPHO/wms?",
    wmsSrsName: "EPSG:2100",
    nsAlias: 'ELPHO'
};

var nodeproxy = {
    proxyUrl : "http://localhost:8002/"
};