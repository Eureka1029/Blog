---
title: Bresenham's line drawing
published: 2026-04-10
description: Lesson 1
image: ""
tags:
  - tinyrenderer
  - 图形学
category: tinyrenderer
draft: false
---
如何画线
```cpp
void line(int ax, int ay, int bx, int by, TGAImage& framebuffer, TGAColor color){
    bool steep = std::abs(ax - bx) < std::abs(ay-by);
    if(steep){ //y比x陡峭
        std::swap(ax,ay);
        std::swap(bx,by);
    }
    if(ax > bx){
        std::swap(ax,bx);
        std::swap(ay,by);
    }
    int y = ay;
    int ierror = 0;
    for(int x = ax; x <= bx; x++){ //尝试画线
        if(steep){
            framebuffer.set(y, x, color);//因为交换了x和y,所以需要交换回来.
        }else{
            framebuffer.set(x, y, color); // 设置颜色
        }
        ierror += 2 * std::abs(by-ay);

		y += (by > ay ? 1 : -1) * (ierror > bx - ax);
		ierror -= 2 * (bx - ax) * (ierror > bx - ax);
        
    }
}
```

最后渲染结果及代码:
```cpp
#include "tgaimage.h"
#include "model.h"

constexpr TGAColor white   = {255, 255, 255, 255}; // attention, BGRA order
constexpr TGAColor green   = {  0, 255,   0, 255};
constexpr TGAColor red     = {  0,   0, 255, 255};
constexpr TGAColor blue    = {255, 128,  64, 255};
constexpr TGAColor yellow  = {  0, 200, 255, 255};

void line(int ax, int ay, int bx, int by, TGAImage& framebuffer, TGAColor color){
    bool steep = std::abs(ax - bx) < std::abs(ay-by);
    if(steep){ //y比x陡峭
        std::swap(ax,ay);
        std::swap(bx,by);
    }
    if(ax > bx){
        std::swap(ax,bx);
        std::swap(ay,by);
    }
    int y = ay;
    int ierror = 0;
    for(int x = ax; x <= bx; x++){ //尝试画线
        float t = (x - ax) / static_cast<float>(bx - ax); 
        if(steep){
            framebuffer.set(y, x, color);//因为交换了x和y,所以需要交换回来.
        }else{
            framebuffer.set(x, y, color); // 设置颜色
        }
        ierror += 2 * std::abs(by-ay);

		y += (by > ay ? 1 : -1) * (ierror > bx - ax);
		ierror -= 2 * (bx - ax) * (ierror > bx - ax);
        
    }
}

int main(int argc, char** argv) {
    constexpr int width  = 800;
    constexpr int height = 800;
    TGAImage framebuffer(width, height, TGAImage::RGB);

    Model *model = new Model("african_head.obj");

    for(int i = 0; i < model->nfaces(); i++){
        std::vector<int> face = model->face(i); 
        for(int j = 0; j < 3; j++){
            vec3 v0 = model->vert(face[j]);
            vec3 v1 = model->vert(face[(j+1)%3]);

            int ax = (v0.x + 1.) * width / 2;
            int ay = (v0.y + 1.) * height / 2;
            int bx = (v1.x + 1.) * width / 2;
            int by = (v1.y + 1.) * height / 2;

            line(ax,ay,bx,by,framebuffer,white);
        }

    }

    framebuffer.write_tga_file("framebuffer.tga");
    return 0;
}
```

![](../../../images/Pasted%20image%2020260411184653.png)

