import React, { useState } from 'react';
import Map from "./Map";
import { Layers, TileLayer, VectorLayer } from "./Layers";
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { OSM, Vector } from "ol/source";
import { fromLonLat, get } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
import { Controls, FullScreenControl } from "./Controls";
let styles = {
  'MultiPolygon': new Style({
    stroke: new Stroke({
      color: 'blue',
      width: 1,
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 255, 0.1)',
    }),
  }),
};

const firstJson = 
{
  "type": "FeatureCollection",
  "features": [{
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          162.91888800895453,
          25.68211430503662
        ]
      },
      "properties": {}
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -7.348215087620131,
          45.957980379475075
        ]
      },
      "properties": {}
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          66.60908093671685,
          -23.022790595252886
        ]
      },
      "properties": {}
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -17.79821579028697,
          -68.97394476948142
        ]
      },
      "properties": {}
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          87.4114243193112,
          10.31779669682959
        ]
      },
      "properties": {}
    }
  ]
}

const geojsonObject = { ...firstJson }; // see full geojson object in Github
const geojsonObject2 = { ...firstJson }; // see full geojson object in Github

const LiveMap = () => {
  const [center, setCenter] = useState([0, 0]);
  const [zoom, setZoom] = useState(1);
  const [showLayer1, setShowLayer1] = useState(false);
  const [showLayer2, setShowLayer2] = useState(false);
return (
  <div>
    <Map center={fromLonLat(center)} zoom={zoom}>
      <Layers>
        <TileLayer
          source={new OSM()}
          zIndex={0}
        />
        {showLayer1 && (
          <VectorLayer
            source={Vector({ features: new GeoJSON().readFeatures(geojsonObject, { featureProjection: get('EPSG:3857') }) })}
            style={styles.MultiPolygon}
          />
        )}
        {showLayer2 && (
          <VectorLayer
            source={Vector({ features: new GeoJSON().readFeatures(geojsonObject2, { featureProjection: get('EPSG:3857') }) })}
            style={styles.MultiPolygon}
          />
        )}
      </Layers>
      <Controls>
        <FullScreenControl />
      </Controls>
    </Map>
    <div>
      <input
        type="checkbox"
        checked={showLayer1}
        onChange={event => setShowLayer1(event.target.checked)}
      /> Johnson County
    </div>
    <div>
      <input
        type="checkbox"
        checked={showLayer2}
        onChange={event => setShowLayer2(event.target.checked)}
      /> Wyandotte County
    </div>
  </div>
  );
}
export default LiveMap;