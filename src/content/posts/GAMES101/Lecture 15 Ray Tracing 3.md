---
title: GAMES101 Lecture 15 Ray Tracing 3
published: 2026-04-22
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
Power per area 每一个面积上的能量  面必须和光线垂直(不垂直就要进行投影)
![](../../../images/Pasted%20image%2020260419173805.png)
一些例子(回顾布林冯漫反射的计算)
![](../../../images/Pasted%20image%2020260419174042.png)



## Radiance(光线在传播过程中的能量)
单位立体角,单位面积上的能力(两次微分)

确定一个区域(dA),这个面向某个方向(ω)辐射的能量
![](../../../images/Pasted%20image%2020260419192103.png)


进一步理解
用Radiance变量将Irradiance和Intensity两个变量联系起来

Irradiance考虑的是所有方向的能力的投影总和
Radiance只考虑某一方向来的能量

Intensity是往每一个的立体角的能量大小
Radiance考虑某一个立体角辐射出能量大小

两种理解方法:
1. 某一方向打到某一小块面积的能量就是Radiance
2. 某一小块面积向某一方向辐射的能力就是Radiance

![](../../../images/Pasted%20image%2020260422155329.png)


## Irradiance vs Radiance
Irradiance考虑的是所有方向的能力的投影总和
Radiance只考虑某一方向来的能量

Irradiance 就是 所有方向的 Radiance的积分
![](../../../images/Pasted%20image%2020260422160413.png)

Radiance和Irradiance中间差了方向性

## BRDF(Bidirectional Reflectance Disrtibution Function) 双向反射分布函数

有根光线打入镜子,光线会被反射到四面八方
希望有个函数能够描述某个方向,反射到某个方向的能量大小.

如何理解反射?
光线打到了某个物体表面,被吸收了,再从这个物体表面发出去.

![](../../../images/Pasted%20image%2020260422161150.png)


BRDF的函数定义
从某个特定方向 ωi 照到表面上一小束光，其中**有多少比例**会恰好被反射到观察方向 ωr 上去。
![](../../../images/Pasted%20image%2020260422161736.png)

描述了光线和物体是如何作用的.

每一个方向的Radiance全部乘以反射方程在加起来,我们就能得到某一方向的光线结果
![](../../../images/Pasted%20image%2020260422165436.png)

反射方程的问题
到达这个面的入射光线很多很难求(反射光线也能成为别的面的入射光线)
![](../../../images/Pasted%20image%2020260422170950.png)


## 渲染方程
反射光 + 自己产生的光(定义所有方向全部朝外)
这里的Ω+代表半球,表示忽略掉下半球射入的光线.
![](../../../images/Pasted%20image%2020260422171125.png)

简化表达式
![](../../../images/Pasted%20image%2020260422180731.png)

进一步简化成算子
![](../../../images/Pasted%20image%2020260422180848.png)
E:本身发生出的能量
K:反射操作符
L:辐射出来的能量

![](../../../images/Pasted%20image%2020260422181109.png)

将L分解成以下结果
![](../../../images/Pasted%20image%2020260422181233.png)
结果约等于 = 光源 + 直接照射 + 弹射一次 + ... 的结果

全局光照 = 间接光照集合

光栅化能告诉我们的是一次和直接光照得到的光照.
![](../../../images/Pasted%20image%2020260422181457.png)


直接光照得到的结果
![](../../../images/Pasted%20image%2020260422181622.png)

加上一次间接光照
![](../../../images/Pasted%20image%2020260422181639.png)

弹射两次
![](../../../images/Pasted%20image%2020260422181827.png)

弹射四次
![](../../../images/Pasted%20image%2020260422181936.png)玻璃需要弹射多次光才能出来

## 概率论回顾

随机变量 : 可能取很多值的变量
随机变量的分布 : 取某些值的概率

![](../../../images/Pasted%20image%2020260422182538.png)


![](../../../images/Pasted%20image%2020260422183112.png)


期望:不断地取值,求平均
![](../../../images/Pasted%20image%2020260422183219.png)


连续情况下描述变量和分布
概率密度函数(PDF)
![](../../../images/Pasted%20image%2020260422183812.png)


![](../../../images/Pasted%20image%2020260422184019.png)