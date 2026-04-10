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
        float t = (x - ax) / static_cast<float>(bx - ax); 
        if(steep){
            framebuffer.set(y, x, color);//因为交换了x和y,所以需要交换回来.
        }else{
            framebuffer.set(x, y, color); // 设置颜色
        }
        ierror += 2 * std::abs(by-ay);
        if(ierror > bx-ay){
            y += by > ay ? 1 : -1;
            ierror -= 2 * (bx - ax);
        }
    }
}
```