---
title: Lecture 02 Review of Linear Algebra
published: 2026-03-14
description: GAMES101 Lecture 2
image: ""
tags:
  - 图形学
  - GAMES101
category: GAMES101
draft: false
---
本节主要是对向量和矩阵的运算进行恢复,相对简单,有基础的朋友可以跳过.

## 向量的点乘
可以判断向量前与后的信息
- 点乘 > 0 同方向
- 点乘 < 0 反方向
![](../../../images/截屏2026-03-17%2020.39.50.png)

## 向量的叉乘
输入两个向量，输出一个同时垂直与这两个向量的新向量

**如何判断新向量的方向？**
>右手螺旋定则

如**a×b=c**
四指从a的方向向b的方向握紧，大拇指指向的就是c的方向
![](https://i0.hdslb.com/bfs/note/acdd405e8591503c0d093d0746605b0f8118be32.jpg@1192w.webp)

**如何判断两个向量的左右关系？**
a×b得到结果是和z轴同向，是正的，说明b在a的左侧

**如何判断一个点是否落在三角形内部？（做光栅化，给三角形内部的像素着色需要用到）**
AB×AP > 0 说明P在AB左侧
BC×BP > 0 说明P在BC左侧
CA×CP > 0 说明P在CA左侧
说明点P落在三角形ABC内部

如果三边结果都是同一侧则就说明在三角形内部


## 矩阵

### 矩阵的乘积
首先两个矩阵必须要可以相乘

（M x N）（N x P） = （M x P）

第一个矩阵的列``==``第二个矩阵的行。才能相乘

如：
- 第一个矩阵M行N列
- 第二个矩阵N行P列
- 得到M行P列的新矩阵


**新矩阵a行b列的元素怎么得出来呢？**  
第一个矩阵a行和第二个矩阵b列做点积运算

### 矩阵的性质
![](../../../images/Pasted%20image%2020260317203601.png)


### 矩阵乘向量
![](https://i0.hdslb.com/bfs/note/19947ad1d796f433ad61003e7358f17c92558cad.jpg@1192w.webp)



### 矩阵的转置
![](https://i0.hdslb.com/bfs/note/e89515f4c5b7eecd46c1ab2bc7efe1d6fc518fc1.jpg@1192w.webp)


### 单位矩阵、矩阵的逆
![](https://i0.hdslb.com/bfs/note/ae7b91e261ed5f7ed7a065e45a9439b2573edaa8.jpg@1192w.webp)



### 向量的点乘、叉乘(矩阵形式)
向量的点乘（矩阵形式）（见下图）
向量的叉乘（矩阵形式）
![](https://i0.hdslb.com/bfs/note/85ed6793e5c7724af366392d8820ab935af5131c.jpg@1192w.webp)


将a向量重新组织，变为A*这个矩阵，A*这个矩阵叫a向量的**反对称矩阵（Skew-Symmetric Matrix）**

（为什么PPT中写的是DualMatrix（对偶矩阵？）呢？此处的“对偶”并非线性代数中“对偶空间”的标准定义，而是强调**向量与叉乘矩阵的等价性**。叉乘矩阵可视为向量的一种“对偶表示”，使得几何操作（如旋转）可通过矩阵运算实现。计算机图形学中，这种术语是约定俗成的，目的是直观表达向量与矩阵形式的对应关系）