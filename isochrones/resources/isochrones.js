//*** Charger la definition du Lambert 93 (EPSG:2154) :
var lambert93;
function defLambert93(){
	proj4.defs('EPSG:2154','+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
	ol.proj.proj4.register(proj4);
	lambert93= ol.proj.get('EPSG:2154'); lambert93.setExtent([-378305.81, 6093283.21, 1212610.74, 7186901.68]);
}
if( typeof proj4 == 'undefined' ){
	var proj4script= document.createElement("script");
	proj4script.src = "./resources/proj4.js";
	document.head.appendChild(proj4script);
	proj4script.onreadystatechange= function(){ if(this.readyState=='complete') defLambert93(); }; // pour IE
	proj4script.onload= defLambert93; // pour les autres
} else {
	defLambert93()
}

if( typeof measuring == 'undefined' ) measuring= false;

var calcIsochrone= false;
isocControl= function(opt_options){
	var buttonStyle= document.createElement('style')
	document.head.appendChild(buttonStyle)
	var styles= '.isochrone-control button{width:7em !important; display:inline; border:1px solid #aaa; border-radius:4px !important; cursor:pointer; }';
	buttonStyle.sheet.insertRule( styles, 0 )
	styles= '.isochrone-control button.actif{background-color: #aaa !important; border-color: #111 }';
	buttonStyle.sheet.insertRule( styles, 0 )
	
  var button= document.createElement('button');
  button.innerHTML= 'isochrone';
  button.setAttribute("title", "Cliquer pour activer la fonction ; puis cliquer dans la carte sur le point de départ de l'isochrone");
  //button.className += ' fas fa-ruler ';
  var this_= this;
  var handleIsochrone= function(e) {
    if (!calcIsochrone) {
			button.classList.add('actif');
			//button.style.cssText= 'background-color: #aaa !important';			//button.style.border= '1px solid #111';
			calcIsochrone= true;
    } else {
			button.classList.remove('actif');
			//button.style.backgroundColor= 'initial';			button.style.border= 'initial';
			calcIsochrone= false;
			isocSource.clear();
			if(isocTooltip){ map.removeOverlay(isocTooltip); isocTooltip=null; }
    }
  };
  button.addEventListener('click', handleIsochrone, false);
  button.addEventListener('touchstart', handleIsochrone, false);
	
  var inputTime= document.createElement('input');
	inputTime.setAttribute("type", "number");
	inputTime.setAttribute("id", "minutes");
	inputTime.setAttribute("min", "1");
	inputTime.setAttribute("max", "600");
	inputTime.value= 10;
  inputTime.style.width= '3em';
  var txtTime= document.createElement('span');
	txtTime.innerHTML= 'minutes'
	
  var element= document.createElement('div');
  element.className= 'isochrone-control ol-selectable ol-control';
  element.style.top= '0.5em';
  element.style.left= '3em';
  element.appendChild(button);
  element.appendChild(inputTime);
  element.appendChild(txtTime);

  var options= opt_options || {};
  ol.control.Control.call( this, { element: element, target: options.target } );
};
ol.inherits(isocControl, ol.control.Control);
var ctrlIsochrone= new isocControl();
map.addControl(ctrlIsochrone);


var isochroneStyle= new ol.style.Style({
  fill: new ol.style.Fill({ color:'rgba(0,0,255,0.2)' }),
  stroke: new ol.style.Stroke({ color:'blue', width:2 }),
  image: new ol.style.Circle({ radius:10,
    fill:new ol.style.Fill({ color:'orange' }),
    stroke:new ol.style.Stroke({ color:'red', width:2 })
  }),
  text: new ol.style.Text({ font:"bold 20px Arial",
    placement: 'point', fill: new ol.style.Fill({color:'#900'}),
    textAlign:"center", offsetY:-10, stroke:new ol.style.Stroke({color:'#fff',width:3})
  })
})
var isocSource= new ol.source.Vector({wrapX: false});
var isochroneVector= new ol.layer.Vector({ source: isocSource, style: isochroneStyle });
map.addLayer(isochroneVector);


var onIsochroneClick= function(evt){
  if (!calcIsochrone){
		if(typeof onSingleClick=="function") onSingleClick(evt);
		return;
	}
	if( measuring ){ return } //	if (sketch) {	return }
		
	var clicCoord= evt.coordinate;
	console.log( "clicCoord=" + clicCoord )
	var newCoord= ol.proj.transform(clicCoord, map.getView().getProjection(), lambert93)
	//console.log( "newCoord=" + newCoord )
	var minutes= document.getElementById('minutes');
	if(minutes && minutes.value>0){ var duree= minutes.value * 60; }
	else{ var duree= 600; }
	var api_ign= "https://wxs.ign.fr/d37yiu4ttsg1x3j0i1233143/isochrone/isochrone.json?"
	var params= "location="+newCoord[0]+","+newCoord[1]+"&method=Time&time="+duree+"&srs=EPSG:2154&smoothing=true"
	
	if(window.XMLHttpRequest) var req=new XMLHttpRequest();
	else var req=new ActiveXObject("Microsoft.XMLHTTP"); //pour IE
	req.open("GET", api_ign + params, true);
	req.onload = function(ev){
		if(req.status==200){ //afficher la reponse du serveur:
			var obj= JSON.parse(req.responseText); 
			afficherIsochrone( obj, clicCoord )
		} else { // echec de l'echange Ajax :
			alert( "Echec : le serveur IGN a répondu : "+ req.status +" ; " + req.statusText )
		}
	}
	req.send();
}

map.on('singleclick', function(evt){ onIsochroneClick(evt) });


function afficherIsochrone( data, coord ){ // Afficher l'isochrone retourné par le serveur IGN, suite à onIsochroneClick
	if( data==undefined ){ alert("Soucis avec la réponse du serveur IGN"); return }
	if( data.status != 'OK' ){ alert( data.message ); return }
	geomWKT= data.wktGeometry
	if( geomWKT=='' ){ alert("Le serveur IGN a renvoyé un isochrone vide"); return }
	var viewProj= map.getView().getProjection();
	var wkt= new ol.format.WKT()
  var feat= wkt.readFeature(geomWKT, {dataProjection:lambert93, featureProjection:viewProj} );
  // Si geomWKT n'est pas un WKT valide -> erreur -> fonction terminée
  if( ! feat ){ alert("Le serveur IGN a renvoyé un isochrone non valide"); return }
  isocSource.clear();
	isocSource.addFeature(feat);
	var polygon= feat.getGeometry();
  if(polygon) map.getView().fit( polygon, {minResolution:2, duration:1000} );
	createIsochroneTooltip(feat,coord);
}


/** Overlay pour afficher un lien de telechargement de l'isochrone.  @type {ol.Overlay} */
var isocTooltip;
/** L'element html pour le tooltip de l'isochrone. * @type {Element} */
var isocTooltipElement;
/** Creates a new isochrone tooltip */
function createIsochroneTooltip(feat,coord){
  if(isocTooltip){ map.removeOverlay(isocTooltip); isocTooltip=null; }
  //if (isocTooltipElement){ isocTooltipElement.parentNode.removeChild(isocTooltipElement); }
	var tipStyle= document.createElement('style')
	document.head.appendChild(tipStyle)
	var styles= '.tooltip-isochrone::before { border-top: 6px solid rgba(255,219,112,0.5); border-right: 6px solid transparent; border-left: 6px solid transparent; content: ""; position: absolute; bottom: -6px; margin-left: -7px; left: 50%;}';
	tipStyle.sheet.insertRule( styles, 0 )
	styles= '.tooltip-isochrone { position: relative; background-color: rgba(255,219,112,0.7); border-radius: 4px; color: black; padding: 3px 7px; white-space: nowrap; border: 1px solid white; }';
	tipStyle.sheet.insertRule( styles, 0 )
	styles= '.tooltip-isochrone .close { position:absolute; top:-10px; font-weight:900; background-color: rgba(255,219,112,0.9); border-radius:8px; color:black; padding:1px 3px; cursor:pointer; }';
	tipStyle.sheet.insertRule( styles, 0 )
  isocTooltipElement= document.createElement('div');
  isocTooltipElement.className= 'tooltip-isochrone';
	
	var olGeoJ= new ol.format.GeoJSON()
	var geojson= olGeoJ.writeFeature(feat, {dataProjection:lambert93, featureProjection:map.getView().getProjection()})
	var obj= JSON.parse(geojson);
	obj.crs= { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::2154" } };
	geojson= JSON.stringify(obj);
	var blob= new Blob([geojson], {type: "text/plain"});
	var dlink= document.createElement('a');
	dlink.download= "isochrone.geojson";
	dlink.onclick= function(){ // IE10+ : (has Blob, but not a[download] or URL)
		if(navigator.msSaveBlob){ return navigator.msSaveBlob(blob,"isochrone.geojson") }
	}
	dlink.href= window.URL.createObjectURL(blob);
	dlink.innerHTML= "Télécharger l'isochrone"
	dlink.title= "Télécharger l'isochrone au format GeoJSON"
	isocTooltipElement.appendChild(dlink)
	var close= document.createElement('span');
	close.innerHTML= 'x';
	close.className= 'close';
	close.onclick= function(){ map.removeOverlay(isocTooltip); isocTooltip=null };
	isocTooltipElement.appendChild(close)
  isocTooltip= new ol.Overlay({ element: isocTooltipElement, offset: [0,0], positioning: 'bottom-center' });
	setTimeout( function(){ // Juste pour afficher le tooltip APRES le zoom sur l'isochrone...
		map.addOverlay(isocTooltip); isocTooltip.setPosition( coord );
	}, 1500);	
	//coord= JSON.parse("["+coord+"]");	//console.log( coord +" : "+ typeof coord )
	//isocTooltip.setPosition( feat.getGeometry().getLastCoordinate() );
}


function download_file(name, contents, mime_type) {
	mime_type = mime_type || "text/plain";
	var blob = new Blob([contents], {type: mime_type});
	var dlink = document.createElement('a');
	dlink.download = name;
	dlink.href = window.URL.createObjectURL(blob);
	dlink.onclick = function(e) {
			// revokeObjectURL needs a delay to work properly
			var that = this;
			setTimeout(function() {
					window.URL.revokeObjectURL(that.href);
			}, 1500);
	};
	dlink.click();
	dlink.remove();
}


