---
title: RISCV 64 glibc + systemd LFS Walkthrough
author: Lee
---

## Install dependencies

```bash
sudo apt update
sudo apt install -y \
    build-essential \
    autoconf automake autotools-dev libtool \
    flex bison gawk gperf texinfo patchutils \
    bc \
    libgmp-dev libmpfr-dev libmpc-dev \
    libncurses-dev \
    zlib1g-dev libexpat-dev \
    pkg-config cmake ninja-build \
    git wget curl \
    python3 python3-pip python3-tomli \
    libglib2.0-dev libslirp-dev \
    qemu-system-misc \
    opensbi u-boot-qemu \
    e2fsprogs \
    meson ninja-build
```

## Create workspace directory

```bash
export LFS=/home/lee/lfs
mkdir -pv $LFS/{sources,rootfs,cross-tools}
export PATH=$LFS/cross-tools/bin:$PATH
```

## Build RISC-V GNU Compiler Toolchain

Initially considered downloading pre-built binaries, but thought it didn't align with the LFS philosophy, so decided to compile it myself

```bash
mkdir $LFS/cross-tools/riscv-gnu-toolchain
cd $LFS/sources
git clone https://github.com/riscv-collab/riscv-gnu-toolchain.git
cd riscv-gnu-toolchain
./configure --prefix=$LFS/cross-tools/riscv-gnu-toolchain
make linux
export PATH=$LFS/cross-tools/riscv-gnu-toolchain/bin:$PATH # Set environment variable
```

```bash
# Verify installation
riscv64-unknown-linux-gnu-gcc --version
riscv64-unknown-linux-gnu-g++ --version
```

## Root filesystem

The root filesystem needs to be completed, otherwise errors will occur

```bash
mount: mounting none on /proc failed: No such file or directory
mount: mounting none on /sys failed: No such file or directory
```

Solution:

```bash
# Create actual directories under usr and other system directories
mkdir -pv $LFS/rootfs/{usr/bin,usr/sbin,usr/lib,etc/systemd/system,var/log/journal,run,proc,sys,dev,tmp,root}

# Create Usr-Merge symlinks
ln -sv usr/bin $LFS/rootfs/bin
ln -sv usr/sbin $LFS/rootfs/sbin
ln -sv usr/lib $LFS/rootfs/lib
ln -sv usr/lib $LFS/rootfs/lib64
```

## Handle dynamic libraries

```bash
sudo cp -a $LFS/cross-tools/riscv-gnu-toolchain/sysroot/lib/* $LFS/rootfs/usr/lib/
```

## libxcrypt

Old version: `crypt()` is in **glibc**, new version `crypt()` has been moved to **libxcrypt**, requiring manual installation

```bash
cd $LFS/sources
wget https://github.com/besser82/libxcrypt/releases/download/v4.5.2/libxcrypt-4.5.2.tar.xz
tar xf libxcrypt-4.5.2.tar.xz
cd libxcrypt-4.5.2

./configure \
--host=riscv64-unknown-linux-gnu \
--prefix=/usr \
--disable-static

make -j$(nproc)
make DESTDIR=$LFS/rootfs install
```

## GNU Bash

```bash
cd $LFS/sources
wget https://ftp.gnu.org/gnu/bash/bash-5.3.tar.gz
tar -xf bash-5.3.tar.gz
cd bash-5.3

./configure --host=riscv64-unknown-linux-gnu \
            --prefix=/usr \
            --without-bash-malloc \
            --disable-nls

make -j$(nproc)
make DESTDIR=$LFS/rootfs install

# Ensure sh points to bash
ln -sfv bash $LFS/rootfs/usr/bin/sh
```

## GNU Coreutils

```bash
cd $LFS/sources
wget https://ftp.gnu.org/gnu/coreutils/coreutils-9.6.tar.xz
tar -xf coreutils-9.6.tar.xz
cd coreutils-9.6

# Cross-compilation fix parameters
./configure --host=riscv64-unknown-linux-gnu \
            --prefix=/usr \
            --enable-no-install-program=kill,uptime

make -j$(nproc)
make DESTDIR=$LFS/rootfs install
```

## util-linux

Systemd requires some components of util-linux

```bash
cd $LFS/sources
wget https://mirrors.edge.kernel.org/pub/linux/utils/util-linux/v2.39/util-linux-2.39.3.tar.xz
tar xf util-linux-2.39.3.tar.xz
cd util-linux-2.39.3
```

```bash
./configure --host=riscv64-unknown-linux-gnu \
            --prefix=/usr \
            --disable-all-programs \
            --disable-nls \
            --enable-libblkid \
            --enable-libmount \
            --enable-agetty \
            --enable-mount \
            --enable-unshare \
            --without-python \
            --without-systemd \
            --without-tinfo \
            --without-ncurses \
            --without-ncursesw

make -j$(nproc)
sudo PATH="$PATH" LFS="$LFS" make DESTDIR="$LFS/rootfs" install -i
```

## Systemd

```bash
cd $LFS/sources
git clone https://github.com/systemd/systemd.git
cd systemd

cat > meson.cross <<EOF
[binaries]
c = 'riscv64-unknown-linux-gnu-gcc'
cpp = 'riscv64-unknown-linux-gnu-g++'
ar = 'riscv64-unknown-linux-gnu-ar'
strip = 'riscv64-unknown-linux-gnu-strip'
pkgconfig = 'pkg-config'

[host_machine]
system = 'linux'
cpu_family = 'riscv64'
cpu = 'riscv64'
endian = 'little'

[properties]
sys_root = '$LFS/rootfs'
EOF
```

```bash
cd $LFS/sources/systemd

# Many of Systemd's tests cannot be disabled; supporting them individually leads to a dependency chain where a depends on b, b depends on c, c depends on d, ad infinitum. Therefore, let's trick the build system.

cat << 'EOF' >> src/basic/log.c

/* ====== LFS Cross-Compile Dummy Patch ====== */

/* --- 1. Prototypes (Declare first to bypass -Wmissing-prototypes check) --- */
void test_prepare(void);
void log_test_failed_internal(void);
int run_test_table(void);
void test_setup_logging(void);
const char* get_testdata_dir(void);
void assert_signal_internal(void);
int slow_tests_enabled(void);
int enter_cgroup_subroot(void);
int setup_fake_runtime_dir(void);
int userns_has_single_user(void);
int can_memlock(void);
int have_namespaces(void);
int ci_environment(void);
const char* get_catalog_dir(void);
int write_tmpfile(void);

/* --- 2. Definitions (Define later to bypass ld linker's undefined reference) --- */

/* Basic test environment */
void test_prepare(void) {}
void log_test_failed_internal(void) {}
int run_test_table(void) { return 0; }
void test_setup_logging(void) {}

/* Network, logging, and path tests */
const char* get_testdata_dir(void) { return "/tmp"; }
const char* get_catalog_dir(void) { return "/tmp"; }

/* Signal and slow test configuration */
void assert_signal_internal(void) {}
int slow_tests_enabled(void) { return 0; } /* Tell it slow tests are not enabled */

/* Container, permission, and namespace tests */
int enter_cgroup_subroot(void) { return 0; }
int setup_fake_runtime_dir(void) { return 0; }
int userns_has_single_user(void) { return 0; } /* Default return false */
int have_namespaces(void) { return 0; }

/* BPF firewall and CI environment tests */
int can_memlock(void) { return 0; }
int ci_environment(void) { return 0; }

/* Environment variable and file operation tests */
int write_tmpfile(void) { return -1; } /* Directly return -1 to indicate write failure, letting the test program skip subsequent logic */

/* ========================================================== */
EOF
```

```bash
mkdir build && cd build

meson setup .. \
  --prefix=/usr \
  --cross-file=../meson.cross \
  --buildtype=release \
  -Dtests=false \
  -Dfuzz-tests=false \
  -Dinstall-tests=false \
  -Dman=false \
  -Dhtml=false \
  -Dblkid=enabled \
  -Dlibmount=enabled \
  -Dglib=false \
  -Dgnutls=false \
  -Dgcrypt=false \
  -Dopenssl=false \
  -Delfutils=false \
  -Dp11kit=false \
  -Dpcre2=false \
  -Dlibidn2=false \
  -Dlibcurl=false \
  -Dselinux=false \
  -Dapparmor=false \
  -Daudit=false \
  -Dseccomp=false \
  -Dkmod=false \
  -Dpam=false \
  -Dpolkit=false \
  -Dacl=false \
  -Dsmack=false \
  -Dima=false \
  -Dnetworkd=false \
  -Dtimesyncd=false \
  -Dmachined=false \
  -Dimportd=false \
  -Dhostnamed=false \
  -Dlocaled=false \
  -Dtimedated=false \
  -Dlogind=false \
  -Duserdb=false \
  -Dhomed=false \
  -Doomd=false \
  -Dnss-myhostname=false \
  -Dnss-systemd=false \
  -Dnss-resolve=false \
  -Dnss-mymachines=false

ninja -j$(nproc)

DESTDIR=$LFS/rootfs ninja install
```

## Login Configuration

```bash
# Simple login script
cat << 'EOF' | sudo tee $LFS/rootfs/usr/bin/lfs-login
#!/bin/sh
# 1. Force set basic environment variables (because /bin/login is skipped)
export PATH=/usr/bin:/usr/sbin
export HOME=/root
export USER=root
export TERM=xterm-256color

# 2. Print welcome message
echo -e "\033[1;32mStarting LFS for RISC-V...\033[0m"

# 3. Start the real Bash and force it into login mode (read .bash_profile)
# This way the root string will be ignored as $0 and won't cause "Is a directory" error
exec /bin/bash --login
EOF

sudo chmod +x $LFS/rootfs/usr/bin/lfs-login

# Create configuration override directory
sudo mkdir -p $LFS/rootfs/etc/systemd/system/serial-getty@ttyS0.service.d

# Write auto-login configuration
sudo cat << 'EOF' | sudo tee $LFS/rootfs/etc/systemd/system/serial-getty@ttyS0.service.d/override.conf
[Service]
ExecStart=
# -n: Do not invoke the login program
# -l: Specify our trampoline script
# %I: Pass terminal name (ttyS0)
ExecStart=-/usr/sbin/agetty --autologin root --noclear -n -l /usr/bin/lfs-login %I $TERM
EOF

systemd-machine-id-setup --root=$LFS/rootfs
```

```bash
# Create passwd file, define root user (UID 0, GID 0, home directory /root, Shell as bash)
cat << EOF | sudo tee $LFS/rootfs/etc/passwd
root:x:0:0:root:/root:/bin/bash
EOF

# Create group file, define root group
cat << EOF | sudo tee $LFS/rootfs/etc/group
root:x:0:
bin:x:1:
daemon:x:2:
sys:x:3:
adm:x:4:
tty:x:5:
disk:x:6:
lp:x:7:
mem:x:8:
kmem:x:9:
wheel:x:10:
EOF
```

## Kernel build

```bash
cd $LFS/sources
wget https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-6.6.10.tar.xz
tar -xf linux-6.6.10.tar.xz
cd linux-6.6.10

make ARCH=riscv CROSS_COMPILE=riscv64-unknown-linux-gnu- defconfig
```

### Key configuration additions

```bash
cat >> .config << 'EOF'
CONFIG_VIRTIO_BLK=y          # Disk
CONFIG_VIRTIO_NET=y          # Network card
CONFIG_VIRTIO_CONSOLE=y      # Console
CONFIG_HVC_RISCV_SBI=y       # SBI console interface
CONFIG_SERIAL_8250=y         # Serial port
CONFIG_SERIAL_8250_CONSOLE=y # Serial console
CONFIG_EXT4_FS=y             # Root filesystem
CONFIG_PCI=y                 # PCI bus
CONFIG_VIRTIO_PCI=y          # VirtIO PCI device

CONFIG_DEVTMPFS=y
CONFIG_TMPFS=y
CONFIG_SYSFS=y
CONFIG_PROC_FS=y
CONFIG_FHANDLE=y

CONFIG_NET=y
CONFIG_INET=y

CONFIG_EPOLL=y
CONFIG_SIGNALFD=y
CONFIG_TIMERFD=y
CONFIG_FUTEX=y

CONFIG_CGROUPS=y
CONFIG_CGROUP_DEVICE=y
CONFIG_CGROUP_FREEZER=y
CONFIG_CGROUP_PIDS=y

CONFIG_SECCOMP=y
CONFIG_NAMESPACES=y
CONFIG_USER_NS=y
EOF
```

### Compilation

```bash
make ARCH=riscv CROSS_COMPILE=riscv64-unknown-linux-gnu- -j$(nproc) Image
```

## Install fastfetch

Host cross-compilation

```bash
cd $LFS/sources
git clone https://github.com/fastfetch-cli/fastfetch.git
cd fastfetch
mkdir build && cd build
```

```bash
cmake .. \
  -DCMAKE_SYSTEM_NAME=Linux \
  -DCMAKE_SYSTEM_PROCESSOR=riscv64 \
  -DCMAKE_C_COMPILER=riscv64-unknown-linux-gnu-gcc \
  -DCMAKE_EXE_LINKER_FLAGS="-static" \
  -DCMAKE_BUILD_TYPE=Release \
  -DENABLE_ZLIB=OFF

make -j$(nproc)

sudo install -Dm755 fastfetch $LFS/rootfs/usr/bin/fastfetch
```

Custom color scheme

```bash
sudo mkdir -p $LFS/rootfs/usr/share/fastfetch

echo -e "\033[38;5;81m╭────────────────────────────────────────╮
\033[38;5;81m│\033[38;5;218m  ██╗     ███████╗███████╗               \033[38;5;81m│
\033[38;5;81m│\033[38;5;218m  ██║     ██╔════╝██╔════╝               \033[38;5;81m│
\033[38;5;15m│  ██║     █████╗  █████╗                \033[38;5;81m│
\033[38;5;218m│  ██║     ██╔══╝  ██╔══╝                \033[38;5;81m│
\033[38;5;218m│  ███████╗███████╗███████╗              \033[38;5;81m│
\033[38;5;15m│      Lee                              \033[38;5;81m│
\033[38;5;81m╰────────────────────────────────────────╯\033[0m" | sudo tee $LFS/rootfs/usr/share/fastfetch/lee.txt
```

Modify configuration file

```bash
sudo mkdir -p $LFS/rootfs/etc/fastfetch

sudo tee $LFS/rootfs/etc/fastfetch/config.jsonc <<EOF
{
  "logo": {
    "source": "/usr/share/fastfetch/lee.txt",
    "type": "file"
  },
  "modules": [
    "os",
    "kernel",
    "uptime",
    "memory",
    "packages",
    "shell",
    "cpu"
  ]
}
EOF
```

## Boot on startup

```bash
# Create root directory
sudo mkdir -p $LFS/rootfs/root

# Write login configuration
cat << EOF | sudo tee $LFS/rootfs/root/.bash_profile
echo "****************************************"
echo "   Welcome to Lee's RISC-V LFS system!"
echo "      System kernel:\$(uname -r)"
echo "****************************************"
fastfetch

export PS1='[\u@lfs \W]\$ '
EOF

# Soft link .bashrc
sudo ln -sfv .bash_profile $LFS/rootfs/root/.bashrc
```

## Image creation

```bash
cd $LFS
dd if=/dev/zero of=lfs-glibc-riscv64.img bs=1M count=1024
sudo /usr/sbin/mkfs.ext4 lfs-glibc-riscv64.img

sudo mkdir -p /mnt/tmp-boot

sudo mount -o loop lfs-glibc-riscv64.img /mnt/tmp-boot
sudo cp -a rootfs/* /mnt/tmp-boot/
sync
sudo umount /mnt/tmp-boot
```

## Boot

```bash
qemu-system-riscv64 \
    -machine virt \
    -m 512M \
    -smp 2 \
    -bios default \
    -kernel $LFS/sources/linux-6.6.10/arch/riscv/boot/Image \
    -drive file=$LFS/lfs-glibc-riscv64.img,format=raw,if=virtio \
    -append "root=/dev/vda rw console=ttyS0 init=/usr/lib/systemd/systemd" \
    -nographic
```

![riscv-lfs](/tips/system/linux/pubilc/riscv-lfs.png)
