import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

const map = new Map({
    view: new View({
        center: [0, 0],
        zoom: 1
    }),
    layers: [
        new TileLayer({
            source: new OSM()
        })
    ],
    target: 'map'
});

export default map;