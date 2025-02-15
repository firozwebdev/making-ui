
      const barCount = 10;
      const equalizer = document.getElementById("equalizer");
      const progressText = document.getElementById("progress-text");
      const stepLabels = document.getElementById("step-labels");
      const downloadBtn = document.getElementById("downloadBtn");

      let progress = 0;

      const colors = [
        "#00c9ff",
        "#00bcd4",
        "#4caf50",
        "#ffeb3b",
        "#ff9800",
        "#ff5722",
        "#e91e63",
        "#f44336",
        "#d32f2f",
        "#b71c1c",
      ];

      const steps = [
        "Creating Models",
        "Creating Migrations",
        "Creating Seeders",
        "Creating Controllers",
        "Creating Actions",
        "Creating DTOs",
        "Creating Messages",
        "Creating Rules",
        "Creating Services",
        "Creating Vue Templates",
        "Creating Image Traits",
        "Creating Exceptions",
        "Creating Helpers",
        "Creating Vue Templates",
        "Creating up Routes",
        "Finalizing Files",
        "Created",
      ];

      const icons = [
        "🎵",
        "🎶",
        "🎼",
        "🎧",
        "🎤",
        "🎷",
        "🎸",
        "🎺",
        "🎻",
        "🎚️",
      ];

      // Create bars dynamically with increasing heights
      for (let i = 0; i < barCount; i++) {
        let bar = document.createElement("div");
        bar.classList.add("bar");
        bar.style.backgroundColor = colors[i];
        bar.dataset.maxHeight = `${(i + 1) * 10}%`;
        let icon = document.createElement("i");
        icon.innerText = icons[i];
        bar.appendChild(icon);
        equalizer.appendChild(bar);
      }

      function startProgress() {
        progress = 0;
        let duration = 5000;
        let interval = duration / barCount;

        let bars = document.querySelectorAll(".bar");
        let index = 0;
        let timer = setInterval(() => {
          if (index >= bars.length) {
            clearInterval(timer);
            progressText.innerText = "CRUD App Generated!";
            progressText.style.animation = "fadeIn 1s forwards";
            stepLabels.innerText = "Process Complete!";
            downloadBtn.style.display = "inline-block"; // Show the download button
            return;
          }

          progress = (index + 1) * 10;
          progressText.innerText = `Processing: ${steps[index]} ${progress}%`;
          stepLabels.innerText = steps[index];

          // Delay step change slightly before updating the bar height
          setTimeout(() => {
            bars[index].style.height = bars[index].dataset.maxHeight;
            let icon = bars[index].querySelector("i");
            icon.style.opacity = 1;
          }, 100); // Delay in updating bar height to allow step text to show

          index++;
        }, interval);
      }
