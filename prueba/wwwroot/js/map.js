var mapView;
var veredas;
var global = {};
var ver;
var prevLayer;
var graphicsLayer;
var formUsuarios;
var formVeredas;

var LayerDepartamentos;
var LayerVeredas;
var VeredasCantidad;

var tDpto = [];
var tVeredas = [];

var PaginaLineas = 10;


require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/widgets/Home",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/widgets/Sketch",
    "esri/widgets/Sketch/SketchViewModel",
    "esri/PopupTemplate",

    "esri/tasks/QueryTask",
    "esri/tasks/support/Query",

    "dijit/form/Button",
    "dijit/Dialog",
    "dojo/domReady!"
],
    function (
        Map,
        MapView,
        FeatureLayer,
        Home,
        Graphic,
        GraphicsLayer,
        Sketch,
        SketchViewModel,
        PopupTemplate,
        QueryTask,
        Query,
        Button,
        Dialog
    ) {
        var map = new Map({
            basemap: "topo-vector"
        });

        mapView = new MapView({
            container: "viewDiv",
            map: map,
            zoom: 6,
            center: [-72.951, 3.471]
        });

        graphicsLayer = new GraphicsLayer({ opacity: .4 });
        map.add(graphicsLayer);

        var btnHome = new Home({
            view: mapView
        });
        mapView.ui.add(btnHome, "top-left");

        var sketch = new Sketch({
            view: mapView,
            layer: graphicsLayer,
            creationMode: "single"
        });
        var sketchVM = new SketchViewModel({
            layer: graphicsLayer,
            view: mapView,
            polygonSymbol: {
                type: "simple-fill",
                style: "none",
                outline: {
                    color: "black",
                    width: 1
                }
            }
        });
        sketchVM.on(["create"], function (e) {
            if (e.state === "complete") {
                map.remove(map.layers.find(x => x.type === "graphics"));
                mapView.on("click", function (e) {
                    PopupDepartamento.location = e.location;
                    if (mapView.popup.visible && stateMap) {
                        mapView.popup.visible = false;
                        stateMap = false;
                    }
                });
                if (_LayerDepartamentos) {
                    mapView.map.layers.forEach((layer) => {
                        mapView.whenLayerView(layer).then((layerView) => {
                            if (layer.type === "feature") {
                                _LayerDepartamentos = layerView;
                            }
                        })
                    });
                    _LayerDepartamentos.queryFeatures({
                        geometry: e.graphic.geometry,
                        distance: 2,
                        units: "miles",
                        spatialRelationship: "intersects",
                        returnGeometry: true,
                        outFields: ["*"]
                    }).then((res) => {
                        mapView.when(function () {
                            stateMap = true;

                            mapView.extent = res.features[0].geometry.extent;
                            res.features[0].popupTemplate = new PopupTemplate(PopupDepartamento);
                            mapView.popup.features = [res.features[0]];
                            mapView.popup.location = {
                                latitude: res.features[0].geometry.centroid.latitude,
                                longitude: res.features[0].geometry.centroid.longitude
                            }
                            mapView.popup.visible = true;
                            mapView.goTo(res.features[0].geometry.extent.expand(1));
                        });
                    });
                }
            }
        });

        sketch.viewModel = sketchVM;


        var btnUsuarios = new Button({
            fieldName: "BtnUsuarios",
            label: "Usuarios",
            onClick: ListUsuarios
        });
        var btnVeredas = new Button({
            fieldName: "BtnVeredas",
            label: "Veredas",
            onClick: ListVeredas
        });

        mapView.ui.add(sketch, "top-right");
        mapView.ui.add(btnUsuarios, "top-right");
        mapView.ui.add(btnVeredas, "top-right");

        formUsuarios = new Dialog({
            id: "FormListUsuarios",
            title: "Listado de usuarios",
            content: "<div id='contenido'>Pendiente...</div>",
            style: "width: 50%;",
        });
        formVeredas = new Dialog({
            id: "FormListVeredas",
            title: "Listado de veredas",
            content: "<div id='contenido'>Pendiente...</div>",
        });

        LayerDepartamentos = new FeatureLayer({
            url: "https://ags.esri.co/server/rest/services/DA_DANE/departamento_mgn2016/MapServer",
            outFields: ["*"],
            opacity: .3,
            renderer: {
                type: "simple",
                symbol: {
                    type: "simple-fill",
                    color: "green",
                    style: "solid",
                    outline: {
                        color: "black",
                        width: 1
                    }
                }
            },
            labelingInfo: {
                labelPlacement: "above-center",
                labelExpressionInfo: {
                    expression: "$feature.DPTO_CNMBRE"
                }
            }
        });
        var _LayerDepartamentos = new FeatureLayer({
            url: "https://ags.esri.co/server/rest/services/DA_DANE/departamento_mgn2016/MapServer",
            outFields: ["*"],
            opacity: 0,
            renderer: {
                type: "simple",
                symbol: {
                    type: "simple-fill",
                    color: "cyan",
                    style: "solid",
                    outline: {
                        color: "black",
                        width: 1
                    }
                }
            }
        });
        map.add(LayerDepartamentos);

        global.getFeatureLayerView = function () {
            let featureLayerView = null;
            mapView.map.layers.forEach(function (layer, index) {
                mapView.whenLayerView(layer).then(function (layerView) {
                    if (layer.type === "feature") {
                        featureLayerView = layerView;
                    }
                }).catch(console.error);
            });
            return featureLayerView;
        }

        LayerVeredas = new FeatureLayer({
            url: "https://ags.esri.co/server/rest/services/DA_DatosAbiertos/VeredasColombia/MapServer/0",
            outFields: ["*"],
            opacity: 0,
            popupTemplate: PopupVereda
        });

        //map.add(LayerVeredas);
        
        global.CargarVeredas = (pag) => {
            paginaVeredas = pag || 0;
            if (paginaVeredas > 0) $('#btnA').removeClass('disabled'); else $('#btnA').addClass('disabled');
            LayerVeredas.queryFeatures({
                where: '1=1',
                returnGeometry: false,
                start: paginaVeredas * PaginaLineas,
                maxRecordCount: PaginaLineas,
                outFields: ['OBJECTID', 'CODIGO_VER', 'DPTOMPIO', 'NOMBRE_VER', 'FUENTE', 'NOMB_MPIO', 'NOM_DEP', 'COD_DPTO', 'Shape.STArea()', 'Shape.STLength()'],
            }).then((res) => {
                $('#ListaVeredas').html('');
                res.features.forEach(row => {
                    $('#ListaVeredas').append(
                        $('<tr>').append(
                            $('<td>').html(row.attributes.OBJECTID),
                            $('<td>').html(row.attributes.NOMBRE_VER),
                            $('<td>').html(row.attributes.NOMB_MPIO),
                            $('<td>').html(row.attributes.NOM_DEP),
                            $('<td>').html(row.attributes['Shape.STArea()']),
                            $('<td>').html(row.attributes['Shape.STLength()']),
                            $('<td>').html("<a class='btn' data-toggle='tooltip' data-placement='top' title='Presiona click para realizar zoom en el mapa para la vereda seleccionada.' onclick='global.VerVereda(" +
                                row.attributes.CODIGO_VER + ")'>🔍</a>")
                        )
                    )
                })
            })
        }
        global.VerVereda = (codigo) => {
            formVeredas.hide();
            //Como se solicita en la guia, usar 'query y querytask de la api de javascript'
            var queryStatesTask = new QueryTask({
                url: "https://ags.esri.co/server/rest/services/DA_DatosAbiertos/VeredasColombia/MapServer/0"
            });
            var query = new Query({
                where: `CODIGO_VER=${codigo}`,
                returnGeometry: true,
                outFields: ["*"],
                opacity: .4,
                renderer: {
                    type: "simple",
                    symbol: {
                        type: "simple-fill",
                        color: "cyan",
                        style: "solid",
                        outline: {
                            color: "black",
                            width: 1
                        }
                    }
                }
            });
            queryStatesTask.execute(query).then(function (res) {
                mapView.extent = res.features[0].geometry.extent;
                //PopupVereda.location = mapView.center.clone();
                res.features[0].popupTemplate = new PopupTemplate(PopupVereda);
                mapView.popup.location = {
                    latitude: res.features[0].geometry.centroid.latitude,
                    longitude: res.features[0].geometry.centroid.longitude
                };
                mapView.popup.features = [res.features[0]];
                mapView.popup.visible = true;
                graphicsLayer.removeAll();
                res.features.forEach((feature) => {
                    var g = new Graphic({
                        geometry: feature.geometry,
                        attributes: feature.attributes,
                        type: "simple",
                        symbol: {
                            type: "simple-fill",
                            color: "cyan",
                            style: "solid",
                            outline: {
                                color: "black",
                                width: 1
                            }
                        }
                    });
                    graphicsLayer.add(g);
                });
            });
        }

        global.BuscarVereda = function (codigo) {
            LayerVeredas.queryFeatures({
                where: `OBJECTID='${codigo}'`,
                returnGeometry: false,
                outFields: ["*"]
            }).then(function (res) {
                cargarVeredas(res.features, 1);
            });
        };
    });



var PopupDepartamento = {
    "title": "Departamento: {DPTO_CNMBRE}",
    "content": [
        {
            "type": "fields",
            "fieldInfos": [
                {
                    "fieldName": "OBJECTID",
                    "label": "OBJECTID ",
                },
                {
                    "fieldName": "DPTO_CCDGO",
                    "label": "DPTO_CCDGO"
                },
                {
                    "fieldName": "DPTO_NANO_CREACION",
                    "label": "DPTO_NANO_CREACION"
                },
                {
                    "fieldName": "DPTO_CNMBRE",
                    "label": "DPTO_CNMBRE"
                },
                {
                    "fieldName": "DPTO_CACTO_ADMNSTRTVO",
                    "label": "DPTO_CACTO_ADMNSTRTVO"
                },
                {
                    "fieldName": "DPTO_NAREA",
                    "label": "DPTO_NAREA"
                },
                {
                    "fieldName": "DPTO_NANO",
                    "label": "DPTO_NANO"
                }
            ]
        }]
}

var PopupVereda = {
    "title": "Vereda: {NOMBRE_VER}",
    "content": [
        {
            "type": "fields",
            "fieldInfos": [
                {
                    "fieldName": "OBJECTID",
                    "label": "Id"
                },
                {
                    "fieldName": "DPTOMPIO",
                    "label": "DPTOMPIO"
                },
                {
                    "fieldName": "CODIGO_VER",
                    "label": "CODIGO_VER"
                },
                {
                    "fieldName": "NOM_DEP",
                    "label": "NOM_DEP"
                },
                {
                    "fieldName": "NOMB_MPIO",
                    "label": "NOMB_MPIO"
                },
                {
                    "fieldName": "NOMBRE_VER",
                    "label": "NOMBRE_VER"
                },
                {
                    "fieldName": "VIGENCIA",
                    "label": "VIGENCIA"
                },
                {
                    "fieldName": "FUENTE",
                    "label": "FUENTE"
                },
                {
                    "fieldName": "DESCRIPCIO",
                    "label": "DESCRIPCIO"
                },
                {
                    "fieldName": "SEUDONIMOS",
                    "label": "SEUDONIMOS"
                },
                {
                    "fieldName": "AREA_HA",
                    "label": "AREA_HA"
                },
                {
                    "fieldName": "COD_DPTO",
                    "label": "COD_DPTO"
                }
            ]
        }]
}