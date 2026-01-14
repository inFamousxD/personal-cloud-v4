# Jetson Orin Nano 8GB: High-Performance LLM Guide

This guide details how to run Gemma 3 4B using NVIDIA-optimized containers on the Orin Nano 8GB while maximizing available system memory.

## 1. Hardware Performance Mode

Before running any models, ensure the Jetson is not being throttled by power-saving settings.

```bash
# Set power profile to 15W (Max for Orin Nano)
sudo nvpmodel -m 0

# Lock clocks at maximum frequency
sudo jetson_clocks
```

## 2. Pre-requisite: Install and Configure Docker

If you encounter the "docker: command not found" error, you must install Docker and configure your user permissions.

```bash
# Install Docker
sudo apt-get update
sudo apt-get install -y docker.io

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your current user to the docker group 
# (This fixes the 'subprocess.CalledProcessError' in jetson-containers)
sudo usermod -aG docker $USER

# IMPORTANT: Log out and log back in (or reboot) for group changes to take effect
sudo reboot
```

## 3. Fix NVIDIA Runtime Error (unknown runtime name: nvidia)

If you see an error about an invalid runtime name, you need to install the NVIDIA Container Toolkit so Docker can access the GPU.

```bash
# Install the NVIDIA Container Toolkit
sudo apt-get install -y nvidia-container-toolkit

# Configure Docker to use the NVIDIA runtime
sudo nvidia-ctk runtime configure --runtime=docker

# Restart the Docker daemon to apply changes
sudo systemctl restart docker
```

## 4. RAM Optimization (Desktop vs. Headless)

The Ubuntu Desktop GUI consumes approximately 1.2GB–1.5GB of RAM. For 8GB boards, disabling the GUI is highly recommended when running 4B+ parameter models.

### To Disable Desktop (Free ~1.5GB RAM):

```bash
sudo systemctl set-default multi-user.target
sudo reboot
```

### To Restore Desktop:

```bash
sudo systemctl set-default graphical.target
sudo reboot
```

## 5. Create NVMe Swap (Safety Net)

If your model exceeds 8GB (common when adding Vision later), the system will crash unless you have a swap file on an NVMe SSD.

```bash
# Create an 8GB swap file
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent after reboot
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 6. Containerized Setup (Maximum Performance)

Using the jetson-containers stack ensures you are using libraries specifically compiled for the Jetson's CUDA cores.

### A. Install dependencies

```bash
git clone [https://github.com/dusty-nv/jetson-containers](https://github.com/dusty-nv/jetson-containers)
cd jetson-containers
pip3 install -r requirements.txt
```

### B. Run the Optimized Ollama Container

This will pull the NVIDIA-tuned image and launch it.

```bash
./run.sh $(./autotag dustynv/ollama:main)
```

### C. Run Gemma 3 4B

Once inside the container terminal:

```bash
ollama run gemma3:4b
```

## 7. Monitoring Tools

Use jtop to monitor RAM, GPU usage, and temperature in real-time.

```bash
# Install if not present
sudo pip3 install jetson-stats

# Launch monitor
jtop
```

### Technical Notes for 8GB Users

* Gemma 3 4B (Quantized): Uses approximately 3.3GB. It should run comfortably even with the Desktop GUI active, but performance will be more consistent in headless mode.
* Model Persistence: The ./run.sh script automatically maps /data/models/ollama to your host drive so you do not have to re-download models when the container stops.
* Thermal Management: Running LLMs at 15W can generate significant heat. Monitor your temperatures in jtop to ensure you are not hitting thermal throttling limits.
