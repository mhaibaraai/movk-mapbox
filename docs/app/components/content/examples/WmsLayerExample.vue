<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [10.45, 51.16], zoom: 5 }">
      <!-- terrestris 公开 OSM-WMS（EPSG:3857） -->
      <MapboxWmsLayer
        url="https://ows.terrestris.de/osm/service"
        layers="OSM-WMS"
        attribution="© terrestris / OpenStreetMap"
      />
    </MapboxMap>
  </div>
</template>
