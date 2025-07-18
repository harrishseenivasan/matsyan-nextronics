// OceanGuard Dashboard JavaScript
console.log('Script.js loaded successfully');

// --- Firebase Initialization (user must fill in config) ---
// Add your Firebase config below
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
// Initialize Firebase
if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
  var db = firebase.database();
} else {
  console.error('Firebase SDK not loaded. Please include Firebase scripts in your HTML.');
}


let radarMap, uploadMap;
let lastUploadedCsvData = null;
let radarMapDynamicMarkers = [];

// --- Cesium viewer removed for Mapbox migration ---
// Navigation functions
function showRadar() {
  toggleView('radar-view');
  setTimeout(() => {
    if (!radarMap) {
      // Initialize Leaflet map in #radar-map
      radarMap = L.map('radar-map').setView([8.2, 77.6], 7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(radarMap);

      // Clear SOS and Fish Spot card info on load
      document.getElementById('sos-info').textContent = '';
      document.getElementById('fishspot-info').textContent = '';

      function addRadarDefaultMarkers() {
        // Removed default SOS and Fish Spot markers
      }
      addRadarDefaultMarkers();

      // CSV upload for SOS & Fish Spot
      // const csvInput = document.getElementById('mapdata-csv');
      // const uploadBtn = document.getElementById('mapdata-upload-btn');
      // let selectedCSVFile = null;
      // if (csvInput) {
      //   csvInput.addEventListener('change', function(e) {
      //     selectedCSVFile = e.target.files[0] || null;
      //   });
      // }
      // if (uploadBtn) {
      //   uploadBtn.addEventListener('click', function() {
      //     if (!selectedCSVFile) {
      //       alert('Please select a CSV file first.');
      //       return;
      //     }
      //     const reader = new FileReader();
      //     reader.onload = function(ev) {
      //       // Parse CSV and build data array
      //       const text = ev.target.result;
      //       const rows = text.split(/\r?\n/);
      //       const data = [];
      //       for (let i = 1; i < rows.length; i++) {
      //         const row = rows[i].trim();
      //         if (!row) continue;
      //         const [type, lat, lng] = row.split(',');
      //         if (!type || !lat || !lng) continue;
      //         data.push({ type: type.trim().toLowerCase(), lat: parseFloat(lat), lng: parseFloat(lng) });
      //       }
      //       lastUploadedCsvData = data;
      //       // Update SOS & Fish Spot cards with latest from CSV
      //       let latestSOS = null;
      //       let latestFishSpot = null;
      //       for (let i = data.length - 1; i >= 0; i--) {
      //         if (!latestSOS && data[i].type === 'sos') latestSOS = data[i];
      //         if (!latestFishSpot && data[i].type === 'fishspot') latestFishSpot = data[i];
      //         if (latestSOS && latestFishSpot) break;
      //       }
      //       if (latestSOS) {
      //         document.getElementById('sos-info').textContent = `Location: ${latestSOS.lat}°N, ${latestSOS.lng}°E`;
      //       } else {
      //         document.getElementById('sos-info').textContent = '';
      //       }
      //       if (latestFishSpot) {
      //         document.getElementById('fishspot-info').textContent = `Lat: ${latestFishSpot.lat} | Lon: ${latestFishSpot.lng}`;
      //       } else {
      //         document.getElementById('fishspot-info').textContent = '';
      //       }
      //       // Update radar map markers immediately
      //       if (radarMap && radarMapDynamicMarkers) {
      //         radarMapDynamicMarkers.forEach(m => radarMap.removeLayer(m));
      //         radarMapDynamicMarkers = [];
      //         data.forEach(item => {
      //           let marker = null;
      //           if (item.type === 'sos') {
      //             marker = L.marker([item.lat, item.lng], {
      //               title: 'SOS',
      //               icon: L.icon({iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/RedDot.svg', iconSize: [24,24]})
      //             }).bindPopup('SOS');
      //           } else if (item.type === 'fishspot') {
      //             marker = L.marker([item.lat, item.lng], {
      //               title: 'Fish Spot',
      //               icon: L.icon({iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Fish_icon.png', iconSize: [24,24]})
      //             }).bindPopup('Fish Spot');
      //           }
      //           if (marker) {
      //             marker.addTo(radarMap);
      //             radarMapDynamicMarkers.push(marker);
      //           }
      //         });
      //       }
      //       // Save to Firebase
      //       if (typeof db !== 'undefined') {
      //         db.ref('uploads').push({
      //           timestamp: Date.now(),
      //           data: data
      //         }, function(error) {
      //           if (error) {
      //             alert('Failed to save to database.');
      //           } else {
      //             alert('Upload saved to history!');
      //             showLatestMarkersOnRadar();
      //             loadHistoryMap();
      //           }
      //         });
      //       } else {
      //         alert('Firebase not initialized.');
      //       }
      //     };
      //     reader.readAsText(selectedCSVFile);
      //   });
      // }

      // Show latest uploaded markers from Firebase on radar by default
      function showLatestMarkersOnRadar() {
        if (typeof db === 'undefined') return;
        db.ref('uploads').orderByChild('timestamp').limitToLast(1).once('value', function(snapshot) {
          const uploads = snapshot.val();
          if (!uploads) return;
          // Remove previous dynamic markers
          radarMapDynamicMarkers.forEach(m => radarMap.removeLayer(m));
          radarMapDynamicMarkers = [];
          // Remove default SOS and Fish Spot markers (but not Weather Station)
          radarMap.eachLayer(layer => {
            if (layer instanceof L.Marker && (layer.options.title === 'SOS' || layer.options.title === 'Fish Spot')) {
              radarMap.removeLayer(layer);
            }
          });
          const uploadArr = Object.values(uploads);
          const latest = uploadArr[uploadArr.length - 1];
          latest.data.forEach(item => {
            let marker = null;
            if (item.type === 'sos') {
              marker = L.marker([item.lat, item.lng], {
                title: 'SOS',
                icon: L.icon({iconUrl: 'sos.png', iconSize: [24,24]})
              }).bindPopup('SOS');
            } else if (item.type === 'fishspot') {
              marker = L.marker([item.lat, item.lng], {
                title: 'Fish Spot',
                icon: L.icon({iconUrl: 'fish.png', iconSize: [32,32]})
              }).bindPopup('Fish Spot');
            }
            if (marker) {
              marker.addTo(radarMap);
              radarMapDynamicMarkers.push(marker);
            }
          });
        });
      }
      // Call on load
      showLatestMarkersOnRadar();

      // --- History Map Logic ---
      let historyMap, historyPins = [], historyMarkers = [];
      window.showHistory = function showHistory() {
        toggleView('history-view');
        setTimeout(() => {
          if (!historyMap) {
            historyMap = L.map('history-map').setView([8.2, 77.6], 7);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors'
            }).addTo(historyMap);
          }
          // Show only last uploaded markers by default
          if (typeof db !== 'undefined' && historyMap) {
            db.ref('uploads').orderByChild('timestamp').limitToLast(1).once('value', function(snapshot) {
              // Clear previous markers
              historyPins.forEach(pin => historyMap.removeLayer(pin));
              historyPins = [];
              historyMarkers.forEach(m => historyMap.removeLayer(m));
              historyMarkers = [];
              const uploads = snapshot.val();
              if (!uploads) return;
              const uploadArr = Object.values(uploads);
              const latest = uploadArr[uploadArr.length - 1];
              latest.data.forEach(item => {
                let marker = null;
                if (item.type === 'sos') {
                  marker = L.marker([item.lat, item.lng], {
                    title: 'SOS',
                    icon: L.icon({iconUrl: 'sos.png', iconSize: [24,24]})
                  }).bindPopup('SOS');
                } else if (item.type === 'fishspot') {
                  marker = L.marker([item.lat, item.lng], {
                    title: 'Fish Spot',
                    icon: L.icon({iconUrl: 'fish.png', iconSize: [48,48]})
                  }).bindPopup('Fish Spot');
                }
                if (marker) {
                  marker.addTo(historyMap);
                  historyMarkers.push(marker);
                }
              });
            });
          }
          loadHistoryMap();
        }, 100);
        // Highlight nav
        document.querySelectorAll('nav ul li').forEach(li => li.classList.remove('active'));
        document.querySelectorAll('nav ul li')[1].classList.add('active');
      };

      function loadHistoryMap() {
        if (typeof db === 'undefined' || !historyMap) return;
        db.ref('uploads').orderByChild('timestamp').once('value', function(snapshot) {
          // Clear previous pins and list
          historyPins.forEach(pin => historyMap.removeLayer(pin));
          historyPins = [];
          historyMarkers.forEach(m => historyMap.removeLayer(m));
          historyMarkers = [];
          const list = document.getElementById('history-list');
          if (list) list.innerHTML = '';
          const uploads = snapshot.val();
          if (!uploads) return;
          Object.entries(uploads).forEach(([key, upload], idx) => {
            // Compute average lat/lng for pin
            let latSum = 0, lngSum = 0, count = 0;
            upload.data.forEach(d => {
              latSum += d.lat;
              lngSum += d.lng;
              count++;
            });
            if (count === 0) return;
            const avgLat = latSum / count, avgLng = lngSum / count;
            // Add pin for upload
            const pin = L.marker([avgLat, avgLng], {
              title: 'Upload '+(idx+1),
              icon: L.icon({iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', iconSize: [28,28]})
            }).addTo(historyMap).bindPopup('Upload '+(idx+1));
            historyPins.push(pin);
            // Add to list
            if (list) {
              const li = document.createElement('li');
              li.textContent = `Upload ${idx+1} (${new Date(upload.timestamp).toLocaleString()})`;
              li.style.cursor = 'pointer';
              li.onclick = function() {
                // Show SOS and Fish Spot for this upload
                historyMarkers.forEach(m => historyMap.removeLayer(m));
                historyMarkers = [];
                upload.data.forEach(item => {
                  let marker = null;
                  if (item.type === 'sos') {
                    marker = L.marker([item.lat, item.lng], {
                      title: 'SOS',
                      icon: L.icon({iconUrl: 'sos.png', iconSize: [24,24]})
                    }).bindPopup('SOS');
                  } else if (item.type === 'fishspot') {
                    marker = L.marker([item.lat, item.lng], {
                      title: 'Fish Spot',
                      icon: L.icon({iconUrl: 'fish.png', iconSize: [32,32]})
                    }).bindPopup('Fish Spot');
                  }
                  if (marker) {
                    marker.addTo(historyMap);
                    historyMarkers.push(marker);
                  }
                });
              };
              list.appendChild(li);
            }
          });
        });
      }

    }
  }, 100);
}

function showUpload() {
  toggleView('upload-view');
  setTimeout(() => {
    if (uploadMap) {
      uploadMap.invalidateSize();
      return;
    }
    // Initialize Leaflet map in #upload-map
    uploadMap = L.map('upload-map').setView([8.2, 77.6], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(uploadMap);

    let uploadMapDynamicMarkers = [];
    const csvInput = document.getElementById('mapdata-csv');
    if (csvInput) {
      csvInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(ev) {
          // Remove previous dynamic markers
          uploadMapDynamicMarkers.forEach(m => uploadMap.removeLayer(m));
          uploadMapDynamicMarkers = [];
          const text = ev.target.result;
          const rows = text.split(/\r?\n/);
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i].trim();
            if (!row) continue;
            const [type, lat, lng] = row.split(',');
            if (!type || !lat || !lng) continue;
            let marker = null;
            if (type.trim().toLowerCase() === 'sos') {
              marker = L.marker([parseFloat(lat), parseFloat(lng)], {
                title: 'SOS',
                icon: L.icon({iconUrl: 'sos.png', iconSize: [24,24]})
              }).bindPopup('SOS');
            } else if (type.trim().toLowerCase() === 'fishspot') {
              marker = L.marker([parseFloat(lat), parseFloat(lng)], {
                title: 'Fish Spot',
                icon: L.icon({iconUrl: 'fish.png', iconSize: [32,32]})
              }).bindPopup('Fish Spot');
            }
            if (marker) {
              marker.addTo(uploadMap);
              uploadMapDynamicMarkers.push(marker);
            }
          }
        };
        reader.readAsText(file);
      });
    }
  }, 100);
}

function showMap() {
  toggleView('map-view');
  // No map in the map menu, just the image
}

function showSettings() {
  toggleView('settings-view');
}

function toggleView(viewClass) {
  document.querySelectorAll('.section-view').forEach(sec => sec.classList.remove('active'));
  document.querySelector(`.${viewClass}`).classList.add('active');
  // Fix nav highlighting for 3 nav items: Radar (0), History (1), Settings (2)
  document.querySelectorAll('nav ul li').forEach(li => li.classList.remove('active'));
  if (viewClass === 'radar-view') document.querySelectorAll('nav ul li')[0].classList.add('active');
  if (viewClass === 'history-view') document.querySelectorAll('nav ul li')[1].classList.add('active');
  if (viewClass === 'settings-view') document.querySelectorAll('nav ul li')[2].classList.add('active');
}

// Helper function to initialize map if needed
function initializeMapIfNeeded(mapId, mapVariable) {
  const mapElement = document.getElementById(mapId);
  if (!mapElement) {
    console.error(`Map element ${mapId} not found`);
    return;
  }
  
  // Check if map is already initialized
  let mapInstance;
  switch(mapVariable) {
    case 'radarMap':
      mapInstance = radarMap;
      break;
    case 'uploadMap':
      mapInstance = uploadMap;
      break;
    case 'mainMap':
      mapInstance = mainMap;
      break;
  }
  
  if (!mapInstance && typeof L !== 'undefined') {
    console.log(`Initializing ${mapId}...`);
    
    // Create the map
    const newMap = L.map(mapId).setView([8.2, 77.6], 7);
    
    // Add Indian Ocean tile layer
    const indianOceanTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Indian Ocean Satellite View',
      maxZoom: 19
    });
    
    indianOceanTileLayer.addTo(newMap);
    
    // Add fallback for tile errors
    indianOceanTileLayer.on('tileerror', function() {
      console.log(`Satellite tiles failed for ${mapId}, using offline map`);
      const offlineTileLayer = L.tileLayer('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', {
        tileSize: 256,
        attribution: 'Indian Ocean Map'
      });
      offlineTileLayer.addTo(newMap);
    });
    
    // Assign to the correct variable
    switch(mapVariable) {
      case 'radarMap':
        radarMap = newMap;
        break;
      case 'uploadMap':
        uploadMap = newMap;
        break;
      case 'mainMap':
        mainMap = newMap;
        break;
    }
    
    mapElement.classList.add('loaded');
    console.log(`${mapId} initialized successfully`);
  } else if (mapInstance) {
    console.log(`${mapId} already initialized`);
  } else {
    console.error(`Leaflet not available for ${mapId}`);
  }
}

// Map initialization
function initializeMaps() {
  try {
    // Wait a bit to ensure DOM elements are ready
    setTimeout(() => {
      // Initialize radar map
      const radarMapElement = document.getElementById('radar-map');
      if (radarMapElement) {
        radarMap = L.map('radar-map').setView([8.2, 77.6], 7);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(radarMap);
        radarMapElement.classList.add('loaded');
      }
      
      // Initialize upload map
      const uploadMapElement = document.getElementById('upload-map');
      if (uploadMapElement) {
        uploadMap = L.map('upload-map').setView([8.2, 77.6], 7);
      }
      
      // Initialize main map
      const mainMapElement = document.getElementById('main-map');
      if (mainMapElement) {
        mainMap = L.map('main-map').setView([8.2, 77.6], 7);
      }

      // Create Indian Ocean map tile layer
      const createIndianOceanTileLayer = () => {
        // Use a satellite image of the Indian Ocean region
        return L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Indian Ocean Satellite View',
          maxZoom: 19
        });
      };

      // Create fallback tile layer for offline use
      const createOfflineTileLayer = () => {
        // Create a canvas-based tile that looks like a map
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Create a simple map-like pattern with ocean colors
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(0, 0, 256, 256);
        
        // Add some grid lines
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1;
        for (let i = 0; i < 256; i += 32) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, 256);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(256, i);
          ctx.stroke();
        }
        
        const dataURL = canvas.toDataURL();
        
        return L.tileLayer(dataURL, {
          tileSize: 256,
          attribution: 'Indian Ocean Map'
        });
      };

      // Try to use satellite imagery first, fallback to offline tiles
      const indianOceanTileLayer = createIndianOceanTileLayer();
      const offlineTileLayer = createOfflineTileLayer();

      if (uploadMap) {
        // Try satellite imagery first
        indianOceanTileLayer.addTo(uploadMap);
        indianOceanTileLayer.on('tileerror', function() {
          console.log('Satellite tiles failed, using offline Indian Ocean map');
          offlineTileLayer.addTo(uploadMap);
        });
        document.getElementById('upload-map').classList.add('loaded');
      }
      
      if (mainMap) {
        indianOceanTileLayer.addTo(mainMap);
        indianOceanTileLayer.on('tileerror', function() {
          offlineTileLayer.addTo(mainMap);
        });
        document.getElementById('main-map').classList.add('loaded');
      }
      
      console.log('Maps initialized successfully with Indian Ocean view');
    }, 100);
  } catch (error) {
    console.error('Error initializing maps:', error);
  }
}

// Clock functionality
function updateClock() {
  const clock = document.getElementById('clock');
  if (!clock) return;
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let ampm = '';
  let format = '12';
  const clockFormatElement = document.getElementById('clockFormat');
  if (clockFormatElement) {
    format = clockFormatElement.value;
  }
  if (format === '12') {
    ampm = hours >= 12 ? ' PM' : ' AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
  }
  const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}${ampm}`;
  clock.textContent = timeStr;
}

// Theme toggle functionality
function toggleTheme() {
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    const body = document.body;
    if (themeToggle.value === 'light') {
      body.classList.add('light-theme');
    } else {
      body.classList.remove('light-theme');
    }
  }
}

// Upload form handling
function handleUpload(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const file = formData.get('gpsfile');
  
  if (file) {
    // Simulate file processing
    alert('GPS file uploaded successfully!');
    // Here you would typically send the file to your server
  } else {
    alert('Please select a file to upload.');
  }
}

// CSV upload and parse for Radar
function handleCsvUpload(file, callback) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const rows = text.split(/\r?\n/).filter(Boolean);
    // Assume CSV: lat,lon,label
    const data = rows.map(row => {
      const [lat, lon, label] = row.split(',');
      return { lat: parseFloat(lat), lon: parseFloat(lon), label: label || '' };
    });
    callback(data);
  };
  reader.readAsText(file);
}


// Initialize everything when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing OceanGuard dashboard...');

  // Always initialize maps on page load
  initializeMaps();
  // Ensure radar map is visible on initial load
  showRadar();

  const csvInput = document.getElementById('mapdata-csv');
  const uploadBtn = document.getElementById('mapdata-upload-btn');
  let selectedCSVFile = null;
  if (csvInput) {
    csvInput.addEventListener('change', function(e) {
      selectedCSVFile = e.target.files[0] || null;
    });
  }
  if (uploadBtn) {
    uploadBtn.addEventListener('click', function() {
      if (!selectedCSVFile) {
        alert('Please select a CSV file first.');
        return;
      }
      // Ensure radarMap is initialized before adding markers
      if (!radarMap) {
        radarMap = L.map('radar-map').setView([8.2, 77.6], 7);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(radarMap);
      }
      const reader = new FileReader();
      reader.onload = function(ev) {
        const text = ev.target.result;
        const rows = text.split(/\r?\n/);
        const data = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i].trim();
          if (!row) continue;
          const [type, lat, lng] = row.split(',');
          if (!type || !lat || !lng) continue;
          data.push({ type: type.trim().toLowerCase(), lat: parseFloat(lat), lng: parseFloat(lng) });
        }
        lastUploadedCsvData = data;
        // Update info cards for heavytide and fishspot
        let latestHeavyTide = null;
        let latestFishSpot = null;
        for (let i = data.length - 1; i >= 0; i--) {
          if (!latestHeavyTide && data[i].type === 'heavytide') latestHeavyTide = data[i];
          if (!latestFishSpot && data[i].type === 'fishspot') latestFishSpot = data[i];
          if (latestHeavyTide && latestFishSpot) break;
        }
        document.getElementById('sos-info').textContent = latestHeavyTide
          ? `Location: ${latestHeavyTide.lat}°N, ${latestHeavyTide.lng}°E` : '';
        document.getElementById('fishspot-info').textContent = latestFishSpot
          ? `Lat: ${latestFishSpot.lat} | Lon: ${latestFishSpot.lng}` : '';
        // Update radar map markers
        if (radarMap && radarMapDynamicMarkers) {
          radarMapDynamicMarkers.forEach(m => radarMap.removeLayer(m));
          radarMapDynamicMarkers = [];
          data.forEach(item => {
            let marker = null;
            if (item.type === 'heavytide') {
              marker = L.marker([item.lat, item.lng], {
                title: 'Heavy Tide',
                icon: L.icon({iconUrl: 'sos.png', iconSize: [24,24]})
              }).bindPopup('Heavy Tide');
            } else if (item.type === 'fishspot') {
              marker = L.marker([item.lat, item.lng], {
                title: 'Fish Spot',
                icon: L.icon({iconUrl: 'fish.png', iconSize: [32,32]})
              }).bindPopup('Fish Spot');
            }
            if (marker) {
              marker.addTo(radarMap);
              radarMapDynamicMarkers.push(marker);
            }
          });
        }
      };
      reader.readAsText(selectedCSVFile);
    });
  }

  // Upload Map Position button handler
  const uploadMapPositionBtn = document.getElementById('upload-map-position');
  if (uploadMapPositionBtn) {
    uploadMapPositionBtn.addEventListener('click', () => {
      if (radarMap) {
        const center = radarMap.getCenter();
        const zoom = radarMap.getZoom();
        const mapPosition = {
          lat: center.lat,
          lng: center.lng,
          zoom: zoom
        };
        // TODO: Replace this with a POST request to your backend if needed
        console.log('Uploading map position:', mapPosition);
        alert(`Uploaded map position: Lat ${mapPosition.lat.toFixed(5)}, Lng ${mapPosition.lng.toFixed(5)}, Zoom ${mapPosition.zoom}`);
      } else {
        alert('Map is not initialized!');
      }
    });
  }

  // Check if Leaflet is loaded
  if (typeof L === 'undefined') {
    console.error('Leaflet library not loaded! Trying alternative CDN...');
    
    // Try to load Leaflet from alternative CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
    script.onload = function() {
      console.log('Leaflet loaded from alternative CDN');
      initializeDashboard();
    };
    script.onerror = function() {
      console.error('All Leaflet CDNs failed, using offline mode');
      // Initialize without maps
      initializeDashboardWithoutMaps();
    };
    document.head.appendChild(script);
    
    // Also load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
    document.head.appendChild(link);
  } else {
    console.log('Leaflet library loaded successfully');
    initializeDashboard();
  }

  // History modal logic
  const historyBtn = document.querySelector('li[onclick="showHistory()"]');
  const modal = document.getElementById('history-map-modal');
  const closeModalBtn = document.getElementById('close-history-modal');
  if (historyBtn && modal && closeModalBtn) {
    historyBtn.onclick = () => {
      if (!lastUploadedCsvData || lastUploadedCsvData.length === 0) {
        alert('No CSV data uploaded yet!');
        return;
      }
      modal.style.display = 'flex';
      setTimeout(() => showHistoryMapModal(), 100);
    };
    closeModalBtn.onclick = () => {
      modal.style.display = 'none';
      // Remove old map if any
      const mapDiv = document.getElementById('history-modal-map');
      mapDiv.innerHTML = '';
    };
  }

  // Set default clock format to 12-hour on page load
  const clockFormatElement = document.getElementById('clockFormat');
  if (clockFormatElement) {
    clockFormatElement.value = '12';
  }
});

function initializeDashboard() {
  // Initialize maps
  initializeMaps();
  
  // Ensure all maps are properly initialized
  ensureAllMapsInitialized();
  
  // Initialize clock immediately
  updateClock();
  
  // Update clock every second
  setInterval(updateClock, 1000);
  
  // Add event listeners
  const clockFormatElement = document.getElementById('clockFormat');
  if (clockFormatElement) {
    clockFormatElement.addEventListener('change', updateClock);
  }
  
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('change', toggleTheme);
  }
  
  const uploadForm = document.getElementById('uploadForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', handleUpload);
  }
  
  // Add some sample data updates
  updateWeatherData();
  setInterval(updateWeatherData, 30000); // Update every 30 seconds
  
  console.log('OceanGuard dashboard initialized successfully');
}

function initializeDashboardWithoutMaps() {
  // Initialize clock immediately
  updateClock();
  
  // Update clock every second
  setInterval(updateClock, 1000);
  
  // Add event listeners
  const clockFormatElement = document.getElementById('clockFormat');
  if (clockFormatElement) {
    clockFormatElement.addEventListener('change', updateClock);
  }
  
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('change', toggleTheme);
  }
  
  const uploadForm = document.getElementById('uploadForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', handleUpload);
  }
  
  // Add some sample data updates
  updateWeatherData();
  setInterval(updateWeatherData, 30000); // Update every 30 seconds
  
  console.log('OceanGuard dashboard initialized without maps');
}

// Also try to initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
  console.log('DOM still loading, waiting for DOMContentLoaded...');
} else {
  console.log('DOM already loaded, initializing immediately...');
  // Initialize immediately
  if (typeof L !== 'undefined') {
    initializeDashboard();
  } else {
    console.log('Leaflet not available, initializing without maps...');
    initializeDashboardWithoutMaps();
  }
}

// Fetch live weather data and update the weather card
function updateWeatherData() {
  const weatherCard = document.querySelector('.card:first-child p');
  if (!weatherCard) return;

  // Open-Meteo API for current weather at 8.2, 77.6
  fetch('https://api.open-meteo.com/v1/forecast?latitude=8.2&longitude=77.6&current_weather=true')
    .then(response => response.json())
    .then(data => {
      if (data && data.current_weather) {
        const temperature = data.current_weather.temperature;
        weatherCard.textContent = `Temperature: ${temperature}°C`;
      } else {
        weatherCard.textContent = 'Weather data unavailable';
      }
    })
    .catch(() => {
      weatherCard.textContent = 'Weather data unavailable';
    });
}

// Test maps function
function testMaps() {
  console.log('=== TESTING MAPS ===');
  console.log('Radar map:', radarMap);
  console.log('Upload map:', uploadMap);
  console.log('Main map:', mainMap);
  
  // Check if map elements exist
  console.log('Radar map element:', document.getElementById('radar-map'));
  console.log('Upload map element:', document.getElementById('upload-map'));
  console.log('Main map element:', document.getElementById('main-map'));
  
  // Force initialize all maps
  console.log('Forcing map initialization...');
  initializeMapIfNeeded('radar-map', 'radarMap');
  initializeMapIfNeeded('upload-map', 'uploadMap');
  initializeMapIfNeeded('main-map', 'mainMap');
  
  // Invalidate sizes
  if (radarMap) {
    radarMap.invalidateSize();
    console.log('Radar map invalidated');
  }
  if (uploadMap) {
    uploadMap.invalidateSize();
    console.log('Upload map invalidated');
  }
  if (mainMap) {
    mainMap.invalidateSize();
    console.log('Main map invalidated');
  }
  
  console.log('=== MAP TEST COMPLETE ===');
}

// Debug function to test everything
function debugEverything() {
  console.log('=== DEBUGGING OCEANGUARD ===');
  console.log('Script loaded:', typeof script !== 'undefined');
  console.log('Leaflet loaded:', typeof L !== 'undefined');
  console.log('Clock element:', document.getElementById('clock'));
  console.log('Radar map element:', document.getElementById('radar-map'));
  console.log('Current time:', new Date().toLocaleTimeString());
  
  // Test clock function
  updateClock();
  
  // Test map initialization
  if (typeof L !== 'undefined') {
    initializeMaps();
  }
  
  console.log('=== DEBUG COMPLETE ===');
} 

// Ensure all maps are properly initialized
function ensureAllMapsInitialized() {
  setTimeout(() => {
    // Check and initialize radar map
    if (!radarMap && document.getElementById('radar-map')) {
      radarMap = L.map('radar-map').setView([8.2, 77.6], 7);
      const indianOceanTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Indian Ocean Satellite View',
        maxZoom: 19
      });
      indianOceanTileLayer.addTo(radarMap);
      document.getElementById('radar-map').classList.add('loaded');
      console.log('Radar map ensured initialized');
    }
    
    // Check and initialize upload map
    if (!uploadMap && document.getElementById('upload-map')) {
      uploadMap = L.map('upload-map').setView([8.2, 77.6], 7);
      const indianOceanTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Indian Ocean Satellite View',
        maxZoom: 19
      });
      indianOceanTileLayer.addTo(uploadMap);
      document.getElementById('upload-map').classList.add('loaded');
      console.log('Upload map ensured initialized');
    }
    
    // Check and initialize main map
    if (!mainMap && document.getElementById('main-map')) {
      mainMap = L.map('main-map').setView([8.2, 77.6], 7);
      const indianOceanTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Indian Ocean Satellite View',
        maxZoom: 19
      });
      indianOceanTileLayer.addTo(mainMap);
      document.getElementById('main-map').classList.add('loaded');
      console.log('Main map ensured initialized');
    }
  }, 500);
} 

// Show the modal map with last uploaded CSV data
function showHistoryMapModal() {
  const mapDiv = document.getElementById('history-modal-map');
  mapDiv.innerHTML = '';
  // Use OpenLayers for modal map
  const map = new ol.Map({
    target: 'history-modal-map',
    layers: [
      new ol.layer.Tile({ source: new ol.source.OSM() })
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([77.6, 8.2]),
      zoom: 7
    })
  });
  // Add points
  if (lastUploadedCsvData && lastUploadedCsvData.length > 0) {
    lastUploadedCsvData.forEach(point => {
      const marker = document.createElement('div');
      marker.className = 'ol-marker';
      marker.innerHTML = `<div style="background:#0288d1;color:white;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;">•</div>`;
      const overlay = new ol.Overlay({
        position: ol.proj.fromLonLat([point.lon, point.lat]),
        positioning: 'center-center',
        element: marker,
        stopEvent: false
      });
      map.addOverlay(overlay);
    });
  }
  // List points
  const list = document.getElementById('history-modal-list');
  list.innerHTML = lastUploadedCsvData.map(p => `<li>${p.label} (${p.lat}, ${p.lon})</li>`).join('');
} 

// Language translations
const translations = {
  en: {
    weather: "Today's Weather",
    latestSOS: "High Tide Zone",
    fishSpot: "Fish Spot",
    upload: "Upload SOS & Fish Spot CSV:",
    uploadBtn: "Upload",
    uploadMapPosition: "Upload Map Position",
    settings: "Settings",
    menuRadar: "Radar",
    menuSettings: "Settings",
    clockFormat: "Clock Format:",
    hour24: "24-Hour",
    hour12: "12-Hour"
  },
  ta: {
    weather: "இன்றைய வானிலை",
    latestSOS: "உயர் அலைப்பெருக்கு பகுதி",
    fishSpot: "மீன் இடம்",
    upload: "எஸ்.ஓ.எஸ் மற்றும் மீன் இடம் CSV பதிவேற்று:",
    uploadBtn: "பதிவேற்று",
    uploadMapPosition: "வரைபட நிலையை பதிவேற்று",
    settings: "அமைப்புகள்",
    menuRadar: "ராடார்",
    menuSettings: "அமைப்புகள்",
    clockFormat: "கடிகார வடிவம்:",
    hour24: "24-மணி",
    hour12: "12-மணி"
  }
};

function setLanguage(lang) {
  // Cards
  document.querySelector('.card h3').textContent = translations[lang].weather;
  document.querySelectorAll('.card h3')[1].textContent = translations[lang].latestSOS;
  document.querySelectorAll('.card h3')[2].textContent = translations[lang].fishSpot;
  // Upload label and button
  document.querySelector('label[for="mapdata-csv"]').innerHTML = `<b>${translations[lang].upload}</b>`;
  document.getElementById('mapdata-upload-btn').textContent = translations[lang].uploadBtn;
  // Upload map position button
  document.getElementById('upload-map-position').textContent = translations[lang].uploadMapPosition;
  // Settings panel
  document.querySelector('.settings-panel h3').textContent = translations[lang].settings;
  document.querySelector('label[for="clockFormat"]').childNodes[0].textContent = translations[lang].clockFormat + ' ';
  // Clock format select
  const clockSelect = document.getElementById('clockFormat');
  clockSelect.options[0].text = translations[lang].hour24;
  clockSelect.options[1].text = translations[lang].hour12;
  // Sidebar menu (update only the text, not the icon or onclick)
  const navItems = document.querySelectorAll('nav ul li');
  if (navItems.length > 0) {
    const radarIcon = navItems[0].querySelector('i');
    if (radarIcon && radarIcon.nextSibling) {
      radarIcon.nextSibling.textContent = ' ' + translations[lang].menuRadar;
    }
  }
  if (navItems.length > 1) {
    const settingsIcon = navItems[1].querySelector('i');
    if (settingsIcon && settingsIcon.nextSibling) {
      settingsIcon.nextSibling.textContent = ' ' + translations[lang].menuSettings;
    }
  }
}

// Language toggle event
const languageToggle = document.getElementById('languageToggle');
if (languageToggle) {
  languageToggle.addEventListener('change', function() {
    setLanguage(this.value);
  });
  // Set initial language on page load
  setLanguage(languageToggle.value);
} 