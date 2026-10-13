// src/pdfTemplate.js

export const generarHTMLPDF = (datos) => {
  const {
    logoBase64,
    numeroCotizacion,
    fechaEmision,
    fechaVencimiento,
    itemLlavero,
    itemTarjeta,
    itemEnvio,
    subtotal,
    descuento,
    total,
    cliente
  } = datos;

  const formatoMoneda = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page { margin: 0; size: letter; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        html, body {
          width: 100%;
          height: auto;
        }
        
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #1a1a1a;
          background: #ffffff;
          font-size: 11px;
          line-height: 1.5;
          display: flex;
          flex-direction: column;
          /* ✅ SIN min-height: el body crece solo con el contenido */
          padding: 40px 50px 0 50px;
          /* Altura real de una hoja letter en px (96dpi): ~1056px */
          min-height: 1056px;
        }

        .contenido {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        /* ============ HEADER ============ */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 20px;
          border-bottom: 3px solid #39ff14;
          margin-bottom: 25px;
        }
        .header-left {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .header-left .logo-img {
          height: 48px;
          width: auto;
          object-fit: contain;
          image-rendering: -webkit-optimize-contrast;
        }
        .header-left .subtitle {
          font-size: 10px;
          color: #666;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .header-right { text-align: right; }
        .header-right .doc-title {
          font-size: 18px;
          font-weight: 900;
          color: #000;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }
        .header-right .doc-info {
          font-size: 10px;
          color: #555;
          line-height: 1.6;
        }
        .header-right .doc-info strong { color: #000; font-weight: 700; }

        .info-grid { display: flex; gap: 30px; margin-bottom: 25px; }
        .info-box {
          flex: 1; padding: 14px 16px; background: #f8f8f8;
          border-left: 4px solid #39ff14; border-radius: 4px;
        }
        .info-box h3 {
          font-size: 10px; font-weight: 900; text-transform: uppercase;
          letter-spacing: 1.5px; color: #000; margin-bottom: 8px;
        }
        .info-box p { font-size: 10px; color: #333; margin-bottom: 3px; line-height: 1.5; }
        .info-box p strong { color: #000; font-weight: 700; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        thead { background: #000; color: #fff; }
        thead th {
          padding: 10px 12px; text-align: left; font-size: 10px;
          font-weight: 900; letter-spacing: 1px; text-transform: uppercase;
        }
        thead th.right { text-align: right; }
        thead th.center { text-align: center; }
        tbody td {
          padding: 12px; font-size: 11px;
          border-bottom: 1px solid #e5e5e5; color: #333;
        }
        tbody td.right { text-align: right; font-weight: 600; color: #000; }
        tbody td.center { text-align: center; }
        tbody tr:last-child td { border-bottom: 2px solid #000; }
        tbody td .desc-title { font-weight: 700; color: #000; display: block; margin-bottom: 2px; }
        tbody td .desc-sub { font-size: 9px; color: #777; }

        .resumen-wrapper { display: flex; justify-content: flex-end; margin-bottom: 25px; }
        .resumen { width: 280px; }
        .resumen-row {
          display: flex; justify-content: space-between;
          padding: 6px 0; font-size: 11px; color: #333;
        }
        .resumen-row.descuento { color: #d32f2f; font-weight: 700; }
        .resumen-row.total {
          border-top: 2px solid #000; margin-top: 6px; padding-top: 10px;
          font-size: 15px; font-weight: 900; color: #000;
        }
        .resumen-row.total .monto {
          color: #39ff14; background: #000;
          padding: 2px 8px; border-radius: 4px;
        }

        .footer-grid {
          display: flex; gap: 30px; margin-top: 30px;
          padding-top: 20px; border-top: 1px solid #ddd; margin-bottom: 30px;
        }
        .footer-box { flex: 1; }
        .footer-box h3 {
          font-size: 10px; font-weight: 900; text-transform: uppercase;
          letter-spacing: 1.5px; color: #000; margin-bottom: 8px;
        }
        .footer-box p { font-size: 9.5px; color: #555; line-height: 1.6; }
        .firma-linea {
          margin-top: 40px; border-top: 1px solid #000;
          padding-top: 6px; font-size: 9px; color: #555; text-align: center;
        }

        .pie-fijo {
          flex-shrink: 0; padding: 12px 0 25px 0;
          border-top: 2px solid #39ff14;
          text-align: center; font-size: 9px; color: #888;
          letter-spacing: 1px; background: #ffffff;
        }
        .pie-fijo strong { color: #000; }
      </style>
    </head>
    <body>

      <div class="contenido">
        <div class="header">
          <div class="header-left">
            ${logoBase64 ? `<img src="${logoBase64}" alt="RB.TECH" class="logo-img" />` : `<h1 style="font-size:32px;font-weight:900;color:#000;letter-spacing:2px;">RB.TECH</h1>`}
            <div class="subtitle">Llaveros 3D + Tarjeta Digital NFC</div>
          </div>
          <div class="header-right">
            <div class="doc-title">COTIZACIÓN</div>
            <div class="doc-info">
              <div><strong>No.</strong> ${numeroCotizacion}</div>
              <div><strong>Emisión:</strong> ${fechaEmision}</div>
              <div><strong>Vence:</strong> ${fechaVencimiento}</div>
            </div>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-box">
            <h3>Datos del Proveedor</h3>
            <p><strong>RB.TECH</strong></p>
            <p>contacto@rbtech.com</p>
            <p>Dirección: México</p>
          </div>
          <div class="info-box">
            <h3>Datos del Cliente</h3>
            <p><strong>${cliente.nombre || 'Cliente General'}</strong></p>
            ${cliente.empresa ? `<p>${cliente.empresa}</p>` : ''}
            ${cliente.telefono ? `<p>Tel: ${cliente.telefono}</p>` : ''}
            ${cliente.email ? `<p>${cliente.email}</p>` : ''}
            ${cliente.direccion ? `<p>Dirección: ${cliente.direccion}</p>` : ''}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Descripción</th>
              <th class="center">Cantidad</th>
              <th class="right">Precio Unitario</th>
              <th class="right">Importe</th>
            </tr>
          </thead>
          <tbody>
            ${itemLlavero ? `
              <tr>
                <td>
                  <span class="desc-title">${itemLlavero.nombre}</span>
                  <span class="desc-sub">Medida: ${itemLlavero.medida}</span>
                </td>
                <td class="center">${itemLlavero.cantidad}</td>
                <td class="right">${formatoMoneda(itemLlavero.precioUnitario)}</td>
                <td class="right">${formatoMoneda(itemLlavero.importe)}</td>
              </tr>
            ` : ''}
            ${itemTarjeta ? `
              <tr>
                <td>
                  <span class="desc-title">${itemTarjeta.nombre}</span>
                  <span class="desc-sub">Tarjeta NFC personalizada</span>
                </td>
                <td class="center">1</td>
                <td class="right">${formatoMoneda(itemTarjeta.precioUnitario)}</td>
                <td class="right">${formatoMoneda(itemTarjeta.importe)}</td>
              </tr>
            ` : ''}
            ${itemEnvio ? `
              <tr>
                <td>
                  <span class="desc-title">${itemEnvio.nombre}</span>
                  <span class="desc-sub">100% obligatorio</span>
                </td>
                <td class="center">1</td>
                <td class="right">${formatoMoneda(itemEnvio.precioUnitario)}</td>
                <td class="right">${formatoMoneda(itemEnvio.importe)}</td>
              </tr>
            ` : ''}
          </tbody>
        </table>

        <div class="resumen-wrapper">
          <div class="resumen">
            <div class="resumen-row">
              <span>Subtotal</span>
              <span>${formatoMoneda(subtotal)}</span>
            </div>
            ${descuento > 0 ? `
              <div class="resumen-row descuento">
                <span>Descuento (30% en llaveros)</span>
                <span>-${formatoMoneda(descuento)}</span>
              </div>
            ` : ''}
            <div class="resumen-row">
              <span>Impuestos</span>
              <span>Incluidos</span>
            </div>
            <div class="resumen-row total">
              <span>TOTAL</span>
              <span class="monto">${formatoMoneda(total)}</span>
            </div>
          </div>
        </div>

        <div class="footer-grid">
          <div class="footer-box">
            <h3>Términos y Condiciones</h3>
            <p>
              • Cotización válida por 15 días naturales a partir de la fecha de emisión.<br/>
              • Los precios están expresados en pesos mexicanos (MXN).<br/>
              • Tiempo de producción: 5 a 7 días hábiles después del anticipo.<br/>
              • Se requiere 50% de anticipo para iniciar producción.<br/>
              • El envío se realiza a nivel nacional con costo fijo de $100.
            </p>
          </div>
          <div class="footer-box">
            <h3>Aceptación del Cliente</h3>
            <p>Al firmar esta cotización, el cliente acepta los términos y condiciones descritos.</p>
            <div class="firma-linea">Nombre y firma del cliente</div>
            <div class="firma-linea" style="margin-top: 20px;">Fecha</div>
          </div>
        </div>
      </div>

      <div class="pie-fijo">
        <strong>RB.TECH</strong> · Cotización generada automáticamente · Gracias por tu preferencia
      </div>

    </body>
    </html>
  `;
};