const API_URL = 'https://script.google.com/a/macros/byerach.org/s/AKfycbwrr-eygRt2TuVKd_aM0Z5h9SOeXaueTtxXi0NjPQRlPanm8pRaqZgn9B5eQNN6Gbw/exec';
const DELETE_CODE = '1234';
const TEACHER_CODE = '5555';

function populateClassOptions() {
    const classSelect = document.getElementById('studentClass');
    const grades = ['ט', 'י', 'יא', 'יב'];
    grades.forEach(grade => {
        for (let i = 1; i <= 11; i++) {
            const option = document.createElement('option');
            option.value = `${grade}${i}`;
            option.textContent = `${grade}${i}`;
            classSelect.appendChild(option);
        }
    });
}

function validateInput() {
    const name = document.getElementById('studentName').value.trim();
    const className = document.getElementById('studentClass').value;
    
    if (!name || !className) {
        showError('נא למלא את שם התלמיד ולבחור כיתה');
        return false;
    }
    return true;
}

function recordEntry() {
    if (!validateInput()) return;
    
    const name = document.getElementById('studentName').value.trim();
    const className = document.getElementById('studentClass').value;
    const entryTime = new Date().toLocaleString('he-IL');
    
    addRowToTable(name, className, entryTime, '');
    sendDataToSheet({ name, class: className, entryTime, exitTime: '', approved: false });
    clearForm();
    showError('');
}

function recordExit() {
    if (!validateInput()) return;
    
    const name = document.getElementById('studentName').value.trim();
    const className = document.getElementById('studentClass').value;
    const exitTime = new Date().toLocaleString('he-IL');
    
    addRowToTable(name, className, '', exitTime);
    sendDataToSheet({ 
        name: name, 
        class: className, 
        entryTime: '',
        exitTime: exitTime, 
        approved: false 
    });
    
    showError('יציאה נרשמה בהצלחה.');
    clearForm();
}

function approveExit(checkbox, studentName) {
    const teacherCode = prompt("הכנס קוד מורה לאישור יציאה:");
    if (teacherCode === TEACHER_CODE) {
        checkbox.checked = true;
        checkbox.disabled = true;
        sendDataToSheet({ 
            name: studentName, 
            approved: true 
        });
        showError('יציאה אושרה על ידי המורה.');
    } else {
        checkbox.checked = false;
        showError('קוד שגוי. היציאה לא אושרה.');
    }
}

function addRowToTable(name, className, entryTime, exitTime) {
    const table = document.getElementById('attendanceTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow(0);
    newRow.innerHTML = `
        <td>${name}</td>
        <td>${className}</td>
        <td><input type="checkbox" onchange="approveExit(this, '${name}')" ${exitTime ? '' : 'disabled'}></td>
        <td>${entryTime}</td>
        <td>${exitTime}</td>
        <td><button onclick="confirmDelete(this)">מחק</button></td>
    `;
    return newRow;
}

function confirmDelete(btn) {
    const userInput = prompt("הכנס קוד מחיקה:");
    if (userInput === DELETE_CODE) {
        deleteRow(btn);
    } else {
        alert("קוד שגוי. המחיקה בוטלה.");
    }
}

function deleteRow(btn) {
    const row = btn.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

function sendDataToSheet(data) {
    axios.post(API_URL, data)
        .then(response => {
            console.log('נתונים נשלחו בהצלחה:', response.data);
        })
        .catch(error => {
            console.error('שגיאה בשליחת נתונים:', error);
            showError('אירעה שגיאה בשליחת הנתונים');
        });
}

function clearForm() {
    document.getElementById('studentName').value = '';
    document.getElementById('studentClass').value = '';
}

function showError(message) {
    document.getElementById('errorMessage').textContent = message;
}

// אתחול הדף
document.addEventListener('DOMContentLoaded', function() {
    populateClassOptions();
});
