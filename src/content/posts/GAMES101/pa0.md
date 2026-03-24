---
title: Games101 pa0
published: 2026-03-24
description: 作业0
image: ""
tags:
  - GAMES101
  - 图形学
category: GAMES101
draft: false
---
给定一个点P=(2,1),将该点绕原点先逆时针旋转45◦，再平移(1,2),计算出 变换后点的坐标（要求用齐次坐标进行计算）

```CPP
#include<cmath>
#include<Eigen/Core>
#include<Eigen/Dense>
#include<iostream>


int main() {

    Eigen::Vector3f p(2.0f, 1.0f, 1.0f);
    Eigen::Matrix3f r;

    // 提前计算好浮点数角度
    float pi = std::acos(-1);
    float angle = 45.0f / 180.0f * pi;

    r << std::cos(angle), -std::sin(angle), 1.0f,
        std::sin(angle), std::cos(angle), 2.0f,
        0.0f, 0.0f, 1.0f;

    Eigen::Vector3f result = r * p;

    std::cout << "变换后的结果是:\n" << result << std::endl;

    return 0;
}
```