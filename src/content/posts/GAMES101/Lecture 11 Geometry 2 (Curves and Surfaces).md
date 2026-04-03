---
title: GAMES101 Lecture 11 Geometry 2 (Curves and Surfaces)
published: 2026-04-03
description: GAMES101 Lecture 11
image: ""
tags:
  - GAMES101
  - 图形学
category: GAMES101
draft: false
---
## 显式几何

### 点云 Piont Cloud

![](../../../images/Pasted%20image%2020260403155412.png)

密度足够高的点,大量的点直接形成表面
点云变成多边形的面,点云密度很低就很难画出来.


### Polygon Mesh多边形面
![](../../../images/Pasted%20image%2020260403155504.png)
用三角形或四边形来表示物体


### The Wavefront Object File(.obj)

把空间中的点、法线和纹理坐标组合起来的文件
f v(顶点/vt(纹理坐标))/vn(法线) `*3` 来表示一个三角形
将面表示出来,定义形成的物体
![](../../../images/Pasted%20image%2020260403155910.png)



## 曲线

### Bezier Curve贝塞尔曲线

用一系列的控制点去定义一个曲线,这些控制点定义虚线满足的性质.

以从p0到p1为切线往前走,曲线会在p3结束,结束时沿着p2到p3的切线走.这样就可以得到唯一的曲线

曲线不一定要经过控制点,取决于我们怎么定义

![](../../../images/Pasted%20image%2020260403160631.png)


### 怎样画贝塞尔曲线

#### de Casteljau算法

![](../../../images/Pasted%20image%2020260403160906.png)


假设曲线上可以定义起点在时间0,终点在时间1.我只需要找在`[0,1]`中的时间t时刻,点所在的位置.


> 假设b0是时刻0,b1是时刻1,假设t在1/3的位置上,那就能找出b01位置,同理b1是时刻0,b2是时刻1,找1/3的位置,就能找出b11的位置;在以b10作为时刻0,b11作为时刻1,找到1/3的点,我们就认为这个点就是t时刻的点.
![](../../../images/Pasted%20image%2020260403161438.png)

图形是通过参数t来表示的,因此是显式几何

当t = 0.5时
![](../../../images/Pasted%20image%2020260403162312.png)

形成过程像递归





