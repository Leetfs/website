---
title: 模型的导入与发布
author: Lee
---

## 安装 VCC

访问[该网址](https://vrchat.com/home/download)，选择 `Download the Creator Companion`。

## 安装 Unity

前往[Unity 官网](https://unity.com/)下载 Unity Hub，访问[该网址](https://creators.vrchat.com/sdk/upgrade/current-unity-version/)获取 VCC 依赖的 Unity 版本。

## 安装着色器

访问 [lilToon](https://lilxyzw.github.io/lilToon/ja_JP/first.html#%E5%B0%8E%E5%85%A5%E6%89%8B%E9%A0%86%E3%81%A8%E7%B0%A1%E6%98%93%E7%9A%84%E3%81%AA%E4%BD%BF%E3%81%84%E6%96%B9)，点击 `こちらをクリックしてlilToonをVCCまたはALCOMに追加し`，在弹出的 VCC 窗口中点击 Add。

## 创建工程

打开 VCC，Projects -> Create New Projects -> Avatar Projects

![vcc-projects](/tips/vrchat/avatar/image/vcc-projects.png)
![vcc-new-avatar](/tips/vrchat/avatar/image/vcc-new-avatar.png)

安装下图所示插件，建议安装 `Gesture Manager`，可以在 Unity 中模拟出游戏的菜单页面。

![vcc-manage-packages](/tips/vrchat/avatar/image/vcc-manage-packages.png)

## 导入模型

双击 `.unitypackage` 文件，点 import。

![unity-model-import](/tips/vrchat/avatar/image/unity-model-import.png)

找到 `.prefab` 文件拖到左上窗口。

![unity-model-prefab.png](/tips/vrchat/avatar/image/unity-model-prefab.png)

## 发布

进入 VCC 菜单，登陆账号并设置模型封面和名称，点击 `Publish` 发布。

![unity-model-prefab.png](/tips/vrchat/avatar/image/unity-build-publish.png)
