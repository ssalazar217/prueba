var mapView;
var graphicsLayer;
var formUser;

require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/layers/GraphicsLayer",
    "esri/widgets/Sketch",
    "esri/widgets/Sketch/SketchViewModel",

    "dojo/ready",
    "dojo/_base/declare",
    "dojo/on",
    "dojo/dom",
    "dojo/_base/array",
    "dojo/query",
    "dojo/_base/connect",
    "dojo/domReady!",

    "dijit/form/Button",
    "dijit/Dialog",
    "dijit/form/Form",
    "dijit/form/TextBox",

], function (
    Map,
    MapView,
    FeatureLayer,
    Dialog, Form, TextBox, Button, onEvent,
    GraphicsLayer,
    Sketch,
    SketchViewModel
) {
    var map = new Map({
        basemap: "topo-vector"
    });

    mapView = new MapView({
        container: "viewDiv",
        map: map,
        center: [-72.951, 3.471],
        zoom: 6
    });

    mapView.ui.add("btnUsuarios", "top-right");
    mapView.ui.add("btnVeredas", "top-right");
    mapView.ui.add("btnPrueba", "top-right");

    //form = new Form();
    formUsers = new Dialog({
        title: "My Dialog",
        content: "Test content.",
        style: "width: 300px; height: 300px;"
    });

    var form = new Form();

    new TextBox({
        placeHolder: "Name"
    }).placeAt(form.containerNode);

    new Button({
        label: "OK"
    }).placeAt(form.containerNode);

    var dia = new Dialog({
        content: form,
        title: "Dialog with form",
        style: "width: 300px; height: 300px;"
    });
    form.startup();
    dia.show();
});