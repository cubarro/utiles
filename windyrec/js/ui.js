// js/ui.js - Gestión de interfaz de usuario

/**
 * Gestor de notificaciones Toast
 */
const ToastManager = {
  container: null,

  /**
   * Inicializa el gestor de toast
   */
  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      console.error('Contenedor de toast no encontrado');
      return false;
    }
    return true;
  },

  /**
   * Muestra una notificación toast
   */
  show(message, type = 'info', duration = 5000) {
    if (!this.container) {
      console.warn('ToastManager no inicializado');
      return;
    }

    const toast = this.createToast(message, type);
    this.container.appendChild(toast);

    // Mostrar con animación
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto-remover después del tiempo especificado
    setTimeout(() => {
      this.hide(toast);
    }, duration);

    return toast;
  },

  /**
   * Crea un elemento toast
   */
  createToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = this.getIconForType(type);
    
    toast.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="flex-shrink: 0; margin-top: 2px;">
          ${icon}
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 500; margin-bottom: 4px;">
            ${this.getTitleForType(type)}
          </div>
          <div style="color: var(--tertiary-color); font-size: 0.875rem;">
            ${message}
          </div>
        </div>
        <button 
          onclick="ToastManager.hide(this.closest('.toast'))" 
          style="background: none; border: none; cursor: pointer; padding: 4px; margin: -4px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;

    return toast;
  },

  /**
   * Obtiene el icono para cada tipo de toast
   */
  getIconForType(type) {
    const icons = {
      success: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22,4 12,14.01 9,11.01"></polyline>
        </svg>
      `,
      error: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger-color)" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      `,
      warning: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning-color)" stroke-width="2">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      `,
      info: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      `
    };

    return icons[type] || icons.info;
  },

  /**
   * Obtiene el título para cada tipo de toast
   */
  getTitleForType(type) {
    const titles = {
      success: 'Éxito',
      error: 'Error',
      warning: 'Advertencia',
      info: 'Información'
    };

    return titles[type] || titles.info;
  },

  /**
   * Oculta un toast específico
   */
  hide(toast) {
    if (!toast) return;

    toast.classList.remove('show');
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  },

  /**
   * Limpia todos los toasts
   */
  clearAll() {
    if (!this.container) return;
    
    const toasts = this.container.querySelectorAll('.toast');
    toasts.forEach(toast => this.hide(toast));
  }
};

/**
 * Gestor de UI principal
 */
const UIManager = {
  /**
   * Inicializa el gestor de UI
   */
  init() {
    this.setupEventListeners();
    this.initializeControls();
    ToastManager.init();
    console.log('UIManager inicializado correctamente');
  },

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    // Botones principales
    const recordBtn = document.getElementById('recordBtn');
    const stopBtn = document.getElementById('stopBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    if (recordBtn) {
      recordBtn.addEventListener('click', () => {
        RecorderManager.startRecording();
      });
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        RecorderManager.stopRecording();
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        RecorderManager.downloadVideo();
      });
    }

    // Configuración de calidad
    const qualitySelect = document.getElementById('qualitySelect');
    if (qualitySelect) {
      qualitySelect.addEventListener('change', (e) => {
        StateManager.updateQualitySetting(e.target.value);
        console.log('Calidad actualizada a:', e.target.value);
      });
    }

    // Toggle de audio
    const audioToggle = document.getElementById('audioToggle');
    if (audioToggle) {
      audioToggle.addEventListener('change', (e) => {
        StateManager.updateAudioSetting(e.target.checked);
        console.log('Audio configurado a:', e.target.checked);
      });
    }

    // Eventos de teclado
    this.setupKeyboardShortcuts();
  },

  /**
   * Configura atajos de teclado
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + R para iniciar/detener grabación
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        
        if (AppState.isRecording) {
          RecorderManager.stopRecording();
        } else if (!AppState.isProcessing) {
          RecorderManager.startRecording();
        }
      }

      // Escape para detener grabación
      if (e.key === 'Escape' && AppState.isRecording) {
        RecorderManager.stopRecording();
      }
    });
  },

  /**
   * Inicializa los controles con valores por defecto
   */
  initializeControls() {
    const qualitySelect = document.getElementById('qualitySelect');
    const audioToggle = document.getElementById('audioToggle');

    if (qualitySelect) {
      qualitySelect.value = AppState.settings.quality;
    }

    if (audioToggle) {
      audioToggle.checked = AppState.settings.includeAudio;
    }
  },

  /**
   * Muestra el modal de procesamiento
   */
  showProcessingModal() {
    const modal = document.getElementById('processingModal');
    if (modal) {
      modal.classList.add('show');
      this.resetProcessingProgress();
    }
  },

  /**
   * Oculta el modal de procesamiento
   */
  hideProcessingModal() {
    const modal = document.getElementById('processingModal');
    if (modal) {
      modal.classList.remove('show');
    }
  },

  /**
   * Actualiza el progreso de procesamiento
   */
  updateProcessingProgress(progress) {
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
      progressFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }
  },

  /**
   * Resetea el progreso de procesamiento
   */
  resetProcessingProgress() {
    this.updateProcessingProgress(0);
  },

  /**
   * Maneja el evento de carga del mapa
   */
  handleMapLoad() {
    const mapLoading = document.getElementById('mapLoading');
    const windyMap = document.getElementById('windyMap');

    if (mapLoading) {
      mapLoading.style.display = 'none';
    }

    if (windyMap) {
      windyMap.style.display = 'block';
    }

    console.log('Mapa de Windy cargado correctamente');
    ToastManager.show('Mapa meteorológico cargado correctamente', 'success', 3000);
  },

  /**
   * Muestra información sobre atajos de teclado
   */
  showKeyboardShortcuts() {
    const message = `
      <strong>Atajos de teclado disponibles:</strong><br>
      • Ctrl/Cmd + R: Iniciar/Detener grabación<br>
      • Escape: Detener grabación
    `;
    
    ToastManager.show(message, 'info', 7000);
  },

  /**
   * Actualiza el estado visual de la aplicación
   */
  updateAppearance() {
    // Aplicar tema automáticamente basado en preferencias del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (prefersDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  },

  /**
   * Maneja errores de la aplicación
   */
  handleAppError(error, context = 'aplicación') {
    console.error(`Error en ${context}:`, error);
    
    let userMessage = 'Ha ocurrido un error inesperado';
    
    if (error.name === 'NotSupportedError') {
      userMessage = 'Esta funcionalidad no está soportada en tu navegador';
    } else if (error.name === 'NotAllowedError') {
      userMessage = 'Permisos necesarios denegados';
    } else if (error.message) {
      userMessage = error.message;
    }

    ToastManager.show(userMessage, 'error');
  },

  /**
   * Maneja la visibilidad de la página
   */
  setupVisibilityHandling() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && AppState.isRecording) {
        console.log('Página oculta durante grabación - continuando en segundo plano');
      } else if (!document.hidden && AppState.isRecording) {
        console.log('Página visible - grabación activa');
      }
    });
  },

  /**
   * Maneja cambios de tamaño de ventana
   */
  setupResizeHandling() {
    let resizeTimeout;
    
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Reajustar layout si es necesario
        console.log('Ventana redimensionada a:', window.innerWidth, 'x', window.innerHeight);
      }, 250);
    });
  }
};

/**
 * Funciones globales para acceso desde HTML
 */
function handleMapLoad() {
  UIManager.handleMapLoad();
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UIManager, ToastManager };
}
