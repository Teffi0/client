import React from 'react';
import { WebView } from 'react-native-webview';

const YandexMap = ({ onLocationSelect }) => {
    const yandexMapsApiKey = 'df86aad9-c093-4384-b6c2-e2d8090f584b';
    const injectJavaScript = `
    ymaps.ready(init);
    function init() {
      var myMap = new ymaps.Map('map', {
        center: [55.76, 37.64], // Москва
        zoom: 10
      });
      
      myMap.events.add('click', function (e) {
        var coords = e.get('coords');
        ymaps.geocode(coords).then(function (res) {
          var firstGeoObject = res.geoObjects.get(0);
          var address = firstGeoObject.getAddressLine();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            address: address,
            coords: coords
          }));
        });
      });
    }
  `;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <script src="https://api-maps.yandex.ru/2.1/?apikey=${yandexMapsApiKey}&lang=ru_RU" type="text/javascript"></script>
        <title>Yandex Maps</title>
      <style>
        html, body, #map {
          width: 100%; height: 100%; padding: 0; margin: 0;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script type="text/javascript">
        ${injectJavaScript}
      </script>
    </body>
    </html>
  `;

    return (
        <WebView
            originWhitelist={['*']}
            source={{ html }}
            style={{ flex: 1 }}
            onMessage={(event) => {
                const data = JSON.parse(event.nativeEvent.data);
                if (typeof onLocationSelect === 'function') {
                    onLocationSelect(data);
                } else {
                    console.error('onLocationSelect is not a function', onLocationSelect);
                }
            }}
        />
    );
};

export default YandexMap;