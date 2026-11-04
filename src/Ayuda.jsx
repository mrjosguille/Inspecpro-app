import React from 'react'
import { FaClipboardList, FaCamera, FaFilePdf, FaChartBar, FaUserTie, FaCheckCircle } from 'react-icons/fa'

export default function Ayuda() {
  const styles = {
    card: { background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', border: '1px solid #e2e8f0', padding: '30px', marginBottom: '24px' },
    title: { color: '#004b7a', fontSize: '22px', fontWeight: '800', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' },
    text: { color: '#475569', fontSize: '15px', lineHeight: '1.6', marginBottom: '10px' },
    list: { color: '#475569', fontSize: '15px', lineHeight: '1.8', paddingLeft: '20px' }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '30px' }}>Centro de Ayuda</h2>

      <div style={styles.card}>
        <h3 style={styles.title}><FaClipboardList /> 1. Crear una Nueva Inspección</h3>
        <p style={styles.text}>Para registrar un diagnóstico, sigue estos pasos:</p>
        <ul style={styles.list}>
          <li>Ve a la pestaña <strong>"Inicio"</strong> y haz clic en <strong>"Nueva Inspección"</strong>.</li>
          <li>Completa los datos del vehículo: Placa, Marca, Modelo y Tipo.</li>
          <li>Agrega los trabajos de <strong>Mano de Obra</strong> y los <strong>Repuestos</strong>. Puedes usar el autocompletado para mayor rapidez.</li>
          <li>Sube las fotos del vehículo y vincúlalas al repuesto o trabajo correspondiente.</li>
          <li>Al final, verifica el resumen de costos y haz clic en <strong>"Guardar y Generar PDF"</strong>.</li>
        </ul>
      </div>

      <div style={styles.card}>
        <h3 style={styles.title}><FaCamera /> 2. Gestión de Fotos</h3>
        <p style={styles.text}>Las fotos son la evidencia clave de tu inspección:</p>
        <ul style={styles.list}>
          <li>Puedes arrastrar y soltar <strong>múltiples fotos a la vez</strong> en el área de carga.</li>
          <li>Una vez subidas, en el menú desplegable debajo de cada foto, selecciona a qué ítem pertenece (ej: Parachoque Delantero).</li>
          <li>Si una foto no se vincula a ningún ítem, el sistema la marcará como "SIN ASIGNAR" en el PDF.</li>
        </ul>
      </div>

      <div style={styles.card}>
        <h3 style={styles.title}><FaFilePdf /> 3. El PDF de Diagnóstico</h3>
        <p style={styles.text}>El PDF se genera automáticamente con un diseño profesional:</p>
        <ul style={styles.list}>
          <li>Incluye el logo de Alianza, los datos del vehículo y el código correlativo (Ej: INSP-2026-0001).</li>
          <li>Muestra las tablas de Mano de Obra y Repuestos con sus ajustes.</li>
          <li>La firma del perito aparece automáticamente según el usuario que haya iniciado sesión.</li>
          <li>Las fotos se distribuyen en cuadrícula, con 6 fotos por hoja, junto a su descripción.</li>
        </ul>
      </div>

      <div style={styles.card}>
        <h3 style={styles.title}><FaChartBar /> 4. Dashboard e Informes</h3>
        <p style={styles.text}>Para ver las estadísticas de tu trabajo:</p>
        <ul style={styles.list}>
          <li>Ve a la pestaña <strong>"Dashboard"</strong> en el menú superior.</li>
          <li>Podrás ver el total de inspecciones, el ahorro total generado y los talleres evaluados.</li>
          <li>Los gráficos muestran los talleres con mayor ahorro y la distribución de tus inspecciones.</li>
        </ul>
      </div>

      <div style={styles.card}>
        <h3 style={styles.title}><FaUserTie /> 5. Perfil y Seguridad</h3>
        <p style={styles.text}>Gestión de tu cuenta:</p>
        <ul style={styles.list}>
          <li>Usa el botón <strong>"Cambiar Clave"</strong> para actualizar tu contraseña de acceso.</li>
          <li>El botón <strong>"Salir"</strong> cierra tu sesión y te devuelve a la pantalla de login.</li>
          <li>Tu firma digital se cargará automáticamente en los PDFs según el correo con el que iniciaste sesión.</li>
        </ul>
      </div>

      <div style={{ ...styles.card, background: '#f0fdf4', borderColor: '#bbf7d0' }}>
        <h3 style={{...styles.title, color: '#166534', borderBottom: 'none'}}><FaCheckCircle /> ¡Consejo Final!</h3>
        <p style={{...styles.text, color: '#166534'}}>
          La aplicación <strong>aprende de tus entradas</strong>. Cada vez que escribas un taller, una marca, un trabajo o una observación, se guardará en la lista de sugerencias para que no tengas que volver a escribirlo.
        </p>
      </div>
    </div>
  )
}