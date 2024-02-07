function handleFileSelect() {
  var fileInput = document.getElementById('fileInput');
  var customLabel = document.getElementById('customLabel');
  var submitButton = document.getElementById('submitButton');

  var allowedExtensions = ['.xlsx'];

  if (fileInput.files.length > 0) {
    var fileName = fileInput.files[0].name;
    var fileExtension = fileName.slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2);

    if (allowedExtensions.includes(fileExtension.toLowerCase())) {
      customLabel.innerText = fileName;
      submitButton.style.display = 'inline-block';
    } else {
      alert('Please choose a valid Excel file with .xlsx extension.');
      fileInput.value = ''; // Clear the file input
      customLabel.innerText = 'Choose an Excel file';
      submitButton.style.display = 'none';
    }
  } else {
    customLabel.innerText = 'Choose an Excel file';
    submitButton.style.display = 'none';
  }
}

function submitForm() {
  var form = document.getElementById('uploadForm');
  form.submit();
}

function handleDrop(event) {
  event.preventDefault();

  var fileInput = document.getElementById('fileInput');
  var customLabel = document.getElementById('customLabel');
  var submitButton = document.getElementById('submitButton');

  var files = event.dataTransfer.files;

  if (files.length > 0) {
    fileInput.files = files;
    handleFileSelect(); // Check file extension after drop
  }
}

var fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', handleFileSelect);

var dropArea = document.getElementById('dropArea');
dropArea.addEventListener('dragover', function (event) { event.preventDefault(); });
dropArea.addEventListener('drop', handleDrop);

var submitButton = document.getElementById('submitButton');
submitButton.addEventListener('click', submitForm);
