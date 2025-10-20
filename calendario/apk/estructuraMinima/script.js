document.addEventListener('DOMContentLoaded', function() {
    // Seleccionar todos los botones de las áreas
    const buttons = document.querySelectorAll('.area-btn');
    
    // Añadir evento de clic a cada botón
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Obtener el área correspondiente
            const area = this.closest('.area');
            const areaId = area.id;
            
            // Cambiar el color de fondo del área al hacer clic
            area.style.backgroundColor = getRandomColor();
            
            // Mostrar un mensaje en la consola
            console.log(`Has hecho clic en el botón del ${areaId}`);
            
            // Añadir una clase temporal para animación
            area.classList.add('clicked');
            
            // Eliminar la clase después de la animación
            setTimeout(() => {
                area.classList.remove('clicked');
            }, 500);
        });
    });
    
    // Función para generar un color aleatorio claro
    function getRandomColor() {
        const letters = 'BCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * letters.length)];
        }
        return color;
    }
    
    // Añadir animación a las áreas al cargar la página
    const areas = document.querySelectorAll('.area');
    areas.forEach((area, index) => {
        setTimeout(() => {
            area.style.opacity = '0';
            area.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                area.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                area.style.opacity = '1';
                area.style.transform = 'translateY(0)';
            }, 100);
        }, index * 200);
    });
}); 
