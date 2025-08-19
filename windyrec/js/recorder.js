// js/recorder.js - Gestión de grabación de pantalla y video

/**
 * Clase principal para gestión de grabación de pantalla
 */
class ScreenRecorder {
  constructor() {
    this.supportedMimeTypes = this.getSupportedMimeTypes();
    this.isSupported = this.checkSupport();
  }

  /**
   * Verifica soporte del navegador para las APIs necesarias
   */
  checkSupport() {
    const hasGetDisplayMedia = navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia;
    const hasMediaRecorder = window.MediaRecorder;
    
    if (!hasGetDisplayMedia) {
      console.error('Screen Capture API no está soportada');
      return false;
    }
    
    if (!hasMediaRecorder) {
      console.error('MediaRecorder API no está soportada');
      return false;
    }
    
    return true;
  }

  /**
   * Obtiene los tipos MIME soportados por el navegador
   */
  getSupportedMimeTypes() {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/mp4;codecs=h264,aac',
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/webm'
    ];

    return types.filter(type => MediaRecorder.isTypeSupported(type));
  }

  /**
   * Configura las opciones de captura de pantalla
   */
  getDisplayMediaOptions() {
    const qualitySettings = StateManager.getCurrentQualitySettings();
    const includeAudio = AppState.settings.includeAudio;

    const options = {
      video: {
        displaySurface: "browser",
        preferCurrentTab: false,
        selfBrowserSurface: "exclude",
        monitorTypeSurfaces: "include",
        ...qualitySettings
      },
      surfaceSwitching: "include"
    };

    if (includeAudio) {
      options.audio = {
        suppressLocalAudioPlayback: false,
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
        systemAudio: "include"
      };
    }

    return options;
  }

  /**
   * Inicia la captura de pantalla
   */
  async startCapture() {
    if (!this.isSupported) {
      throw new Error('Las APIs de grabación no están soportadas en este navegador');
    }

    try {
      const options = this.getDisplayMediaOptions();
      console.log('Iniciando captura con opciones:', options);
      
      const stream = await navigator.mediaDevices.getDisplayMedia(options);
      
      // Configurar el stream
      this.setupStreamEventHandlers(stream);
      StateManager.setMediaStream(stream);
      
      // Configurar MediaRecorder
      this.setupMediaRecorder(stream);
      
      return stream;
      
    } catch (error) {
      this.handleCaptureError(error);
      throw error;
    }
  }

  /**
   * Configura los event handlers del stream
   */
  setupStreamEventHandlers(stream) {
    // Detectar cuando el usuario detiene la compartición desde el navegador
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.addEventListener('ended', () => {
        console.log('Usuario detuvo la compartición de pantalla');
        RecorderManager.stopRecording();
      });
    }

    // Log de información del stream
    console.log('Stream configurado:', {
      videoTracks: stream.getVideoTracks().length,
      audioTracks: stream.getAudioTracks().length,
      active: stream.active
    });
  }

  /**
   * Configura el MediaRecorder
   */
  setupMediaRecorder(stream) {
    const qualitySettings = StateManager.getCurrentQualitySettings();
    
    const options = {
      mimeType: this.supportedMimeTypes[0] || 'video/webm',
      videoBitsPerSecond: qualitySettings.videoBitsPerSecond,
      audioBitsPerSecond: qualitySettings.audioBitsPerSecond
    };

    console.log('Configurando MediaRecorder con opciones:', options);
    
    const mediaRecorder = new MediaRecorder(stream, options);
    this.setupMediaRecorderEvents(mediaRecorder);
    StateManager.setMediaRecorder(mediaRecorder);
    
    return mediaRecorder;
  }

  /**
   * Configura los eventos del MediaRecorder
   */
  setupMediaRecorderEvents(mediaRecorder) {
    mediaRecorder.addEventListener('dataavailable', (event) => {
      if (event.data && event.data.size > 0) {
        console.log('Chunk de datos recibido:', event.data.size, 'bytes');
        StateManager.addRecordedChunk(event.data);
      }
    });

    mediaRecorder.addEventListener('start', () => {
      console.log('Grabación iniciada');
      StateManager.setRecordingState(true);
      StateManager.startTimer();
      ToastManager.show('Grabación iniciada correctamente', 'success');
    });

    mediaRecorder.addEventListener('stop', () => {
      console.log('Grabación detenida');
      StateManager.setRecordingState(false);
      StateManager.stopTimer();
      this.processRecording();
    });

    mediaRecorder.addEventListener('error', (event) => {
      console.error('Error en MediaRecorder:', event.error);
      StateManager.setRecordingState(false);
      StateManager.stopTimer();
      ToastManager.show('Error durante la grabación: ' + event.error.message, 'error');
    });

    mediaRecorder.addEventListener('pause', () => {
      console.log('Grabación pausada');
    });

    mediaRecorder.addEventListener('resume', () => {
      console.log('Grabación reanudada');
    });
  }

  /**
   * Procesa la grabación al finalizar
   */
  async processRecording() {
    try {
      StateManager.setProcessingState(true);
      UIManager.showProcessingModal();

      // Simular progreso de procesamiento
      this.simulateProcessingProgress();

      // Crear blob con los chunks grabados
      const mimeType = AppState.mediaRecorder.mimeType || 'video/webm';
      const blob = new Blob(AppState.recordedChunks, { type: mimeType });
      
      console.log('Video procesado:', {
        size: blob.size,
        type: blob.type,
        chunks: AppState.recordedChunks.length
      });

      // Establecer el blob en el estado
      StateManager.setVideoBlob(blob);
      StateManager.clearRecordedChunks();
      
      // Pequeña pausa para mostrar completado
      await new Promise(resolve => setTimeout(resolve, 500));
      
      StateManager.setProcessingState(false);
      UIManager.hideProcessingModal();
      
      ToastManager.show('Video generado correctamente', 'success');
      
    } catch (error) {
      console.error('Error procesando grabación:', error);
      StateManager.setProcessingState(false);
      UIManager.hideProcessingModal();
      ToastManager.show('Error procesando el video: ' + error.message, 'error');
    }
  }

  /**
   * Simula el progreso de procesamiento
   */
  simulateProcessingProgress() {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          resolve();
        }
        UIManager.updateProcessingProgress(progress);
      }, 200);
    });
  }

  /**
   * Maneja errores de captura
   */
  handleCaptureError(error) {
    let message = 'Error desconocido al iniciar la captura';
    
    switch (error.name) {
      case 'NotAllowedError':
        message = 'Permisos de captura de pantalla denegados. Por favor, permite el acceso y vuelve a intentar.';
        break;
      case 'NotSupportedError':
        message = 'La captura de pantalla no está soportada en este navegador.';
        break;
      case 'NotFoundError':
        message = 'No se encontraron fuentes de captura disponibles.';
        break;
      case 'AbortError':
        message = 'Captura de pantalla cancelada por el usuario.';
        break;
      case 'NotReadableError':
        message = 'Error de hardware al acceder a la captura de pantalla.';
        break;
      case 'OverconstrainedError':
        message = 'No se pudo satisfacer las configuraciones de captura solicitadas.';
        break;
      default:
        message = `Error de captura: ${error.message}`;
    }
    
    console.error('Error de captura:', error);
    ToastManager.show(message, 'error');
  }
}

/**
 * Gestor principal de grabación
 */
const RecorderManager = {
  recorder: null,

  /**
   * Inicializa el gestor de grabación
   */
  init() {
    this.recorder = new ScreenRecorder();
    
    if (!this.recorder.isSupported) {
      this.showUnsupportedMessage();
      return false;
    }
    
    console.log('RecorderManager inicializado correctamente');
    console.log('Tipos MIME soportados:', this.recorder.supportedMimeTypes);
    return true;
  },

  /**
   * Inicia una nueva grabación
   */
  async startRecording() {
    try {
      if (AppState.isRecording) {
        console.warn('Ya hay una grabación en curso');
        return;
      }

      console.log('Iniciando nueva grabación...');
      
      // Limpiar estado anterior si existe
      if (AppState.videoUrl) {
        StateManager.resetForNewRecording();
      }
      
      // Iniciar captura
      await this.recorder.startCapture();
      
      // Iniciar grabación
      if (AppState.mediaRecorder) {
        AppState.mediaRecorder.start(1000); // Chunks cada segundo
      }
      
    } catch (error) {
      console.error('Error iniciando grabación:', error);
      StateManager.setRecordingState(false);
    }
  },

  /**
   * Detiene la grabación actual
   */
  stopRecording() {
    try {
      if (!AppState.isRecording) {
        console.warn('No hay grabación activa para detener');
        return;
      }

      console.log('Deteniendo grabación...');
      
      // Detener MediaRecorder
      if (AppState.mediaRecorder && AppState.mediaRecorder.state === 'recording') {
        AppState.mediaRecorder.stop();
      }
      
      // Detener stream
      if (AppState.mediaStream) {
        AppState.mediaStream.getTracks().forEach(track => {
          track.stop();
          console.log('Track detenido:', track.kind);
        });
      }
      
    } catch (error) {
      console.error('Error deteniendo grabación:', error);
      ToastManager.show('Error al detener la grabación', 'error');
    }
  },

  /**
   * Descarga el video grabado
   */
  downloadVideo() {
    if (!AppState.videoUrl) {
      console.error('No hay video disponible para descargar');
      ToastManager.show('No hay video disponible para descargar', 'error');
      return;
    }

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `windy-recording-${timestamp}.webm`;
      
      const downloadLink = document.createElement('a');
      downloadLink.href = AppState.videoUrl;
      downloadLink.download = filename;
      downloadLink.style.display = 'none';
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      console.log('Descarga iniciada:', filename);
      ToastManager.show('Descarga iniciada', 'success');
      
    } catch (error) {
      console.error('Error descargando video:', error);
      ToastManager.show('Error al descargar el video', 'error');
    }
  },

  /**
   * Muestra mensaje de funcionalidad no soportada
   */
  showUnsupportedMessage() {
    const message = `
      <div style="text-align: center; padding: 20px;">
        <h3>Funcionalidad no soportada</h3>
        <p>Tu navegador no soporta las APIs necesarias para la grabación de pantalla.</p>
        <p>Por favor, usa un navegador moderno como Chrome, Firefox o Edge.</p>
      </div>
    `;
    
    ToastManager.show('Navegador no compatible con grabación de pantalla', 'error');
    
    // Deshabilitar controles
    const controls = ['recordBtn', 'stopBtn', 'downloadBtn'];
    controls.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.disabled = true;
        element.title = 'No soportado en este navegador';
      }
    });
  }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ScreenRecorder, RecorderManager };
}
