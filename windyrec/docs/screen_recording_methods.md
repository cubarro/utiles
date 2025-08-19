# Técnicas Modernas de Screen Recording en Frontend con JavaScript/HTML5

## Resumen Ejecutivo

Este documento analiza las técnicas más avanzadas para implementar funcionalidades de grabación de pantalla y captura de interacciones del usuario utilizando exclusivamente tecnologías nativas del navegador. Se examinan cinco enfoques principales: Screen Capture API, MediaRecorder API, Canvas Recording, WebRTC, y tecnologías complementarias como Web Workers y WebAssembly. Cada técnica incluye implementaciones prácticas, limitaciones técnicas y recomendaciones de uso específicas para diferentes escenarios de aplicación.

## 1. Introducción

La grabación de pantalla en el frontend ha evolucionado significativamente con la introducción de APIs nativas del navegador que eliminan la dependencia de plugins externos. Las técnicas modernas permiten capturar desde contenido específico de una pestaña hasta flujos de video completos del escritorio, todo esto procesado directamente en el navegador usando JavaScript y HTML5.

Las aplicaciones incluyen desde herramientas de soporte técnico hasta plataformas educativas, sistemas de monitoreo de experiencia de usuario y aplicaciones de colaboración en tiempo real.

## 2. Screen Capture API

### 2.1 Descripción General

La Screen Capture API, centrada en el método `getDisplayMedia()`, representa la solución más moderna y estándar para la captura de pantalla en navegadores. Esta API permite al usuario seleccionar qué contenido compartir a través de una interfaz segura proporcionada por el navegador.

### 2.2 Implementación Básica

```javascript
// Configuración básica para captura de pantalla
const displayMediaOptions = {
  video: {
    displaySurface: "browser", // "browser", "window", "monitor"
    preferCurrentTab: false,
    selfBrowserSurface: "exclude", // No mostrar la pestaña actual
    monitorTypeSurfaces: "include"
  },
  audio: {
    suppressLocalAudioPlayback: false,
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 44100,
    systemAudio: "include" // Incluir audio del sistema
  },
  surfaceSwitching: "include" // Permitir cambio dinámico
};

// Función asíncrona para iniciar captura
async function startScreenCapture() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    return stream;
  } catch (error) {
    console.error('Error al iniciar captura de pantalla:', error);
    throw error;
  }
}
```

### 2.3 Implementación Avanzada con Gestión de Estado

```javascript
class ScreenRecorder {
  constructor() {
    this.stream = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
  }

  async startCapture(options = {}) {
    const defaultOptions = {
      video: {
        displaySurface: "window",
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        suppressLocalAudioPlayback: true
      }
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      this.stream = await navigator.mediaDevices.getDisplayMedia(finalOptions);
      this.setupMediaRecorder();
      return this.stream;
    } catch (error) {
      this.handleError('Captura de pantalla', error);
    }
  }

  setupMediaRecorder() {
    const options = {
      mimeType: 'video/webm;codecs=vp9,opus',
      videoBitsPerSecond: 2500000, // 2.5 Mbps
      audioBitsPerSecond: 128000   // 128 kbps
    };

    this.mediaRecorder = new MediaRecorder(this.stream, options);
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      this.createDownloadLink();
    };

    // Detectar cuando el usuario para la compartición
    this.stream.getVideoTracks()[0].addEventListener('ended', () => {
      this.stopRecording();
    });
  }

  startRecording() {
    if (this.mediaRecorder && !this.isRecording) {
      this.recordedChunks = [];
      this.mediaRecorder.start(100); // Chunks cada 100ms
      this.isRecording = true;
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  createDownloadLink() {
    const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `screen-recording-${Date.now()}.webm`;
    downloadLink.textContent = 'Descargar grabación';
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    URL.revokeObjectURL(url);
  }

  handleError(context, error) {
    console.error(`Error en ${context}:`, error);
    
    if (error.name === 'NotAllowedError') {
      throw new Error('Usuario denegó permisos de captura de pantalla');
    } else if (error.name === 'NotSupportedError') {
      throw new Error('Captura de pantalla no soportada en este navegador');
    } else {
      throw new Error(`Error técnico: ${error.message}`);
    }
  }
}
```

### 2.4 Limitaciones y Consideraciones

**Limitaciones de Seguridad:**
- El contenido no visible puede ser ofuscado automáticamente
- No permite enumerar fuentes de captura disponibles
- Requiere interacción del usuario para cada sesión

**Limitaciones Técnicas:**
- Soporte limitado en navegadores móviles
- Las restricciones se aplican después de la selección del usuario
- La captura de audio puede no estar disponible según la configuración

**Compatibilidad:**
- Chrome 72+, Firefox 66+, Edge 79+
- Safari tiene soporte limitado
- No disponible en dispositivos móviles

## 3. MediaRecorder API

### 3.1 Descripción General

La MediaRecorder API proporciona la funcionalidad para grabar streams de medios, siendo el complemento perfecto para Screen Capture API. Permite configurar formatos de salida, calidad de video/audio y gestión de datos en tiempo real.

### 3.2 Configuración Avanzada de Formatos

```javascript
class AdvancedMediaRecorder {
  constructor() {
    this.supportedMimeTypes = this.getSupportedMimeTypes();
    this.recorder = null;
    this.chunks = [];
  }

  getSupportedMimeTypes() {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/mp4;codecs=h264,aac',
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2'
    ];

    return types.filter(type => MediaRecorder.isTypeSupported(type));
  }

  createRecorder(stream, options = {}) {
    const defaultOptions = {
      mimeType: this.supportedMimeTypes[0], // Mejor formato disponible
      videoBitsPerSecond: 2500000,
      audioBitsPerSecond: 128000,
      bitsPerSecond: 2628000 // Total
    };

    const finalOptions = { ...defaultOptions, ...options };
    
    this.recorder = new MediaRecorder(stream, finalOptions);
    this.setupEventHandlers();
    
    return this.recorder;
  }

  setupEventHandlers() {
    this.recorder.addEventListener('dataavailable', (event) => {
      if (event.data && event.data.size > 0) {
        this.chunks.push(event.data);
        this.onDataAvailable?.(event.data);
      }
    });

    this.recorder.addEventListener('start', () => {
      console.log('Grabación iniciada');
      this.onStart?.();
    });

    this.recorder.addEventListener('stop', () => {
      console.log('Grabación detenida');
      this.processRecording();
    });

    this.recorder.addEventListener('error', (event) => {
      console.error('Error en grabación:', event.error);
      this.onError?.(event.error);
    });
  }

  processRecording() {
    const blob = new Blob(this.chunks, { 
      type: this.recorder.mimeType 
    });
    
    this.onRecordingComplete?.(blob);
    this.chunks = []; // Limpiar para próxima grabación
  }

  // Grabación con fragmentación temporal
  startTimedRecording(intervalMs = 1000) {
    this.recorder.start(intervalMs);
  }

  // Solicitar datos sin detener grabación
  requestData() {
    if (this.recorder.state === 'recording') {
      this.recorder.requestData();
    }
  }
}
```

### 3.3 Streaming en Tiempo Real

```javascript
class RealTimeRecorder {
  constructor(websocketUrl) {
    this.ws = new WebSocket(websocketUrl);
    this.recorder = null;
    this.chunkNumber = 0;
  }

  async startRealtimeRecording(stream) {
    const options = {
      mimeType: 'video/webm;codecs=vp8,opus',
      videoBitsPerSecond: 1000000, // Menor bitrate para streaming
      audioBitsPerSecond: 64000
    };

    this.recorder = new MediaRecorder(stream, options);
    
    this.recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.sendChunkToServer(event.data);
      }
    };

    // Enviar chunks cada 100ms para baja latencia
    this.recorder.start(100);
  }

  sendChunkToServer(chunk) {
    const reader = new FileReader();
    reader.onload = () => {
      const message = {
        type: 'video-chunk',
        chunkNumber: this.chunkNumber++,
        timestamp: Date.now(),
        data: reader.result
      };
      
      this.ws.send(JSON.stringify(message));
    };
    
    reader.readAsArrayBuffer(chunk);
  }
}
```

### 3.4 Limitaciones Técnicas

**Formatos de Salida:**
- WebM (VP8/VP9) es el más compatible
- MP4 (H.264) tiene soporte limitado
- Audio: Opus, AAC según el contenedor

**Performance:**
- Bitrate alto puede afectar performance del navegador
- Fragmentación muy frecuente aumenta overhead
- Memoria limitada para chunks grandes

## 4. Canvas Recording

### 4.1 Descripción General

La grabación de canvas permite capturar contenido gráfico generado dinámicamente, ideal para aplicaciones de visualización, juegos web y herramientas de dibujo. Utiliza `captureStream()` para convertir el contenido del canvas en un MediaStream.

### 4.2 Implementación Básica

```javascript
class CanvasRecorder {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.stream = null;
    this.recorder = null;
    this.chunks = [];
    this.isRecording = false;
  }

  startCapture(frameRate = 30) {
    try {
      // Capturar stream del canvas
      this.stream = this.canvas.captureStream(frameRate);
      
      const options = {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000
      };

      this.recorder = new MediaRecorder(this.stream, options);
      this.setupRecorderEvents();
      
      return this.stream;
    } catch (error) {
      console.error('Error capturando canvas:', error);
      throw error;
    }
  }

  setupRecorderEvents() {
    this.recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };

    this.recorder.onstop = () => {
      this.saveRecording();
    };
  }

  startRecording() {
    if (this.recorder && !this.isRecording) {
      this.chunks = [];
      this.recorder.start();
      this.isRecording = true;
    }
  }

  stopRecording() {
    if (this.recorder && this.isRecording) {
      this.recorder.stop();
      this.isRecording = false;
    }
  }

  saveRecording() {
    const blob = new Blob(this.chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `canvas-recording-${Date.now()}.webm`;
    link.click();
    
    URL.revokeObjectURL(url);
  }
}
```

### 4.3 Canvas con Audio Sincronizado

```javascript
class CanvasWithAudioRecorder {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.audioContext = new AudioContext();
    this.combinedStream = null;
  }

  async createCombinedStream(frameRate = 30, includeSystemAudio = false) {
    // Stream del canvas
    const canvasStream = this.canvas.captureStream(frameRate);
    
    // Stream de audio del micrófono
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    // Combinar streams
    this.combinedStream = new MediaStream();
    
    // Agregar video track del canvas
    canvasStream.getVideoTracks().forEach(track => {
      this.combinedStream.addTrack(track);
    });
    
    // Agregar audio track del micrófono
    audioStream.getAudioTracks().forEach(track => {
      this.combinedStream.addTrack(track);
    });

    // Opcionalmente, agregar audio del sistema
    if (includeSystemAudio) {
      try {
        const systemAudio = await navigator.mediaDevices.getDisplayMedia({
          video: false,
          audio: true
        });
        
        systemAudio.getAudioTracks().forEach(track => {
          this.combinedStream.addTrack(track);
        });
      } catch (error) {
        console.warn('No se pudo capturar audio del sistema:', error);
      }
    }

    return this.combinedStream;
  }

  async startRecording(frameRate = 30) {
    const stream = await this.createCombinedStream(frameRate);
    
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9,opus',
      videoBitsPerSecond: 2500000,
      audioBitsPerSecond: 128000
    });

    const chunks = [];
    
    recorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      this.downloadRecording(blob);
    };

    recorder.start();
    return recorder;
  }

  downloadRecording(blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `canvas-with-audio-${Date.now()}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
```

### 4.4 Captura de Canvas con Efectos en Tiempo Real

```javascript
class CanvasEffectsRecorder {
  constructor(sourceCanvas) {
    this.sourceCanvas = sourceCanvas;
    this.effectsCanvas = document.createElement('canvas');
    this.effectsCtx = this.effectsCanvas.getContext('2d');
    this.effects = [];
  }

  addEffect(effectFunction) {
    this.effects.push(effectFunction);
  }

  setupEffectsCanvas() {
    this.effectsCanvas.width = this.sourceCanvas.width;
    this.effectsCanvas.height = this.sourceCanvas.height;
  }

  applyEffects() {
    // Copiar contenido original
    this.effectsCtx.drawImage(this.sourceCanvas, 0, 0);
    
    // Aplicar efectos secuencialmente
    this.effects.forEach(effect => {
      effect(this.effectsCtx, this.effectsCanvas.width, this.effectsCanvas.height);
    });
  }

  startRecordingWithEffects(frameRate = 30) {
    this.setupEffectsCanvas();
    
    // Aplicar efectos en cada frame
    const applyEffectsLoop = () => {
      this.applyEffects();
      requestAnimationFrame(applyEffectsLoop);
    };
    applyEffectsLoop();

    // Grabar el canvas con efectos
    const stream = this.effectsCanvas.captureStream(frameRate);
    
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });

    const chunks = [];
    recorder.ondataavailable = event => chunks.push(event.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      this.downloadRecording(blob);
    };

    recorder.start();
    return recorder;
  }

  // Ejemplo de efecto: filtro de desenfoque
  static blurEffect(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Aplicar filtro básico de desenfoque
    for (let i = 0; i < data.length; i += 4) {
      if (i > width * 4 && i < data.length - width * 4) {
        data[i] = (data[i] + data[i - 4] + data[i + 4]) / 3;     // Red
        data[i + 1] = (data[i + 1] + data[i - 3] + data[i + 5]) / 3; // Green
        data[i + 2] = (data[i + 2] + data[i - 2] + data[i + 6]) / 3; // Blue
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }
}
```

### 4.5 Limitaciones del Canvas Recording

**Limitaciones de Seguridad:**
- Canvas "tainted" por contenido cross-origin no se puede grabar
- Políticas CORS afectan la captura
- Contenido de video/imagen externa requiere configuración específica

**Limitaciones de Performance:**
- Alto frameRate puede impactar el rendimiento
- Efectos complejos aumentan la carga de CPU
- Memoria limitada para canvas grandes

## 5. WebRTC y Streaming

### 5.1 Descripción General

WebRTC no solo permite la comunicación peer-to-peer, sino que también proporciona APIs fundamentales para la captura y manipulación de streams de medios. Las funciones `getUserMedia()` y `getDisplayMedia()` son parte del ecosistema WebRTC.

### 5.2 Captura Híbrida: Cámara + Pantalla

```javascript
class HybridRecorder {
  constructor() {
    this.cameraStream = null;
    this.screenStream = null;
    this.combinedStream = null;
    this.recorder = null;
  }

  async initializeCameraAndScreen() {
    try {
      // Obtener stream de cámara
      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });

      // Obtener stream de pantalla
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });

      return { camera: this.cameraStream, screen: this.screenStream };
    } catch (error) {
      console.error('Error inicializando streams:', error);
      throw error;
    }
  }

  createPictureInPictureCanvas() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Configurar tamaño del canvas (pantalla principal)
    canvas.width = 1920;
    canvas.height = 1080;

    // Crear elementos de video para cada stream
    const screenVideo = document.createElement('video');
    const cameraVideo = document.createElement('video');
    
    screenVideo.srcObject = this.screenStream;
    cameraVideo.srcObject = this.cameraStream;
    
    screenVideo.play();
    cameraVideo.play();

    // Función de renderizado
    const render = () => {
      // Dibujar pantalla completa
      ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
      
      // Dibujar cámara en esquina (picture-in-picture)
      const pipWidth = 320;
      const pipHeight = 240;
      const pipX = canvas.width - pipWidth - 20;
      const pipY = 20;
      
      // Borde para la cámara
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.strokeRect(pipX - 2, pipY - 2, pipWidth + 4, pipHeight + 4);
      
      // Dibujar video de cámara
      ctx.drawImage(cameraVideo, pipX, pipY, pipWidth, pipHeight);
      
      requestAnimationFrame(render);
    };

    // Esperar a que los videos estén listos
    Promise.all([
      new Promise(resolve => screenVideo.onloadedmetadata = resolve),
      new Promise(resolve => cameraVideo.onloadedmetadata = resolve)
    ]).then(() => {
      render();
    });

    return canvas;
  }

  async startHybridRecording() {
    await this.initializeCameraAndScreen();
    const compositeCanvas = this.createPictureInPictureCanvas();
    
    // Obtener stream del canvas compuesto
    const canvasStream = compositeCanvas.captureStream(30);
    
    // Agregar audio de ambas fuentes
    this.combinedStream = new MediaStream();
    
    // Video del canvas compuesto
    canvasStream.getVideoTracks().forEach(track => {
      this.combinedStream.addTrack(track);
    });
    
    // Audio de la cámara
    this.cameraStream.getAudioTracks().forEach(track => {
      this.combinedStream.addTrack(track);
    });
    
    // Audio de la pantalla (si está disponible)
    this.screenStream.getAudioTracks().forEach(track => {
      this.combinedStream.addTrack(track);
    });

    // Configurar grabador
    this.recorder = new MediaRecorder(this.combinedStream, {
      mimeType: 'video/webm;codecs=vp9,opus',
      videoBitsPerSecond: 3000000,
      audioBitsPerSecond: 128000
    });

    const chunks = [];
    this.recorder.ondataavailable = event => chunks.push(event.data);
    this.recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      this.downloadRecording(blob);
    };

    this.recorder.start();
    return this.recorder;
  }

  stopRecording() {
    if (this.recorder) {
      this.recorder.stop();
    }
    
    // Limpiar streams
    [this.cameraStream, this.screenStream].forEach(stream => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    });
  }

  downloadRecording(blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hybrid-recording-${Date.now()}.webm`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
```

### 5.3 Streaming P2P con Grabación

```javascript
class P2PRecorder {
  constructor() {
    this.localStream = null;
    this.peerConnection = null;
    this.recorder = null;
    this.dataChannel = null;
  }

  async setupPeerConnection(signalingServer) {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    this.peerConnection = new RTCPeerConnection(configuration);
    
    // Configurar data channel para metadatos
    this.dataChannel = this.peerConnection.createDataChannel('recording-metadata');
    
    this.dataChannel.onopen = () => {
      console.log('Canal de datos abierto');
    };

    // Manejar stream remoto
    this.peerConnection.ontrack = (event) => {
      console.log('Stream remoto recibido');
      this.startRecordingRemoteStream(event.streams[0]);
    };

    return this.peerConnection;
  }

  async startLocalStreamAndRecord() {
    // Obtener stream local (pantalla + audio)
    this.localStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    });

    // Agregar tracks al peer connection
    this.localStream.getTracks().forEach(track => {
      this.peerConnection.addTrack(track, this.localStream);
    });

    // Iniciar grabación local
    this.startRecordingLocalStream();

    return this.localStream;
  }

  startRecordingLocalStream() {
    this.recorder = new MediaRecorder(this.localStream, {
      mimeType: 'video/webm;codecs=vp9,opus'
    });

    const chunks = [];
    this.recorder.ondataavailable = event => {
      chunks.push(event.data);
      
      // Enviar metadatos a través del data channel
      if (this.dataChannel && this.dataChannel.readyState === 'open') {
        this.dataChannel.send(JSON.stringify({
          type: 'chunk-metadata',
          size: event.data.size,
          timestamp: Date.now()
        }));
      }
    };

    this.recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      this.saveRecording(blob, 'local');
    };

    this.recorder.start(1000); // Chunks cada segundo
  }

  startRecordingRemoteStream(remoteStream) {
    const remoteRecorder = new MediaRecorder(remoteStream, {
      mimeType: 'video/webm;codecs=vp9,opus'
    });

    const remoteChunks = [];
    remoteRecorder.ondataavailable = event => {
      remoteChunks.push(event.data);
    };

    remoteRecorder.onstop = () => {
      const blob = new Blob(remoteChunks, { type: 'video/webm' });
      this.saveRecording(blob, 'remote');
    };

    remoteRecorder.start(1000);
    this.remoteRecorder = remoteRecorder;
  }

  stopAllRecording() {
    if (this.recorder) {
      this.recorder.stop();
    }
    
    if (this.remoteRecorder) {
      this.remoteRecorder.stop();
    }
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
  }

  saveRecording(blob, type) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}-recording-${Date.now()}.webm`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
```

## 6. Tecnologías Complementarias

### 6.1 Web Workers para Procesamiento Pesado

```javascript
// main.js - Hilo principal
class WorkerBasedRecorder {
  constructor() {
    this.worker = new Worker('/js/recording-worker.js');
    this.chunks = [];
    this.isProcessing = false;
  }

  async startRecording() {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    });

    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9,opus'
    });

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        // Enviar chunk al worker para procesamiento
        this.worker.postMessage({
          type: 'process-chunk',
          chunk: event.data,
          timestamp: Date.now()
        });
      }
    };

    // Escuchar respuestas del worker
    this.worker.onmessage = (event) => {
      const { type, data } = event.data;
      
      switch (type) {
        case 'chunk-processed':
          this.chunks.push(data.processedChunk);
          break;
        case 'processing-complete':
          this.finalizeRecording();
          break;
        case 'error':
          console.error('Error en worker:', data.error);
          break;
      }
    };

    recorder.start(100);
    return recorder;
  }

  finalizeRecording() {
    // Combinar chunks procesados
    const finalBlob = new Blob(this.chunks, { type: 'video/webm' });
    this.downloadRecording(finalBlob);
  }
}
```

```javascript
// recording-worker.js - Web Worker
class RecordingProcessor {
  constructor() {
    this.processedChunks = [];
    this.compressionLevel = 0.8;
  }

  async processChunk(chunk, timestamp) {
    try {
      // Procesar chunk (comprimir, aplicar filtros, etc.)
      const arrayBuffer = await chunk.arrayBuffer();
      
      // Simulación de procesamiento pesado
      const processedData = this.compressData(arrayBuffer);
      
      // Crear nuevo blob con datos procesados
      const processedChunk = new Blob([processedData], { type: chunk.type });
      
      return {
        processedChunk,
        originalSize: chunk.size,
        compressedSize: processedChunk.size,
        timestamp
      };
    } catch (error) {
      throw new Error(`Error procesando chunk: ${error.message}`);
    }
  }

  compressData(arrayBuffer) {
    // Implementar algoritmo de compresión
    // Por simplicidad, retornamos los datos originales
    return arrayBuffer;
  }

  async batchProcess(chunks) {
    const results = [];
    
    for (const chunk of chunks) {
      const result = await this.processChunk(chunk.data, chunk.timestamp);
      results.push(result);
    }
    
    return results;
  }
}

const processor = new RecordingProcessor();

self.onmessage = async (event) => {
  const { type, chunk, timestamp, chunks } = event.data;
  
  try {
    switch (type) {
      case 'process-chunk':
        const result = await processor.processChunk(chunk, timestamp);
        self.postMessage({
          type: 'chunk-processed',
          data: result
        });
        break;
        
      case 'batch-process':
        const batchResults = await processor.batchProcess(chunks);
        self.postMessage({
          type: 'batch-processed',
          data: batchResults
        });
        break;
        
      case 'finalize':
        self.postMessage({
          type: 'processing-complete'
        });
        break;
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      data: { error: error.message }
    });
  }
};
```

### 6.2 WebAssembly para Codificación Optimizada

```javascript
class WASMVideoProcessor {
  constructor() {
    this.wasmModule = null;
    this.initialized = false;
  }

  async initializeWASM() {
    try {
      // Cargar módulo WASM (ejemplo con FFmpeg.wasm)
      const { createFFmpeg, fetchFile } = FFmpeg;
      this.wasmModule = createFFmpeg({
        log: true,
        corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
      });
      
      await this.wasmModule.load();
      this.initialized = true;
      
      return true;
    } catch (error) {
      console.error('Error inicializando WASM:', error);
      return false;
    }
  }

  async processVideoWithWASM(videoBlob, options = {}) {
    if (!this.initialized) {
      await this.initializeWASM();
    }

    const inputName = 'input.webm';
    const outputName = `output.${options.format || 'mp4'}`;

    try {
      // Escribir archivo de entrada
      this.wasmModule.FS('writeFile', inputName, await fetchFile(videoBlob));

      // Construir comando FFmpeg
      const command = this.buildFFmpegCommand(inputName, outputName, options);
      
      // Ejecutar conversión
      await this.wasmModule.run(...command);

      // Leer archivo de salida
      const data = this.wasmModule.FS('readFile', outputName);
      
      // Limpiar archivos temporales
      this.wasmModule.FS('unlink', inputName);
      this.wasmModule.FS('unlink', outputName);

      return new Blob([data.buffer], { 
        type: `video/${options.format || 'mp4'}` 
      });
    } catch (error) {
      console.error('Error procesando video con WASM:', error);
      throw error;
    }
  }

  buildFFmpegCommand(input, output, options) {
    const command = ['-i', input];

    // Configurar codec de video
    if (options.videoCodec) {
      command.push('-c:v', options.videoCodec);
    }

    // Configurar bitrate
    if (options.videoBitrate) {
      command.push('-b:v', options.videoBitrate);
    }

    // Configurar resolución
    if (options.scale) {
      command.push('-vf', `scale=${options.scale}`);
    }

    // Configurar codec de audio
    if (options.audioCodec) {
      command.push('-c:a', options.audioCodec);
    }

    // Configurar preset de calidad
    if (options.preset) {
      command.push('-preset', options.preset);
    }

    command.push(output);
    return command;
  }

  async convertToMultipleFormats(videoBlob) {
    const formats = [
      { format: 'mp4', videoCodec: 'libx264', preset: 'fast' },
      { format: 'webm', videoCodec: 'libvpx-vp9' },
      { format: 'mov', videoCodec: 'libx264', scale: '1280:720' }
    ];

    const results = {};

    for (const formatConfig of formats) {
      try {
        console.log(`Convirtiendo a ${formatConfig.format}...`);
        const convertedBlob = await this.processVideoWithWASM(videoBlob, formatConfig);
        results[formatConfig.format] = convertedBlob;
      } catch (error) {
        console.error(`Error convirtiendo a ${formatConfig.format}:`, error);
        results[formatConfig.format] = null;
      }
    }

    return results;
  }
}
```

### 6.3 MutationObserver para Cambios del DOM

```javascript
class DOMChangeRecorder {
  constructor() {
    this.observer = null;
    this.changes = [];
    this.isRecording = false;
    this.startTime = null;
  }

  startRecording(targetElement = document.body) {
    this.changes = [];
    this.isRecording = true;
    this.startTime = Date.now();

    const config = {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      characterData: true,
      characterDataOldValue: true
    };

    this.observer = new MutationObserver((mutations) => {
      if (this.isRecording) {
        this.processMutations(mutations);
      }
    });

    this.observer.observe(targetElement, config);
    console.log('Grabación de cambios DOM iniciada');
  }

  processMutations(mutations) {
    const timestamp = Date.now() - this.startTime;

    mutations.forEach((mutation) => {
      const change = {
        timestamp,
        type: mutation.type,
        target: this.getElementSelector(mutation.target)
      };

      switch (mutation.type) {
        case 'childList':
          change.addedNodes = Array.from(mutation.addedNodes).map(node => ({
            nodeType: node.nodeType,
            nodeName: node.nodeName,
            textContent: node.textContent,
            selector: this.getElementSelector(node)
          }));
          
          change.removedNodes = Array.from(mutation.removedNodes).map(node => ({
            nodeType: node.nodeType,
            nodeName: node.nodeName,
            textContent: node.textContent
          }));
          break;

        case 'attributes':
          change.attributeName = mutation.attributeName;
          change.oldValue = mutation.oldValue;
          change.newValue = mutation.target.getAttribute(mutation.attributeName);
          break;

        case 'characterData':
          change.oldValue = mutation.oldValue;
          change.newValue = mutation.target.textContent;
          break;
      }

      this.changes.push(change);
    });
  }

  getElementSelector(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    const path = [];
    while (element && element !== document.body) {
      let selector = element.nodeName.toLowerCase();
      
      if (element.id) {
        selector += `#${element.id}`;
        path.unshift(selector);
        break;
      }
      
      if (element.className) {
        const classes = element.className.split(' ').filter(cls => cls.trim());
        if (classes.length > 0) {
          selector += `.${classes.join('.')}`;
        }
      }
      
      // Agregar índice si hay hermanos del mismo tipo
      const siblings = Array.from(element.parentNode?.children || [])
        .filter(sibling => sibling.nodeName === element.nodeName);
      
      if (siblings.length > 1) {
        const index = siblings.indexOf(element) + 1;
        selector += `:nth-child(${index})`;
      }
      
      path.unshift(selector);
      element = element.parentElement;
    }

    return path.join(' > ');
  }

  stopRecording() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.isRecording = false;
    
    console.log(`Grabación detenida. ${this.changes.length} cambios registrados.`);
    return this.changes;
  }

  exportChanges(format = 'json') {
    const data = {
      metadata: {
        totalChanges: this.changes.length,
        duration: this.changes.length > 0 ? 
          this.changes[this.changes.length - 1].timestamp : 0,
        recordingDate: new Date().toISOString()
      },
      changes: this.changes
    };

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      
      case 'csv':
        return this.convertToCSV(this.changes);
      
      default:
        return data;
    }
  }

  convertToCSV(changes) {
    const headers = ['timestamp', 'type', 'target', 'details'];
    const rows = changes.map(change => [
      change.timestamp,
      change.type,
      change.target || '',
      JSON.stringify({
        attributeName: change.attributeName,
        oldValue: change.oldValue,
        newValue: change.newValue,
        addedNodes: change.addedNodes,
        removedNodes: change.removedNodes
      })
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  playbackChanges(targetElement, speed = 1) {
    if (this.changes.length === 0) {
      console.warn('No hay cambios para reproducir');
      return;
    }

    let currentIndex = 0;
    const playNextChange = () => {
      if (currentIndex >= this.changes.length) {
        console.log('Reproducción completada');
        return;
      }

      const change = this.changes[currentIndex];
      this.applyChange(change, targetElement);
      
      currentIndex++;
      
      // Calcular tiempo hasta el próximo cambio
      const nextChange = this.changes[currentIndex];
      const delay = nextChange ? 
        (nextChange.timestamp - change.timestamp) / speed : 0;
      
      if (delay > 0) {
        setTimeout(playNextChange, delay);
      } else {
        playNextChange();
      }
    };

    playNextChange();
  }

  applyChange(change, targetElement) {
    const element = targetElement.querySelector(change.target);
    
    if (!element) {
      console.warn(`Elemento no encontrado: ${change.target}`);
      return;
    }

    switch (change.type) {
      case 'attributes':
        if (change.newValue !== null) {
          element.setAttribute(change.attributeName, change.newValue);
        } else {
          element.removeAttribute(change.attributeName);
        }
        break;

      case 'characterData':
        element.textContent = change.newValue;
        break;

      case 'childList':
        // Nota: La reproducción de cambios de childList es compleja
        // y requiere recrear los nodos basándose en la información guardada
        console.log('Aplicando cambio de childList:', change);
        break;
    }
  }
}
```

### 6.4 RequestAnimationFrame para Captura Fluida

```javascript
class SmoothCaptureRecorder {
  constructor() {
    this.isCapturing = false;
    this.frames = [];
    this.startTime = null;
    this.targetFPS = 60;
    this.canvas = null;
    this.context = null;
  }

  initializeCanvas(width = 1920, height = 1080) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.context = this.canvas.getContext('2d');
    
    // Configurar calidad de renderizado
    this.context.imageSmoothingEnabled = true;
    this.context.imageSmoothingQuality = 'high';
    
    return this.canvas;
  }

  async startSmoothCapture(sourceElement, options = {}) {
    const {
      fps = 60,
      duration = null,
      includeAudio = false,
      captureMode = 'element' // 'element', 'screen', 'region'
    } = options;

    this.targetFPS = fps;
    this.isCapturing = true;
    this.frames = [];
    this.startTime = performance.now();

    // Inicializar canvas para composición
    this.initializeCanvas(
      options.width || sourceElement.offsetWidth,
      options.height || sourceElement.offsetHeight
    );

    // Configurar stream de salida
    const outputStream = this.canvas.captureStream(fps);
    
    // Agregar audio si se solicita
    if (includeAudio) {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true
        });
        
        audioStream.getAudioTracks().forEach(track => {
          outputStream.addTrack(track);
        });
      } catch (error) {
        console.warn('No se pudo capturar audio:', error);
      }
    }

    // Iniciar loop de captura
    this.captureLoop(sourceElement, captureMode);

    // Configurar grabador
    const recorder = new MediaRecorder(outputStream, {
      mimeType: 'video/webm;codecs=vp9,opus',
      videoBitsPerSecond: 2500000
    });

    const chunks = [];
    recorder.ondataavailable = event => chunks.push(event.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      this.downloadRecording(blob);
    };

    // Detener automáticamente si se especifica duración
    if (duration) {
      setTimeout(() => {
        this.stopCapture();
        recorder.stop();
      }, duration);
    }

    recorder.start();
    return { recorder, outputStream };
  }

  captureLoop(sourceElement, captureMode) {
    if (!this.isCapturing) return;

    const currentTime = performance.now();
    const elapsed = currentTime - this.startTime;
    
    // Calcular frame esperado basado en FPS objetivo
    const expectedFrame = Math.floor(elapsed * this.targetFPS / 1000);
    
    if (expectedFrame > this.frames.length) {
      this.captureFrame(sourceElement, captureMode, elapsed);
    }

    requestAnimationFrame(() => this.captureLoop(sourceElement, captureMode));
  }

  captureFrame(sourceElement, captureMode, timestamp) {
    try {
      switch (captureMode) {
        case 'element':
          this.captureElementFrame(sourceElement);
          break;
        case 'screen':
          this.captureScreenFrame();
          break;
        case 'region':
          this.captureRegionFrame(sourceElement);
          break;
      }

      this.frames.push({
        timestamp,
        frameNumber: this.frames.length
      });
    } catch (error) {
      console.error('Error capturando frame:', error);
    }
  }

  captureElementFrame(element) {
    // Limpiar canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Usar html2canvas para capturar elemento DOM
    // Nota: Esto requiere la librería html2canvas
    if (typeof html2canvas !== 'undefined') {
      html2canvas(element, {
        canvas: this.canvas,
        useCORS: true,
        allowTaint: false,
        scale: 1,
        logging: false
      }).catch(error => {
        console.error('Error con html2canvas:', error);
      });
    } else {
      // Fallback: dibujar información básica del elemento
      this.context.fillStyle = '#f0f0f0';
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.context.fillStyle = '#333';
      this.context.font = '20px Arial';
      this.context.fillText(
        `Elemento: ${element.tagName}`,
        50, 50
      );
      this.context.fillText(
        `Tiempo: ${Date.now()}`,
        50, 80
      );
    }
  }

  async captureScreenFrame() {
    // Para captura de pantalla, necesitamos usar getDisplayMedia
    if (!this.screenStream) {
      try {
        this.screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        
        this.screenVideo = document.createElement('video');
        this.screenVideo.srcObject = this.screenStream;
        this.screenVideo.play();
      } catch (error) {
        console.error('Error obteniendo stream de pantalla:', error);
        return;
      }
    }

    // Dibujar video de pantalla en canvas
    if (this.screenVideo && this.screenVideo.readyState >= 2) {
      this.context.drawImage(
        this.screenVideo,
        0, 0,
        this.canvas.width,
        this.canvas.height
      );
    }
  }

  captureRegionFrame(regionElement) {
    // Capturar una región específica
    const rect = regionElement.getBoundingClientRect();
    
    // Crear un canvas temporal para la región
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = rect.width;
    tempCanvas.height = rect.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Capturar contenido de la región (simplificado)
    tempCtx.fillStyle = '#e0e0e0';
    tempCtx.fillRect(0, 0, rect.width, rect.height);
    
    // Dibujar información de la región
    tempCtx.fillStyle = '#333';
    tempCtx.font = '16px Arial';
    tempCtx.fillText(`Región: ${rect.width}x${rect.height}`, 10, 30);
    
    // Copiar al canvas principal
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(
      tempCanvas,
      0, 0,
      this.canvas.width,
      this.canvas.height
    );
  }

  stopCapture() {
    this.isCapturing = false;
    
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }
    
    console.log(`Captura detenida. ${this.frames.length} frames capturados.`);
  }

  downloadRecording(blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smooth-recording-${Date.now()}.webm`;
    link.click();
    URL.revokeObjectURL(url);
  }

  getFrameStatistics() {
    if (this.frames.length === 0) return null;

    const totalDuration = this.frames[this.frames.length - 1].timestamp;
    const actualFPS = this.frames.length / (totalDuration / 1000);
    
    return {
      totalFrames: this.frames.length,
      duration: totalDuration,
      targetFPS: this.targetFPS,
      actualFPS: actualFPS.toFixed(2),
      efficiency: ((actualFPS / this.targetFPS) * 100).toFixed(1) + '%'
    };
  }
}
```

## 7. Comparación y Matriz de Decisión

### 7.1 Tabla Comparativa de Técnicas

| Característica | Screen Capture API | MediaRecorder API | Canvas Recording | WebRTC Streaming | Web Workers |
|---|---|---|---|---|---|
| **Facilidad de Implementación** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| **Control de Calidad** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Performance** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Compatibilidad Navegadores** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Soporte Móvil** | ⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Captura de Audio** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | N/A |
| **Tiempo Real** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Personalización** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

### 7.2 Casos de Uso Recomendados

#### Screen Capture API
- **Ideal para:** Tutoriales, demostraciones de software, soporte técnico
- **Ventajas:** Implementación simple, selección de usuario, audio del sistema
- **Limitaciones:** No disponible en móviles, control limitado de región

#### MediaRecorder API
- **Ideal para:** Grabación de cualquier MediaStream, control de calidad
- **Ventajas:** Múltiples formatos, control de bitrate, fragmentación temporal
- **Limitaciones:** Formatos limitados según navegador

#### Canvas Recording
- **Ideal para:** Aplicaciones gráficas, juegos, visualizaciones dinámicas
- **Ventajas:** Control total del contenido, efectos en tiempo real
- **Limitaciones:** Requiere redibujado manual, mayor complejidad

#### WebRTC + Recording
- **Ideal para:** Videoconferencias, colaboración remota, streaming
- **Ventajas:** Comunicación P2P, streaming de baja latencia
- **Limitaciones:** Configuración compleja, requerimientos de red

#### Web Workers + WASM
- **Ideal para:** Procesamiento pesado, conversión de formatos, efectos complejos
- **Ventajas:** Performance optimizada, no bloquea UI
- **Limitaciones:** Complejidad de implementación, transferencia de datos

### 7.3 Matriz de Decisión por Escenario

```javascript
const DecisionMatrix = {
  scenarios: {
    "Tutorial de Software": {
      recommended: "Screen Capture API + MediaRecorder",
      alternatives: ["Canvas Recording"],
      reasoning: "Simplicidad de implementación, captura de pantalla completa con audio"
    },
    
    "Juego Web": {
      recommended: "Canvas Recording + Web Workers",
      alternatives: ["Screen Capture API"],
      reasoning: "Control total del contenido, performance optimizada"
    },
    
    "Videoconferencia": {
      recommended: "WebRTC + MediaRecorder",
      alternatives: ["Screen Capture API"],
      reasoning: "Streaming en tiempo real, comunicación bidireccional"
    },
    
    "Editor Gráfico": {
      recommended: "Canvas Recording + MutationObserver",
      alternatives: ["Screen Capture API"],
      reasoning: "Captura de cambios específicos, control de contenido"
    },
    
    "Monitoreo UX": {
      recommended: "MutationObserver + RequestAnimationFrame",
      alternatives: ["Screen Capture API"],
      reasoning: "Captura de interacciones específicas, menor overhead"
    },
    
    "Aplicación Móvil": {
      recommended: "Canvas Recording + MutationObserver",
      alternatives: ["MediaRecorder con getUserMedia"],
      reasoning: "Screen Capture API no disponible en móviles"
    }
  },

  getRecommendation(scenario, constraints = {}) {
    const scenarioConfig = this.scenarios[scenario];
    if (!scenarioConfig) {
      return this.getGenericRecommendation(constraints);
    }

    // Aplicar restricciones
    let recommendation = scenarioConfig.recommended;
    
    if (constraints.mobile && recommendation.includes("Screen Capture")) {
      recommendation = scenarioConfig.alternatives[0] || "Canvas Recording";
    }
    
    if (constraints.performance === "high" && !recommendation.includes("Web Workers")) {
      recommendation += " + Web Workers";
    }
    
    if (constraints.quality === "high" && !recommendation.includes("WASM")) {
      recommendation += " + WebAssembly";
    }

    return {
      primary: recommendation,
      alternatives: scenarioConfig.alternatives,
      reasoning: scenarioConfig.reasoning,
      constraints: constraints
    };
  },

  getGenericRecommendation(constraints) {
    const recommendations = [];
    
    if (constraints.mobile) {
      recommendations.push("Canvas Recording");
    } else {
      recommendations.push("Screen Capture API");
    }
    
    recommendations.push("MediaRecorder API");
    
    if (constraints.performance === "high") {
      recommendations.push("Web Workers");
    }
    
    if (constraints.quality === "high") {
      recommendations.push("WebAssembly");
    }

    return {
      primary: recommendations.join(" + "),
      alternatives: ["MutationObserver", "RequestAnimationFrame"],
      reasoning: "Configuración genérica basada en restricciones",
      constraints: constraints
    };
  }
};

// Ejemplo de uso:
const recommendation = DecisionMatrix.getRecommendation("Tutorial de Software", {
  mobile: false,
  performance: "medium",
  quality: "high"
});

console.log(recommendation);
// Output: {
//   primary: "Screen Capture API + MediaRecorder + WebAssembly",
//   alternatives: ["Canvas Recording"],
//   reasoning: "Simplicidad de implementación, captura de pantalla completa con audio",
//   constraints: { mobile: false, performance: "medium", quality: "high" }
// }
```

## 8. Limitaciones y Consideraciones de Seguridad

### 8.1 Limitaciones Generales

#### Limitaciones de Navegador
- **Navegadores Móviles:** Screen Capture API no está disponible
- **Safari:** Soporte limitado para algunas características avanzadas
- **Versiones Antiguas:** APIs modernas requieren navegadores actualizados
- **Políticas Corporativas:** Algunos entornos bloquean APIs de captura

#### Limitaciones de Performance
- **Memoria:** Grabaciones largas pueden agotar la memoria del navegador
- **CPU:** Procesamiento de video en tiempo real es intensivo
- **Almacenamiento:** Archivos de video grandes requieren gestión especial
- **Batería:** Grabación intensiva puede agotar la batería en dispositivos móviles

### 8.2 Consideraciones de Seguridad

#### Políticas de Seguridad del Navegador
```javascript
class SecurityManager {
  static checkPermissions() {
    const permissions = {
      displayCapture: false,
      microphone: false,
      camera: false,
      clipboard: false
    };

    // Verificar soporte de APIs
    permissions.displayCapture = 'getDisplayMedia' in navigator.mediaDevices;
    permissions.microphone = 'getUserMedia' in navigator.mediaDevices;
    permissions.camera = 'getUserMedia' in navigator.mediaDevices;

    return permissions;
  }

  static async requestPermissions() {
    const results = {};

    try {
      // Solicitar permiso de pantalla
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });
      displayStream.getTracks().forEach(track => track.stop());
      results.display = 'granted';
    } catch (error) {
      results.display = 'denied';
    }

    try {
      // Solicitar permiso de micrófono
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      audioStream.getTracks().forEach(track => track.stop());
      results.audio = 'granted';
    } catch (error) {
      results.audio = 'denied';
    }

    return results;
  }

  static setupSecurityPolicies() {
    // Configurar Content Security Policy para grabación
    const csp = {
      'media-src': "'self' blob: data:",
      'worker-src': "'self' blob:",
      'script-src': "'self' 'unsafe-inline'",
      'connect-src': "'self' wss: ws:"
    };

    return csp;
  }

  static validateOrigin() {
    // Verificar que la aplicación esté en HTTPS
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      throw new Error('APIs de grabación requieren HTTPS');
    }

    return true;
  }

  static sanitizeRecordingData(blob) {
    // Eliminar metadatos sensibles del archivo
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Crear nuevo blob sin metadatos
        const sanitizedBlob = new Blob([reader.result], {
          type: blob.type
        });
        resolve(sanitizedBlob);
      };
      reader.readAsArrayBuffer(blob);
    });
  }
}
```

#### Gestión de Datos Sensibles
```javascript
class DataProtection {
  constructor() {
    this.encryptionKey = null;
    this.initializeEncryption();
  }

  async initializeEncryption() {
    // Generar clave de encriptación para datos locales
    this.encryptionKey = await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256
      },
      true,
      ["encrypt", "decrypt"]
    );
  }

  async encryptRecording(recordingBlob) {
    const arrayBuffer = await recordingBlob.arrayBuffer();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      this.encryptionKey,
      arrayBuffer
    );

    return {
      data: encryptedData,
      iv: iv,
      type: recordingBlob.type
    };
  }

  async decryptRecording(encryptedData, iv, originalType) {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      this.encryptionKey,
      encryptedData
    );

    return new Blob([decryptedBuffer], { type: originalType });
  }

  // Limpiar datos sensibles de la memoria
  secureCleanup(dataArray) {
    if (dataArray && dataArray.fill) {
      dataArray.fill(0);
    }
  }

  // Generar hash para verificación de integridad
  async generateHash(data) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
```

### 8.3 Privacidad y Cumplimiento

#### Notificaciones de Usuario
```javascript
class PrivacyManager {
  static showRecordingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'recording-indicator';
    indicator.innerHTML = `
      <div style="
        position: fixed;
        top: 10px;
        right: 10px;
        background: #ff4444;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 10000;
        font-family: Arial, sans-serif;
        font-size: 14px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      ">
        🔴 GRABANDO - Esta sesión está siendo grabada
      </div>
    `;
    
    document.body.appendChild(indicator);
    return indicator;
  }

  static hideRecordingIndicator() {
    const indicator = document.getElementById('recording-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  static async requestRecordingConsent() {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10001;
        ">
          <div style="
            background: white;
            padding: 30px;
            border-radius: 10px;
            max-width: 400px;
            text-align: center;
          ">
            <h3>Consentimiento de Grabación</h3>
            <p>Esta aplicación solicitará permisos para grabar su pantalla y audio. 
               Los datos se procesarán localmente y no se enviarán a servidores externos 
               sin su consentimiento explícito.</p>
            <div style="margin-top: 20px;">
              <button id="consent-allow" style="
                background: #4CAF50;
                color: white;
                border: none;
                padding: 10px 20px;
                margin: 0 10px;
                border-radius: 5px;
                cursor: pointer;
              ">Permitir</button>
              <button id="consent-deny" style="
                background: #f44336;
                color: white;
                border: none;
                padding: 10px 20px;
                margin: 0 10px;
                border-radius: 5px;
                cursor: pointer;
              ">Rechazar</button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      modal.querySelector('#consent-allow').onclick = () => {
        modal.remove();
        resolve(true);
      };

      modal.querySelector('#consent-deny').onclick = () => {
        modal.remove();
        resolve(false);
      };
    });
  }

  static logPrivacyEvent(eventType, details) {
    const event = {
      timestamp: new Date().toISOString(),
      type: eventType,
      details: details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Guardar en localStorage para auditoría
    const privacyLog = JSON.parse(localStorage.getItem('privacyLog') || '[]');
    privacyLog.push(event);
    
    // Mantener solo los últimos 100 eventos
    if (privacyLog.length > 100) {
      privacyLog.splice(0, privacyLog.length - 100);
    }
    
    localStorage.setItem('privacyLog', JSON.stringify(privacyLog));
  }
}
```

## 9. Implementación Práctica Completa

### 9.1 Clase Universal de Grabación

```javascript
class UniversalRecorder {
  constructor(options = {}) {
    this.options = {
      preferredMethod: 'auto', // 'auto', 'screen-capture', 'canvas', 'webrtc'
      quality: 'high', // 'low', 'medium', 'high'
      includeAudio: true,
      includeSystemAudio: false,
      format: 'webm',
      frameRate: 30,
      bitRate: 2500000,
      ...options
    };

    this.recorder = null;
    this.stream = null;
    this.isRecording = false;
    this.chunks = [];
    this.startTime = null;
    this.method = null;
  }

  async initialize() {
    // Verificar capacidades del navegador
    const capabilities = await this.checkCapabilities();
    
    // Seleccionar mejor método disponible
    this.method = this.selectBestMethod(capabilities);
    
    // Solicitar consentimiento
    const consent = await PrivacyManager.requestRecordingConsent();
    if (!consent) {
      throw new Error('Usuario no dio consentimiento para grabación');
    }

    console.log(`Inicializando grabador con método: ${this.method}`);
    return this.method;
  }

  async checkCapabilities() {
    const capabilities = {
      screenCapture: 'getDisplayMedia' in navigator.mediaDevices,
      mediaRecorder: 'MediaRecorder' in window,
      canvas: 'HTMLCanvasElement' in window,
      webWorkers: 'Worker' in window,
      webAssembly: 'WebAssembly' in window
    };

    // Verificar formatos soportados
    if (capabilities.mediaRecorder) {
      capabilities.supportedFormats = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/mp4;codecs=h264,aac'
      ].filter(format => MediaRecorder.isTypeSupported(format));
    }

    return capabilities;
  }

  selectBestMethod(capabilities) {
    if (this.options.preferredMethod !== 'auto') {
      return this.options.preferredMethod;
    }

    // Lógica de selección automática
    if (capabilities.screenCapture && !this.isMobile()) {
      return 'screen-capture';
    } else if (capabilities.canvas) {
      return 'canvas';
    } else if (capabilities.mediaRecorder) {
      return 'webrtc';
    } else {
      throw new Error('No hay métodos de grabación disponibles');
    }
  }

  async startRecording(target = null) {
    if (this.isRecording) {
      throw new Error('Ya hay una grabación en progreso');
    }

    try {
      await this.initialize();
      
      // Mostrar indicador de grabación
      PrivacyManager.showRecordingIndicator();
      
      // Inicializar stream según el método
      switch (this.method) {
        case 'screen-capture':
          this.stream = await this.initScreenCapture();
          break;
        case 'canvas':
          this.stream = await this.initCanvasCapture(target);
          break;
        case 'webrtc':
          this.stream = await this.initWebRTCCapture();
          break;
        default:
          throw new Error(`Método no soportado: ${this.method}`);
      }

      // Configurar MediaRecorder
      this.setupRecorder();
      
      // Iniciar grabación
      this.recorder.start(100); // Chunks cada 100ms
      this.isRecording = true;
      this.startTime = Date.now();
      
      // Log del evento de privacidad
      PrivacyManager.logPrivacyEvent('recording-started', {
        method: this.method,
        includeAudio: this.options.includeAudio
      });

      console.log('Grabación iniciada');
      return true;

    } catch (error) {
      console.error('Error iniciando grabación:', error);
      PrivacyManager.hideRecordingIndicator();
      throw error;
    }
  }

  async initScreenCapture() {
    const options = {
      video: {
        frameRate: { ideal: this.options.frameRate }
      },
      audio: this.options.includeAudio || this.options.includeSystemAudio
    };

    return await navigator.mediaDevices.getDisplayMedia(options);
  }

  async initCanvasCapture(canvasElement) {
    if (!canvasElement) {
      // Crear canvas de toda la página
      canvasElement = await this.createPageCanvas();
    }

    const stream = canvasElement.captureStream(this.options.frameRate);

    // Agregar audio si se solicita
    if (this.options.includeAudio) {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true
        });
        
        audioStream.getAudioTracks().forEach(track => {
          stream.addTrack(track);
        });
      } catch (error) {
        console.warn('No se pudo capturar audio:', error);
      }
    }

    return stream;
  }

  async initWebRTCCapture() {
    return await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: this.options.includeAudio
    });
  }

  setupRecorder() {
    const mimeType = this.selectBestMimeType();
    
    const options = {
      mimeType,
      videoBitsPerSecond: this.options.bitRate,
      audioBitsPerSecond: 128000
    };

    this.recorder = new MediaRecorder(this.stream, options);
    
    this.recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };

    this.recorder.onstop = () => {
      this.finalizeRecording();
    };

    this.recorder.onerror = (event) => {
      console.error('Error en grabación:', event.error);
      this.stopRecording();
    };
  }

  selectBestMimeType() {
    const formats = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ];

    return formats.find(format => 
      MediaRecorder.isTypeSupported(format)
    ) || 'video/webm';
  }

  stopRecording() {
    if (!this.isRecording) {
      return false;
    }

    try {
      this.recorder.stop();
      this.isRecording = false;
      
      // Detener todos los tracks
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }

      // Ocultar indicador
      PrivacyManager.hideRecordingIndicator();
      
      // Log del evento
      PrivacyManager.logPrivacyEvent('recording-stopped', {
        duration: Date.now() - this.startTime,
        chunks: this.chunks.length
      });

      console.log('Grabación detenida');
      return true;

    } catch (error) {
      console.error('Error deteniendo grabación:', error);
      return false;
    }
  }

  async finalizeRecording() {
    const blob = new Blob(this.chunks, { type: this.recorder.mimeType });
    
    // Limpiar chunks
    this.chunks = [];
    
    // Procesar grabación según opciones
    const finalBlob = await this.processRecording(blob);
    
    // Descargar automáticamente
    this.downloadRecording(finalBlob);
    
    return finalBlob;
  }

  async processRecording(blob) {
    // Aplicar procesamiento adicional si está configurado
    if (this.options.postProcess) {
      return await this.options.postProcess(blob);
    }
    
    return blob;
  }

  downloadRecording(blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recording-${Date.now()}.${this.options.format}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  async createPageCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const ctx = canvas.getContext('2d');
    
    // Usar html2canvas si está disponible
    if (typeof html2canvas !== 'undefined') {
      const canvasElement = await html2canvas(document.body, {
        canvas: canvas,
        useCORS: true,
        scale: 1
      });
      return canvasElement;
    }
    
    // Fallback básico
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#333333';
    ctx.font = '24px Arial';
    ctx.fillText('Grabación de página', 50, 100);
    
    return canvas;
  }

  isMobile() {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      .test(navigator.userAgent);
  }

  getRecordingInfo() {
    return {
      isRecording: this.isRecording,
      method: this.method,
      duration: this.isRecording ? Date.now() - this.startTime : 0,
      chunks: this.chunks.length,
      options: this.options
    };
  }
}
```

### 9.2 Ejemplo de Uso Completo

```javascript
// Inicialización y uso de la clase universal
async function demoRecording() {
  const recorder = new UniversalRecorder({
    quality: 'high',
    includeAudio: true,
    includeSystemAudio: true,
    frameRate: 30,
    format: 'webm'
  });

  try {
    // Inicializar
    const method = await recorder.initialize();
    console.log(`Método seleccionado: ${method}`);

    // Botones de control
    const startBtn = document.getElementById('start-recording');
    const stopBtn = document.getElementById('stop-recording');
    const statusDiv = document.getElementById('recording-status');

    startBtn.onclick = async () => {
      try {
        await recorder.startRecording();
        startBtn.disabled = true;
        stopBtn.disabled = false;
        
        // Actualizar estado cada segundo
        const statusInterval = setInterval(() => {
          const info = recorder.getRecordingInfo();
          statusDiv.textContent = `Grabando: ${Math.floor(info.duration / 1000)}s - Chunks: ${info.chunks}`;
        }, 1000);

        stopBtn.onclick = () => {
          recorder.stopRecording();
          clearInterval(statusInterval);
          startBtn.disabled = false;
          stopBtn.disabled = true;
          statusDiv.textContent = 'Grabación completada';
        };

      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    };

  } catch (error) {
    console.error('Error inicializando:', error);
    alert(`No se pudo inicializar la grabación: ${error.message}`);
  }
}

// Ejecutar cuando la página esté cargada
document.addEventListener('DOMContentLoaded', demoRecording);
```

## 10. Conclusiones y Recomendaciones

### 10.1 Resumen de Hallazgos Clave

Las técnicas modernas de screen recording en el frontend han alcanzado un nivel de madurez que permite implementar soluciones robustas usando exclusivamente tecnologías nativas del navegador. Los principales hallazgos incluyen:

1. **Screen Capture API** se ha consolidado como la solución estándar para captura de pantalla, ofreciendo simplicidad de implementación y buena integración con MediaRecorder API.

2. **MediaRecorder API** proporciona control granular sobre la calidad y formato de grabación, siendo esencial para cualquier implementación profesional.

3. **Canvas Recording** ofrece la máxima flexibilidad para contenido gráfico dinámico, permitiendo efectos en tiempo real y control total del contenido capturado.

4. **Web Workers y WebAssembly** son fundamentales para optimizar el rendimiento en aplicaciones que requieren procesamiento intensivo de video.

5. **Las limitaciones de compatibilidad móvil** siguen siendo un factor crítico que debe considerarse en el diseño de aplicaciones.

### 10.2 Recomendaciones Estratégicas

#### Para Desarrolladores
1. **Implementar detección de capacidades** antes de seleccionar la técnica de grabación
2. **Usar una arquitectura modular** que permita cambiar entre técnicas según las capacidades del navegador
3. **Considerar el rendimiento** desde el diseño, especialmente para sesiones de grabación largas
4. **Implementar medidas de seguridad** y privacidad desde el inicio del desarrollo

#### Para Aplicaciones Empresariales
1. **Screen Capture API + MediaRecorder** para la mayoría de casos de uso corporativos
2. **Implementar políticas de consentimiento** claras y conformes con regulaciones de privacidad
3. **Considerar soluciones híbridas** que combinen múltiples técnicas según el contexto
4. **Planificar para escalabilidad** considerando el almacenamiento y procesamiento de grandes volúmenes de grabaciones

#### Para Aplicaciones Móviles
1. **Canvas Recording** como técnica principal debido a limitaciones de Screen Capture API
2. **MutationObserver** para capturar interacciones específicas del usuario
3. **Optimización agresiva** para preservar batería y rendimiento
4. **Interfaces táctiles** adaptadas para controles de grabación

### 10.3 Tendencias Futuras

Las tecnologías de grabación en el frontend continuarán evolucionando hacia:

1. **Mayor integración con IA** para análisis automático de contenido grabado
2. **Mejores capacidades de streaming** en tiempo real
3. **Soporte nativo para realidad aumentada** y contenido 3D
4. **Optimizaciones de hardware** aprovechando GPUs para procesamiento de video
5. **Estándares de privacidad más estrictos** que requerirán implementaciones más sofisticadas

## 11. Recursos Adicionales

### 11.1 APIs y Especificaciones
- [Screen Capture API Specification](https://w3c.github.io/mediacapture-screen-share/)
- [MediaStream Recording API](https://w3c.github.io/mediacapture-record/)
- [WebRTC Specification](https://webrtc.org/getting-started/overview)
- [Canvas API Reference](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

### 11.2 Librerías y Herramientas
- [RecordRTC](https://recordrtc.org/) - Librería completa para grabación
- [html2canvas](https://html2canvas.hertzen.com/) - Captura de elementos DOM
- [FFmpeg.wasm](https://ffmpegwasm.netlify.app/) - Procesamiento de video con WebAssembly
- [MediaRecorder-API-Polyfill](https://github.com/ai/audio-recorder-polyfill) - Polyfill para navegadores antiguos

### 11.3 Ejemplos y Demos
- [WebRTC Samples](https://webrtc.github.io/samples/) - Ejemplos oficiales de WebRTC
- [MDN MediaStream Examples](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API)
- [Screen Recording Demo](https://github.com/muaz-khan/RecordRTC) - Implementaciones de referencia

---

*Documento generado por MiniMax Agent - Análisis técnico actualizado al 17 de agosto de 2025*