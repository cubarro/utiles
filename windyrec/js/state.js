// js/state.js - Gestión centralizada del estado de la aplicación

/**
 * Estado global de la aplicación WindyRec
 */
const AppState = {
  // Estado de grabación
  isRecording: false,
  isProcessing: false,
  
  // Stream y recorder
  mediaStream: null,
  mediaRecorder: null,
  
  // Datos de grabación
  recordedChunks: [],
  videoBlob: null,
  videoUrl: null,
  
  // Timer
  recordingStartTime: 0,
  timerInterval: null,
  
  // Configuración
  settings: {
    quality: 'high',
    includeAudio: true,
    mimeType: 'video/webm;codecs=vp9,opus'
  },
  
  // UI Referencias
  elements: {
    recordBtn: null,
    stopBtn: null,
    downloadBtn: null,
    statusDot: null,
    statusText: null,
    timerDisplay: null,
    qualitySelect: null,
    audioToggle: null,
    processingModal: null,
    progressFill: null,
    windyMap: null,
    mapLoading: null
  }
};

/**
 * Configuraciones de calidad de video
 */
const QualitySettings = {
  high: {
    videoBitsPerSecond: 2500000, // 2.5 Mbps
    audioBitsPerSecond: 128000,  // 128 Kbps
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    frameRate: { ideal: 30 }
  },
  medium: {
    videoBitsPerSecond: 1500000, // 1.5 Mbps
    audioBitsPerSecond: 96000,   // 96 Kbps
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 }
  },
  low: {
    videoBitsPerSecond: 800000,  // 800 Kbps
    audioBitsPerSecond: 64000,   // 64 Kbps
    width: { ideal: 854 },
    height: { ideal: 480 },
    frameRate: { ideal: 24 }
  }
};

/**
 * Funciones para mutación del estado
 */
const StateManager = {
  /**
   * Inicializa las referencias de elementos DOM
   */
  initElements() {
    AppState.elements = {
      recordBtn: document.getElementById('recordBtn'),
      stopBtn: document.getElementById('stopBtn'),
      downloadBtn: document.getElementById('downloadBtn'),
      statusDot: document.getElementById('statusDot'),
      statusText: document.getElementById('statusText'),
      timerDisplay: document.querySelector('.timer-text'),
      qualitySelect: document.getElementById('qualitySelect'),
      audioToggle: document.getElementById('audioToggle'),
      processingModal: document.getElementById('processingModal'),
      progressFill: document.getElementById('progressFill'),
      windyMap: document.getElementById('windyMap'),
      mapLoading: document.getElementById('mapLoading')
    };
  },

  /**
   * Actualiza el estado de grabación
   */
  setRecordingState(isRecording) {
    AppState.isRecording = isRecording;
    this.updateUI();
  },

  /**
   * Actualiza el estado de procesamiento
   */
  setProcessingState(isProcessing) {
    AppState.isProcessing = isProcessing;
    this.updateUI();
  },

  /**
   * Establece el stream de medios
   */
  setMediaStream(stream) {
    AppState.mediaStream = stream;
  },

  /**
   * Establece el recorder de medios
   */
  setMediaRecorder(recorder) {
    AppState.mediaRecorder = recorder;
  },

  /**
   * Añade chunks de video grabado
   */
  addRecordedChunk(chunk) {
    AppState.recordedChunks.push(chunk);
  },

  /**
   * Limpia los chunks grabados
   */
  clearRecordedChunks() {
    AppState.recordedChunks = [];
  },

  /**
   * Establece el blob de video final
   */
  setVideoBlob(blob) {
    AppState.videoBlob = blob;
    if (AppState.videoUrl) {
      URL.revokeObjectURL(AppState.videoUrl);
    }
    AppState.videoUrl = URL.createObjectURL(blob);
  },

  /**
   * Actualiza la configuración de calidad
   */
  updateQualitySetting(quality) {
    AppState.settings.quality = quality;
  },

  /**
   * Actualiza la configuración de audio
   */
  updateAudioSetting(includeAudio) {
    AppState.settings.includeAudio = includeAudio;
  },

  /**
   * Inicia el timer de grabación
   */
  startTimer() {
    AppState.recordingStartTime = Date.now();
    AppState.timerInterval = setInterval(() => {
      this.updateTimer();
    }, 1000);
  },

  /**
   * Detiene el timer de grabación
   */
  stopTimer() {
    if (AppState.timerInterval) {
      clearInterval(AppState.timerInterval);
      AppState.timerInterval = null;
    }
  },

  /**
   * Actualiza la visualización del timer
   */
  updateTimer() {
    if (!AppState.recordingStartTime) return;
    
    const elapsed = Math.floor((Date.now() - AppState.recordingStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (AppState.elements.timerDisplay) {
      AppState.elements.timerDisplay.textContent = timeString;
    }
  },

  /**
   * Resetea el timer
   */
  resetTimer() {
    AppState.recordingStartTime = 0;
    if (AppState.elements.timerDisplay) {
      AppState.elements.timerDisplay.textContent = '00:00';
    }
  },

  /**
   * Actualiza la UI basada en el estado actual
   */
  updateUI() {
    const { elements } = AppState;
    
    if (AppState.isRecording) {
      // Estado grabando
      elements.recordBtn.disabled = true;
      elements.stopBtn.disabled = false;
      elements.downloadBtn.disabled = true;
      elements.qualitySelect.disabled = true;
      elements.audioToggle.disabled = true;
      
      elements.statusDot.className = 'status-dot recording';
      elements.statusText.textContent = 'Grabando...';
      
      // Actualizar botón de grabación
      const recordIcon = document.getElementById('recordIcon');
      const recordText = document.getElementById('recordText');
      if (recordIcon && recordText) {
        recordIcon.innerHTML = `
          <rect x="6" y="6" width="12" height="12" rx="2"></rect>
        `;
        recordText.textContent = 'Grabando...';
      }
      
    } else if (AppState.isProcessing) {
      // Estado procesando
      elements.recordBtn.disabled = true;
      elements.stopBtn.disabled = true;
      elements.downloadBtn.disabled = true;
      elements.qualitySelect.disabled = true;
      elements.audioToggle.disabled = true;
      
      elements.statusDot.className = 'status-dot';
      elements.statusText.textContent = 'Procesando video...';
      
    } else if (AppState.videoUrl) {
      // Estado con video listo
      elements.recordBtn.disabled = false;
      elements.stopBtn.disabled = true;
      elements.downloadBtn.disabled = false;
      elements.qualitySelect.disabled = false;
      elements.audioToggle.disabled = false;
      
      elements.statusDot.className = 'status-dot ready';
      elements.statusText.textContent = 'Video listo para descargar';
      
      // Restaurar botón de grabación
      const recordIcon = document.getElementById('recordIcon');
      const recordText = document.getElementById('recordText');
      if (recordIcon && recordText) {
        recordIcon.innerHTML = `
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="3"></circle>
        `;
        recordText.textContent = 'Nueva Grabación';
      }
      
    } else {
      // Estado inicial/listo
      elements.recordBtn.disabled = false;
      elements.stopBtn.disabled = true;
      elements.downloadBtn.disabled = true;
      elements.qualitySelect.disabled = false;
      elements.audioToggle.disabled = false;
      
      elements.statusDot.className = 'status-dot';
      elements.statusText.textContent = 'Listo para grabar';
      
      // Restaurar botón de grabación
      const recordIcon = document.getElementById('recordIcon');
      const recordText = document.getElementById('recordText');
      if (recordIcon && recordText) {
        recordIcon.innerHTML = `
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="3"></circle>
        `;
        recordText.textContent = 'Iniciar Grabación';
      }
    }
  },

  /**
   * Limpia el estado para una nueva grabación
   */
  resetForNewRecording() {
    // Limpiar recursos anteriores
    if (AppState.mediaStream) {
      AppState.mediaStream.getTracks().forEach(track => track.stop());
    }
    
    if (AppState.videoUrl) {
      URL.revokeObjectURL(AppState.videoUrl);
    }
    
    // Resetear estado
    AppState.isRecording = false;
    AppState.isProcessing = false;
    AppState.mediaStream = null;
    AppState.mediaRecorder = null;
    AppState.recordedChunks = [];
    AppState.videoBlob = null;
    AppState.videoUrl = null;
    
    this.stopTimer();
    this.resetTimer();
    this.updateUI();
  },

  /**
   * Obtiene la configuración actual de calidad
   */
  getCurrentQualitySettings() {
    return QualitySettings[AppState.settings.quality];
  }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AppState, StateManager, QualitySettings };
}
