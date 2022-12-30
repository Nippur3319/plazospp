let today = new Date();
let anio = today.getFullYear();
let nextAnio = anio + 1;
let nextNextAnio = anio + 2;
let url = `https://nolaborables.com.ar/api/v2/feriados/${anio}?incluir=opcional`;
let urlNextYear = `https://nolaborables.com.ar/api/v2/feriados/${nextAnio}?incluir=opcional`;
let urlNextNextYear = `https://nolaborables.com.ar/api/v2/feriados/${nextNextAnio}?incluir=opcional`;
let HTMLResponse = document.getElementById("app");
let yearArr = [];
let weekDayName;
let mostrable = [];
let desplegadoFlag = false;

document.getElementById("btn").onclick = function () {
  nextYear();
};

function nextYear() {
  //creo un array con los próximos 730 días (2 años) desde la fecha de inicio de conteo
  yearArr = [];
  let startDate = new Date(document.getElementById("startDate").value);
  for (let i = 0; i <= 730; i++) {
    let newDate = {
      isDate: new Date(startDate.setDate(startDate.getDate() + 1)),
      dia: 0,
      id: "",
      info: "",
      mes: 0,
      motivo: "",
      tipo: "",
    };

    yearArr.push(newDate);
  }
  getHolidays().then(getNextYearHolidays()).then(getNextNextYearHolidays());
}

function getDayName(value) {
  switch (value) {
    case 0:
      weekDayName = "Domingo";
      break;
    case 1:
      weekDayName = "Lunes";
      break;
    case 2:
      weekDayName = "Martes";
      break;
    case 3:
      weekDayName = "Miércoles";
      break;
    case 4:
      weekDayName = "Jueves";
      break;
    case 5:
      weekDayName = "Viernes";
      break;
    case 6:
      weekDayName = "Sábado";
      break;
  }
}

async function getHolidays() {
  // api trae los feriados por año, no por fecha, es decir, no verifica fecha por fecha si el día es feriado o no, sino que trae un array con todos los feriados del año solicitado
  fetch(url)
    .then((response) => response.json())
    .then((holidaysArr) => {
      addHolidayYear(holidaysArr, anio);
      //le agrega el anio del url al array de feriados

      updateNextYearInfo(yearArr, holidaysArr);
    });
}

async function getNextYearHolidays() {
  fetch(urlNextYear)
    .then((response) => response.json())
    .then((nextYearHolidaysArr) => {
      addHolidayYear(nextYearHolidaysArr, nextAnio);
      //le agrega el anio del url al array de feriados

      updateNextYearInfo(yearArr, nextYearHolidaysArr);
    });
}

async function getNextNextYearHolidays() {
  fetch(urlNextNextYear)
    .then((response) => response.json())
    .then((nextNextYearHolidaysArr) => {
      addHolidayYear(nextNextYearHolidaysArr, nextNextAnio);
      //le agrega el anio del url al array de feriados

      updateNextYearInfo(yearArr, nextNextYearHolidaysArr);
    });
}

function addHolidayYear(array, year) {
  for (let i = 0; i < array.length; i++) {
    array[i].year = year;
  }
  //console.log(JSON.stringify(array))
}

function updateNextYearInfo(year, holidays) {
  for (let i = 0; i < year.length; i++) {
    for (let z = 0; z < holidays.length; z++) {
      if (
        year[i].isDate.getMonth() + 1 == holidays[z].mes &&
        year[i].isDate.getDate() == holidays[z].dia &&
        year[i].isDate.getFullYear() == holidays[z].year
      ) {
        year[i].dia = holidays[z].dia;
        year[i].id = holidays[z].id;
        year[i].info = holidays[z].info;
        year[i].mes = holidays[z].mes;
        year[i].motivo = holidays[z].motivo;
        year[i].tipo = holidays[z].tipo;
        year[i].year = holidays[z].year;
      }
    }
  }
  yearArr = year;
  //console.log(JSON.stringify(yearArr));
  agregarElementos(yearArr);
}

function agregarElementos(arr) {
  //vacío el div ulistado
  document.getElementById("ulListado").innerHTML = "";

  // creo una variable con el contenido de ulistado
  var lista = document.getElementById("ulListado");

  // para cada elemento del array ejecuto una función anónima que crea un li linew y lo llena con el contenido
  arr.forEach(
    function (data) {
      var linew = document.createElement("li");

      getDayName(data.isDate.getDay());

      // formateo la línea standard
      var contenido = document.createTextNode(
        `${yearArr.indexOf(
          data
        )} días:     ${weekDayName}, ${data.isDate.getDate()}/${
          data.isDate.getMonth() + 1
        }/${data.isDate.getFullYear()} `
      );

      // formateo de feriados
      if (data.motivo != "") {
        let infoFeriado = document.createElement("p");
        infoFeriado.innerHTML = `<a href="${data.info}"target="_blank"> ${data.motivo}</a> (${data.tipo})`;
        linew.appendChild(infoFeriado);
        linew.className = "holidayLi";
      }

      lista.appendChild(linew);
      linew.appendChild(contenido);

      // invisibilización del día de inicio de plazo
      if (arr.indexOf(data) === 0) {
        linew.classList.add("invisible");
      }

      // formateo de múltiplos de 10 días
      if (arr.indexOf(data) % 10 === 0) {
        //linew.classList.add("boldLi");

        //creo un botón con un número de botón
        let btnDesplegar = document.createElement("button");
        let indexBtn = arr.indexOf(data);
        btnDesplegar.setAttribute("onclick", `desplegarItems(${indexBtn})`);
        btnDesplegar.setAttribute("id", "btnDespegar");

        btnDesplegar.innerHTML = `
          <img id="imgDesplegar" src="desplegar.png" alt="desplegar" width="10">
        
        `;
        linew.appendChild(btnDesplegar);
      } else if (mostrable.indexOf(arr.indexOf(data)) === -1) {
        // si no es múltiplo de 10 y no está en el array mostrable
        linew.className = "regularLi, invisible";
      } else if (linew.className === "smallLi") {
        linew.className = "regularLi, invisible";
      } else {
        linew.className = "smallLi";
      }

      // formateo de Sábados y Domingos
      if (weekDayName == "Sábado" || weekDayName == "Domingo") {
        linew.classList.add("weekendLi");
      }
    } //cierra la función anónima
  ); //cierra el forEach;
} // cierra agregarElementos

// despliegue de ítems adyacentes al múltiplo de 10
function desplegarItems(indice) {
  mostrable = [];

  //creo un array con el indice de los días que tengo que togglear
  for (let i = indice; i < indice + 10; i++) {
    console.log(yearArr[i]);
    mostrable.push(i);
  }
  console.log(mostrable);
  desplegadoFlag = true;
  agregarElementos(yearArr);
}
