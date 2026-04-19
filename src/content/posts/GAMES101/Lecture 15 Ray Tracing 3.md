---
title: GAMES101 Lecture 15 Ray Tracing 3
published: 2026-04-19
description: GAMES101 Lecture 15
image: ""
tags:
  - 图形学
  - GAMES101
category: GAMES101
draft: false
pinned: false
---
## Irradiance(物体表面接收的光的能量)
Power per area 每一个面积上的能力  面必须和光线垂直(不垂直就要进行投影)
![](../../../images/Pasted%20image%2020260419173805.png)
一些例子(回顾布林冯漫反射的计算)
![](../../../images/Pasted%20image%2020260419174042.png)



## Radiance(光线在传播过程中的能量)
单位立体角,单位面积上的能力(两次微分)

确定一个区域(dA),这个面向某个方向(ω)辐射的能量
![](../../../images/Pasted%20image%2020260419192103.png)


