---
title: 03 Barycentric coordinates 质心坐标
published: 2026-04-13
description: Lesson 3
image: ""
tags:
  - 图形学
  - tinyrenderer
category: tinyrenderer
draft: false
---

鞋带公式计算面积:  
$$\text{Area}(ABC) = \frac{1}{2} \left( \small(B_y-A_y)(B_x+A_x) + (C_y-B_y)(C_x+B_x) + (A_y-C_y)(A_x+C_x) \right).$$

重心坐标. 
$$P = \alpha A + \beta B + \gamma C,$$ 

$$\alpha = \frac{ \, \text{Area}(PBC) \, }{ \, \text{Area}(ABC) \, }.$$ 
$$\beta = \frac{ \, \text{Area}(PCA) \, }{ \, \text{Area}(ABC) \, }, \quad \gamma = \frac{ \, \text{Area}(PAB) \, }{ \, \text{Area}(ABC) \, }.$$ 


## 全彩三角形
```cpp
#include <cmath>
#include "tgaimage.h"
constexpr TGAColor white   = {255, 255, 255, 255}; // attention, BGRA order
constexpr TGAColor green   = {  0, 255,   0, 255};
constexpr TGAColor red     = {  0,   0, 255, 255};
constexpr TGAColor blue    = {255, 128,  64, 255};
constexpr TGAColor yellow  = {  0, 200, 255, 255};
double signed_triangle_area(int ax, int ay, int bx, int by, int cx, int cy) {
    return .5*((by-ay)*(bx+ax) + (cy-by)*(cx+bx) + (ay-cy)*(ax+cx));
}

void triangle(int ax, int ay, int bx, int by, int cx, int cy, TGAImage &framebuffer) {
    int bbminx = std::min(std::min(ax, bx), cx); // bounding box for the triangle
    int bbminy = std::min(std::min(ay, by), cy); // defined by its top left and bottom right corners
    int bbmaxx = std::max(std::max(ax, bx), cx);
    int bbmaxy = std::max(std::max(ay, by), cy);
    double total_area = signed_triangle_area(ax, ay, bx, by, cx, cy);
    if (total_area<1) return; // backface culling + discarding triangles that cover less than a pixel

#pragma omp parallel for
    for (int x=bbminx; x<=bbmaxx; x++) {
        for (int y=bbminy; y<=bbmaxy; y++) {
            double alpha = signed_triangle_area(x, y, bx, by, cx, cy) / total_area;
            double beta  = signed_triangle_area(x, y, cx, cy, ax, ay) / total_area;
            double gamma = signed_triangle_area(x, y, ax, ay, bx, by) / total_area;
            if (alpha<0 || beta<0 || gamma<0) continue; // negative barycentric coordinate => the pixel is outside the triangle
            TGAColor color = blue * alpha + green * beta + red * gamma;
            framebuffer.set(x, y, color);
        }
    }
}

int main(int argc, char** argv) {
    constexpr int width  = 64;
    constexpr int height = 64;
    TGAImage framebuffer(width, height, TGAImage::RGB);

    int ax = 17, ay =  4;
    int bx = 55, by = 39;
    int cx = 23, cy = 59;

    triangle(ax, ay, bx, by, cx, cy, framebuffer);

    framebuffer.write_tga_file("framebuffer.tga");
    return 0;
}
```

需要对TGAcolor类进行运算符重载
```cpp
// 1. 重载乘号 *
    TGAColor operator*(const double value) const { // 加了 const，保证不会修改原始变量
        TGAColor result = *this; // 拷贝一份自己
        for(int i = 0; i < 4; i++){
            // 先计算浮点结果，再限制在 0-255 之间
            int val = result.bgra[i] * value;
            result.bgra[i] = std::max(0, std::min(255, val));
        }
        return result; // 返回新算出来的颜色
    }

    // 2. 重载加号 +
    TGAColor operator+(const TGAColor& other) const { // 加了 const
        TGAColor result = *this; // 拷贝一份自己
        for(int i = 0; i < 4; i++){
            // 防止相加后超过 255 导致颜色溢出变黑
            int sum = result.bgra[i] + other.bgra[i];
            result.bgra[i] = std::min(255, sum);
        }
        return result; // 返回新算出来的颜色
    }
```

![](../../../images/截屏2026-04-13%2015.43.34.png)