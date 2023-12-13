const webcam = document.getElementById("webcam");
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const captureButton = document.getElementById("captureButton");
const deleteButton = document.getElementById("deleteButton");
const submitButton = document.getElementById("submitButton");
const imageContainer = document.getElementById("image-container");
const capturedImage = document.getElementById("capturedImage");
let mediaStream = null;

// Mengaktifkan webcam
async function startWebcam() {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
    webcam.srcObject = mediaStream;
    startButton.disabled = true;
    stopButton.disabled = false;
    captureButton.disabled = false;
  } catch (error) {
    console.error("Gagal mengaktifkan webcam:", error);
  }
}

// Menonaktifkan webcam
function stopWebcam() {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    webcam.srcObject = null;
    startButton.disabled = false;
    stopButton.disabled = true;
    captureButton.disabled = true;
    deleteButton.disabled = true;
    submitButton.disabled = true;
  }
}

startButton.addEventListener("click", startWebcam);
stopButton.addEventListener("click", stopWebcam);

let imageDataURL = null;

// Menyimpan gambar dari webcam saat tombol "Capture" diklik
captureButton.addEventListener("click", () => {
  const canvas = document.createElement("canvas");
  canvas.width = webcam.videoWidth;
  canvas.height = webcam.videoHeight;
  const context = canvas.getContext("2d");
  context.drawImage(webcam, 0, 0, canvas.width, canvas.height);
  imageDataURL = canvas.toDataURL("image/png");
  capturedImage.src = imageDataURL;
  imageContainer.style.display = "block";
  captureButton.disabled = true;
  deleteButton.disabled = false;
  submitButton.disabled = false;
});

// Menghapus gambar yang telah diambil
deleteButton.addEventListener("click", () => {
  capturedImage.src = "";
  imageContainer.style.display = "none";
  imageDataURL = null;
  captureButton.disabled = false;
  deleteButton.disabled = true;
  submitButton.disabled = true;
});

// Menyimpan gambar yang telah diambil saat tombol "Submit" diklik
function downloadImage() {
  if (imageDataURL) {
    const a = document.createElement("a");
    a.href = imageDataURL;
    a.download = "kinkan.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    alert("Gambar telah diunduh ke folder unduhan Anda.");
  }
}

// Menyimpan gambar yang telah diambil saat tombol "Submit" diklik
submitButton.addEventListener("click", downloadImage);
