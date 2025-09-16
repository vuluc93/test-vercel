document.addEventListener("DOMContentLoaded", () => {
  // Lấy tên file HTML hiện tại
  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf("/") + 1); // ví dụ: "stock.html"

  // Lấy tên JSON cùng tên file HTML
  const baseName = page.replace(".html", ""); // "stock"
  const configFile = baseName + ".json";      // "stock.json"

  function openTarget(item) {
    // Build URL theo cấu trúc mới trong JSON
    const url = `http://localhost:8080/?file=${encodeURIComponent(item.project + "\\" + item.target)}&search=${encodeURIComponent(item.search)}`;

    console.log("openTarget url:", url);

    fetch(url)
      .then((res) => res.text())
      .then((msg) => {
        console.log("Server response:", msg);
      })
      .catch((err) => {
        console.error("Error:", err);
        alert("Không gọi được server. Bạn đã chạy server.ps1 chưa?");
      });
  }

  // Load config JSON
  fetch("config/" + configFile)
    .then((res) => res.json())
    .then((data) => {
      console.log("Loaded config:", configFile, data);

      const dashboard = document.getElementById("dashboard");
      data.forEach((item) => {
        const cell = document.createElement("div");
        cell.className = "cell";

        const btn = document.createElement("button");
        btn.textContent = item.label;
        btn.className = "cell-btn";
        btn.onclick = () => {
          openTarget(item);
        };
        cell.appendChild(btn);

        // cell.textContent = item.label;

        // // click cell (trừ button) mở link chính
        // cell.onclick = (e) => {
        //   if (e.target.tagName.toLowerCase() !== "button") {
        //     openTarget(item);
        //   }
        // };

        if (item.children && item.children.length > 0) {
          const btn = document.createElement('button');
          btn.className = 'expand-btn';
          btn.textContent = '+';
          cell.appendChild(btn);

          const childrenBox = document.createElement('div');
          childrenBox.className = 'children';

          item.children.forEach(ch => {
            const a = document.createElement('a');
            a.textContent = ch.label;
            a.href = "#";
            a.onclick = (e) => {
              e.preventDefault();
              openTarget(ch);
            };
            childrenBox.appendChild(a);
          });
          cell.appendChild(childrenBox);

          btn.onclick = (e) => {
            e.stopPropagation();

            // xác định expand hướng nào
            if (item.id <= 3) { // hàng trên → expand lên trên
              childrenBox.style.bottom = '100%';
              childrenBox.style.top = 'auto';
              childrenBox.style.marginBottom = '10px';
            } else { // hàng dưới → expand xuống dưới
              childrenBox.style.top = '100%';
              childrenBox.style.bottom = 'auto';
              childrenBox.style.marginTop = '10px';
            }
            childrenBox.style.display = 'block';

            // disable button sau khi expand
            btn.disabled = true;
            btn.style.opacity = 0.5;
          };
        }

        dashboard.appendChild(cell);
      });
    })
    .catch((err) => {
      console.error("Không load được config:", configFile, err);
    });
});
