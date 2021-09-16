var wms_layers = [];
var layersList = [];

var lyr_Communes31IGN_1 = new ol.layer.Tile({
	source: new ol.source.TileWMS(({
		url: "http://data.geo-ide.application.developpement-durable.gouv.fr/WMS/131/IAL_Inondation",
		attributions: ' ',
		params: {
			"LAYERS": "Communes31____IGN_",
			"TILED": "true",
			"VERSION": "1.1.1"},
	})),
	title: "Communes31 (© IGN)",
	opacity: 1.000000,
});
wms_layers.push([lyr_Communes31IGN_1, 0]);
layersList.unshift(lyr_Communes31IGN_1);
lyr_Communes31IGN_1.setVisible(true);


var lyr_PlanIGNv2_2 = new ol.layer.Tile({
	source: new ol.source.TileWMS(({
		url: "https://wxs.ign.fr/essentiels/geoportail/r/wms",
		attributions: ' ',
		params: {
			"LAYERS": "GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2",
			"TILED": "true",
			"VERSION": "1.3.0"},
	})),
	title: "Plan IGN v2",
	opacity: 1.000000,
});
wms_layers.push([lyr_PlanIGNv2_2, 0]);
layersList.unshift(lyr_PlanIGNv2_2);
lyr_PlanIGNv2_2.setVisible(true);


/*var layWMTS = new ol.layer.Tile({
	source : new ol.source.WMTS({
		url: "https://wxs.ign.fr/essentiels/geoportail/wmts",
		layer: "GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2",
		matrixSet: "PM",
		format: "image/png",
		style: "normal",
		tileGrid : new ol.tilegrid.WMTS({
				origin: [-20037508,20037508], // topLeftCorner
				resolutions: [ 156543.03392804103, 78271.5169640205, 39135.75848201024, 19567.879241005125,
    9783.939620502562, 4891.969810251281, 2445.9849051256406, 1222.9924525628203,
		611.4962262814101, 305.74811314070485, 152.87405657035254, 76.43702828517625,
    38.218514142588134, 19.109257071294063, 9.554628535647034, 4.777314267823517,
    2.3886571339117584, 1.1943285669558792, 0.5971642834779396, 0.29858214173896974,
    0.14929107086948493, 0.07464553543474241 ],
				matrixIds: ["0","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19"] // ids des TileMatrix
		})
	}),
	title: "Plan IGN WMTS",
})
wms_layers.push([layWMTS, 0]);
layersList.unshift([layWMTS, 0]);
layWMTS.setVisible(true);
*/

//var layersList = [layWMTS, lyr_PlanIGNv2_2, lyr_Communes31IGN_1];
