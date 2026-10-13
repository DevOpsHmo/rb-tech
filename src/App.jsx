import React, { useState, useMemo } from 'react';
import './App.css';
import { generarHTMLPDF } from './pdfTemplate';
import logoImg from './assets/logo.png';

const PRECIOS = {
  llavero: {
    basico:   { nombre: "Llavero Básico",   medida: "5x5 cm",   precio: 150 },
    estandar: { nombre: "Llavero Estándar", medida: "8x8 cm",   precio: 250 },
    pro:      { nombre: "Llavero Pro",      medida: "15x15 cm", precio: 450 }
  },
  tarjeta: {
    sencilla: { nombre: "Tarjeta Digital Sencilla", precio: 500 },
    completa: { nombre: "Tarjeta Digital Completa", precio: 1200 }
  },
  envio: 100
};

const convertirLogoABase64 = async (url) => {
  const respuesta = await fetch(url);
  const blob = await respuesta.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};

function App() {
  const [llavero, setLlavero] = useState('basico');
  const [cantidad, setCantidad] = useState(1);
  const [tarjeta, setTarjeta] = useState('sencilla');
  const [generando, setGenerando] = useState(false);

  const [cliente] = useState({
    nombre: 'Cliente General',
    empresa: '',
    telefono: '',
    email: '',
    direccion: ''
  });

  const calculos = useMemo(() => {
    const objLlavero = PRECIOS.llavero[llavero];
    const objTarjeta = PRECIOS.tarjeta[tarjeta];
    const cant = parseInt(cantidad) || 1;

    const subtotalLlaverosOriginal = objLlavero.precio * cant;
    const descuentoAplicado = cant >= 20;
    const descuentoMonto = descuentoAplicado ? subtotalLlaverosOriginal * 0.30 : 0;
    const subtotalLlaveros = subtotalLlaverosOriginal - descuentoMonto;

    const subtotalGeneral = subtotalLlaverosOriginal + objTarjeta.precio + PRECIOS.envio;
    const total = subtotalLlaveros + objTarjeta.precio + PRECIOS.envio;

    return {
      objLlavero, objTarjeta, cant,
      subtotalLlaverosOriginal, subtotalLlaveros,
      descuentoAplicado, descuentoMonto,
      subtotalGeneral, total
    };
  }, [llavero, cantidad, tarjeta]);

  const generarPDF = async () => {
    setGenerando(true);
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      const logoBase64 = await convertirLogoABase64(logoImg);

      const hoy = new Date();
      const vence = new Date();
      vence.setDate(vence.getDate() + 15);
      const fmtFecha = (d) => d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });

      const htmlContent = generarHTMLPDF({
        logoBase64,
        numeroCotizacion: `RB-${hoy.getFullYear()}${String(hoy.getMonth()+1).padStart(2,'0')}${String(hoy.getDate()).padStart(2,'0')}-${String(Math.floor(Math.random()*9000)+1000)}`,
        fechaEmision: fmtFecha(hoy),
        fechaVencimiento: fmtFecha(vence),
        itemLlavero: {
          nombre: calculos.objLlavero.nombre,
          medida: calculos.objLlavero.medida,
          cantidad: calculos.cant,
          precioUnitario: calculos.objLlavero.precio,
          importe: calculos.subtotalLlaverosOriginal
        },
        itemTarjeta: {
          nombre: calculos.objTarjeta.nombre,
          precioUnitario: calculos.objTarjeta.precio,
          importe: calculos.objTarjeta.precio
        },
        itemEnvio: {
          nombre: 'Envío Nacional',
          precioUnitario: PRECIOS.envio,
          importe: PRECIOS.envio
        },
        subtotal: calculos.subtotalGeneral,
        descuento: calculos.descuentoMonto,
        total: calculos.total,
        cliente
      });

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '850px';
      iframe.style.height = '1100px';
      iframe.style.border = '0';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(htmlContent);
      doc.close();

      const esperarImagenes = () => {
        const imgs = doc.images;
        return Promise.all(Array.from(imgs).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        }));
      };

      await new Promise(resolve => setTimeout(resolve, 300));
      await esperarImagenes();
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(doc.body, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        windowWidth: 850,
        windowHeight: 1100
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // ✅ FORZAR UNA SOLA HOJA: escalar la imagen para que quepa completa
      const imgRatio = canvas.height / canvas.width;
      const pdfRatio = pdfHeight / pdfWidth;

      let finalWidth, finalHeight;
      if (imgRatio > pdfRatio) {
        // La imagen es más alta: ajustar por altura
        finalHeight = pdfHeight;
        finalWidth = pdfHeight / imgRatio;
      } else {
        // La imagen es más ancha: ajustar por ancho
        finalWidth = pdfWidth;
        finalHeight = pdfWidth * imgRatio;
      }

      // Centrar horizontalmente
      const offsetX = (pdfWidth - finalWidth) / 2;

      pdf.addImage(imgData, 'JPEG', offsetX, 0, finalWidth, finalHeight);
      pdf.save(`Cotizacion_RB_TECH_${Date.now()}.pdf`);
      document.body.removeChild(iframe);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Revisa la consola.');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="app">
      {/* HEADER: solo texto, sin logo */}
      <header className="app-header">
        <h1 className="logo-texto">RB.TECH</h1>
        <p className="tagline">Llaveros 3D + Tarjeta Digital NFC</p>
      </header>

      {/* LAYOUT DESKTOP: 2 columnas */}
      <main className="app-main">
        <div className="scroll-area">
          <div className="formulario">
            <section className="card">
              <div className="card-header">
                <span className="step-badge">1</span>
                <h2>Elige tu Llavero</h2>
              </div>
              <div className="opciones">
                {Object.entries(PRECIOS.llavero).map(([key, item]) => (
                  <button
                    key={key}
                    className={`opcion ${llavero === key ? 'activa' : ''}`}
                    onClick={() => setLlavero(key)}
                  >
                    <div className="opcion-info">
                      <span className="opcion-nombre">{item.nombre}</span>
                      <span className="opcion-medida">{item.medida}</span>
                    </div>
                    <span className="opcion-precio">${item.precio}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="card">
              <div className="card-header">
                <span className="step-badge">×</span>
                <h2>Cantidad</h2>
              </div>
              <div className="cantidad-control">
                <button className="qty-btn" onClick={() => setCantidad(Math.max(1, calculos.cant - 1))}>−</button>
                <input
                  type="number"
                  className="qty-input"
                  value={cantidad}
                  min="1"
                  onChange={(e) => setCantidad(e.target.value)}
                />
                <button className="qty-btn" onClick={() => setCantidad(calculos.cant + 1)}>+</button>
              </div>
              {calculos.cant >= 20 ? (
                <div className="badge-descuento">🎉 ¡30% de descuento aplicado!</div>
              ) : (
                <div className="hint-descuento">Agrega {20 - calculos.cant} más para obtener 30% OFF</div>
              )}
            </section>

            <section className="card">
              <div className="card-header">
                <span className="step-badge">2</span>
                <h2>Elige tu Tarjeta NFC</h2>
              </div>
              <div className="opciones">
                {Object.entries(PRECIOS.tarjeta).map(([key, item]) => (
                  <button
                    key={key}
                    className={`opcion ${tarjeta === key ? 'activa' : ''}`}
                    onClick={() => setTarjeta(key)}
                  >
                    <div className="opcion-info">
                      <span className="opcion-nombre">{item.nombre}</span>
                    </div>
                    <span className="opcion-precio">${item.precio}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="card card-envio">
              <div className="card-header">
                <span className="step-badge">3</span>
                <h2>Envío Nacional</h2>
              </div>
              <div className="envio-info">
                <span>100% Obligatorio</span>
                <span className="opcion-precio">${PRECIOS.envio}</span>
              </div>
            </section>
          </div>
        </div>

        {/* COLUMNA DERECHA EN DESKTOP: resumen en vivo */}
        <aside className="resumen-panel">
          <div className="resumen-card">
            <h3>Resumen</h3>
            <div className="resumen-linea">
              <span>{calculos.objLlavero.nombre} × {calculos.cant}</span>
              <span>${calculos.subtotalLlaverosOriginal.toLocaleString('en-US')}</span>
            </div>
            {calculos.descuentoAplicado && (
              <div className="resumen-linea descuento">
                <span>Descuento 30%</span>
                <span>-${calculos.descuentoMonto.toLocaleString('en-US')}</span>
              </div>
            )}
            <div className="resumen-linea">
              <span>{calculos.objTarjeta.nombre}</span>
              <span>${calculos.objTarjeta.precio.toLocaleString('en-US')}</span>
            </div>
            <div className="resumen-linea">
              <span>Envío Nacional</span>
              <span>${PRECIOS.envio.toLocaleString('en-US')}</span>
            </div>
            <div className="resumen-total">
              <span>TOTAL</span>
              <span>${calculos.total.toLocaleString('en-US')}</span>
            </div>
          </div>
        </aside>
      </main>

      {/* FOOTER FIJO */}
      <footer className="app-footer">
        <div className="total-info">
          <span className="total-label">Total</span>
          <span className="total-monto">${calculos.total.toLocaleString('en-US')}</span>
        </div>
        <button className="btn-pdf" onClick={generarPDF} disabled={generando}>
          {generando ? <span className="loader"></span> : <>📄 Descargar PDF</>}
        </button>
      </footer>
    </div>
  );
}

export default App;