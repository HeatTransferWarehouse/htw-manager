import React, { useContext, useEffect } from "react";
import MapContext from "../Map/MapContext";
import OLTileLayer from "ol/layer/Tile";
import OLVectorLayer from "ol/layer/Vector";
const Layers = ({ children }) => {
  return <div>{children}</div>;
};

const TileLayer = ({ source, zIndex = 0 }) => {
  const { map } = useContext(MapContext); 
  useEffect(() => {
    if (!map) return;
    
    let tileLayer = new OLTileLayer({
      source,
      zIndex,
    });
    map.addLayer(tileLayer);
    tileLayer.setZIndex(zIndex);
    return () => {
      if (map) {
        map.removeLayer(tileLayer);
      }
    };
  }, [map]);
  return null;
};

const VectorLayer = ({ source, style, zIndex = 0 }) => {
  const { map } = useContext(MapContext);
  useEffect(() => {
    if (!map) return;
    let vectorLayer = new OLVectorLayer({
      source,
      style
    });
    map.addLayer(vectorLayer);
    vectorLayer.setZIndex(zIndex);
    return () => {
      if (map) {
        map.removeLayer(vectorLayer);
      }
    };
  }, [map]);
  return null;
};

export { Layers,
         TileLayer, 
         VectorLayer,
       };