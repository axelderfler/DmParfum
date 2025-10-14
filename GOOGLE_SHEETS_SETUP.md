# Configuración de Google Sheets para Dm Parfum

## 📋 Cómo configurar tu Google Sheet

### 1. Crear tu Google Sheet

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. Nombra la hoja como "Perfumes" (o el nombre que prefieras)

### 2. Configurar las columnas

Tu Google Sheet debe tener estas columnas en la primera fila (encabezados):

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| ID | Nombre | Marca | Precio | Categoría | Descripción | Imagen | Stock | WhatsApp | Instagram |

**Ejemplo de datos:**
```
1, Oud Royal, Arabian Oud, 450000, masculino, Fragancia masculina con notas de oud auténtico, https://ejemplo.com/imagen1.jpg, 5, +573001234567, @dmparfum
2, Rose Gold, Arabian Rose, 380000, femenino, Elegante fragancia femenina con rosas, https://ejemplo.com/imagen2.jpg, 3, +573001234567, @dmparfum
```

### 3. Hacer público tu Google Sheet

1. Haz clic en "Compartir" (botón azul en la esquina superior derecha)
2. Cambia los permisos a "Cualquier usuario con el enlace puede ver"
3. Copia el enlace de tu Google Sheet

### 4. Obtener el ID de tu Google Sheet

Del enlace que copiaste, extrae el ID. Por ejemplo:
- Enlace: `https://docs.google.com/spreadsheets/d/1ABC123DEF456GHI789JKL/edit#gid=0`
- ID: `1ABC123DEF456GHI789JKL`

### 5. Configurar en tu página web

En el archivo `script.js`, busca la sección `GOOGLE_SHEETS_CONFIG` y actualiza:

```javascript
const GOOGLE_SHEETS_CONFIG = {
  sheetUrl: 'https://docs.google.com/spreadsheets/d/TU_ID_AQUI/edit#gid=0',
  sheetId: 'TU_ID_AQUI',
  sheetName: 'Perfumes', // Nombre de tu hoja
  // ... resto de la configuración
};
```

## 🔧 Funciones disponibles

### Recargar productos manualmente
```javascript
// En la consola del navegador
DmParfum.refreshProducts();
```

### Actualizar configuración
```javascript
// En la consola del navegador
DmParfum.updateGoogleSheetsConfig({
  sheetId: 'NUEVO_ID',
  sheetName: 'NuevoNombre'
});
```

## 📝 Formato de datos requerido

### Columnas obligatorias:
- **ID**: Número único para cada producto
- **Nombre**: Nombre del perfume
- **Marca**: Marca del perfume
- **Precio**: Precio en pesos colombianos (sin puntos ni comas)
- **Categoría**: `masculino`, `femenino`, o `unisex`
- **Descripción**: Descripción del producto
- **Imagen**: URL completa de la imagen
- **Stock**: Cantidad disponible (0 = agotado)
- **WhatsApp**: Número de WhatsApp (con código país)
- **Instagram**: Usuario de Instagram (con @)

### Ejemplo completo:
```
1,Oud Royal,Arabian Oud,450000,masculino,"Fragancia masculina con notas de oud auténtico, sándalo y especias orientales",https://ejemplo.com/oud-royal.jpg,5,+573001234567,@dmparfum
```

## ⚠️ Notas importantes

1. **Solo productos con stock > 0 se mostrarán**
2. **Las imágenes deben ser URLs públicas**
3. **Los precios deben ser números sin formato**
4. **Las categorías deben ser exactamente**: `masculino`, `femenino`, `unisex`
5. **El WhatsApp debe incluir código país**: `+573001234567`

## 🚨 Solución de problemas

### Error: "No se encontraron datos"
- Verifica que el ID del Google Sheet sea correcto
- Asegúrate de que la hoja esté pública
- Verifica que el nombre de la hoja coincida

### Error: "Error HTTP: 403"
- El Google Sheet no es público
- Verifica los permisos de compartir

### Los productos no se cargan
- Revisa la consola del navegador para errores
- Verifica el formato de los datos
- Asegúrate de que hay productos con stock > 0

## 🔄 Actualización automática

Los datos se cargan automáticamente cuando:
- Se carga la página
- Se llama a `refreshProducts()`
- Se actualiza la configuración

Los cambios en tu Google Sheet se reflejarán inmediatamente en la página web.
