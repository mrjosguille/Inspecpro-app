import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useDropzone } from 'react-dropzone'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { FaCarCrash, FaHistory, FaPlus, FaTrash, FaCheckCircle, FaClipboardList, FaArrowLeft, FaFilePdf, FaCamera, FaTools, FaSearch, FaSave, FaSyncAlt, FaChartBar, FaSignOutAlt, FaKey, FaFileAlt, FaMagic, FaCar, FaUserTie, FaTimes, FaEye } from 'react-icons/fa'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

import logoAlianza from './logo.png'
import firmaGuillermo from './firma_guillermo.png'
import firmaCompanero from './firma_companero.png'
import Ayuda from './Ayuda'

const supabaseUrl = 'https://zznrbucuhqgatpghrdxo.supabase.co'
const supabaseKey = 'sb_publishable_ZTdxdW4IvtTAxeVOIAP2BA_aU4wj9fu' 
const supabase = createClient(supabaseUrl, supabaseKey)

// LISTAS BASE
const PIEZAS_BASE = ["PARACHOQUE DEL", "PARACHOQUE TRAS", "GUARDABARRO RH DEL", "GUARDABARRO LH DEL", "CAPOT", "MASCARA FRONTAL", "FAROL RH", "FAROL LH", "PUERTA DEL LH", "PUERTA DEL RH", "PARABRISAS DEL", "PARABRISAS TRAS"];
const MANO_OBRA_BASE = ["PULIDO", "ENDEREZADO", "PINTURA", "ALINEACION DE FARO", "REPARACION DE PARACHOQUE", "DESABOLLADO", "MECANICA", "ELECTRICIDAD"];
const MARCAS_BASE = ["TOYOTA", "NISSAN", "MITSUBISHI", "CHEVROLET", "SUZUKI", "HYUNDAI", "KIA", "FORD", "VOLKSWAGEN", "HONDA", "MAZDA", "JEEP"];
const TIPOS_BASE = ["SEDAN", "HATCHBACK", "SUV", "CAMIONETA", "PICKUP", "FURGON", "MOTOCICLETA"];
const OBS_MANO_BASE = ["NO GUARDA RELACION", "DAÑO PREVIO", "AJUSTE DE PRECIO", "PIEZA NO PROFORMADA", "TRABAJO INNECESARIO"];
const OBS_REP_BASE = ["PIEZA CON DESGASTE", "PIEZA RECUPERABLE", "NO GUARDA RELACION", "PIEZA DUPLICADA", "DAÑO PREVIO", "AJUSTE POR DESGASTE"];

const COLORS = ['#005b96', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function App() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [vista, setVista] = useState('inicio'); 
    const [menuInspeccionesAbierto, setMenuInspeccionesAbierto] = useState(false);
  const [inspecciones, setInspecciones] = useState([]);
  const [inspeccionSeleccionada, setInspeccionSeleccionada] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);  
  const [generandoPDFInv, setGenerandoPDFInv] = useState(false);
  
  // ESTADOS PARA EL OCR
  const [procesandoOCR, setProcesandoOCR] = useState(false);
  const [textoOCR, setTextoOCR] = useState('');
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  // ESTADOS PARA CAMBIO DE CONTRASEÑA
  const [mostrarCambioPass, setMostrarCambioPass] = useState(false);
  const [nuevaPass, setNuevaPass] = useState('');
  const [passActual, setPassActual] = useState('');
  const [mensajePass, setMensajePass] = useState('');

  // ESTADOS PARA EL VISOR DE PROFORMA
  const [proformaUrl, setProformaUrl] = useState(null);
  const [mostrarVisor, setMostrarVisor] = useState(false);
  const [tipoArchivo, setTipoArchivo] = useState('');

  // ESTADOS PARA LAS LISTAS QUE APRENDEN
  const [listaTalleres, setListaTalleres] = useState([]);
  const [listaMarcas, setListaMarcas] = useState(MARCAS_BASE);
  const [listaModelos, setListaModelos] = useState([]);
  const [listaTipos, setListaTipos] = useState(TIPOS_BASE);
  const [listaManoObra, setListaManoObra] = useState(MANO_OBRA_BASE);
  const [listaPiezas, setListaPiezas] = useState(PIEZAS_BASE);
  const [listaObsMano, setListaObsMano] = useState(OBS_MANO_BASE);
  const [listaObsRep, setListaObsRep] = useState(OBS_REP_BASE);
  const [listaObsGenerales, setListaObsGenerales] = useState([]);

  // LISTAS PARA EL INVENTARIO
  const [invListaMarcas, setInvListaMarcas] = useState([]);
  const [invListaModelos, setInvListaModelos] = useState([]);
  const [invListaTipos, setInvListaTipos] = useState([]);
  const [invListaColores, setInvListaColores] = useState([]);
  const [invListaCombustibles, setInvListaCombustibles] = useState([]);
  const [invListaTransmisiones, setInvListaTransmisiones] = useState([]);

  const [nuevaInspeccion, setNuevaInspeccion] = useState({ 
    placa: '', tramite: '', taller: '', 
    marca: '', modelo: '', tipoVehiculo: '', 
    descuentoGlobalManoObra: '', 
    observaciones_generales: '', 
    repuestos: [], 
    manoObra: [], 
    perito: '' 
  });
  
  const [fotosSubidas, setFotosSubidas] = useState([]);

  // --- ESTADOS PARA EL INVENTARIO VEHICULAR ---
  const [vistaInventarios, setVistaInventarios] = useState('lista'); 
  const [listaInventarios, setListaInventarios] = useState([]);
  const [busquedaInv, setBusquedaInv] = useState('');
  const [inventarioSeleccionado, setInventarioSeleccionado] = useState(null); // Para la vista previa
  
  const [tabInventario, setTabInventario] = useState(0);
  const [invDatos, setInvDatos] = useState({ 
    placa: '', fecha: new Date().toISOString().split('T')[0], marca: '', modelo: '', tipo: '', motor: '', chasis: '', color: '', kilometraje: '', combustible: '', transmision: '' 
  });
  
  const [invExterior, setInvExterior] = useState({
    parabrisas: { tiene: '', estado: '', cantidad: '' },
    emblemas: { tiene: '', estado: '', cantidad: '' },
    faroles_rh: { tiene: '', estado: '', cantidad: '' },
    faroles_lh: { tiene: '', estado: '', cantidad: '' },
    medias_luces_rh: { tiene: '', estado: '', cantidad: '' },
    medias_luces_lh: { tiene: '', estado: '', cantidad: '' },
    mascara: { tiene: '', estado: '', cantidad: '' },
    llanta_auxilio: { tiene: '', estado: '', cantidad: '' },
    rompe_nieblas_rh: { tiene: '', estado: '', cantidad: '' },
    rompe_nieblas_lh: { tiene: '', estado: '', cantidad: '' },
    tapa_cubo: { tiene: '', estado: '', cantidad: '' },
    tapa_ruedas: { tiene: '', estado: '', cantidad: '' },
    tapa_sol_rh: { tiene: '', estado: '', cantidad: '' },
    tapa_sol_lh: { tiene: '', estado: '', cantidad: '' },
    antena: { tiene: '', estado: '', cantidad: '' },
    guinadores_rh: { tiene: '', estado: '', cantidad: '' },
    guinadores_lh: { tiene: '', estado: '', cantidad: '' },
    halogenos_rh: { tiene: '', estado: '', cantidad: '' },
    halogenos_lh: { tiene: '', estado: '', cantidad: '' },
    limpiaparabrisas_rh: { tiene: '', estado: '', cantidad: '' },
    limpiaparabrisas_lh: { tiene: '', estado: '', cantidad: '' },
    neutralizadores: { tiene: '', estado: '', cantidad: '' },
    retrovisores_rh: { tiene: '', estado: '', cantidad: '' },
    retrovisores_lh: { tiene: '', estado: '', cantidad: '' },
    stops_rh: { tiene: '', estado: '', cantidad: '' },
    stops_lh: { tiene: '', estado: '', cantidad: '' },
    tapa_radiador: { tiene: '', estado: '', cantidad: '' },
    tapa_tanque: { tiene: '', estado: '', cantidad: '' },
    tapa_dep_agua: { tiene: '', estado: '', cantidad: '' },
    parachoques_del: { tiene: '', estado: '', cantidad: '' },
    parachoques_tras: { tiene: '', estado: '', cantidad: '' },
    spoiler: { tiene: '', estado: '', cantidad: '' },
    pechera: { tiene: '', estado: '', cantidad: '' },
    llantas_del: { tiene: '', estado: '', cantidad: '' },
    llantas_tras: { tiene: '', estado: '', cantidad: '' },
    aros: { tiene: '', estado: '', cantidad: '' },
    estado_llantas: { tiene: '', estado: '', cantidad: '' },
  });

  const [invInterior, setInvInterior] = useState({ 
    luces_interiores: { tiene: '', estado: '' },
    radio: { tiene: '', estado: '' },
    parlantes: { tiene: '', estado: '' },
    encendedor: { tiene: '', estado: '' },
    cinturones_rh: { tiene: '', estado: '' },
    cinturones_lh: { tiene: '', estado: '' },
    asientos: { tiene: '', estado: '' }
  });

  const [invAccesorios, setInvAccesorios] = useState({ 
    cola_pato: { tiene: '', estado: '' },
    techo_solar: { tiene: '', estado: '' },
    mataburro: { tiene: '', estado: '' },
    parrilla: { tiene: '', estado: '' },
    pisaderas: { tiene: '', estado: '' },
    gato: { tiene: '', estado: '' },
    llaves: { tiene: '', estado: '' },
    alarma: { tiene: '', estado: '' }
  });

  const [invObservaciones, setInvObservaciones] = useState('');
  const [fotosInventario, setFotosInventario] = useState([]);

  // --- CARGAR MEMORIA DE APRENDIZAJE ---
  useEffect(() => {
    const savedTalleres = JSON.parse(localStorage.getItem('talleres')) || [];
    const savedMarcas = JSON.parse(localStorage.getItem('marcas')) || [];
    const savedModelos = JSON.parse(localStorage.getItem('modelos')) || [];
    const savedManoObra = JSON.parse(localStorage.getItem('manoObra')) || [];
    const savedPiezas = JSON.parse(localStorage.getItem('piezas')) || [];
    const savedObsMano = JSON.parse(localStorage.getItem('obsMano')) || [];
    const savedObsRep = JSON.parse(localStorage.getItem('obsRep')) || [];
    const savedObsGenerales = JSON.parse(localStorage.getItem('obsGenerales')) || [];

    setListaTalleres(savedTalleres);
    setListaMarcas([...new Set([...MARCAS_BASE, ...savedMarcas])]);
    setListaModelos(savedModelos);
    setListaManoObra([...new Set([...MANO_OBRA_BASE, ...savedManoObra])]);
    setListaPiezas([...new Set([...PIEZAS_BASE, ...savedPiezas])]);
    setListaObsMano([...new Set([...OBS_MANO_BASE, ...savedObsMano])]);
    setListaObsRep([...new Set([...OBS_REP_BASE, ...savedObsRep])]);
    setListaObsGenerales(savedObsGenerales);

    setInvListaMarcas(JSON.parse(localStorage.getItem('inv_marcas')) || []);
    setInvListaModelos(JSON.parse(localStorage.getItem('inv_modelos')) || []);
    setInvListaTipos(JSON.parse(localStorage.getItem('inv_tipos')) || []);
    setInvListaColores(JSON.parse(localStorage.getItem('inv_colores')) || []);
    setInvListaCombustibles(JSON.parse(localStorage.getItem('inv_combustibles')) || []);
    setInvListaTransmisiones(JSON.parse(localStorage.getItem('inv_transmisiones')) || []);
  }, []);

  // --- LÓGICA DE LOGIN ---
  const asignarPerito = (emailUsuario) => {
    if (!emailUsuario) return '';
    const emailLower = emailUsuario.toLowerCase();
    if (emailLower === 'brian.moreira@full-assistance.net') return 'BRIAN MOREIRA';
    return 'GUILLERMO ILLESCAS'; 
  };

  const puedeVerDashboard = (emailUsuario) => {
    if (!emailUsuario) return false;
    const emailLower = emailUsuario.toLowerCase();
    return emailLower === 'mrjosguille@gmail.com' || emailLower === 'jefa@alianza.com';
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) setNuevaInspeccion(prev => ({ ...prev, perito: asignarPerito(session.user.email) }));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setNuevaInspeccion(prev => ({ ...prev, perito: asignarPerito(session.user.email) }));
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError("Credenciales incorrectas. Verifica tu correo y contraseña.");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setVista('inicio');
    setInspeccionSeleccionada(null);
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    setMensajePass('');
    const { error } = await supabase.auth.updateUser({ password: nuevaPass });
    if (error) setMensajePass("Error: " + error.message);
    else {
      setMensajePass("¡Contraseña actualizada con éxito!");
      setNuevaPass(''); setPassActual('');
      setTimeout(() => setMostrarCambioPass(false), 2000);
    }
  };

  // --- OCR ---
  const onProformaDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles?.length) return;
    if (!GEMINI_API_KEY) {
      alert("⚠️ Falta configurar la API Key de Gemini en el archivo .env");
      return;
    }

    setCargando(true);
    setProcesandoOCR(true);
    const file = acceptedFiles[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `proforma-${Date.now()}.${fileExt}`;
    
    try {
      const { error: uploadError } = await supabase.storage.from('proformas-pdf').upload(fileName, file);
      if (!uploadError) {
        const { data } = await supabase.storage.from('proformas-pdf').getPublicUrl(fileName);
        setProformaUrl(data.publicUrl);
        setTipoArchivo(file.type);
      }

      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const prompt = `Eres un auditor experto en peritaje de seguros de vehículos. Tu trabajo es leer esta proforma de taller y extraer los datos con precisión quirúrgica.

Devuelve EXCLUSIVAMENTE un JSON válido, sin texto extra, con esta estructura:
{
  "items": [
    { "nombre": "NOMBRE DEL ITEM EN MAYÚSCULAS", "precio": 123.45, "tipo": "MANO_OBRA" o "REPUESTO" }
  ]
}

REGLAS ESTRICTAS DE EXTRACCIÓN:
1. Los PRECIOS deben ser exactamente los que figuran en la columna de total o precio unitario de la proforma. NO inventes ni sumes valores.
2. "MANO_OBRA" = trabajos, servicios, pintura, enderezado, pulido, alineación, etc.
3. "REPUESTO" = piezas, partes, materiales.
4. Ignora códigos de artículo largos (ej. números de parte), placas, datos del cliente, subtotales generales, impuestos (IVA) y el total final.
5. Los nombres deben ir en MAYÚSCULAS y sin caracteres raros, tal cual aparecen en el documento.
6. Si un ítem no tiene precio claro o está tachado, usa 0.
7. Si no hay ítems reconocibles, devuelve {"items": []}.`;

      const payload = {
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: file.type, data: base64Data } }] }],
        generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
      };

      let response;
      let intentos = 0;
      let maxIntentos = 3;

      while (intentos < maxIntentos) {
        try {
          response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (response.ok || (response.status !== 503 && response.status !== 429)) break; 
        } catch (e) { console.warn("Fallo de red, reintentando..."); }

        intentos++;
        if (intentos < maxIntentos) await new Promise(res => setTimeout(res, 2000));
      }

      if (response && !response.ok && (response.status === 503 || response.status === 429)) {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!response || !response.ok) {
        const errText = response ? await response.text() : "Error de red";
        throw new Error(`La IA de Google está muy saturada (${response?.status}). Detalle: ${errText.slice(0, 100)}`);
      }

      const dataJSON = await response.json();
      const candidate = dataJSON?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidate) throw new Error("Gemini no devolvió contenido.");

      let textoRespuesta = candidate.replace(/```json/gi, '').replace(/```/g, '').trim();
      let resultado;
      try { resultado = JSON.parse(textoRespuesta); } 
      catch (parseErr) {
        const match = textoRespuesta.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("Respuesta de Gemini no contiene JSON válido.");
        resultado = JSON.parse(match[0]);
      }
      
      let nuevosRepuestos = [];
      let nuevaManoObra = [];

      if (Array.isArray(resultado.items)) {
        resultado.items.forEach(item => {
          const nombre = String(item.nombre || '').toUpperCase().trim();
          const precio = Number(item.precio) || 0;
          if (!nombre) return;

          if (item.tipo === 'MANO_OBRA') {
            nuevaManoObra.push({ nombre, precioOriginal: precio, accion: 'APROBADO', precioAprobado: precio, observacion: '' });
          } else {
            nuevosRepuestos.push({ nombre, precioOriginal: precio, accion: 'CAMBIO', descuento: '', observacion: '' });
          }
        });
      }

      if (nuevosRepuestos.length > 0 || nuevaManoObra.length > 0) {
        setNuevaInspeccion(prev => ({ ...prev, repuestos: [...prev.repuestos, ...nuevosRepuestos], manoObra: [...prev.manoObra, ...nuevaManoObra] }));
        alert(`✅ ¡Proforma leída!\n\nMano de obra: ${nuevaManoObra.length}\nRepuestos: ${nuevosRepuestos.length}`);
      } else {
        alert("No se detectaron ítems claros.");
      }

    } catch (error) {
      console.error("Error OCR Gemini:", error);
      alert("❌ Error al procesar:\n" + error.message);
    } finally {
      setCargando(false);
      setProcesandoOCR(false);
    }
  }, [GEMINI_API_KEY]);

  const { getRootProps: getRootPropsProforma, getInputProps: getInputPropsProforma } = useDropzone({ onDrop: onProformaDrop, accept: {'image/*': [], 'application/pdf': []}, maxFiles: 1 });

  const cargarInspecciones = async () => {
    const { data, error } = await supabase.from('inspecciones').select('*').order('id', { ascending: false });
    if (!error) setInspecciones(data);
  };

  const cargarInventarios = async () => {
    const { data, error } = await supabase.from('inventarios_vehiculos').select('*').order('id', { ascending: false });
    if (!error) setListaInventarios(data);
  };
  
  useEffect(() => { 
    if (session) {
      cargarInspecciones(); 
      cargarInventarios();
    }
  }, [session]);

  const onDrop = useCallback(async (acceptedFiles) => {
    setCargando(true);
    const nuevasFotos = [];
    for (const file of acceptedFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('fotos-inspecciones').upload(fileName, file);
      if (!uploadError) {
        const { data } = await supabase.storage.from('fotos-inspecciones').getPublicUrl(fileName);
        nuevasFotos.push({ url: data.publicUrl, itemVinculado: '' }); 
      }
    }
    setFotosSubidas([...fotosSubidas, ...nuevasFotos]);
    setCargando(false);
  }, [fotosSubidas]);
  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: {'image/*': []} });

  const onDropInventario = useCallback(async (acceptedFiles) => {
    setCargando(true);
    const nuevasFotos = [];
    for (const file of acceptedFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `inv-${Date.now()}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('fotos-inspecciones').upload(fileName, file);
      if (!uploadError) {
        const { data } = await supabase.storage.from('fotos-inspecciones').getPublicUrl(fileName);
        nuevasFotos.push({ url: data.publicUrl, nombre: '' }); 
      }
    }
    setFotosInventario([...fotosInventario, ...nuevasFotos]);
    setCargando(false);
  }, [fotosInventario]);
  const { getRootProps: getRootPropsInv, getInputProps: getInputPropsInv } = useDropzone({ onDrop: onDropInventario, accept: {'image/*': []} });

  const agregarManoObra = () => setNuevaInspeccion({ ...nuevaInspeccion, manoObra: [...nuevaInspeccion.manoObra, { nombre: '', precioOriginal: '', accion: 'APROBADO', precioAprobado: '', observacion: '' }] });
  const actualizarManoObra = (index, campo, valor) => {
    const nuevos = [...nuevaInspeccion.manoObra];
    nuevos[index][campo] = valor;
    if (campo === 'accion') {
      if (valor === 'APROBADO') nuevos[index].precioAprobado = nuevos[index].precioOriginal;
      if (valor === 'RECHAZADO') nuevos[index].precioAprobado = 0;
    }
    if (campo === 'precioOriginal' && nuevos[index].accion === 'APROBADO') nuevos[index].precioAprobado = valor;
    setNuevaInspeccion({ ...nuevaInspeccion, manoObra: nuevos });
  };
  
  const agregarRepuesto = () => setNuevaInspeccion({ ...nuevaInspeccion, repuestos: [...nuevaInspeccion.repuestos, { nombre: '', precioOriginal: '', accion: 'CAMBIO', descuento: '', observacion: '' }] });
  const actualizarRepuesto = (index, campo, valor) => {
    const nuevos = [...nuevaInspeccion.repuestos];
    nuevos[index][campo] = valor;
    setNuevaInspeccion({ ...nuevaInspeccion, repuestos: nuevos });
  };

  const actualizarExterior = (campo, propiedad, valor) => {
    setInvExterior(prev => ({ ...prev, [campo]: { ...prev[campo], [propiedad]: valor } }));
  };

  const actualizarInterior = (campo, propiedad, valor) => {
    setInvInterior(prev => ({ ...prev, [campo]: { ...prev[campo], [propiedad]: valor } }));
  };
  
  const actualizarAccesorios = (campo, propiedad, valor) => {
    setInvAccesorios(prev => ({ ...prev, [campo]: { ...prev[campo], [propiedad]: valor } }));
  };

  const limpiarFormulario = () => {
    if(window.confirm("¿Estás seguro de limpiar todos los datos del formulario?")) {
      setNuevaInspeccion({ placa: '', tramite: '', taller: '', marca: '', modelo: '', tipoVehiculo: '', descuentoGlobalManoObra: '', observaciones_generales: '', repuestos: [], manoObra: [], perito: asignarPerito(session.user.email) });
      setFotosSubidas([]);
      setProformaUrl(null);
      setTextoOCR('');
    }
  };

  const totalProforma = nuevaInspeccion.manoObra.reduce((sum, i) => sum + (Number(i.precioOriginal)||0), 0) + nuevaInspeccion.repuestos.reduce((sum, i) => sum + (Number(i.precioOriginal)||0), 0);
  const subtotalMO = nuevaInspeccion.manoObra.reduce((sum, i) => i.accion === 'RECHAZADO' ? sum : sum + (Number(i.precioAprobado)||0), 0);
  const totalMO = subtotalMO - (subtotalMO * (Number(nuevaInspeccion.descuentoGlobalManoObra)||0) / 100);
  const totalRep = nuevaInspeccion.repuestos.reduce((sum, i) => i.accion === 'RECHAZADO' ? sum : sum + ((Number(i.precioOriginal)||0) - ((Number(i.precioOriginal)||0) * (Number(i.descuento)||0) / 100)), 0);
  const totalDiagnostico = totalMO + totalRep;
  const ajusteNeto = totalProforma - totalDiagnostico;

  const generarCodigo = () => {
    const year = new Date().getFullYear();
    const count = inspecciones.length + 1;
    return `INSP-${year}-${String(count).padStart(4, '0')}`;
  };

  const guardarYGenerar = async (e, soloGuardar = false) => {
    if(e) e.preventDefault();
    if(!nuevaInspeccion.placa) return alert("La placa es obligatoria");
    setCargando(true);
    
    const guardarEnMemoria = (key, nuevoValor) => {
      if (!nuevoValor) return;
      const actual = JSON.parse(localStorage.getItem(key)) || [];
      if (!actual.includes(nuevoValor.toUpperCase())) {
        localStorage.setItem(key, JSON.stringify([...actual, nuevoValor.toUpperCase()]));
      }
    };

    guardarEnMemoria('talleres', nuevaInspeccion.taller);
    guardarEnMemoria('marcas', nuevaInspeccion.marca);
    guardarEnMemoria('modelos', nuevaInspeccion.modelo);
    guardarEnMemoria('obsGenerales', nuevaInspeccion.observaciones_generales);
    
    nuevaInspeccion.manoObra.forEach(m => {
      guardarEnMemoria('manoObra', m.nombre);
      guardarEnMemoria('obsMano', m.observacion);
    });
    
    nuevaInspeccion.repuestos.forEach(r => {
      guardarEnMemoria('piezas', r.nombre);
      guardarEnMemoria('obsRep', r.observacion);
    });

    const codigo = generarCodigo();
    
    const datosParaGuardar = {
      codigo: codigo,
      taller: nuevaInspeccion.taller, 
      proforma: Math.round(totalProforma), 
      diagnostico: Math.round(totalDiagnostico),
      ahorro: Math.round(ajusteNeto), 
      placa: nuevaInspeccion.placa, 
      tramite: nuevaInspeccion.tramite,
      marca: nuevaInspeccion.marca, 
      modelo: nuevaInspeccion.modelo, 
      tipoVehiculo: nuevaInspeccion.tipoVehiculo,
      observaciones_generales: nuevaInspeccion.observaciones_generales, 
      repuestos: nuevaInspeccion.repuestos, 
      manoObra: nuevaInspeccion.manoObra, 
      descuentoGlobalManoObra: nuevaInspeccion.descuentoGlobalManoObra === '' ? null : Number(nuevaInspeccion.descuentoGlobalManoObra),
      fotos: fotosSubidas, 
      perito: nuevaInspeccion.perito,
      proforma_pdf: proformaUrl
    };
    
    const { error } = await supabase.from('inspecciones').insert([datosParaGuardar]);
    if (!error) {
      generarPDF(datosParaGuardar, soloGuardar);
      if(!soloGuardar) {
        setNuevaInspeccion({ placa: '', tramite: '', taller: '', marca: '', modelo: '', tipoVehiculo: '', descuentoGlobalManoObra: '', observaciones_generales: '', repuestos: [], manoObra: [], perito: asignarPerito(session.user.email) });
        setFotosSubidas([]);
        setProformaUrl(null);
        setTextoOCR('');
        setVista('inicio');
      }
      cargarInspecciones();
    } else {
      alert("Error al guardar: " + error.message);
      setCargando(false);
    }
  };

  const guardarInventario = async (e) => {
    e.preventDefault();
    if(!invDatos.placa) return alert("La placa es obligatoria en los datos del vehículo");
    setCargando(true);

    const guardarEnLista = (key, valor) => {
      if (!valor) return;
      const listaActual = JSON.parse(localStorage.getItem(key)) || [];
      const valorUpper = valor.toUpperCase();
      if (!listaActual.includes(valorUpper)) {
        localStorage.setItem(key, JSON.stringify([...listaActual, valorUpper]));
      }
    };

    guardarEnLista('inv_marcas', invDatos.marca);
    guardarEnLista('inv_modelos', invDatos.modelo);
    guardarEnLista('inv_tipos', invDatos.tipo);
    guardarEnLista('inv_colores', invDatos.color);
    guardarEnLista('inv_combustibles', invDatos.combustible);
    guardarEnLista('inv_transmisiones', invDatos.transmision);

    const datosParaGuardar = {
      ...invDatos,
      exterior: invExterior,
      interior: invInterior,
      accesorios: invAccesorios,
      observaciones: invObservaciones,
      fotos: fotosInventario,
      perito: nuevaInspeccion.perito
    };

    const { error } = await supabase.from('inventarios_vehiculos').insert([datosParaGuardar]);
    
    if (!error) {
      alert("✅ Inventario guardado correctamente.");
      setGenerandoPDFInv(true);
      await generarPDFInventario(datosParaGuardar);
      setGenerandoPDFInv(false);
      
      setInvDatos({ placa: '', fecha: new Date().toISOString().split('T')[0], marca: '', modelo: '', tipo: '', motor: '', chasis: '', color: '', kilometraje: '', combustible: '', transmision: '' });
      setInvExterior({
        parabrisas: { tiene: '', estado: '', cantidad: '' },
        emblemas: { tiene: '', estado: '', cantidad: '' },
        faroles_rh: { tiene: '', estado: '', cantidad: '' },
        faroles_lh: { tiene: '', estado: '', cantidad: '' },
        medias_luces_rh: { tiene: '', estado: '', cantidad: '' },
        medias_luces_lh: { tiene: '', estado: '', cantidad: '' },
        mascara: { tiene: '', estado: '', cantidad: '' },
        llanta_auxilio: { tiene: '', estado: '', cantidad: '' },
        rompe_nieblas_rh: { tiene: '', estado: '', cantidad: '' },
        rompe_nieblas_lh: { tiene: '', estado: '', cantidad: '' },
        tapa_cubo: { tiene: '', estado: '', cantidad: '' },
        tapa_ruedas: { tiene: '', estado: '', cantidad: '' },
        tapa_sol_rh: { tiene: '', estado: '', cantidad: '' },
        tapa_sol_lh: { tiene: '', estado: '', cantidad: '' },
        antena: { tiene: '', estado: '', cantidad: '' },
        guinadores_rh: { tiene: '', estado: '', cantidad: '' },
        guinadores_lh: { tiene: '', estado: '', cantidad: '' },
        halogenos_rh: { tiene: '', estado: '', cantidad: '' },
        halogenos_lh: { tiene: '', estado: '', cantidad: '' },
        limpiaparabrisas_rh: { tiene: '', estado: '', cantidad: '' },
        limpiaparabrisas_lh: { tiene: '', estado: '', cantidad: '' },
        neutralizadores: { tiene: '', estado: '', cantidad: '' },
        retrovisores_rh: { tiene: '', estado: '', cantidad: '' },
        retrovisores_lh: { tiene: '', estado: '', cantidad: '' },
        stops_rh: { tiene: '', estado: '', cantidad: '' },
        stops_lh: { tiene: '', estado: '', cantidad: '' },
        tapa_radiador: { tiene: '', estado: '', cantidad: '' },
        tapa_tanque: { tiene: '', estado: '', cantidad: '' },
        tapa_dep_agua: { tiene: '', estado: '', cantidad: '' },
        parachoques_del: { tiene: '', estado: '', cantidad: '' },
        parachoques_tras: { tiene: '', estado: '', cantidad: '' },
        spoiler: { tiene: '', estado: '', cantidad: '' },
        pechera: { tiene: '', estado: '', cantidad: '' },
        llantas_del: { tiene: '', estado: '', cantidad: '' },
        llantas_tras: { tiene: '', estado: '', cantidad: '' },
        aros: { tiene: '', estado: '', cantidad: '' },
        estado_llantas: { tiene: '', estado: '', cantidad: '' },
      });
      setInvInterior({ 
        luces_interiores: { tiene: '', estado: '' },
        radio: { tiene: '', estado: '' },
        parlantes: { tiene: '', estado: '' },
        encendedor: { tiene: '', estado: '' },
        cinturones_rh: { tiene: '', estado: '' },
        cinturones_lh: { tiene: '', estado: '' },
        asientos: { tiene: '', estado: '' }
      });
      setInvAccesorios({ 
        cola_pato: { tiene: '', estado: '' },
        techo_solar: { tiene: '', estado: '' },
        mataburro: { tiene: '', estado: '' },
        parrilla: { tiene: '', estado: '' },
        pisaderas: { tiene: '', estado: '' },
        gato: { tiene: '', estado: '' },
        llaves: { tiene: '', estado: '' },
        alarma: { tiene: '', estado: '' }
      });
      setInvObservaciones('');
      setFotosInventario([]);
      setTabInventario(0);
      setVistaInventarios('lista');
      cargarInventarios();
    } else {
      alert("Error al guardar inventario: " + error.message);
    }
    setCargando(false);
  };

  const generarPDF = async (datos, soloGuardar = false) => {
    if (!soloGuardar) {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      doc.setTextColor(0, 0, 0); doc.setFontSize(10);
      doc.text(`CÓDIGO: ${datos.codigo || 'N/A'}`, 14, 40);
      
      const col1 = 14; const col2 = 60; const col3 = 110; const col4 = 155;
      
      doc.text(`PLACA: ${(datos.placa || '').toUpperCase()}`, col1, 48);
      doc.text(`MARCA: ${(datos.marca || '').toUpperCase()}`, col2, 48);
      doc.text(`MODELO: ${(datos.modelo || '').toUpperCase()}`, col3, 48);
      doc.text(`TIPO: ${(datos.tipoVehiculo || '').toUpperCase()}`, col4, 48);
      
      doc.text(`TRÁMITE: ${(datos.tramite || '').toUpperCase()}`, col1, 55);
      doc.text(`TALLER: ${(datos.taller || '').toUpperCase()}`, col2, 55);
      doc.text(`FECHA: ${new Date().toLocaleDateString()}`, col4, 55);

      const tableManoObra = datos.manoObra.map(m => [(m.nombre || '').toUpperCase(), m.precioOriginal ? `Bs ${m.precioOriginal}` : '-', (m.accion || '').toUpperCase(), m.accion === 'RECHAZADO' ? 'Bs 0' : `Bs ${m.precioAprobado || 0}`, m.observacion ? m.observacion.toUpperCase() : '-']);
      if (tableManoObra.length > 0) { autoTable(doc, { startY: 65, margin: { left: 14, right: 14 }, head: [['Mano de Obra', 'P. Original', 'Acción', 'P. Aprobado', 'Observación']], body: tableManoObra, styles: { fontSize: 8 }, headStyles: { fillColor: [0, 51, 102] } }); }

      const tableRepuestos = datos.repuestos.map(r => [(r.nombre || '').toUpperCase(), r.precioOriginal ? `Bs ${r.precioOriginal}` : 'S/P', (r.accion || '').toUpperCase(), r.descuento ? `-${r.descuento}%` : '-', r.observacion ? r.observacion.toUpperCase() : '-']);
      if (tableRepuestos.length > 0) { autoTable(doc, { startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 65, margin: { left: 14, right: 14 }, head: [['Pieza / Repuesto', 'P. Original', 'Acción', 'Desc.', 'Observación']], body: tableRepuestos, styles: { fontSize: 8 }, headStyles: { fillColor: [0, 166, 80] } }); }

      let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 65;
      
      doc.setDrawColor(0, 51, 102); doc.rect(14, finalY, pageWidth - 28, 35); doc.setFontSize(10);
      doc.text(`Total Proforma Original: Bs ${totalProforma.toFixed(2)}`, 18, finalY + 8); 
      doc.text(`Total Mano de Obra: Bs ${totalMO.toFixed(2)}`, 18, finalY + 16); 
      doc.text(`Total Repuestos: Bs ${totalRep.toFixed(2)}`, 18, finalY + 24);
      
      doc.setFontSize(12); doc.setTextColor(0, 51, 102); 
      doc.text(`TOTAL DIAGNÓSTICO: Bs ${totalDiagnostico.toFixed(2)}`, 110, finalY + 16); 
      doc.setTextColor(0, 166, 80); 
      doc.text(`AJUSTE NETO: Bs ${ajusteNeto.toFixed(2)}`, 110, finalY + 24);

      doc.setTextColor(0, 0, 0); doc.setFontSize(10); 
      doc.text("OBSERVACIONES GENERALES:", 14, finalY + 48);
      const splitObs = doc.splitTextToSize((datos.observaciones_generales || 'NINGUNA').toUpperCase(), pageWidth - 28); 
      doc.text(splitObs, 14, finalY + 55);

      let firmaY = finalY + 55 + (splitObs.length * 5) + 10; 
      if (firmaY > 250) firmaY = 250;
      
      let firmaImgSrc = firmaGuillermo; 
      if (datos.perito === 'BRIAN MOREIRA') firmaImgSrc = firmaCompanero;

      const imgFirma = new Image(); imgFirma.src = firmaImgSrc; 
      await new Promise((resolve) => {
        imgFirma.onload = () => { doc.addImage(imgFirma, 'PNG', 80, firmaY, 50, 25); resolve(); };
        imgFirma.onerror = () => resolve();
      });

      if (datos.fotos && datos.fotos.length > 0) {
        doc.addPage(); 
        doc.setTextColor(0, 0, 0); doc.setFontSize(11);
        doc.text("REGISTRO FOTOGRÁFICO", 14, 35);
        
        const anchoFoto = 75; const altoFoto = 45; const espacioX = 10; const espacioY = 15; 
        let filaActual = 0; let columnaActual = 0;

        for (let i = 0; i < datos.fotos.length; i++) {
          const foto = datos.fotos[i]; 
          if (columnaActual === 2) { columnaActual = 0; filaActual++; }
          let posY = 45 + (filaActual * (altoFoto + espacioY + 10)); 
          
          if (posY + altoFoto + 15 > 260) {
            doc.addPage(); doc.text("REGISTRO FOTOGRÁFICO (CONT.)", 14, 35);
            filaActual = 0; columnaActual = 0; posY = 45;
          }
          
          const posX = 25 + (columnaActual * (anchoFoto + espacioX)); 
          
          try {
            const response = await fetch(foto.url); const blob = await response.blob();
            const base64data = await new Promise((resolve) => { const reader = new FileReader(); reader.onloadend = () => resolve(reader.result); reader.readAsDataURL(blob); });
            
            doc.setFillColor(241, 245, 249);
            doc.roundedRect(posX - 3, posY - 3, anchoFoto + 6, altoFoto + 15, 3, 3, 'F');
            doc.setDrawColor(203, 213, 225); 
            doc.roundedRect(posX - 3, posY - 3, anchoFoto + 6, altoFoto + 15, 3, 3, 'S');
            
            doc.addImage(base64data, 'JPEG', posX, posY, anchoFoto, altoFoto); 
            
            doc.setFontSize(9); doc.setTextColor(0, 0, 0); 
            doc.text(`Ítem: ${(foto.itemVinculado || 'SIN ASIGNAR').toUpperCase()}`, posX, posY + altoFoto + 7); 
          } catch (error) { console.log("Error al cargar foto", error); }
          columnaActual++; 
        }
      }

      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFillColor(0, 51, 102); doc.rect(0, 0, pageWidth, 25, 'F'); 
        const imgLogo = new Image(); imgLogo.src = logoAlianza; doc.addImage(imgLogo, 'PNG', 14, 4, 25, 17); 
        doc.setTextColor(255, 255, 255); doc.setFontSize(16); doc.text("INSPECPRO", 45, 15); doc.setFontSize(9); doc.text("SISTEMA DE DIAGNÓSTICO VEHICULAR", 45, 21);
        doc.setDrawColor(0, 51, 102); doc.setLineWidth(0.5); doc.rect(10, 30, pageWidth - 20, pageHeight - 45, 'S');
        doc.setFillColor(245, 247, 250); doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
        doc.setTextColor(100, 116, 139); doc.setFontSize(8);
        doc.text("ALIANZA GRUPO ASEGURADOR - HERRAMIENTA DE USO INTERNO", pageWidth / 2, pageHeight - 5, { align: "center" });
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - 14, pageHeight - 5, { align: "right" });
      }

      doc.save(`Diagnóstico ${(datos.placa || 'SIN PLACA').toUpperCase()}.pdf`);
      setCargando(false);
    } else {
      setCargando(false);
      alert("Datos guardados correctamente. No se generó PDF.");
    }
  };

  const generarPDFInventario = async (datos) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    const filtrarData = (objeto) => {
      return Object.keys(objeto)
        .filter(key => objeto[key].tiene !== 'N/A')
        .map(key => {
          const item = objeto[key];
          let detalle = item.tiene || '-';
          if (item.tiene === 'SI' && item.estado) detalle = item.estado;
          if (item.tiene === 'SI' && item.cantidad) detalle += ` (${item.cantidad})`;
          return [key.replace(/_/g, ' ').toUpperCase(), detalle];
        });
    };

    doc.setTextColor(0, 0, 0); doc.setFontSize(9);
    doc.text(`PLACA: ${datos.placa}`, 14, 38);
    doc.text(`FECHA: ${datos.fecha}`, 110, 38);
    doc.text(`MARCA: ${datos.marca}`, 14, 43);
    doc.text(`MODELO: ${datos.modelo}`, 110, 43);
    doc.text(`TIPO: ${datos.tipo}`, 14, 48);
    doc.text(`MOTOR: ${datos.motor}`, 110, 48);
    doc.text(`CHASIS: ${datos.chasis}`, 14, 53);
    doc.text(`COLOR: ${datos.color}`, 110, 53);
    doc.text(`KILOMETRAJE: ${datos.kilometraje}`, 14, 58);
    doc.text(`COMBUSTIBLE: ${datos.combustible}`, 110, 58);
    doc.text(`TRANSMISIÓN: ${datos.transmision}`, 14, 63);

    let currentY = 70;

    const drawTwoColumnTable = (titulo, data, headColor) => {
      if (data.length === 0) return;
      
      doc.setFontSize(10); doc.setTextColor(0, 51, 102); doc.text(titulo, 14, currentY);
      currentY += 4;

      const midPoint = Math.ceil(data.length / 2);
      const leftData = data.slice(0, midPoint);
      const rightData = data.slice(midPoint);

      autoTable(doc, {
        startY: currentY,
        head: [['Ítem', 'Detalle']],
        body: leftData,
        styles: { fontSize: 8, cellPadding: 1 },
        headStyles: { fillColor: headColor },
        columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 45 } },
        margin: { left: 14 },
        tableWidth: 85
      });

      const leftTableEndY = doc.lastAutoTable.finalY;

      if (rightData.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [['Ítem', 'Detalle']],
          body: rightData,
          styles: { fontSize: 8, cellPadding: 1 },
          headStyles: { fillColor: headColor },
          columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 45 } },
          margin: { left: 105 }, 
          tableWidth: 85
        });
      }

      const rightTableEndY = doc.lastAutoTable.finalY;
      currentY = Math.max(leftTableEndY, rightTableEndY) + 8;
    };

    drawTwoColumnTable("EXTERIOR", filtrarData(datos.exterior), [0, 51, 102]);
    drawTwoColumnTable("INTERIOR", filtrarData(datos.interior), [0, 166, 80]);
    drawTwoColumnTable("ACCESORIOS", filtrarData(datos.accesorios), [245, 158, 11]);

    doc.setTextColor(0, 0, 0); doc.setFontSize(10); doc.text("OBSERVACIONES:", 14, currentY);
    const splitObs = doc.splitTextToSize(datos.observaciones || 'NINGUNA', pageWidth - 28); 
    doc.setFontSize(9); doc.text(splitObs, 14, currentY + 4);
    currentY += 4 + (splitObs.length * 4) + 10;

    if (currentY + 30 > pageHeight - 30) {
      currentY = pageHeight - 35;
    }
    
    let firmaImgSrc = firmaGuillermo; 
    if (datos.perito === 'BRIAN MOREIRA') firmaImgSrc = firmaCompanero;

    const imgFirma = new Image(); imgFirma.src = firmaImgSrc; 
    await new Promise((resolve) => {
      imgFirma.onload = () => { 
        const firmaX = (pageWidth / 2) - 25; 
        doc.addImage(imgFirma, 'PNG', firmaX, currentY, 50, 25); 
        resolve(); 
      };
      imgFirma.onerror = () => resolve();
    });

    if (datos.fotos && datos.fotos.length > 0) {
      doc.addPage(); 
      
      const anchoFoto = 55; 
      const altoFoto = 45; 
      const espacioX = 10; 
      const espacioY = 15; 
      let columnaActual = 0;
      
      doc.setTextColor(0, 51, 102); doc.setFontSize(12); doc.text("REGISTRO FOTOGRÁFICO", 14, 40);
      currentY = 45; 
      
      for (let i = 0; i < datos.fotos.length; i++) {
        if (columnaActual === 3) { 
          columnaActual = 0; 
          currentY += altoFoto + espacioY + 5; 
        }
        
        if (currentY + altoFoto + 10 > pageHeight - 25) {
          doc.addPage(); 
          currentY = 40;
          doc.setTextColor(0, 51, 102); doc.setFontSize(12); doc.text("REGISTRO FOTOGRÁFICO (CONT.)", 14, currentY);
          currentY += 5;
          columnaActual = 0;
        }
        
        const posX = 14 + (columnaActual * (anchoFoto + espacioX)); 
        
        try {
          const response = await fetch(datos.fotos[i].url); const blob = await response.blob();
          const base64data = await new Promise((resolve) => { const reader = new FileReader(); reader.onloadend = () => resolve(reader.result); reader.readAsDataURL(blob); });
          
          doc.setFillColor(241, 245, 249);
          doc.roundedRect(posX - 2, currentY - 2, anchoFoto + 4, altoFoto + 10, 3, 3, 'F');
          doc.setDrawColor(203, 213, 225); 
          doc.roundedRect(posX - 2, currentY - 2, anchoFoto + 4, altoFoto + 10, 3, 3, 'S');
          
          doc.addImage(base64data, 'JPEG', posX, currentY, anchoFoto, altoFoto); 
          
          doc.setFontSize(8); doc.setTextColor(0, 0, 0); 
          doc.text(`${(datos.fotos[i].nombre || 'S/N').toUpperCase()}`, posX, currentY + altoFoto + 6); 
        } catch (e) { console.log(e); }
        columnaActual++;
      }
    }

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFillColor(0, 51, 102); doc.rect(0, 0, pageWidth, 25, 'F'); 
      const imgLogo = new Image(); imgLogo.src = logoAlianza; doc.addImage(imgLogo, 'PNG', 14, 4, 25, 17); 
      doc.setTextColor(255, 255, 255); doc.setFontSize(16); doc.text("INSPECPRO", 45, 15); doc.setFontSize(9); doc.text("ACTA DE INVENTARIO VEHICULAR", 45, 21);
      
      doc.setFillColor(245, 247, 250); doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
      doc.setTextColor(100, 116, 139); doc.setFontSize(8);
      doc.text("ALIANZA GRUPO ASEGURADOR - HERRAMIENTA DE USO INTERNO", pageWidth / 2, pageHeight - 5, { align: "center" });
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - 14, pageHeight - 5, { align: "right" });
    }

    doc.save(`Inventario ${datos.placa}.pdf`);
  };

  const inspeccionesFiltradas = inspecciones.filter(insp => {
    if (!session) return false;
    const esAdmin = puedeVerDashboard(session.user.email);
    const esDueño = insp.perito === asignarPerito(session.user.email);
    const tienePermiso = esAdmin || esDueño;
    const coincideBusqueda = 
      insp.placa?.toLowerCase().includes(busqueda.toLowerCase()) || 
      insp.tramite?.toLowerCase().includes(busqueda.toLowerCase());
    return tienePermiso && coincideBusqueda;
  });

  const totalAhorroGlobal = inspecciones.reduce((sum, insp) => sum + (Number(insp.ahorro) || 0), 0);
  const ahorroPorTaller = inspecciones.reduce((acc, insp) => {
    const taller = insp.taller || 'SIN TALLER';
    if (!acc[taller]) acc[taller] = { nombre: taller, ahorro: 0, inspecciones: 0 };
    acc[taller].ahorro += Number(insp.ahorro) || 0;
    acc[taller].inspecciones += 1;
    return acc;
  }, {});
  const dataTalleres = Object.values(ahorroPorTaller).sort((a, b) => b.ahorro - a.ahorro).slice(0, 5);

  const styles = {
    body: { fontFamily: "'Nunito', sans-serif", backgroundColor: '#f4f6f9', minHeight: '100vh', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' },
    navbar: { background: 'linear-gradient(135deg, #005b96 0%, #004b7a 100%)', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', color: 'white' },
    navbarBrand: { display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '800', fontSize: '22px', cursor: 'pointer' },
    logo: { height: '38px', background: 'white', padding: '4px 8px', borderRadius: '6px' },
    navLinks: { display: 'flex', gap: '15px', alignItems: 'center' },
    navLink: { color: 'white', fontWeight: '600', cursor: 'pointer', padding: '8px 16px', borderRadius: '8px' },
    btnLogout: { color: 'white', background: 'transparent', border: '1px solid white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '15px' },
    container: { maxWidth: '1100px', margin: '40px auto', padding: '0 20px', flex: 1 },
    footer: { textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '12px', fontWeight: '600', letterSpacing: '1px' },
    card: { background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', border: '1px solid #e2e8f0', padding: '30px', marginBottom: '24px' },
    heroSection: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'center', marginTop: '40px' },
    heroText: { fontSize: '18px', color: '#64748b', marginBottom: '30px', lineHeight: '1.6' },
    heroTitle: { fontSize: '38px', fontWeight: '800', color: '#0f172a', lineHeight: '1.2', marginBottom: '20px' },
    heroImage: { background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', textAlign: 'center', border: '1px solid #f1f5f9' },
    btnPrimary: { padding: '14px 24px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', border: 'none', background: '#005b96', color: 'white', boxShadow: '0 4px 12px rgba(0, 91, 150, 0.3)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px' },
    btnOutline: { padding: '14px 24px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', border: '2px solid #e2e8f0', background: 'white', color: '#475569', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px' },
    btnSuccess: { padding: '14px 20px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', border: 'none', background: '#10b981', color: 'white', fontSize: '15px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' },
    btnWarning: { padding: '14px 20px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', border: 'none', background: '#f59e0b', color: 'white', fontSize: '15px', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' },
    btnDanger: { padding: '14px 20px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', border: 'none', background: '#ef4444', color: 'white', fontSize: '15px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    formLabel: { fontSize: '14px', fontWeight: '700', color: '#475569' },
    formInput: { padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '15px', fontFamily: 'inherit', outline: 'none', background: '#f8fafc', width: '100%' },
    itemRow: { display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', background: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '10px', border: '1px solid #e2e8f0' },
    btnDelete: { background: '#fee2e2', color: '#dc2626', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' },
    cardTitle: { color: '#004b7a', fontSize: '20px', fontWeight: '800', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px' },
    rowBetween: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
    searchBar: { display: 'flex', gap: '10px', marginBottom: '20px', background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' },
    previewTable: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    previewTh: { background: '#f8fafc', padding: '10px', textAlign: 'left', fontSize: '13px', color: '#475569', borderBottom: '2px solid #e2e8f0' },
    previewTd: { padding: '10px', fontSize: '14px', borderBottom: '1px solid #e2e8f0' },
    kpiCard: { background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', textAlign: 'center' },
    kpiValue: { fontSize: '36px', fontWeight: '800', color: '#005b96', margin: '10px 0' },
    kpiLabel: { fontSize: '14px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' },
    chartCard: { background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', marginBottom: '24px' },
    visorModal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
    visorContenido: { background: 'white', borderRadius: '12px', padding: '20px', width: '80%', maxWidth: '800px', height: '85vh', display: 'flex', flexDirection: 'column' },
    visorFrame: { flex: 1, width: '100%', border: 'none', borderRadius: '8px', marginBottom: '15px', backgroundColor: '#f1f5f9' },
    tabBtn: { padding: '10px 20px', border: 'none', background: 'transparent', fontWeight: '700', fontSize: '15px', cursor: 'pointer', color: '#64748b', borderBottom: '3px solid transparent' },
    tabBtnActive: { padding: '10px 20px', border: 'none', background: 'transparent', fontWeight: '700', fontSize: '15px', cursor: 'pointer', color: '#005b96', borderBottom: '3px solid #005b96' },
  };

  if (!session) {
    return (
      <div style={{...styles.body, justifyContent: 'center', alignItems: 'center'}}>
        <div style={{...styles.card, maxWidth: '400px', width: '100%', padding: '40px'}}>
          <div style={{textAlign: 'center', marginBottom: '30px'}}>
            <img src={logoAlianza} alt="Alianza" style={{height: '60px', marginBottom: '20px'}} />
            <h2 style={{color: '#004b7a', fontSize: '24px', fontWeight: '800'}}>InspecPro</h2>
            <p style={{color: '#64748b', fontSize: '14px'}}>Sistema de Gestión de Inspecciones</p>
          </div>
          <form onSubmit={handleLogin}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Correo Electrónico</label>
              <input type="email" style={styles.formInput} placeholder="ejemplo@alianza.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div style={{...styles.formGroup, marginTop: '15px'}}>
              <label style={styles.formLabel}>Contraseña</label>
              <input type="password" style={styles.formInput} placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {loginError && <p style={{color: '#ef4444', fontSize: '13px', marginTop: '10px', textAlign: 'center'}}>{loginError}</p>}
            <button type="submit" style={{...styles.btnPrimary, width: '100%', justifyContent: 'center', marginTop: '25px'}}>Iniciar Sesión</button>
          </form>
        </div>
      </div>
    );
  }

  return (
       <div style={styles.body} onClick={() => setMenuInspeccionesAbierto(false)}>
            <nav style={styles.navbar} className="navbar" onClick={(e) => e.stopPropagation()}>
        <div style={{...styles.navbarBrand, color: 'white'}} className="navbar-brand" onClick={() => setVista('inicio')}>
          <img src={logoAlianza} alt="Alianza" style={styles.logo} />
          InspecPro
        </div>
        <div style={styles.navLinks} className="navLinks">
                   <span style={{...styles.navLink, background: vista === 'inicio' ? 'rgba(255,255,255,0.15)' : 'transparent'}} onClick={() => { setVista('inicio'); setMenuInspeccionesAbierto(false); }}>Inicio</span>
                    {/* MENÚ DESPLEGABLE DE INSPECCIONES */}
          <div style={{ position: 'relative' }}>
            <span 
              style={{...styles.navLink, background: (vista === 'historial' || vista === 'formulario') ? 'rgba(255,255,255,0.15)' : 'transparent', cursor: 'pointer' }}
              onClick={() => setMenuInspeccionesAbierto(!menuInspeccionesAbierto)}
            >
              Inspecciones
            </span>

            {menuInspeccionesAbierto && (
              <div style={{ position: 'absolute', top: '100%', left: 0, backgroundColor: 'white', minWidth: '200px', boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)', zIndex: 100, borderRadius: '8px', marginTop: '5px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <span 
                  style={{ color: '#005b96', padding: '12px 16px', display: 'block', cursor: 'pointer', fontWeight: 'bold', borderBottom: '1px solid #f1f5f9' }} 
                  onClick={() => { setVista('historial'); setInspeccionSeleccionada(null); setMenuInspeccionesAbierto(false); }}
                >
                  Ver Listado
                </span>
                <span 
                  style={{ color: '#005b96', padding: '12px 16px', display: 'block', cursor: 'pointer', fontWeight: 'bold' }} 
                  onClick={() => { setVista('formulario'); setMenuInspeccionesAbierto(false); }}
                >
                  Nueva Inspección
                </span>
              </div>
            )}
          </div>

                    <span style={{...styles.navLink, background: vista === 'inventarios' ? 'rgba(255,255,255,0.15)' : 'transparent'}} onClick={() => { setVista('inventarios'); setVistaInventarios('lista'); setMenuInspeccionesAbierto(false); }}>Inventarios</span>
          
          {puedeVerDashboard(session?.user?.email) && (
            <span style={{...styles.navLink, background: vista === 'dashboard' ? 'rgba(255,255,255,0.15)' : 'transparent'}} onClick={() => setVista('dashboard')}>Dashboard</span>
          )}

                    <span style={{...styles.navLink, background: vista === 'perfil' ? 'rgba(255,255,255,0.15)' : 'transparent'}} onClick={() => { setVista('perfil'); setMenuInspeccionesAbierto(false); }}><FaUserTie style={{marginRight: '5px'}} /> Perfil</span>
          <button style={styles.btnLogout} onClick={handleLogout}><FaSignOutAlt /> Salir</button>
        </div>
      </nav>

      <div style={styles.container} className="container">
        {vista === 'dashboard' && puedeVerDashboard(session?.user?.email) && (
          <div>
            <h2 style={{...styles.heroTitle, fontSize: '28px', marginBottom: '30px'}}>Dashboard de Informes</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={styles.kpiCard}>
                <div style={styles.kpiLabel}>Total Inspecciones</div>
                <div style={styles.kpiValue}>{inspecciones.length}</div>
              </div>
              <div style={styles.kpiCard}>
                <div style={styles.kpiLabel}>Ajuste Total Generado</div>
                <div style={{...styles.kpiValue, color: '#10b981'}}>Bs {totalAhorroGlobal.toLocaleString()}</div>
              </div>
              <div style={styles.kpiCard}>
                <div style={styles.kpiLabel}>Talleres Evaluados</div>
                <div style={styles.kpiValue}>{Object.keys(ahorroPorTaller).length}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }} className="dashboard-grid">
              <div style={styles.chartCard}>
                <h3 style={{fontSize: '16px', color: '#004b7a', marginBottom: '20px'}}>Top 5 Talleres con Mayor Inflación</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={dataTalleres} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value) => `Bs ${value}`} />
                      <Bar dataKey="ahorro" fill="#005b96" radius={[4, 4, 0, 0]} name="Ajuste (Bs)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={styles.chartCard}>
                <h3 style={{fontSize: '16px', color: '#004b7a', marginBottom: '20px'}}>Distribución de Inspecciones</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={dataTalleres} dataKey="inspecciones" nameKey="nombre" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                        {dataTalleres.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {vista === 'inicio' && (
          <div style={styles.heroSection} className="hero-section">
            <div>
              <h1 style={styles.heroTitle}>Gestión de Inspecciones y Control de Costos</h1>
              <p style={styles.heroText}>Elaboración de diagnósticos, ajuste de costos y reportes de inspecciones.</p>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button style={styles.btnPrimary} onClick={() => setVista('formulario')}><FaPlus /> NUEVA INSPECCIÓN</button>
                <button style={styles.btnOutline} onClick={() => { setVista('historial'); setInspeccionSeleccionada(null); }}><FaHistory /> HISTORIAL</button>
              </div>
            </div>
            <div style={styles.heroImage}>
              <img src={logoAlianza} alt="Alianza Logo" style={{width: '70%', maxWidth: '250px', marginBottom: '25px'}} />
              <h2 style={{ color: '#005b96', marginBottom: '10px' }}>Control Técnico-Operativo</h2>
              <p style={{ color: '#64748b', textAlign: 'center', fontSize: '14px' }}>Evidencia fotográfica y reportes.</p>
            </div>
          </div>
        )}

        {vista === 'perfil' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{...styles.heroTitle, fontSize: '28px', marginBottom: '30px'}}>Mi Perfil</h2>
            
            <div style={{ ...styles.card, display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#005b96', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '36px', fontWeight: 'bold' }}>
                {nuevaInspeccion.perito === 'BRIAN MOREIRA' ? 'BM' : 'GI'}
              </div>
              
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h3 style={{ fontSize: '24px', color: '#0f172a', margin: '0 0 5px 0' }}>{nuevaInspeccion.perito}</h3>
                <p style={{ color: '#64748b', margin: '0 0 5px 0', fontSize: '15px' }}><FaUserTie style={{marginRight: '5px'}}/> Perito / Asistente de Inspección</p>
                <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>{session.user.email}</p>
              </div>

              <div>
                <button style={{...styles.btnPrimary, backgroundColor: '#f59e0b'}} onClick={() => setMostrarCambioPass(true)}>
                  <FaKey /> Cambiar mi Contraseña
                </button>
              </div>
            </div>

            <h3 style={{ fontSize: '18px', color: '#004b7a', marginBottom: '15px', marginTop: '30px' }}>Mis Estadísticas</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={styles.kpiCard}>
                <div style={styles.kpiLabel}>Mis Inspecciones</div>
                <div style={styles.kpiValue}>
                  {inspecciones.filter(i => i.perito === nuevaInspeccion.perito).length}
                </div>
              </div>
              <div style={styles.kpiCard}>
                <div style={styles.kpiLabel}>Ajuste Generado</div>
                <div style={{...styles.kpiValue, color: '#10b981'}}>
                  Bs {inspecciones.filter(i => i.perito === nuevaInspeccion.perito).reduce((sum, i) => sum + (Number(i.ahorro) || 0), 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {vista === 'inventarios' && vistaInventarios === 'lista' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{...styles.heroTitle, fontSize: '28px', margin: 0}}>Historial de Inventarios</h2>
              <button style={styles.btnPrimary} onClick={() => setVistaInventarios('formulario')}><FaPlus /> NUEVO INVENTARIO</button>
            </div>

            <div style={styles.searchBar}>
              <div style={{position: 'relative', flex: 1}}>
                <FaSearch style={{position: 'absolute', left: '15px', top: '15px', color: '#94a3b8'}} />
                <input type="text" placeholder="Buscar por Placa..." style={{...styles.formInput, paddingLeft: '40px'}} value={busquedaInv} onChange={(e) => setBusquedaInv(e.target.value.toUpperCase())} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {listaInventarios.filter(inv => inv.placa?.toLowerCase().includes(busquedaInv.toLowerCase())).map(inv => (
                <div key={inv.id} style={{...styles.card, borderLeft: '5px solid #10b981', padding: '20px', cursor: 'pointer'}} onClick={() => setInventarioSeleccionado(inv)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#005b96', margin: 0 }}>{inv.placa}</h3>
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>{inv.fecha}</span>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>Vehículo: {inv.marca} {inv.modelo}</p>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Perito: {inv.perito}</p>
                  <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '15px', textAlign: 'right', fontWeight: 'bold' }}>Clic para ver detalle →</p>
                </div>
              ))}
              {listaInventarios.length === 0 && <p style={{color: '#64748b'}}>Aún no hay inventarios registrados.</p>}
            </div>
          </div>
        )}

        {vista === 'inventarios' && vistaInventarios === 'formulario' && (
          <div>
            <button style={{...styles.btnOutline, marginBottom: '20px', padding: '10px'}} onClick={() => setVistaInventarios('lista')}><FaArrowLeft /> Volver al Listado</button>
            
            <div style={styles.card}>
              <h2 style={styles.cardTitle}><FaCar /> Registro de Inventario Vehicular</h2>
              
              <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '20px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                <button style={tabInventario === 0 ? styles.tabBtnActive : styles.tabBtn} onClick={() => setTabInventario(0)}>1. Datos del Vehículo</button>
                <button style={tabInventario === 1 ? styles.tabBtnActive : styles.tabBtn} onClick={() => setTabInventario(1)}>2. Exterior</button>
                <button style={tabInventario === 2 ? styles.tabBtnActive : styles.tabBtn} onClick={() => setTabInventario(2)}>3. Interior y Accesorios</button>
                <button style={tabInventario === 3 ? styles.tabBtnActive : styles.tabBtn} onClick={() => setTabInventario(3)}>4. Fotos y Notas</button>
              </div>

              {tabInventario === 0 && (
                <div style={styles.formGrid} className="form-grid">
                  <div style={styles.formGroup}><label style={styles.formLabel}>Placa</label><input style={styles.formInput} value={invDatos.placa} onChange={e => setInvDatos({...invDatos, placa: e.target.value.toUpperCase()})} /></div>
                  <div style={styles.formGroup}><label style={styles.formLabel}>Fecha</label><input type="date" style={styles.formInput} value={invDatos.fecha} onChange={e => setInvDatos({...invDatos, fecha: e.target.value})} /></div>
                  
                  <div style={styles.formGroup}><label style={styles.formLabel}>Marca</label><input style={styles.formInput} list="inv-marcas" value={invDatos.marca} onChange={e => setInvDatos({...invDatos, marca: e.target.value.toUpperCase()})} /><datalist id="inv-marcas">{invListaMarcas.map(m => <option key={m} value={m} />)}</datalist></div>
                  <div style={styles.formGroup}><label style={styles.formLabel}>Modelo</label><input style={styles.formInput} list="inv-modelos" value={invDatos.modelo} onChange={e => setInvDatos({...invDatos, modelo: e.target.value.toUpperCase()})} /><datalist id="inv-modelos">{invListaModelos.map(m => <option key={m} value={m} />)}</datalist></div>
                  <div style={styles.formGroup}><label style={styles.formLabel}>Tipo</label><input style={styles.formInput} list="inv-tipos" value={invDatos.tipo} onChange={e => setInvDatos({...invDatos, tipo: e.target.value.toUpperCase()})} /><datalist id="inv-tipos">{invListaTipos.map(t => <option key={t} value={t} />)}</datalist></div>
                  
                  <div style={styles.formGroup}><label style={styles.formLabel}>Motor</label><input style={styles.formInput} value={invDatos.motor} onChange={e => setInvDatos({...invDatos, motor: e.target.value.toUpperCase()})} /></div>
                  <div style={styles.formGroup}><label style={styles.formLabel}>N° Chasis</label><input style={styles.formInput} value={invDatos.chasis} onChange={e => setInvDatos({...invDatos, chasis: e.target.value.toUpperCase()})} /></div>
                  
                  <div style={styles.formGroup}><label style={styles.formLabel}>Color</label><input style={styles.formInput} list="inv-colores" value={invDatos.color} onChange={e => setInvDatos({...invDatos, color: e.target.value.toUpperCase()})} /><datalist id="inv-colores">{invListaColores.map(c => <option key={c} value={c} />)}</datalist></div>
                  <div style={styles.formGroup}><label style={styles.formLabel}>Kilometraje</label><input style={styles.formInput} value={invDatos.kilometraje} onChange={e => setInvDatos({...invDatos, kilometraje: e.target.value.toUpperCase()})} /></div>
                  
                  <div style={styles.formGroup}><label style={styles.formLabel}>Combustible</label><input style={styles.formInput} list="inv-combustibles" value={invDatos.combustible} onChange={e => setInvDatos({...invDatos, combustible: e.target.value.toUpperCase()})} /><datalist id="inv-combustibles">{invListaCombustibles.map(c => <option key={c} value={c} />)}</datalist></div>
                  <div style={styles.formGroup}><label style={styles.formLabel}>Transmisión</label><input style={styles.formInput} list="inv-transmisiones" value={invDatos.transmision} onChange={e => setInvDatos({...invDatos, transmision: e.target.value.toUpperCase()})} /><datalist id="inv-transmisiones">{invListaTransmisiones.map(t => <option key={t} value={t} />)}</datalist></div>
                </div>
              )}

              {tabInventario === 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
                  
                  {/* LEYENDA DE BOTONES ELEGANTE */}
                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', padding: '5px 10px', marginBottom: '5px' }}>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Referencia de Estado:</span>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', background: '#10b981', color: 'white', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold' }}>✓</span>
                      <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>Sí</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', background: '#ef4444', color: 'white', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold' }}>✗</span>
                      <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>No</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', background: '#f59e0b', color: 'white', borderRadius: '4px', fontSize: '8px', fontWeight: 'bold' }}>N/A</span>
                      <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>No aplica</span>
                    </div>

                    <div style={{ height: '12px', width: '1px', background: '#cbd5e1', margin: '0 4px' }}></div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', background: '#10b981', color: 'white', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold' }}>B</span>
                      <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>Bueno</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', background: '#f59e0b', color: 'white', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold' }}>R</span>
                      <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>Regular</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', background: '#ef4444', color: 'white', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold' }}>M</span>
                      <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>Malo</span>
                    </div>
                  </div>

                  {/* LISTA DE ITEMS EXTERIOR */}
                  {[
                    { id: 'parabrisas', nombre: 'PARABRISAS' },
                    { id: 'emblemas', nombre: 'EMBLEMAS', cantidad: true },
                    { id: 'faroles', nombre: 'FAROLES', esPar: true },
                    { id: 'medias_luces', nombre: 'MEDIAS LUCES', esPar: true, na: true },
                    { id: 'mascara', nombre: 'MASCARA' },
                    { id: 'llanta_auxilio', nombre: 'LLANTA AUXILIO' },
                    { id: 'rompe_nieblas', nombre: 'ROMPE NIEBLAS', esPar: true, na: true },
                    { id: 'tapa_cubo', nombre: 'TAPA CUBO', cantidad: true, na: true },
                    { id: 'tapa_ruedas', nombre: 'TAPA RUEDAS', cantidad: true, na: true },
                    { id: 'tapa_sol', nombre: 'TAPA SOL', esPar: true },
                    { id: 'antena', nombre: 'ANTENA', na: true },
                    { id: 'guinadores', nombre: 'GUINADORES', esPar: true, na: true },
                    { id: 'halogenos', nombre: 'HALOGENOS', esPar: true, na: true },
                    { id: 'limpiaparabrisas', nombre: 'LIMPIAPARABRISAS', esPar: true },
                    { id: 'neutralizadores', nombre: 'NEUTRALIZADORES', na: true },
                    { id: 'retrovisores', nombre: 'RETROVISORES', esPar: true },
                    { id: 'stops', nombre: 'STOPS', esPar: true },
                    { id: 'tapa_radiador', nombre: 'TAPA RADIADOR' },
                    { id: 'tapa_tanque', nombre: 'TAPA TANQUE' },
                    { id: 'tapa_dep_agua', nombre: 'TAPA DEP AGUA' },
                    { id: 'parachoques_del', nombre: 'PARACHOQUES DEL' },
                    { id: 'parachoques_tras', nombre: 'PARACHOQUES TRAS' },
                    { id: 'spoiler', nombre: 'SPOILER' },
                    { id: 'pechera', nombre: 'PECHERA' }
                  ].map((campo) => {
                    
                    const renderBotonera = (sufijo, tituloSufijo) => {
                      const idFinal = sufijo ? `${campo.id}_${sufijo}` : campo.id;
                      const item = invExterior[idFinal] || { tiene: '', estado: '', cantidad: '' };
                      
                      const btnBase = { padding: '6px 12px', borderRadius: '6px', border: 'none', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
                      const btnVerde = { ...btnBase, background: item.tiene === 'SI' ? '#10b981' : '#e2e8f0', color: item.tiene === 'SI' ? 'white' : '#94a3b8' };
                      const btnRojo = { ...btnBase, background: item.tiene === 'NO' ? '#ef4444' : '#e2e8f0', color: item.tiene === 'NO' ? 'white' : '#94a3b8' };
                      const btnAmarillo = { ...btnBase, background: item.tiene === 'N/A' ? '#f59e0b' : '#e2e8f0', color: item.tiene === 'N/A' ? 'white' : '#94a3b8' };
                      
                      const btnBueno = { ...btnBase, background: item.estado === 'BUENO' ? '#10b981' : '#f1f5f9', color: item.estado === 'BUENO' ? 'white' : '#64748b' };
                      const btnRegular = { ...btnBase, background: item.estado === 'REGULAR' ? '#f59e0b' : '#f1f5f9', color: item.estado === 'REGULAR' ? 'white' : '#64748b' };
                      const btnMalo = { ...btnBase, background: item.estado === 'MALO' ? '#ef4444' : '#f1f5f9', color: item.estado === 'MALO' ? 'white' : '#64748b' };

                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, justifyContent: 'flex-end' }}>
                          
                          {tituloSufijo && <span style={{fontWeight: '800', color: '#64748b', fontSize: '12px'}}>{tituloSufijo}</span>}

                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button type="button" style={btnVerde} onClick={() => actualizarExterior(idFinal, 'tiene', 'SI')}>✓</button>
                            <button type="button" style={btnRojo} onClick={() => actualizarExterior(idFinal, 'tiene', 'NO')}>✗</button>
                            {campo.na && <button type="button" style={btnAmarillo} onClick={() => actualizarExterior(idFinal, 'tiene', 'N/A')}>N/A</button>}
                          </div>

                          {item.tiene === 'SI' && (
                            <div style={{ display: 'flex', gap: '4px', borderLeft: '2px solid #e2e8f0', paddingLeft: '10px' }}>
                              <button type="button" style={btnBueno} onClick={() => actualizarExterior(idFinal, 'estado', 'BUENO')}>B</button>
                              <button type="button" style={btnRegular} onClick={() => actualizarExterior(idFinal, 'estado', 'REGULAR')}>R</button>
                              <button type="button" style={btnMalo} onClick={() => actualizarExterior(idFinal, 'estado', 'MALO')}>M</button>
                            </div>
                          )}

                          {item.tiene === 'SI' && campo.cantidad && (
                            <input type="number" placeholder="Cant." style={{...styles.formInput, width: '60px', padding: '6px', marginLeft: '5px'}} value={item.cantidad} onChange={(e) => actualizarExterior(idFinal, 'cantidad', e.target.value)} />
                          )}
                        </div>
                      );
                    };

                    return (
                      <div key={campo.id} style={{ background: 'white', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                        
                        <div style={{ flex: 1, minWidth: '100px', fontWeight: '800', color: '#1e293b', fontSize: '13px' }}>
                          {campo.nombre}
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', flex: 1, gap: '15px', justifyContent: 'flex-end' }}>
                          {campo.esPar ? (
                            <>
                              {renderBotonera('rh', 'RH')}
                              {renderBotonera('lh', 'LH')}
                            </>
                          ) : (
                            renderBotonera('', '')
                          )}
                        </div>

                      </div>
                    );
                  })}

                  {/* LLANTAS Y AROS */}
                  <div style={{ marginTop: '20px', borderTop: '2px dashed #cbd5e1', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px', gridColumn: '1 / -1' }}>
                    <div style={{ background: 'white', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '150px', fontWeight: '800', color: '#1e293b', fontSize: '13px' }}>LLANTAS DEL</div>
                      <input style={{...styles.formInput, flex: 1, padding: '8px'}} placeholder="Ej: Good Year 185/75R14" value={invExterior.llantas_del?.estado || ''} onChange={(e) => actualizarExterior('llantas_del', 'estado', e.target.value.toUpperCase())} />
                    </div>
                    
                    <div style={{ background: 'white', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '150px', fontWeight: '800', color: '#1e293b', fontSize: '13px' }}>LLANTAS TRAS</div>
                      <input style={{...styles.formInput, flex: 1, padding: '8px'}} placeholder="Ej: Good Year 185/75R14" value={invExterior.llantas_tras?.estado || ''} onChange={(e) => actualizarExterior('llantas_tras', 'estado', e.target.value.toUpperCase())} />
                    </div>

                    <div style={{ background: 'white', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '150px', fontWeight: '800', color: '#1e293b', fontSize: '13px' }}>AROS</div>
                      <div style={{display: 'flex', gap: '10px', flex: 1}}>
                        <button type="button" style={{...styles.btnOutline, flex: 1, padding: '8px', background: invExterior.aros?.estado === 'FIERRO' ? '#005b96' : 'white', color: invExterior.aros?.estado === 'FIERRO' ? 'white' : '#475569'}} onClick={() => actualizarExterior('aros', 'estado', 'FIERRO')}>FIERRO</button>
                        <button type="button" style={{...styles.btnOutline, flex: 1, padding: '8px', background: invExterior.aros?.estado === 'ALEACION' ? '#005b96' : 'white', color: invExterior.aros?.estado === 'ALEACION' ? 'white' : '#475569'}} onClick={() => actualizarExterior('aros', 'estado', 'ALEACION')}>ALEACIÓN</button>
                      </div>
                    </div>

                    <div style={{ background: 'white', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '150px', fontWeight: '800', color: '#1e293b', fontSize: '13px' }}>ESTADO LLANTAS</div>
                      <div style={{display: 'flex', gap: '10px', flex: 1}}>
                        <button type="button" style={{...styles.btnOutline, flex: 1, padding: '8px', background: invExterior.estado_llantas?.estado === 'BUENO' ? '#10b981' : 'white', color: invExterior.estado_llantas?.estado === 'BUENO' ? 'white' : '#475569'}} onClick={() => actualizarExterior('estado_llantas', 'estado', 'BUENO')}>BUENO</button>
                        <button type="button" style={{...styles.btnOutline, flex: 1, padding: '8px', background: invExterior.estado_llantas?.estado === 'REGULAR' ? '#f59e0b' : 'white', color: invExterior.estado_llantas?.estado === 'REGULAR' ? 'white' : '#475569'}} onClick={() => actualizarExterior('estado_llantas', 'estado', 'REGULAR')}>REGULAR</button>
                        <button type="button" style={{...styles.btnOutline, flex: 1, padding: '8px', background: invExterior.estado_llantas?.estado === 'MALO' ? '#ef4444' : 'white', color: invExterior.estado_llantas?.estado === 'MALO' ? 'white' : '#475569'}} onClick={() => actualizarExterior('estado_llantas', 'estado', 'MALO')}>MALO</button>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {tabInventario === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  <h3 style={{fontSize: '16px', color: '#004b7a', marginBottom: '0'}}>Interior</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px' }}>
                    {[
                      { id: 'luces_interiores', nombre: 'LUCES INTERIORES', tipo: 'estado' },
                      { id: 'radio', nombre: 'RADIO', tipo: 'original' },
                      { id: 'parlantes', nombre: 'PARLANTES', tipo: 'original' },
                      { id: 'encendedor', nombre: 'ENCENDEDOR', na: true },
                      { id: 'cinturones', nombre: 'CINTURONES', esPar: true, tipo: 'estado' },
                      { id: 'asientos', nombre: 'ASIENTOS', tipo: 'tela_cuero' }
                    ].map((campo) => {
                      
                      const renderBotonera = (sufijo, tituloSufijo) => {
                        const idFinal = sufijo ? `${campo.id}_${sufijo}` : campo.id;
                        const item = invInterior[idFinal] || { tiene: '', estado: '' };
                        
                        const btnBase = { padding: '6px 12px', borderRadius: '6px', border: 'none', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
                        const btnVerde = { ...btnBase, background: item.tiene === 'SI' ? '#10b981' : '#e2e8f0', color: item.tiene === 'SI' ? 'white' : '#94a3b8' };
                        const btnRojo = { ...btnBase, background: item.tiene === 'NO' ? '#ef4444' : '#e2e8f0', color: item.tiene === 'NO' ? 'white' : '#94a3b8' };
                        const btnAmarillo = { ...btnBase, background: item.tiene === 'N/A' ? '#f59e0b' : '#e2e8f0', color: item.tiene === 'N/A' ? 'white' : '#94a3b8' };
                        
                        const btnSel = (val) => ({ ...btnBase, background: item.estado === val ? '#005b96' : '#f1f5f9', color: item.estado === val ? 'white' : '#64748b' });

                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1 }}>
                            {tituloSufijo && <span style={{fontWeight: '800', color: '#64748b', fontSize: '12px'}}>{tituloSufijo}</span>}
                            
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button type="button" style={btnVerde} onClick={() => actualizarInterior(idFinal, 'tiene', 'SI')}>✓</button>
                              <button type="button" style={btnRojo} onClick={() => actualizarInterior(idFinal, 'tiene', 'NO')}>✗</button>
                              {campo.na && <button type="button" style={btnAmarillo} onClick={() => actualizarInterior(idFinal, 'tiene', 'N/A')}>N/A</button>}
                            </div>

                            {item.tiene === 'SI' && (
                              <div style={{ display: 'flex', gap: '4px', borderLeft: '2px solid #e2e8f0', paddingLeft: '10px' }}>
                                {campo.tipo === 'estado' && (
                                  <>
                                    <button type="button" style={{...btnSel('BUENO'), background: item.estado === 'BUENO' ? '#10b981' : '#f1f5f9'}} onClick={() => actualizarInterior(idFinal, 'estado', 'BUENO')}>B</button>
                                    <button type="button" style={{...btnSel('REGULAR'), background: item.estado === 'REGULAR' ? '#f59e0b' : '#f1f5f9'}} onClick={() => actualizarInterior(idFinal, 'estado', 'REGULAR')}>R</button>
                                    <button type="button" style={{...btnSel('MALO'), background: item.estado === 'MALO' ? '#ef4444' : '#f1f5f9'}} onClick={() => actualizarInterior(idFinal, 'estado', 'MALO')}>M</button>
                                  </>
                                )}
                                {campo.tipo === 'original' && (
                                  <>
                                    <button type="button" style={btnSel('ORIGINAL')} onClick={() => actualizarInterior(idFinal, 'estado', 'ORIGINAL')}>ORIGINAL</button>
                                    <button type="button" style={btnSel('NO ORIGINAL')} onClick={() => actualizarInterior(idFinal, 'estado', 'NO ORIGINAL')}>NO ORIG.</button>
                                  </>
                                )}
                                {campo.tipo === 'tela_cuero' && (
                                  <>
                                    <button type="button" style={btnSel('TELA')} onClick={() => actualizarInterior(idFinal, 'estado', 'TELA')}>TELA</button>
                                    <button type="button" style={btnSel('CUERO')} onClick={() => actualizarInterior(idFinal, 'estado', 'CUERO')}>CUERO</button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      };

                      return (
                        <div key={campo.id} style={{ background: 'white', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '110px', fontWeight: '800', color: '#1e293b', fontSize: '13px' }}>{campo.nombre}</div>
                          <div style={{ display: 'flex', flex: 1, gap: '15px', flexWrap: 'wrap' }}>
                            {campo.esPar ? (
                              <>
                                {renderBotonera('rh', 'RH')}
                                {renderBotonera('lh', 'LH')}
                              </>
                            ) : renderBotonera('', '')}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <h3 style={{fontSize: '16px', color: '#004b7a', marginTop: '10px', marginBottom: '0'}}>Accesorios</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px' }}>
                    {[
                      { id: 'cola_pato', nombre: 'COLA PATO', tipo: 'original', na: true },
                      { id: 'techo_solar', nombre: 'TECHO SOLAR', na: true },
                      { id: 'mataburro', nombre: 'MATABURRO', na: true },
                      { id: 'parrilla', nombre: 'PARRILLA', tipo: 'original', na: true },
                      { id: 'pisaderas', nombre: 'PISADERAS', tipo: 'original', na: true },
                      { id: 'gato', nombre: 'GATO' },
                      { id: 'llaves', nombre: 'LLAVES' },
                      { id: 'alarma', nombre: 'ALARMA', tipo: 'original' }
                    ].map((campo) => {
                      const item = invAccesorios[campo.id] || { tiene: '', estado: '' };
                      
                      const btnBase = { padding: '6px 12px', borderRadius: '6px', border: 'none', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
                      const btnVerde = { ...btnBase, background: item.tiene === 'SI' ? '#10b981' : '#e2e8f0', color: item.tiene === 'SI' ? 'white' : '#94a3b8' };
                      const btnRojo = { ...btnBase, background: item.tiene === 'NO' ? '#ef4444' : '#e2e8f0', color: item.tiene === 'NO' ? 'white' : '#94a3b8' };
                      const btnAmarillo = { ...btnBase, background: item.tiene === 'N/A' ? '#f59e0b' : '#e2e8f0', color: item.tiene === 'N/A' ? 'white' : '#94a3b8' };
                      const btnSel = (val) => ({ ...btnBase, background: item.estado === val ? '#005b96' : '#f1f5f9', color: item.estado === val ? 'white' : '#64748b' });

                      return (
                        <div key={campo.id} style={{ background: 'white', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '110px', fontWeight: '800', color: '#1e293b', fontSize: '13px' }}>{campo.nombre}</div>
                          
                          <div style={{ display: 'flex', flex: 1, gap: '10px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button type="button" style={btnVerde} onClick={() => actualizarAccesorios(campo.id, 'tiene', 'SI')}>✓</button>
                              <button type="button" style={btnRojo} onClick={() => actualizarAccesorios(campo.id, 'tiene', 'NO')}>✗</button>
                              {campo.na && <button type="button" style={btnAmarillo} onClick={() => actualizarAccesorios(campo.id, 'tiene', 'N/A')}>N/A</button>}
                            </div>

                            {item.tiene === 'SI' && campo.tipo === 'original' && (
                              <div style={{ display: 'flex', gap: '4px', borderLeft: '2px solid #e2e8f0', paddingLeft: '10px' }}>
                                <button type="button" style={btnSel('ORIGINAL')} onClick={() => actualizarAccesorios(campo.id, 'estado', 'ORIGINAL')}>ORIGINAL</button>
                                <button type="button" style={btnSel('NO ORIGINAL')} onClick={() => actualizarAccesorios(campo.id, 'estado', 'NO ORIGINAL')}>NO ORIG.</button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

              {tabInventario === 3 && (
                <div>
                  <p style={{fontSize: '14px', color: '#64748b', marginBottom: '15px'}}>
                    Sube todas las fotos que necesites a la vez y luego selecciona en el desplegable qué parte del vehículo muestran.
                  </p>

                  <div {...getRootPropsInv()} style={{ border: '2px dashed #cbd5e1', padding: '30px', textAlign: 'center', borderRadius: '12px', cursor: 'pointer', background: '#f8fafc', marginBottom: '20px' }}>
                    <input {...getInputPropsInv()} />
                    <p style={{ color: '#64748b', fontWeight: '600', margin: 0 }}><FaCamera /> Arrastra o haz clic para subir varias fotos</p>
                    {cargando && <p style={{ color: '#005b96', fontSize: '14px', marginTop: '10px' }}>Subiendo...</p>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                    {fotosInventario.map((foto, index) => (
                      <div key={index} style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                        <img src={foto.url} alt="foto" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px', marginBottom: '10px' }} />
                        
                        <select 
                          style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', fontWeight: 'bold', color: '#0f172a' }} 
                          value={foto.nombre} 
                          onChange={(e) => { 
                            const n = [...fotosInventario]; 
                            n[index].nombre = e.target.value; 
                            setFotosInventario(n); 
                          }}
                        >
                          <option value="">-- Asignar Foto --</option>
                          <option value="Frontal RH">Frontal RH</option>
                          <option value="Frontal LH">Frontal LH</option>
                          <option value="Posterior RH">Posterior RH</option>
                          <option value="Posterior LH">Posterior LH</option>
                          <option value="Asiento Conductor">Asiento Conductor</option>
                          <option value="N° de Motor">N° de Motor</option>
                          <option value="N° de Chasis">N° de Chasis</option>
                          <option value="Plaqueta Identificación">Plaqueta Identificación</option>
                          <option value="Asientos de Atrás">Asientos de Atrás</option>
                          <option value="Tacómetro/Odómetro">Tacómetro/Odómetro</option>
                          <option value="Vista del Motor">Vista del Motor</option>
                          <option value="Accesorios">Accesorios (Gato, Botiquín)</option>
                          <option value="Llanta de Auxilio">Llanta de Auxilio</option>
                          <option value="Llantas Delanteras">Llantas Delanteras</option>
                          <option value="Llantas Traseras">Llantas Traseras</option>
                        </select>

                        <button type="button" onClick={() => {
                          const n = [...fotosInventario];
                          n.splice(index, 1);
                          setFotosInventario(n);
                        }} style={{ marginTop: '8px', background: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                          Eliminar Foto
                        </button>
                      </div>
                    ))}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Observaciones Generales del Vehículo</label>
                    <textarea style={{...styles.formInput, minHeight: '120px', resize: 'vertical'}} placeholder="Detalla cualquier daño, faltante o detalle importante..." value={invObservaciones} onChange={e => setInvObservaciones(e.target.value.toUpperCase())} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }} className="action-buttons">
                {tabInventario > 0 && <button style={styles.btnOutline} onClick={() => setTabInventario(tabInventario - 1)}>Anterior</button>}
                {tabInventario < 3 && <button style={styles.btnPrimary} onClick={() => setTabInventario(tabInventario + 1)}>Siguiente</button>}
                {tabInventario === 3 && <button style={styles.btnSuccess} onClick={guardarInventario} disabled={cargando || generandoPDFInv}>{generandoPDFInv ? 'Generando PDF...' : <><FaFilePdf /> Guardar y Generar PDF</>}</button>}
              </div>
            </div>
          </div>
        )}

        {vista === 'formulario' && (
          <div>
            <button style={{...styles.btnOutline, marginBottom: '20px', padding: '10px'}} onClick={() => setVista('inicio')}><FaArrowLeft /> Volver al Inicio</button>
            <div style={{ ...styles.card, border: '2px dashed #005b96', backgroundColor: '#f0f8ff', marginBottom: '20px' }}>
              <h2 style={styles.cardTitle}><FaFileAlt /> Proforma del Taller</h2>
              <p style={{fontSize: '13px', color: '#64748b', marginBottom: '15px'}}>Sube el PDF o foto de la proforma. La IA extraerá los datos automáticamente.</p>
              <div {...getRootPropsProforma()} style={{ textAlign: 'center', cursor: 'pointer', padding: '20px' }}>
                <input {...getInputPropsProforma()} />
                <button style={{...styles.btnPrimary, backgroundColor: '#8b5cf6'}} type="button" disabled={procesandoOCR}>
                  {procesandoOCR ? '⏳ Analizando con IA...' : <><FaMagic /> Subir y Escanear Proforma</>}
                </button>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}><FaClipboardList /> Datos del Vehículo</h2>
              <div style={styles.formGrid} className="form-grid">
                <div style={styles.formGroup}><label style={styles.formLabel}>Placa (Obligatorio)</label><input style={styles.formInput} placeholder="Ej: 123-ABC" value={nuevaInspeccion.placa} onChange={e => setNuevaInspeccion({...nuevaInspeccion, placa: e.target.value.toUpperCase()})} /></div>
                <div style={styles.formGroup}><label style={styles.formLabel}>Nº Trámite</label><input style={styles.formInput} placeholder="Ej: IR-987654" value={nuevaInspeccion.tramite} onChange={e => setNuevaInspeccion({...nuevaInspeccion, tramite: e.target.value.toUpperCase()})} /></div>
                <div style={styles.formGroup}><label style={styles.formLabel}>Taller</label><input style={styles.formInput} placeholder="Ej: Car Center" list="lista-talleres" value={nuevaInspeccion.taller} onChange={e => setNuevaInspeccion({...nuevaInspeccion, taller: e.target.value.toUpperCase()})} /><datalist id="lista-talleres">{listaTalleres.map(t => (<option key={t} value={t} />))}</datalist></div>
                <div style={styles.formGroup}><label style={styles.formLabel}>Marca</label><input style={styles.formInput} placeholder="Ej: Toyota" list="lista-marcas" value={nuevaInspeccion.marca} onChange={e => setNuevaInspeccion({...nuevaInspeccion, marca: e.target.value.toUpperCase()})} /><datalist id="lista-marcas">{listaMarcas.map(m => (<option key={m} value={m} />))}</datalist></div>
                <div style={styles.formGroup}><label style={styles.formLabel}>Modelo</label><input style={styles.formInput} placeholder="Ej: Corolla" list="lista-modelos" value={nuevaInspeccion.modelo} onChange={e => setNuevaInspeccion({...nuevaInspeccion, modelo: e.target.value.toUpperCase()})} /><datalist id="lista-modelos">{listaModelos.map(m => (<option key={m} value={m} />))}</datalist></div>
                <div style={styles.formGroup}><label style={styles.formLabel}>Tipo</label><input style={styles.formInput} placeholder="Ej: Sedan" list="lista-tipos" value={nuevaInspeccion.tipoVehiculo} onChange={e => setNuevaInspeccion({...nuevaInspeccion, tipoVehiculo: e.target.value.toUpperCase()})} /><datalist id="lista-tipos">{listaTipos.map(t => (<option key={t} value={t} />))}</datalist></div>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}><FaTools /> Mano de Obra</h2>
              {nuevaInspeccion.manoObra.map((mano, index) => (
                <div key={index} style={styles.itemRow}>
                  <input style={{...styles.formInput, flex: 2}} placeholder="Trabajo" list="lista-mano-obra" value={mano.nombre} onChange={e => actualizarManoObra(index, 'nombre', e.target.value.toUpperCase())} />
                  <input style={{...styles.formInput, flex: 1}} type="number" placeholder="P. Proforma Bs" value={mano.precioOriginal || ''} onChange={e => actualizarManoObra(index, 'precioOriginal', e.target.value)} />
                  <select style={{...styles.formInput, flex: 1}} value={mano.accion} onChange={e => actualizarManoObra(index, 'accion', e.target.value)}>
                    <option value="APROBADO">APROBADO</option><option value="APROBADO CON AJUSTE">APROBADO CON AJUSTE</option><option value="RECHAZADO">RECHAZADO</option>
                  </select>
                  {mano.accion === 'APROBADO CON AJUSTE' && (<input style={{...styles.formInput, flex: 1}} type="number" placeholder="P. Aprobado Bs" value={mano.precioAprobado || ''} onChange={e => actualizarManoObra(index, 'precioAprobado', e.target.value)} />)}
                  <input style={{...styles.formInput, flex: 2}} placeholder="Motivo/Observación" list="lista-obs-mano" value={mano.observacion || ''} onChange={e => actualizarManoObra(index, 'observacion', e.target.value.toUpperCase())} />
                  <button style={styles.btnDelete} onClick={() => { const n = [...nuevaInspeccion.manoObra]; n.splice(index, 1); setNuevaInspeccion({...nuevaInspeccion, manoObra: n}); }}><FaTrash /></button>
                </div>
              ))}
              <datalist id="lista-mano-obra">{listaManoObra.map(t => (<option key={t} value={t} />))}</datalist>
              <datalist id="lista-obs-mano">{listaObsMano.map(o => (<option key={o} value={o} />))}</datalist>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                <button style={{...styles.btnOutline, padding: '10px 15px', fontSize: '14px'}} onClick={agregarManoObra}><FaPlus /> Agregar Manualmente</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={styles.formLabel}>Desc. Global (%):</label>
                  <input style={{...styles.formInput, width: '80px', padding: '8px'}} type="number" value={nuevaInspeccion.descuentoGlobalManoObra} onChange={e => setNuevaInspeccion({...nuevaInspeccion, descuentoGlobalManoObra: e.target.value})} />
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}><FaCarCrash /> Repuestos</h2>
              {nuevaInspeccion.repuestos.map((rep, index) => (
                <div key={index} style={styles.itemRow}>
                  <input style={{...styles.formInput, flex: 2}} placeholder="Repuesto" list="lista-piezas" value={rep.nombre} onChange={e => actualizarRepuesto(index, 'nombre', e.target.value.toUpperCase())} />
                  <input style={{...styles.formInput, flex: 1}} type="number" placeholder="P. Proforma Bs" value={rep.precioOriginal || ''} onChange={e => actualizarRepuesto(index, 'precioOriginal', e.target.value)} />
                  <select style={{...styles.formInput, flex: 1}} value={rep.accion} onChange={e => actualizarRepuesto(index, 'accion', e.target.value)}>
                    <option value="CAMBIO">CAMBIO</option><option value="REPARACION">REPARACION</option><option value="CAMBIO C/REC">CAMBIO C/REC</option><option value="RECHAZADO">RECHAZADO</option>
                  </select>
                  <input style={{...styles.formInput, flex: 1}} type="number" placeholder="Deprec. %" value={rep.descuento || ''} onChange={e => actualizarRepuesto(index, 'descuento', e.target.value)} />
                  <input style={{...styles.formInput, flex: 2}} placeholder="Observación (Ej: Desgaste)" list="lista-obs-repuestos" value={rep.observacion || ''} onChange={e => actualizarRepuesto(index, 'observacion', e.target.value.toUpperCase())} />
                  <button style={styles.btnDelete} onClick={() => { const n = [...nuevaInspeccion.repuestos]; n.splice(index, 1); setNuevaInspeccion({...nuevaInspeccion, repuestos: n}); }}><FaTrash /></button>
                </div>
              ))}
              <datalist id="lista-piezas">{listaPiezas.map(p => (<option key={p} value={p} />))}</datalist>
              <datalist id="lista-obs-repuestos">{listaObsRep.map(o => (<option key={o} value={o} />))}</datalist>
              <button style={{...styles.btnOutline, marginTop: '20px', padding: '10px 15px', fontSize: '14px'}} onClick={agregarRepuesto}><FaPlus /> Agregar Manualmente</button>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}><FaCamera /> Fotos</h2>
              <div {...getRootProps()} style={{ border: '2px dashed #cbd5e1', padding: '30px', textAlign: 'center', borderRadius: '12px', cursor: 'pointer', background: '#f8fafc', marginBottom: '20px' }}>
                <input {...getInputProps()} />
                <p style={{ color: '#64748b', fontWeight: '600', margin: 0 }}><FaCamera /> Arrastra o haz clic para subir fotos</p>
                {cargando && <p style={{ color: '#005b96', fontSize: '14px', marginTop: '10px' }}>Subiendo...</p>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
                {fotosSubidas.map((foto, index) => (
                  <div key={index} style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <img src={foto.url} alt="foto" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px', marginBottom: '10px' }} />
                    <select style={{ width: '100%', padding: '5px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} value={foto.itemVinculado} onChange={(e) => { const n = [...fotosSubidas]; n[index].itemVinculado = e.target.value; setFotosSubidas(n); }}>
                      <option value="">-- Vincular --</option>
                      {nuevaInspeccion.manoObra.map((m, i) => (<option key={`m-${i}`} value={m.nombre}>{m.nombre}</option>))}
                      {nuevaInspeccion.repuestos.map((r, i) => (<option key={`r-${i}`} value={r.nombre}>{r.nombre}</option>))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}><FaClipboardList /> Observaciones Generales</h2>
              <textarea style={{...styles.formInput, minHeight: '100px', resize: 'vertical'}} placeholder="Detalle hallazgos, daños no proformados o notas adicionales..." value={nuevaInspeccion.observaciones_generales} onChange={e => setNuevaInspeccion({...nuevaInspeccion, observaciones_generales: e.target.value.toUpperCase()})} list="lista-obs-generales" />
              <datalist id="lista-obs-generales">{listaObsGenerales.map(o => (<option key={o} value={o} />))}</datalist>
            </div>

            <div style={{...styles.card, background: '#f0fdf4', borderColor: '#bbf7d0'}}>
              <h2 style={{...styles.cardTitle, color: '#166534', borderBottomColor: '#bbf7d0'}}>Resumen de Ajuste de Costos</h2>
              <div style={styles.rowBetween}><span>Total Proforma Original:</span> <strong>Bs {totalProforma.toFixed(2)}</strong></div>
              <div style={styles.rowBetween}><span>Total Diagnóstico Final:</span> <strong style={{ color: '#005b96' }}>Bs {totalDiagnostico.toFixed(2)}</strong></div>
              <div style={{...styles.rowBetween, fontSize: '20px', fontWeight: '800', color: ajusteNeto >= 0 ? '#16a34a' : '#dc2626', borderTop: '1px solid #bbf7d0', paddingTop: '15px', marginTop: '15px'}}><span>Monto de Ajuste:</span> <span>Bs {ajusteNeto.toFixed(2)}</span></div>
            </div>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: '20px' }} className="action-buttons">
              <button style={styles.btnDanger} onClick={limpiarFormulario}><FaSyncAlt /> Limpiar Formulario</button>
              <button style={styles.btnWarning} onClick={(e) => guardarYGenerar(e, true)} disabled={cargando}><FaSave /> Solo Guardar</button>
              <button style={styles.btnSuccess} onClick={(e) => guardarYGenerar(e, false)} disabled={cargando}>
                {cargando ? 'Procesando...' : <><FaFilePdf /> Guardar y Generar PDF</>}
              </button>
            </div>
          </div>
        )}

        {session && vista === 'historial' && !inspeccionSeleccionada && (
          <div>
            <h2 style={{...styles.heroTitle, fontSize: '28px', marginBottom: '20px'}}>Listado de Inspecciones</h2>
            <div style={styles.searchBar}>
              <div style={{position: 'relative', flex: 1}}>
                <FaSearch style={{position: 'absolute', left: '15px', top: '15px', color: '#94a3b8'}} />
                <input type="text" placeholder="Buscar por Placa o Nº de Trámite..." style={{...styles.formInput, paddingLeft: '40px'}} value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {inspeccionesFiltradas.map(insp => (
                <div key={insp.id} style={{...styles.card, borderLeft: '5px solid #005b96', padding: '20px', cursor: 'pointer', transition: 'transform 0.2s'}} onClick={() => setInspeccionSeleccionada(insp)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#005b96', margin: 0 }}>{insp.placa}</h3>
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>Ajuste: Bs {insp.ahorro}</span>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>Taller: {insp.taller}</p>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Proforma: Bs {insp.proforma} | Diag: Bs {insp.diagnostico}</p>
                  <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '15px', textAlign: 'right', fontWeight: 'bold' }}>Clic para ver detalle →</p>
                </div>
              ))}
              {inspeccionesFiltradas.length === 0 && <p style={{color: '#64748b'}}>No se encontraron inspecciones con ese criterio.</p>}
            </div>
          </div>
        )}

        {session && vista === 'historial' && inspeccionSeleccionada && (puedeVerDashboard(session.user.email) || inspeccionSeleccionada.perito === asignarPerito(session.user.email)) && (
          <div>
            <button style={{...styles.btnOutline, marginBottom: '20px', padding: '10px'}} onClick={() => setInspeccionSeleccionada(null)}><FaArrowLeft /> Volver al Listado</button>
            <div style={styles.card}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px'}}>
                <h2 style={{...styles.cardTitle, margin: 0, border: 'none', padding: 0}}>Detalle: {inspeccionSeleccionada.placa}</h2>
                <span style={{ background: '#dcfce7', color: '#166534', padding: '8px 15px', borderRadius: '8px', fontSize: '16px', fontWeight: '800' }}>Ajuste: Bs {inspeccionSeleccionada.ahorro}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px', background: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
                <div><strong>Vehículo:</strong> {inspeccionSeleccionada.marca} {inspeccionSeleccionada.modelo} ({inspeccionSeleccionada.tipoVehiculo})</div>
                <div><strong>N° Trámite:</strong> {inspeccionSeleccionada.tramite}</div>
                <div><strong>Taller:</strong> {inspeccionSeleccionada.taller}</div>
                <div><strong>Total Proforma:</strong> Bs {inspeccionSeleccionada.proforma}</div>
                <div><strong>Total Diagnóstico:</strong> Bs {inspeccionSeleccionada.diagnostico}</div>
              </div>
              <h3 style={{fontSize: '16px', color: '#004b7a', marginBottom: '10px'}}>Mano de Obra</h3>
              <table style={styles.previewTable}>
                <thead><tr><th style={styles.previewTh}>Trabajo</th><th style={styles.previewTh}>P. Proforma</th><th style={styles.previewTh}>Acción</th><th style={styles.previewTh}>P. Aprobado</th></tr></thead>
                <tbody>
                  {Array.isArray(inspeccionSeleccionada.manoObra) && inspeccionSeleccionada.manoObra.map((m, i) => (
                    <tr key={i}><td style={styles.previewTd}>{m.nombre}</td><td style={styles.previewTd}>Bs {m.precioOriginal}</td><td style={styles.previewTd}>{m.accion}</td><td style={styles.previewTd}>Bs {m.precioAprobado}</td></tr>
                  ))}
                </tbody>
              </table>
              <h3 style={{fontSize: '16px', color: '#004b7a', marginTop: '30px', marginBottom: '10px'}}>Repuestos</h3>
              <table style={styles.previewTable}>
                <thead><tr><th style={styles.previewTh}>Pieza</th><th style={styles.previewTh}>P. Proforma</th><th style={styles.previewTh}>Acción</th><th style={styles.previewTh}>Desc.</th></tr></thead>
                <tbody>
                  {Array.isArray(inspeccionSeleccionada.repuestos) && inspeccionSeleccionada.repuestos.map((r, i) => (
                    <tr key={i}><td style={styles.previewTd}>{r.nombre}</td><td style={styles.previewTd}>{r.precioOriginal ? `Bs ${r.precioOriginal}` : 'S/P'}</td><td style={styles.previewTd}>{r.accion}</td><td style={styles.previewTd}>{r.descuento ? `-${r.descuento}%` : '-'}</td></tr>
                  ))}
                </tbody>
              </table>
              <h3 style={{fontSize: '16px', color: '#004b7a', marginTop: '30px', marginBottom: '10px'}}>Observaciones</h3>
              <p style={{background: '#f8fafc', padding: '15px', borderRadius: '8px', fontSize: '14px'}}>{inspeccionSeleccionada.observaciones_generales || 'Sin observaciones.'}</p>
              {inspeccionSeleccionada.proforma_pdf && (
                <div style={{ marginTop: '20px' }}>
                  <button style={{...styles.btnPrimary, backgroundColor: '#475569'}} onClick={() => { setProformaUrl(inspeccionSeleccionada.proforma_pdf); setMostrarVisor(true); }}>
                    <FaFileAlt /> Ver Proforma Original
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {vista === 'ayuda' && <Ayuda />}
      </div>

      <footer style={styles.footer}>
        ALIANZA GRUPO ASEGURADOR - HERRAMIENTA DE USO INTERNO
      </footer>

      {mostrarCambioPass && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ color: '#004b7a', marginBottom: '20px' }}>Cambiar Contraseña</h3>
            <form onSubmit={handleCambiarPassword}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Contraseña Actual</label>
                <input type="password" style={styles.formInput} value={passActual} onChange={e => setPassActual(e.target.value)} required />
              </div>
              <div style={{...styles.formGroup, marginTop: '15px'}}>
                <label style={styles.formLabel}>Nueva Contraseña</label>
                <input type="password" style={styles.formInput} value={nuevaPass} onChange={e => setNuevaPass(e.target.value)} required minLength={6} />
              </div>
              {mensajePass && <p style={{ color: mensajePass.includes('Error') ? '#ef4444' : '#10b981', fontSize: '13px', marginTop: '10px' }}>{mensajePass}</p>}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" style={{...styles.btnOutline, flex: 1, justifyContent: 'center'}} onClick={() => setMostrarCambioPass(false)}>Cancelar</button>
                <button type="submit" style={{...styles.btnPrimary, flex: 1, justifyContent: 'center'}}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mostrarVisor && proformaUrl && (
        <div style={styles.visorModal} onClick={() => setMostrarVisor(false)}>
          <div style={styles.visorContenido} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#004b7a' }}>Visor de Proforma</h3>
              <button style={{ ...styles.btnDanger, padding: '8px 15px' }} onClick={() => setMostrarVisor(false)}>Cerrar</button>
            </div>
            {tipoArchivo === 'application/pdf' || proformaUrl.includes('.pdf') ? (
              <iframe src={proformaUrl} style={styles.visorFrame} title="Proforma PDF" />
            ) : (
              <div style={{ flex: 1, overflow: 'auto', textAlign: 'center' }}>
                <img src={proformaUrl} alt="Proforma" style={{ maxWidth: '100%', borderRadius: '8px' }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL PARA VER DETALLE DE INVENTARIO (VISTA PREVIA) */}
      {inventarioSeleccionado && (
        <div style={styles.visorModal} onClick={() => setInventarioSeleccionado(null)}>
          <div style={{...styles.visorContenido, height: 'auto', maxHeight: '90vh', overflowY: 'auto'}} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px' }}>
              <div>
                <h2 style={{ margin: 0, color: '#004b7a', fontSize: '24px' }}>Inventario: {inventarioSeleccionado.placa}</h2>
                <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>{inventarioSeleccionado.marca} {inventarioSeleccionado.modelo} - {inventarioSeleccionado.fecha}</p>
              </div>
              <button style={{ ...styles.btnDanger, padding: '8px 15px' }} onClick={() => setInventarioSeleccionado(null)}>Cerrar</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px', background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
              <div><strong>Motor:</strong> {inventarioSeleccionado.motor}</div>
              <div><strong>Chasis:</strong> {inventarioSeleccionado.chasis}</div>
              <div><strong>Color:</strong> {inventarioSeleccionado.color}</div>
              <div><strong>Kilometraje:</strong> {inventarioSeleccionado.kilometraje}</div>
            </div>

            <h3 style={{fontSize: '16px', color: '#004b7a', marginBottom: '10px'}}>Observaciones</h3>
            <p style={{background: '#f8fafc', padding: '15px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px'}}>{inventarioSeleccionado.observaciones || 'Sin observaciones.'}</p>

            <h3 style={{fontSize: '16px', color: '#004b7a', marginBottom: '10px'}}>Registro Fotográfico</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
              {inventarioSeleccionado.fotos && inventarioSeleccionado.fotos.map((foto, index) => (
                <div key={index} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={foto.url} alt={foto.nombre} style={{ width: '100%', height: '80px', objectFit: 'cover' }} />
                  <p style={{ margin: 0, padding: '5px', fontSize: '10px', textAlign: 'center', fontWeight: 'bold', color: '#475569' }}>{foto.nombre}</p>
                </div>
              ))}
              {(!inventarioSeleccionado.fotos || inventarioSeleccionado.fotos.length === 0) && <p style={{color: '#64748b'}}>No hay fotos registradas.</p>}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}