<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [10.45, 51.16], zoom: 5 }">
      <!-- terrestris 公开 OSM-WMS（EPSG:3857） -->
      <MaplibreWmsLayer
        url="https://ows.terrestris.de/osm/service"
        layers="OSM-WMS"
        attribution="© terrestris / OpenStreetMap"
      />
    </MaplibreMap>
  </div>
</template>
