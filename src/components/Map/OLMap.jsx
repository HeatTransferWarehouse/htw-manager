import React from 'react';

import './Map.css';
import OlMap from 'ol/Map';
import OlView from 'ol/View';
import OlLayerTile from 'ol/layer/Tile';
import OlSourceOsm from 'ol/source/OSM';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

import 'ol/ol.css';
import 'antd/dist/antd.css';

import {
    MapComponent
} from '@terrestris/react-geo';

const layer = new OlLayerTile({
    source: new OlSourceOsm()
});

const center = [46.8772, 96.7898];

const map = new Map({
    view: new View({
        center: center,
        zoom: 16,
    }),
    layers: [
        new TileLayer({
            source: new OSM()
        })
    ],
    target: 'map'
});

function OLMap() {
    return (
        <div className="ol-map">
            <MapComponent
                map={map}
            />
        </div>
    );
}

export default OLMap;