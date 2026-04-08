---
title: GAMES101 Lecture 13 Ray Tracing 1 (Whitted-Style Ray Tracing)
published: 2026-04-07
description: GAMES101 Lecture 13
image: ""
tags:
  - 图形学
  - GAMES101
category: GAMES101
draft: false
---
## Why Ray Tracing?

光栅化不能很好表示全局的效果
![](../../../images/Pasted%20image%2020260408174314.png)


光栅化快速近似,质量较低
![](../../../images/Pasted%20image%2020260408175118.png)

光线追踪慢,但是质量高
![](../../../images/Pasted%20image%2020260408175636.png)


## 基础光线追踪算法

### 光纤
1. 光沿直线传播
2. 光线与光线不会碰撞.
3. 光路的可逆性
![](../../../images/Pasted%20image%2020260408175824.png)

### Ray Casting

#### Generating Eye Rays
![](../../../images/Pasted%20image%2020260408180509.png)

判断是否能被光源照亮,计算点的着色
![](../../../images/Pasted%20image%2020260408180544.png)

### Recursive(Whitted-Style) Ray Tracing
![](../../../images/Pasted%20image%2020260408181046.png)


光线一部分往物体里折射,一部分反射.
![](../../../images/Pasted%20image%2020260408181332.png)

光路经过的每个点的着色都会被加入到被透过的像素上.
![](../../../images/Pasted%20image%2020260408181606.png)

光线类型归类
- primary rays
- secondary rays
- shadow rays

![](../../../images/Pasted%20image%2020260408181747.png)

###  Ray-Surface Intersection 求交点(光线打到谁)

定义光纤
起点与方向定义一条光线
![](../../../images/Pasted%20image%2020260408182149.png)


光线与球的交点
![](../../../images/Pasted%20image%2020260408182443.png)

![](../../../images/Pasted%20image%2020260408183113.png)

隐式定义
![](../../../images/Pasted%20image%2020260408183324.png)

判断一个光线(射线)在物体内还是物体外:
看和物体的交点:奇数在内,偶数在外.

光线与三角形求交
- 简单方式:一个一个三角形问相不相交
- 一个三角形和光线有1个交点或0个交点
![](../../../images/Pasted%20image%2020260408183726.png)

光线与三角形求交 转化成  光线与三角形所在面求交, 在计算是否在三角形内.

定义平面:一个法线和一个点.
知道法线和一个点,如何用他们来表示平面上任意一个点.
![](../../../images/Pasted%20image%2020260408184558.png)

联立两个方程
![](../../../images/Pasted%20image%2020260408193843.png)


### MT算法
直接找到光线和三角形的交点

光线方程 = 重心坐标
三个式子三个未知量 --> 解线性方程组.
![](../../../images/Pasted%20image%2020260408194208.png)


## 加速光线与三角形求交

### Bounding Volumes 包围盒
用形状将物体包围起来
![](../../../images/Pasted%20image%2020260408195216.png)
基本思路:如果光线连盒子都碰不到,那就更不可能碰到物体

重新认识长方体:3个对面的形成的交集
![](../../../images/Pasted%20image%2020260408195418.png)

AABB(轴对齐包围盒):面是和x,y,z的平面平行的.
![](../../../images/Pasted%20image%2020260408195736.png)

如何判定光线是否和盒子相交?
找什么时候进入了长方形和离开了长方形
![](../../../images/Pasted%20image%2020260408200118.png)
两个线段求交

光线什么时候进入盒子? 光线进入了三个对面
光线什么时候离开盒子? 光线离开任一一对对面

对每个对面求最早进入与最晚离开时间
$t_{enter} = max(t_{min})$
$t_{exit} = max(t_{max})$
![](../../../images/Pasted%20image%2020260408200636.png)
如果进入的时间小于离开的时间,就认为在盒子里,有交点.

如果离开时间 < 0 : 光线背对盒子
离开时间 >= 0 且 进入时间<0 : 光线从盒子里射出

总结:光线和AABB有交点当且仅当
进入时间<离开时间 且 离开时间 >=0
![](../../../images/Pasted%20image%2020260408201249.png)


### 为什么要Axis-Aligned 轴平行平面
![](../../../images/Pasted%20image%2020260408201524.png)