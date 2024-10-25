document.addEventListener("DOMContentLoaded", () => {
    mostrarFechaActual();
    generarNumeros();
    cargarDatos();

    document.getElementById('reiniciar').onclick = reiniciarSorteo;
    document.getElementById('guardar').onclick = guardarUsuario;
    document.getElementById('debe').onclick = () => cambiarEstado('debe');
    document.getElementById('pago').onclick = () => cambiarEstado('pago');
    document.getElementById('borrar').onclick = borrarUsuario;
    document.getElementById('generarPDF').onclick = generarPDF;
    document.getElementById('verResumen').onclick = mostrarResumen;
});

let usuarios = {};
let numeroSeleccionado = null;
const premio = "1,000,000 COP"; 
const fechaSorteo = new Date().toLocaleDateString(); 
const valorBoleta = "10,000 COP"; 
const codigoPais = "+57"; // Código de país para Colombia

function mostrarFechaActual() {
    const fecha = new Date();
    document.getElementById('fecha').innerText = `Fecha actual: ${fecha.toLocaleString()}`;
}

function generarNumeros() {
    const container = document.getElementById('numeros-container');
    for (let i = 0; i < 100; i++) {
        const numeroDiv = document.createElement('div');
        numeroDiv.className = 'col-2 col-sm-1 numeros libre'; 
        numeroDiv.innerText = i.toString().padStart(2, '0');
        numeroDiv.onclick = () => seleccionarNumero(i);
        container.appendChild(numeroDiv);
    }
}

function cargarDatos() {
    const datosGuardados = JSON.parse(localStorage.getItem('loteriaDatos'));
    if (datosGuardados) {
        usuarios = datosGuardados.usuarios || {};
        marcarNumeros();
        actualizarTablaUsuarios();
    }
}

function seleccionarNumero(numero) {
    numeroSeleccionado = numero;
    document.getElementById('acciones').style.display = 'flex'; 
    marcarNumeros();
}

function guardarUsuario() {
    const nombre = document.getElementById('nombre-participante').value;
    const celular = document.getElementById('celular-participante').value;

    if (nombre && celular) {
        const fechaCompra = new Date().toLocaleString();
        usuarios[numeroSeleccionado] = {
            nombre,
            celular: codigoPais + celular, // Guarda el celular con el código de país
            estado: 'libre',
            fechaCompra
        };
        guardarDatos();
        actualizarTablaUsuarios();
        marcarNumeros();
        document.getElementById('nombre-participante').value = '';
        document.getElementById('celular-participante').value = '';
    }
}

function cambiarEstado(estado) {
    if (numeroSeleccionado !== null && usuarios[numeroSeleccionado]) {
        usuarios[numeroSeleccionado].estado = estado;
        guardarDatos();
        marcarNumeros();
        actualizarTablaUsuarios();
    }
}

function borrarUsuario() {
    if (numeroSeleccionado !== null && usuarios[numeroSeleccionado]) {
        delete usuarios[numeroSeleccionado];
        guardarDatos();
        marcarNumeros();
        actualizarTablaUsuarios();
        numeroSeleccionado = null; // Reinicia la selección
        document.getElementById('acciones').style.display = 'none'; // Oculta las acciones
    }
}

function marcarNumeros() {
    const numerosDiv = document.getElementsByClassName('numeros');
    for (let i = 0; i < numerosDiv.length; i++) {
        numerosDiv[i].className = 'col-2 col-sm-1 numeros libre';
        if (usuarios[i]) {
            numerosDiv[i].classList.add(usuarios[i].estado);
        } else {
            numerosDiv[i].classList.add('libre');
        }
    }
}

function guardarDatos() {
    localStorage.setItem('loteriaDatos', JSON.stringify({ usuarios }));
}

function reiniciarSorteo() {
    usuarios = {};
    numeroSeleccionado = null;
    guardarDatos();
    actualizarTablaUsuarios();
    const numerosDiv = document.getElementsByClassName('numeros');
    for (let i = 0; i < numerosDiv.length; i++) {
        numerosDiv[i].className = 'col-2 col-sm-1 numeros libre';
    }
    document.getElementById('acciones').style.display = 'none'; // Oculta las acciones
}

function enviarTicket(numero) {
    const usuario = usuarios[numero];
    const mensaje = `🎟️ **Ticket de Lotería** 🎟️\n\n**Nombre:** ${usuario.nombre}\n**Fecha de Sorteo:** ${fechaSorteo}\n**Número Escogido:** ${numero.toString().padStart(2, '0')}\n**Estado:** ${usuario.estado}\n**Fecha y Hora de Compra:** ${usuario.fechaCompra}\n**Premio:** ${premio}\n**Valor de la Boleta:** ${valorBoleta}`;
    const url = `https://wa.me/${usuario.celular}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}

function mostrarResumen() {
    const resumenUrl = 'resumen.html';
    window.open(resumenUrl, '_blank');
}

function generarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Resumen de Compras de Lotería", 10, 10);
    let y = 20;

    for (let num in usuarios) {
        const usuario = usuarios[num];
        doc.text(`Nombre: ${usuario.nombre}`, 10, y);
        doc.text(`Número Escogido: ${num}`, 10, y + 10);
        doc.text(`Estado: ${usuario.estado}`, 10, y + 20);
        doc.text(`Fecha y Hora de Compra: ${usuario.fechaCompra}`, 10, y + 30);
        doc.text(`Fecha del Sorteo: ${fechaSorteo}`, 10, y + 40);
        doc.text(`Premio: ${premio}`, 10, y + 50);
        doc.text(`Valor de la Boleta: ${valorBoleta}`, 10, y + 60);
        y += 70;
    }

    doc.save("Resumen_Lotería.pdf");
}

function actualizarTablaUsuarios() {
    const lista = document.getElementById('usuarios-lista');
    lista.innerHTML = ''; // Limpia la lista antes de actualizar
    for (let num in usuarios) {
        const usuario = usuarios[num];
        const row = document.createElement('tr');
        
        // Crear celda para el nombre
        const nombreTd = document.createElement('td');
        nombreTd.innerText = usuario.nombre;
        row.appendChild(nombreTd);

        // Crear celda para el número con estilo de círculo
        const numeroTd = document.createElement('td');
        const numeroDiv = document.createElement('div');
        numeroDiv.className = `numero-circulo ${usuario.estado}`; // Aplica la clase de estado
        numeroDiv.innerText = num.toString().padStart(2, '0');
        numeroTd.appendChild(numeroDiv);
        row.appendChild(numeroTd);
        
        // Crear celda para el celular
        const celularTd = document.createElement('td');
        celularTd.innerHTML = `<a href="tel:${usuario.celular}" style="color: green;">${usuario.celular}</a>`;
        row.appendChild(celularTd);

        // Crear celda para el estado
        const estadoTd = document.createElement('td');
        estadoTd.style.color = usuario.estado === 'pago' ? 'green' : 'red';
        estadoTd.innerText = usuario.estado;
        row.appendChild(estadoTd);

        // Crear celda para el botón de enviar ticket
        const enviarTicketTd = document.createElement('td');
        enviarTicketTd.innerHTML = `<button class="btn btn-info" onclick="enviarTicket(${num})">Enviar Ticket</button>`;
        row.appendChild(enviarTicketTd);

        lista.appendChild(row);
    }
}
function actualizarTablaUsuarios() {
    const lista = document.getElementById('usuarios-lista');
    lista.innerHTML = ''; // Limpia la lista antes de actualizar
    for (let num in usuarios) {
        const usuario = usuarios[num];
        const row = document.createElement('tr');
        
        // Crear celda para el nombre
        const nombreTd = document.createElement('td');
        nombreTd.innerText = usuario.nombre;
        row.appendChild(nombreTd);

        // Crear celda para el número con estilo de círculo
        const numeroTd = document.createElement('td');
        const numeroDiv = document.createElement('div');
        numeroDiv.className = `numero-circulo ${usuario.estado}`; // Aplica la clase de estado
        numeroDiv.innerText = num.toString().padStart(2, '0');
        numeroTd.appendChild(numeroDiv);
        row.appendChild(numeroTd);
        
        // Crear celda para el celular
        const celularTd = document.createElement('td');
        celularTd.innerHTML = `<a href="tel:${usuario.celular}" style="color: green;">${usuario.celular}</a>`;
        row.appendChild(celularTd);

        // Crear celda para el estado con formato solicitado
        const estadoTd = document.createElement('td');
        const estadoEstrella = document.createElement('span');
        estadoEstrella.style.color = usuario.estado === 'pago' ? 'green' : 'red';
        estadoEstrella.innerHTML = `⭐️ <strong>${usuario.estado.toUpperCase()}</strong> ⭐️`;
        estadoTd.appendChild(estadoEstrella);
        row.appendChild(estadoTd);

        // Crear celda para el botón de enviar ticket
        const enviarTicketTd = document.createElement('td');
        enviarTicketTd.innerHTML = `<button class="btn btn-info" onclick="enviarTicket(${num})">Enviar Ticket</button>`;
        row.appendChild(enviarTicketTd);

        lista.appendChild(row);
    }
}
function actualizarTablaUsuarios() {
    const lista = document.getElementById('usuarios-lista');
    lista.innerHTML = ''; // Limpia la lista antes de actualizar
    for (let num in usuarios) {
        const usuario = usuarios[num];
        const row = document.createElement('tr');
        
        // Crear celda para el nombre en negrita, mayúsculas y con emoji
        const nombreTd = document.createElement('td');
        nombreTd.innerHTML = `<strong>👤 ${usuario.nombre.toUpperCase()}</strong>`;
        row.appendChild(nombreTd);

        // Crear celda para el número con estilo de círculo y en negrita
        const numeroTd = document.createElement('td');
        const numeroDiv = document.createElement('div');
        numeroDiv.className = `numero-circulo ${usuario.estado}`; // Aplica la clase de estado
        numeroDiv.innerText = num.toString().padStart(2, '0');
        numeroTd.innerHTML = `<strong>${numeroDiv.outerHTML}</strong>`; // Asegura que el número esté en negrita
        row.appendChild(numeroTd);
        
        // Crear celda para el celular en negrita y con emoji
        const celularTd = document.createElement('td');
        celularTd.innerHTML = `<strong>📞 <a href="tel:${usuario.celular}" style="color: green;">${usuario.celular}</a></strong>`;
        row.appendChild(celularTd);

        // Crear celda para el estado con formato solicitado
        const estadoTd = document.createElement('td');
        const estadoEstrella = document.createElement('span');
        estadoEstrella.style.color = usuario.estado === 'pago' ? 'green' : 'red';
        estadoEstrella.innerHTML = `⭐️ <strong>${usuario.estado.toUpperCase()}</strong> ⭐️`;
        estadoTd.appendChild(estadoEstrella);
        row.appendChild(estadoTd);

        // Crear celda para el botón de enviar ticket
        const enviarTicketTd = document.createElement('td');
        enviarTicketTd.innerHTML = `<button class="btn btn-info" onclick="enviarTicket(${num})">Enviar Ticket</button>`;
        row.appendChild(enviarTicketTd);

        lista.appendChild(row);
    }
}
