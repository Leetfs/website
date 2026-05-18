---
title: RISCV 64 glibc + systemd LFS 完全攻略
author: リー
---

## 依存関係のインストール

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

## 作業ディレクトリの作成

```bash
export LFS=/home/lee/lfs
mkdir -pv $LFS/{sources,rootfs,cross-tools}
export PATH=$LFS/cross-tools/bin:$PATH
```

## RISC-V GNU コンパイラツールチェーンの構築

最初は完成品のバイナリを直接ダウンロードしようと考えましたが、LFSの精神に合わないと思い、自分でコンパイルすることにしました。

```bash
mkdir $LFS/cross-tools/riscv-gnu-toolchain
cd $LFS/sources
git clone https://github.com/riscv-collab/riscv-gnu-toolchain.git
cd riscv-gnu-toolchain
./configure --prefix=$LFS/cross-tools/riscv-gnu-toolchain
make linux
export PATH=$LFS/cross-tools/riscv-gnu-toolchain/bin:$PATH # 環境変数の設定
```

```bash
# インストールの検証
riscv64-unknown-linux-gnu-gcc --version
riscv64-unknown-linux-gnu-g++ --version
```

## ルートファイルシステム

ルートファイルシステムを補完する必要があります。そうしないとエラーが発生します。

```bash
mount: /procへのnoneのマウントに失敗しました: そのようなファイルまたはディレクトリはありません
mount: /sysへのnoneのマウントに失敗しました: そのようなファイルまたはディレクトリはありません
```

解決策：

```bash
# usr 配下の実際のディレクトリとその他のシステムディレクトリを作成
mkdir -pv $LFS/rootfs/{usr/bin,usr/sbin,usr/lib,etc/systemd/system,var/log/journal,run,proc,sys,dev,tmp,root}

# Usr-Merge のシンボリックリンクを作成
ln -sv usr/bin $LFS/rootfs/bin
ln -sv usr/sbin $LFS/rootfs/sbin
ln -sv usr/lib $LFS/rootfs/lib
ln -sv usr/lib $LFS/rootfs/lib64
```

## 動的リンクライブラリの処理

```bash
sudo cp -a $LFS/cross-tools/riscv-gnu-toolchain/sysroot/lib/* $LFS/rootfs/usr/lib/
```

## libxcrypt

旧バージョン：`crypt()` は **glibc** に含まれていましたが、新しいバージョンでは `crypt()` は **libxcrypt** に分離され、手動でインストールする必要があります。

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

# shがbashを指すようにする
ln -sfv bash $LFS/rootfs/usr/bin/sh
```

## GNU Coreutils

```bash
cd $LFS/sources
wget https://ftp.gnu.org/gnu/coreutils/coreutils-9.6.tar.xz
tar -xf coreutils-9.6.tar.xz
cd coreutils-9.6

# クロスコンパイル修正パラメータ
./configure --host=riscv64-unknown-linux-gnu \
            --prefix=/usr \
            --enable-no-install-program=kill,uptime

make -j$(nproc)
make DESTDIR=$LFS/rootfs install
```

## util-linux

Systemdにはutil-linuxの一部コンポーネントが必要です

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

# Systemdの多くのテストは無効化できず、個別に対応するとaがbに依存し、bがcに依存し、cがさらにdに依存するという無限の依存関係が発生するため、ビルドシステムを騙す。

cat << 'EOF' >> src/basic/log.c

/* ====== LFSクロスコンパイルダミーパッチ ====== */

/* --- 1. プロトタイプ宣言 (-Wmissing-prototypes チェックを回避) --- */
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

/* --- 2. 定義 (ldリンカーの未定義参照を回避) --- */

/* 基本テスト環境 */
void test_prepare(void) {}
void log_test_failed_internal(void) {}
int run_test_table(void) { return 0; }
void test_setup_logging(void) {}

/* ネットワーク、ログ、パステスト */
const char* get_testdata_dir(void) { return "/tmp"; }
const char* get_catalog_dir(void) { return "/tmp"; }

/* シグナルと低速テスト設定 */
void assert_signal_internal(void) {}
int slow_tests_enabled(void) { return 0; } /* 低速テストが有効でないことを伝える */

/* コンテナ、権限、名前空間テスト */
int enter_cgroup_subroot(void) { return 0; }
int setup_fake_runtime_dir(void) { return 0; }
int userns_has_single_user(void) { return 0; } /* デフォルトで偽を返す */
int have_namespaces(void) { return 0; }

/* BPFファイアウォールとCI環境テスト */
int can_memlock(void) { return 0; }
int ci_environment(void) { return 0; }

/* 環境変数とファイル操作テスト */
int write_tmpfile(void) { return -1; } /* 直接-1を返して書き込み失敗とし、テストプログラムに後続ロジックをスキップさせる */

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

## ログイン設定

```bash
# 簡易ログインスクリプト
cat << 'EOF' | sudo tee $LFS/rootfs/usr/bin/lfs-login
#!/bin/sh
# 1. 基本環境変数の強制設定 (/bin/loginをスキップするため)
export PATH=/usr/bin:/usr/sbin
export HOME=/root
export USER=root
export TERM=xterm-256color

# 2. ウェルカムメッセージの表示
echo -e "\033[1;32mStarting LFS for RISC-V...\033[0m"

# 3. 実際のBashを起動し、ログインモードを強制 (.bash_profileを読み込む)
# これによりroot文字列は$0として無視され、「Is a directory」エラーが発生しない
exec /bin/bash --login
EOF

sudo chmod +x $LFS/rootfs/usr/bin/lfs-login

# 設定オーバーライドディレクトリの作成
sudo mkdir -p $LFS/rootfs/etc/systemd/system/serial-getty@ttyS0.service.d

# 自動ログイン設定の書き込み
sudo cat << 'EOF' | sudo tee $LFS/rootfs/etc/systemd/system/serial-getty@ttyS0.service.d/override.conf
[Service]
ExecStart=
# -n: loginプログラムを呼び出さない
# -l: ブリッジスクリプトを指定
# %I: 端末名 (ttyS0) を渡す
ExecStart=-/usr/sbin/agetty --autologin root --noclear -n -l /usr/bin/lfs-login %I $TERM
EOF

systemd-machine-id-setup --root=$LFS/rootfs
```

```bash
# passwdファイルの作成、rootユーザーの定義（UID 0, GID 0, ホームディレクトリ /root, Shell は bash）
cat << EOF | sudo tee $LFS/rootfs/etc/passwd
root:x:0:0:root:/root:/bin/bash
EOF

# groupファイルの作成、rootグループの定義
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

## カーネルビルド

```bash
cd $LFS/sources
wget https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-6.6.10.tar.xz
tar -xf linux-6.6.10.tar.xz
cd linux-6.6.10

make ARCH=riscv CROSS_COMPILE=riscv64-unknown-linux-gnu- defconfig
```

### 主要設定追加

```bash
cat >> .config << 'EOF'
CONFIG_VIRTIO_BLK=y          # ディスク
CONFIG_VIRTIO_NET=y          # ネットワークカード
CONFIG_VIRTIO_CONSOLE=y      # コンソール
CONFIG_HVC_RISCV_SBI=y       # SBIコンソールインターフェース
CONFIG_SERIAL_8250=y         # シリアルポート
CONFIG_SERIAL_8250_CONSOLE=y # シリアルコンソール
CONFIG_EXT4_FS=y             # ルートファイルシステム
CONFIG_PCI=y                 # PCIバス
CONFIG_VIRTIO_PCI=y          # VirtIO PCIデバイス

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

### コンパイル

```bash
make ARCH=riscv CROSS_COMPILE=riscv64-unknown-linux-gnu- -j$(nproc) Image
```

## fastfetchのインストール

ホストマシンでのクロスコンパイル

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

カスタムカラースキーム

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

設定ファイルの変更

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

## 起動時自動起動

```bash
# ルートディレクトリを作成
sudo mkdir -p $LFS/rootfs/root

# ログイン設定を書き込む
cat << EOF | sudo tee $LFS/rootfs/root/.bash_profile
echo "****************************************"
echo "   Welcome to Lee's RISC-V LFS system!"
echo "      System kernel:\$(uname -r)"
echo "****************************************"
fastfetch

export PS1='[\u@lfs \W]\$ '
EOF

# .bashrcへのシンボリックリンクを作成
sudo ln -sfv .bash_profile $LFS/rootfs/root/.bashrc
```

## イメージ作成

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

## 起動

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
