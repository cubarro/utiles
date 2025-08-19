// js/main.js - Orquestador principal de la aplicación WindyRec

/**
 * Configuración global de la aplicación
 */
const AppConfig = {
  version: '1.0.0',
  name: 'WindyRec',
  author: 'MiniMax Agent',
  
  // URLs y configuraciones externas
  windyEmbedBaseUrl: 'https://embed.windy.com/embed2.html',
  
  // Configuraciones por defecto
  defaultMapConfig: {
    lat: 10,
    lon: -70,
    zoom: 5,
    overlay: 'wind',
    product: 'ecmwf',
    level: 'surface'
  },
  
  // Límites y configuraciones técnicas
  maxRecordingDuration: 600000, // 10 minutos en ms
  warningDuration: 540000,      // 9 minutos - mostrar advertencia
  
  // Configuraciones de UI
  toastDuration: 5000,
  processingSimulationDuration: 2000
};

/**
 * Clase principal de la aplicación
 */
class WindyRecApp {
  constructor() {
    this.isInitialized = false;
    this.initStartTime = Date.now();
    
    // Bind de métodos para event listeners
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    this.handleUnload = this.handleUnload.bind(this);
  }

  /**
   * Inicializa la aplicación completa
   */
  async init() {
    try {
      console.log(`Inicializando ${AppConfig.name} v${AppConfig.version}...`);
      
      // 1. Verificar soporte del navegador
      if (!this.checkBrowserSupport()) {
        throw new Error('Navegador no compatible');
      }

      // 2. Inicializar módulos en orden
      await this.initializeModules();

      // 3. Configurar eventos globales
      this.setupGlobalEventHandlers();

      // 4. Configurar mapa de Windy
      this.setupWindyMap();

      // 5. Mostrar información inicial
      this.showWelcomeMessage();

      // 6. Marcar como inicializado
      this.isInitialized = true;
      
      const initTime = Date.now() - this.initStartTime;
      console.log(`${AppConfig.name} inicializado correctamente en ${initTime}ms`);
      
    } catch (error) {
      console.error('Error durante la inicialización:', error);
      this.handleInitializationError(error);
    }
  }

  /**
   * Verifica el soporte del navegador
   */
  checkBrowserSupport() {
    const requiredFeatures = [
      'mediaDevices' in navigator,
      'getDisplayMedia' in (navigator.mediaDevices || {}),
      'MediaRecorder' in window,
      'URL' in window && 'createObjectURL' in URL,
      'Blob' in window,
      'addEventListener' in document,
      'querySelector' in document
    ];

    const isSupported = requiredFeatures.every(feature => feature);
    
    if (!isSupported) {
      console.error('Navegador no compatible - faltan características requeridas');
    }

    return isSupported;
  }

  /**
   * Inicializa todos los módulos de la aplicación
   */
  async initializeModules() {
    console.log('Inicializando módulos...');

    // 1. Inicializar gestión de estado
    StateManager.initElements();
    console.log('✓ StateManager inicializado');

    // 2. Inicializar gestor de UI
    UIManager.init();
    console.log('✓ UIManager inicializado');

    // 3. Inicializar gestor de grabación
    const recorderInitialized = RecorderManager.init();
    if (recorderInitialized) {
      console.log('✓ RecorderManager inicializado');
    } else {
      console.warn('⚠ RecorderManager con funcionalidad limitada');
    }

    // 4. Configurar visibilidad y resize handling
    UIManager.setupVisibilityHandling();
    UIManager.setupResizeHandling();
    console.log('✓ Event handlers de UI configurados');

    // 5. Actualizar UI inicial
    StateManager.updateUI();
    console.log('✓ UI inicial configurada');
  }

  /**
   * Configura event handlers globales
   */
  setupGlobalEventHandlers() {
    // Manejar cierre de ventana durante grabación
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    window.addEventListener('unload', this.handleUnload);

    // Manejar errores no capturados
    window.addEventListener('error', (event) => {
      console.error('Error global capturado:', event.error);
      UIManager.handleAppError(event.error, 'ventana');
    });

    // Manejar promesas rechazadas
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Promesa rechazada no manejada:', event.reason);
      UIManager.handleAppError(event.reason, 'promesa');
      event.preventDefault();
    });

    // Detectar cambios de conexión
    if ('onLine' in navigator) {
      window.addEventListener('online', () => {
        console.log('Conexión restaurada');
        ToastManager.show('Conexión a internet restaurada', 'success', 3000);
      });

      window.addEventListener('offline', () => {
        console.log('Conexión perdida');
        ToastManager.show('Sin conexión a internet - algunas funciones pueden verse afectadas', 'warning', 5000);
      });
    }

    console.log('Event handlers globales configurados');
  }

  /**
   * Configura el mapa embebido de Windy
   */
  setupWindyMap() {
    const windyMap = document.getElementById('windyMap');
    const mapLoading = document.getElementById('mapLoading');

    if (!windyMap) {
      console.error('Elemento del mapa no encontrado');
      return;
    }

    // Configurar URL del mapa con parámetros
    const mapUrl = this.buildWindyMapUrl();
    windyMap.src = mapUrl;

    // Configurar timeout para carga del mapa
    const loadTimeout = setTimeout(() => {
      console.warn('Timeout cargando mapa de Windy');
      if (mapLoading) {
        mapLoading.innerHTML = `
          <div style="text-align: center; color: var(--tertiary-color);">
            <p>El mapa está tardando en cargar...</p>
            <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 16px;">
              Recargar página
            </button>
          </div>
        `;
      }
    }, 15000);

    // Limpiar timeout cuando el mapa cargue
    windyMap.addEventListener('load', () => {
      clearTimeout(loadTimeout);
    });

    console.log('Mapa de Windy configurado con URL:', mapUrl);
  }

  /**
   * Construye la URL del mapa embebido de Windy
   */
  buildWindyMapUrl() {
    const config = AppConfig.defaultMapConfig;
    const params = new URLSearchParams({
      lat: config.lat,
      lon: config.lon,
      detailLat: config.lat,
      detailLon: config.lon,
      width: '100%',
      height: '100%',
      zoom: config.zoom,
      level: config.level,
      overlay: config.overlay,
      product: config.product,
      menu: '',
      message: 'true',
      marker: '',
      calendar: 'now',
      pressure: '',
      type: 'map',
      location: 'coordinates',
      detail: '',
      metricWind: 'km/h',
      metricTemp: '°C',
      radarRange: '-1'
    });

    return `${AppConfig.windyEmbedBaseUrl}?${params.toString()}`;
  }

  /**
   * Muestra mensaje de bienvenida
   */
  showWelcomeMessage() {
    // Mostrar información inicial después de un breve delay
    setTimeout(() => {
      if (!localStorage.getItem('windyrec_welcome_shown')) {
        ToastManager.show(
          'Bienvenido a WindyRec. Usa Ctrl+R para iniciar grabación rápidamente.',
          'info',
          7000
        );
        localStorage.setItem('windyrec_welcome_shown', 'true');
      }
    }, 2000);

    // Mostrar atajos de teclado si es la primera visita
    setTimeout(() => {
      if (!localStorage.getItem('windyrec_shortcuts_shown')) {
        UIManager.showKeyboardShortcuts();
        localStorage.setItem('windyrec_shortcuts_shown', 'true');
      }
    }, 8000);
  }

  /**
   * Maneja errores durante la inicialización
   */
  handleInitializationError(error) {
    console.error('Error crítico durante inicialización:', error);
    
    // Mostrar mensaje de error en la UI
    const container = document.querySelector('.container');
    if (container) {
      container.innerHTML = `
        <div style="
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          height: 100vh; 
          text-align: center;
          padding: 2rem;
        ">
          <div style="
            background: var(--surface-color);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: 2rem;
            max-width: 500px;
            box-shadow: var(--shadow-md);
          ">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--danger-color)" stroke-width="2" style="margin-bottom: 1rem;">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <h2 style="color: var(--secondary-color); margin-bottom: 1rem;">Error de Inicialización</h2>
            <p style="color: var(--tertiary-color); margin-bottom: 1.5rem;">
              No se pudo inicializar la aplicación correctamente. 
              Por favor, verifica que estés usando un navegador compatible.
            </p>
            <button onclick="location.reload()" class="btn btn-primary">
              Reintentar
            </button>
          </div>
        </div>
      `;
    }
  }

  /**
   * Maneja el evento beforeunload
   */
  handleBeforeUnload(event) {
    if (AppState.isRecording) {
      const message = 'Hay una grabación en curso. ¿Estás seguro de que quieres salir?';
      event.preventDefault();
      event.returnValue = message;
      return message;
    }
  }

  /**
   * Maneja el evento unload
   */
  handleUnload() {
    // Limpiar recursos antes de cerrar
    this.cleanup();
  }

  /**
   * Limpia recursos de la aplicación
   */
  cleanup() {
    console.log('Limpiando recursos de la aplicación...');

    try {
      // Detener grabación si está activa
      if (AppState.isRecording) {
        RecorderManager.stopRecording();
      }

      // Limpiar streams de medios
      if (AppState.mediaStream) {
        AppState.mediaStream.getTracks().forEach(track => track.stop());
      }

      // Limpiar URLs de objeto
      if (AppState.videoUrl) {
        URL.revokeObjectURL(AppState.videoUrl);
      }

      // Limpiar timers
      StateManager.stopTimer();

      console.log('Recursos limpiados correctamente');
      
    } catch (error) {
      console.error('Error durante la limpieza:', error);
    }
  }

  /**
   * Obtiene información de diagnóstico
   */
  getDiagnosticInfo() {
    return {
      appVersion: AppConfig.version,
      userAgent: navigator.userAgent,
      isInitialized: this.isInitialized,
      currentState: {
        isRecording: AppState.isRecording,
        isProcessing: AppState.isProcessing,
        hasVideo: !!AppState.videoUrl
      },
      browserSupport: {
        getDisplayMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia),
        mediaRecorder: !!window.MediaRecorder,
        webRTC: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
      },
      supportedMimeTypes: RecorderManager.recorder ? RecorderManager.recorder.supportedMimeTypes : []
    };
  }

  /**
   * Exporta logs para diagnóstico
   */
  exportDiagnostics() {
    const diagnostics = this.getDiagnosticInfo();
    const blob = new Blob([JSON.stringify(diagnostics, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `windyrec-diagnostics-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    ToastManager.show('Información de diagnóstico exportada', 'success');
  }
}

/**
 * Instancia global de la aplicación
 */
const App = new WindyRecApp();

/**
 * Inicialización cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

/**
 * Funciones de utilidad globales para debugging
 */
window.WindyRecDebug = {
  getState: () => AppState,
  getDiagnostics: () => App.getDiagnosticInfo(),
  exportDiagnostics: () => App.exportDiagnostics(),
  cleanup: () => App.cleanup(),
  version: AppConfig.version
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WindyRecApp, AppConfig };
}

console.log(`WindyRec v${AppConfig.version} - Script principal cargado`);
