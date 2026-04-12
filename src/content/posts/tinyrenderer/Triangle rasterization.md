---
title: Triangle rasterization
published: 2026-04-12
description: Triangle rasterization
image: ""
tags:
  - 图形学
  - tinyrenderer
category: tinyrenderer
draft: false
---
## 扫描线算法填充三角形

```cpp
void triangle(int ax, int ay, int bx, int by, int cx, int cy, TGAImage &framebuffer, TGAColor color) {
    if(ay > by) {std::swap(ax,bx); std::swap(ay,by);}
    if(ay > cy) {std::swap(ax,cx); std::swap(ay,cy);}
    if(by > cy) {std::swap(bx,cx); std::swap(by,cy);}

    int total_height = cy - ay;
    if(ay != by){
        int segment_height = by - ay;
        for(int y = ay; y < by; y++){
            int x0 = ax + (y - ay) * (bx - ax) / segment_height;
            int x1 = ax + (y - ay) * (cx - ax) / total_height;
            for(int x = std::min(x0,x1); x < std::max(x0,x1); x++){
                framebuffer.set(x, y, color);
            }
        }
    }
    if(by != cy){
        int segment_height = cy - by;
        for(int y = by; y <= cy; y++){
            int x0 = bx + (y - by) * (cx - bx) / segment_height;
            int x1 = ax + (y - ay) * (cx - ax) / total_height;
            for(int x = std::min(x0,x1); x < std::max(x0,x1); x++){
                framebuffer.set(x, y, color);
            }
        }
    }

}
```
![](../../../images/截屏2026-04-12%2015.40.16.png)


## 现代光栅化方法.

### 包围盒
```cpp
void triangle(int ax, int ay, int bx, int by, int cx, int cy, TGAImage &framebuffer, TGAColor color) {
    int bbminx = std::min(std::min(ax, bx), cx); // bounding box for the triangle
    int bbminy = std::min(std::min(ay, by), cy); // defined by its top left and bottom right corners
    int bbmaxx = std::max(std::max(ax, bx), cx);
    int bbmaxy = std::max(std::max(ay, by), cy);
#pragma omp parallel for
    for (int x=bbminx; x<=bbmaxx; x++) {
        for (int y=bbminy; y<=bbmaxy; y++) {
            framebuffer.set(x, y, color);
        }
    }
}
```

![](../../../images/截屏2026-04-12%2015.46.45.png)


利用重心坐标判断包围盒的坐标是否在三角形内
```cpp
double signed_triangle_area(int ax, int ay, int bx, int by, int cx, int cy) {
    return .5*((by-ay)*(bx+ax) + (cy-by)*(cx+bx) + (ay-cy)*(ax+cx));
}

void triangle(int ax, int ay, int bx, int by, int cx, int cy, TGAImage &framebuffer, TGAColor color) {
    int bbminx = std::min(std::min(ax, bx), cx); // bounding box for the triangle
    int bbminy = std::min(std::min(ay, by), cy); // defined by its top left and bottom right corners
    int bbmaxx = std::max(std::max(ax, bx), cx);
    int bbmaxy = std::max(std::max(ay, by), cy);
    double total_area = signed_triangle_area(ax, ay, bx, by, cx, cy);

#pragma omp parallel for
    for (int x=bbminx; x<=bbmaxx; x++) {
        for (int y=bbminy; y<=bbmaxy; y++) {
            double alpha = signed_triangle_area(x, y, bx, by, cx, cy) / total_area;
            double beta  = signed_triangle_area(x, y, cx, cy, ax, ay) / total_area;
            double gamma = signed_triangle_area(x, y, ax, ay, bx, by) / total_area;
            if (alpha<0 || beta<0 || gamma<0) continue; // negative barycentric coordinate => the pixel is outside the triangle
            framebuffer.set(x, y, color);
        }
    }
}
```

![](../../../images/截屏2026-04-12%2015.59.18.png)


## 画出头像
```cpp
#include <iostream>
#include <cstdlib>   // std::rand() 需要
#include <utility>   // std::pair 需要 (为了配合 auto [ax, ay])
#include "tgaimage.h"
#include "model.h"
#include "geometry.h"

constexpr TGAColor white   = {255, 255, 255, 255}; // attention, BGRA order
constexpr TGAColor green   = {  0, 255,   0, 255};
constexpr TGAColor red     = {  0,   0, 255, 255};
constexpr TGAColor blue    = {255, 128,  64, 255};
constexpr TGAColor yellow  = {  0, 200, 255, 255};
const int width = 800;
const int height = 800;

std::pair<int, int> project(vec3 v) {
    int x = (v.x + 1.) * width / 2.;
    int y = (v.y + 1.) * height / 2.;
    return {x, y}; // 返回一个包含两个整数的 pair
}

double signed_triangle_area(int ax, int ay, int bx, int by, int cx, int cy) {
    return .5*((by-ay)*(bx+ax) + (cy-by)*(cx+bx) + (ay-cy)*(ax+cx));
}

void triangle(int ax, int ay, int bx, int by, int cx, int cy, TGAImage &framebuffer, TGAColor color) {
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
            framebuffer.set(x, y, color);
        }
    }
}

int main(int argc, char** argv) {
    Model model("african_head.obj");
    TGAImage framebuffer(width, height, TGAImage::RGB);

    for (int i=0; i<model.nfaces(); i++) { // iterate through all triangles
        auto [ax, ay] = project(model.vert(i, 0));
        auto [bx, by] = project(model.vert(i, 1));
        auto [cx, cy] = project(model.vert(i, 2));
        TGAColor rnd;
        for (int c=0; c<3; c++) rnd[c] = std::rand()%255;
        triangle(ax, ay, bx, by, cx, cy, framebuffer, rnd);
    }

    framebuffer.write_tga_file("framebuffer.tga");
    return 0;
}
```

1. 遍历每一个面
2. 根据面的到每一个点
3. 根据点来画三角形

结果:
![](../../../images/截屏2026-04-12%2016.24.05.png)
我们会发现正面的面和背面的面重叠在了一起,为了解决这个问题,我们在triangle()函数中添加一句

```cpp
if (total_area<1) return;
```

```cpp
void triangle(int ax, int ay, int bx, int by, int cx, int cy, TGAImage &framebuffer, TGAColor color) {
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
            framebuffer.set(x, y, color);
        }
    }
}
```


原因是在obj文件中,三角形面的点都是按照逆时针顺序存储的,当我们正面看的时候,逆时针计算出的面积应该>0,而在背面后,逆时针变成了顺时针,因此面积应该<0,对于这种三角形,我们就不画了;

逆时针>0的缘故是由于向量叉乘的性质,右手定理

叉乘的值 =  ||a|| \*||b|| sin𝛉 符号由右手定理决定

结果
![](../../../images/截屏2026-04-12%2016.37.29.png)