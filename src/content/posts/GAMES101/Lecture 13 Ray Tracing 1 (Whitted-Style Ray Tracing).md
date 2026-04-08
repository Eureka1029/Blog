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

