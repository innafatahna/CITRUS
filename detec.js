const input = document.getElementById("gambar");
const element = document.getElementById("json");

input.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  const data = new FormData();
  data.append("image_file", file, "image_file");

  try {
    const response = await fetch("/detect", {
      method: "post",
      body: data,
    });

    if (!response.ok) {
      throw new Error(
        `Server returned ${response.status} ${response.statusText}`
      );
    }

    const hasil = await response.json();

    // Display tanggal, waktu, jumlah, and kualitas in HTML
    element.innerHTML = `<p>Date: ${hasil.tanggal}</p><p>Time: ${hasil.waktu}</p><p>Count: ${hasil.jumlah}</p><p>Quality: ${hasil.kualitas}</p>`;

    draw_image_and_boxes(file, hasil.boxes);
  } catch (error) {
    console.error("Error during fetch or parsing JSON:", error);
    // Handle the error, e.g., display an error message to the user
  }
});

function draw_image_and_boxes(file, boxes) {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = () => {
    const canvas = document.querySelector("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = 3;
    ctx.font = "18px serif";
    boxes.forEach(([x1, y1, x2, y2, label, prob]) => {
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      ctx.fillStyle = "#00ff00";
      const width = ctx.measureText(label).width;
      ctx.fillRect(x1, y1, width + 10, 25);
      ctx.fillStyle = "#000000";
      ctx.fillText(`${label} (${prob * 100}%)`, x1, y1 + 18);
    });
  };
}
