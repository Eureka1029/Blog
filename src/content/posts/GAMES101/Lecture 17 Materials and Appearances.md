---
title: GAMES101 Lecture 17 Materials and Appearances
published: 2026-05-06
description: GAMES101 Lecture 17
image: ""
tags:
  - GAMES101
  - 图形学
category: GAMES101
draft: false
pinned: false
---
## The Appearance of Natural Materials

材质和光线传播是紧密结合的.


### 同一模型的不同材质导致了不同的渲染效果
![](../../../images/Pasted%20image%2020260506160244.png)


根据渲染方程可知
BRDF == 材质

BRDF决定了光如何反射.

漫反射:均匀的反射到各个方向.
一个表面,不自发光也不吸收光,根据能量守恒.Lo = Li
![](../../../images/Pasted%20image%2020260506161431.png)

albedo : 反射率


抛光的金属材质
![](../../../images/Pasted%20image%2020260506161631.png)



玻璃或水
![](../../../images/Pasted%20image%2020260506161745.png)

### 镜面反射
![](../../../images/Pasted%20image%2020260506163347.png)

反射公式,求反射方向
![](../../../images/Pasted%20image%2020260506163402.png)

镜面反射的BRDF很麻烦



### **折射**
![](../../../images/Pasted%20image%2020260506164832.png)


斯涅尔定理来算折射方向
![](../../../images/Pasted%20image%2020260506174814.png)


如果入射的介质折射率大于出射的折射率,则没有折射光线(全反射)
![](../../../images/Pasted%20image%2020260506175354.png)

全反射现象
![](../../../images/Pasted%20image%2020260506175636.png)

折射:BTDF
反射:BRDF
散射:BSDF = BRDF + BTDF


### 菲涅耳项

不同的视角书的反射情况不一样.
![](../../../images/Pasted%20image%2020260506180319.png)

入射角度与反射的能量直接的关系
越平行越反射(绝缘体)
![](../../../images/Pasted%20image%2020260506180555.png)


导体的菲涅尔项
![](../../../images/Pasted%20image%2020260506181701.png)

如何计算菲涅尔项?
有多少能量被反射出(0-1)


原式太复杂,使用近似的公式Schlick's approximation
![](../../../images/Pasted%20image%2020260506182447.png)


## Microfacet Material 微表面模型

微表面认为从远处看是材质,从近处看看到的是几何

每一个微表面看作一个小的镜面.
![](../../../images/Pasted%20image%2020260506225807.png)


![](../../../images/Pasted%20image%2020260506225924.png)

粗糙程度可以用法线的分布来表示


![](../../../images/Pasted%20image%2020260506231659.png)

## Isotropic / Anisotropic Materials(BRDFs)

区分材质的方法:
- 各向同性材质Isotropic
- 各项异性材质Anisotropic Materials

![](../../../images/Pasted%20image%2020260507153118.png)


方位角旋转后不相等-----各向异性
![](../../../images/Pasted%20image%2020260507153954.png)


## 总结BRDF性质