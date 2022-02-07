

let today = new Date();
let anio = today.getFullYear();
let nextAnio = anio + 1
let nextNextAnio = anio + 2
let url = `https://nolaborables.com.ar/api/v2/feriados/${anio}?incluir=opcional`
let urlNextYear = `https://nolaborables.com.ar/api/v2/feriados/${nextAnio}?incluir=opcional`
let urlNextNextYear = `httpsgit://nolaborables.com.ar/api/v2/feriados/${nextNextAnio}?incluir=opcional`

let HTMLResponse = document.getElementById("app")
let yearArr = [];
let weekDayName;
document.getElementById("btn").onclick = function() {nextYear()};


function nextYear() {
    
    yearArr = [];
    let startDate = new Date(document.getElementById("startDate").value)
    for (let i = 0; i <= 730 ; i++) {
        let newDate = {
            isDate: new Date(startDate.setDate(startDate.getDate() + 1)),
            dia: 0,
            id: "",
            info: "",
            mes: 0,
            motivo: "",
            tipo: ""
            }; 
        
        yearArr.push(newDate);
    }
    getHolidays()
    .then(getNextYearHolidays()).then(getNextNextYearHolidays());
    
}

function getDayName(value){
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
    // tengo el problema de que la api trae los feriados por año, no por fecha, es decir, no verifica fecha por fecha si el día es feriado o no, sino que te trae un array con todos los feriados del año que vos le pidas.
    fetch(url)
    .then(response => response.json())
    .then(holidaysArr => {
        addHolidayYear(holidaysArr,anio);
        //le agrega el anio del url al array de feriados

        updateNextYearInfo(yearArr,holidaysArr);
    })

}


async function getNextYearHolidays() {
    
    fetch(urlNextYear)
    .then(response => response.json())
    .then(nextYearHolidaysArr => {
        addHolidayYear(nextYearHolidaysArr,nextAnio);
        //le agrega el anio del url al array de feriados

        updateNextYearInfo(yearArr,nextYearHolidaysArr);
    })

}

async function getNextNextYearHolidays() {
    
    fetch(urlNextNextYear)
    .then(response => response.json())
    .then(nextNextYearHolidaysArr => {
        addHolidayYear(nextNextYearHolidaysArr,nextNextAnio);
        //le agrega el anio del url al array de feriados

        updateNextYearInfo(yearArr,nextNextYearHolidaysArr);
    })

}



function addHolidayYear(array,year){
    for (let i = 0; i < array.length; i++) {
        array[i].year = year;

        
    }
    //console.log(JSON.stringify(array))
}


function updateNextYearInfo(year,holidays){
    for (let i = 0; i < year.length; i++) {
        for (let z = 0; z < holidays.length; z++) {
            
            if (year[i].isDate.getMonth() + 1 == holidays[z].mes && year[i].isDate.getDate() ==  holidays[z].dia && year[i].isDate.getFullYear() ==  holidays[z].year) {
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
    agregarElementos(yearArr) ;
    
} 






function agregarElementos(arr){ 
    
    document.getElementById("ulListado").innerHTML = "";
    var lista=document.getElementById("ulListado"); 
    
    
    arr.forEach(function(data,index){
        var linew= document.createElement("li");    
        getDayName(data.isDate.getDay());
        var contenido = document.createTextNode(
            `${yearArr.indexOf(data)} días: ${weekDayName}, ${data.isDate.getDate()}/${data.isDate.getMonth() + 1}/${data.isDate.getFullYear()}`) 
        

            
        if (arr.indexOf(data) == 0) {
            linew.classList.add("invisible")
        }


        if (arr.indexOf(data) % 10 == 0 ) {
            linew.classList.add("boldLi");
        } else {
            linew.className = "regularLi";
        }

        lista.appendChild(linew);
        linew.appendChild(contenido);

        if(data.motivo != "") {
            /* var infoFeriado = document.createTextNode(` ${data.motivo}  (${data.tipo})`);
            linew.appendChild(infoFeriado);
             */
            
            let infoFeriado = document.createElement('p');
            infoFeriado.innerHTML = `<a href="${data.info}"target="_blank"> ${data.motivo}</a>  (${data.tipo})<br>`
            linew.appendChild(infoFeriado);
            linew.className = "holidayLi";
        }


        if(weekDayName == "Sábado"  || weekDayName == "Domingo" ) {
            
            linew.classList.add("weekendLi");
        }
    })
}
