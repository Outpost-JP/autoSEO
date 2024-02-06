document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addRowButton').addEventListener('click', addRow);
    document.getElementById('removeRowButton').addEventListener('click', removeRow);
    document.getElementById('seoForm').addEventListener('submit', submitForm);
});

function addRow() {
    const table = document.getElementById('headerTable');
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td>
            <select name="headerLevel[]">
                <option value="h1">H1</option>
                <option value="h2">H2</option>
                <option value="h3">H3</option>
                <option value="h4">H4</option>
                <option value="h5">H5</option>
                <option value="h6">H6</option>
            </select>
        </td>
        <td><textarea name="headerText"></textarea></td>
        <td><textarea name="headerCharCount" oninput="this.value=this.value.replace(/[^0-9]/g,'');"></textarea></td>
        <td><textarea name="headerSummary"></textarea></td>
        <td><textarea name="headerKeywords"></textarea></td>
        <td><textarea name="headerNotes"></textarea></td>
    `;
}

function removeRow() {
    const table = document.getElementById('headerTable');
    const rowCount = table.rows.length;
    if (rowCount > 1) { // 最初の行を除いて削除
        table.deleteRow(-1);
    }
}

function submitForm(event) {
    event.preventDefault();
    const headers = {};
    Array.from(document.querySelectorAll('#headerTable tr')).slice(1).forEach((tr, index) => {
        headers[`headline${index + 1}`] = {
            level: tr.querySelector('select[name="headerLevel[]"]').value,
            text: tr.querySelector('textarea[name="headerText"]').value,
            charCount: tr.querySelector('textarea[name="headerCharCount"]').value,
            summary: tr.querySelector('textarea[name="headerSummary"]').value,
            keywords: tr.querySelector('textarea[name="headerKeywords"]').value.split(',').map(kw => kw.trim()),
            notes: tr.querySelector('textarea[name="headerNotes"]').value
        };
    });

    const formData = {
        section1: {
            keywords: document.getElementById('inputKeyword').value.split(',').map(kw => kw.trim()),
            targetReader: document.getElementById('inputTarget').value,
            searchIntent: document.getElementById('inputIntent').value,
            goal: document.getElementById('inputGoal').value,
            title: document.getElementById('inputTitle').value,
            description: document.getElementById('inputDescription').value
        },
        section2: headers
    };

    fetch('/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('message').textContent = '送信に成功しました';
        document.getElementById('message').style.color = 'green';
    })
    .catch(error => {
        document.getElementById('message').textContent = '送信に失敗しました';
        document.getElementById('message').style.color = 'red';
        console.error('送信エラー:', error);
    });
}

// サーバーからのイベントをリッスンする
const eventSource = new EventSource('/submit');
eventSource.onmessage = function(event) {
    const data = JSON.parse(event.data);
    const outputFrame = document.getElementById('outputFrame');
    // contentが存在する場合、output-frameに追加する
    if (data.content) {
        const p = document.createElement('p');
        p.textContent = data.content;
        outputFrame.appendChild(p);
    }
};
                   
    
